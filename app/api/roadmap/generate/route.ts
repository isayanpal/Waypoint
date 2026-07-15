import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini/client";
import { buildRoadmapPrompt } from "@/lib/gemini/prompts";
import { roadmapResponseSchema, roadmapPayloadSchema } from "@/lib/gemini/schema";
import { newSkillSchema } from "@/lib/validations/new-skill";

export const runtime = "nodejs";

function isTransientGeminiError(error: unknown) {
  const status = (error as { status?: number })?.status;
  return status === 503 || status === 429;
}

async function generateContentWithRetry(prompt: string, retries = 2) {
  const gemini = getGeminiClient();

  for (let attempt = 0; ; attempt++) {
    try {
      return await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: roadmapResponseSchema,
        },
      });
    } catch (error) {
      if (attempt >= retries || !isTransientGeminiError(error)) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
}

async function requestRoadmap(prompt: string) {
  const result = await generateContentWithRetry(prompt);
  return roadmapPayloadSchema.safeParse(JSON.parse(result.text ?? "{}"));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsedInput = newSkillSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsedInput.error.flatten() },
      { status: 400 }
    );
  }

  const { data: allowed, error: rateLimitError } = await supabase.rpc(
    "check_and_log_ai_generation",
    { p_user_id: user.id }
  );

  if (rateLimitError) {
    return NextResponse.json({ error: "rate_limit_check_failed" }, { status: 500 });
  }

  if (!allowed) {
    const { data: recent } = await supabase
      .from("ai_generations")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(2);

    const oldest = recent?.[0]?.created_at;
    const retryAt = oldest
      ? new Date(new Date(oldest).getTime() + 24 * 60 * 60 * 1000).toISOString()
      : null;

    return NextResponse.json({ error: "rate_limited", retryAt }, { status: 429 });
  }

  const prompt = buildRoadmapPrompt(parsedInput.data);
  let parsedRoadmap;
  try {
    parsedRoadmap = await requestRoadmap(prompt);

    if (!parsedRoadmap.success) {
      parsedRoadmap = await requestRoadmap(
        `${prompt}\n\nIMPORTANT: your previous response did not match the required structure. ` +
          `Return exactly 5 phases and exactly 2 portfolio projects, matching the schema exactly.`
      );
    }
  } catch {
    return NextResponse.json({ error: "generation_unavailable" }, { status: 503 });
  }

  if (!parsedRoadmap.success) {
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }

  const { data: skillProjectId, error: writeError } = await supabase.rpc(
    "create_skill_project_from_ai",
    {
      p_payload: {
        name: parsedInput.data.name,
        goal: parsedInput.data.goal,
        level: parsedInput.data.level,
        timelineMonths: parsedInput.data.timelineMonths,
        ...parsedRoadmap.data,
      },
    }
  );

  if (writeError || !skillProjectId) {
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }

  return NextResponse.json({ skillProjectId }, { status: 201 });
}
