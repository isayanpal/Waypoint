import { Type } from "@google/genai";
import { z } from "zod";

// Gemini structured-output schema (responseSchema, JSON mode). Shape mirrors the
// DB tables so create_skill_project_from_ai() can insert it directly.
export const roadmapResponseSchema = {
  type: Type.OBJECT,
  properties: {
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          topics: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["name", "topics"],
      },
    },
    portfolioProjects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          timeline: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          description: { type: Type.STRING },
          hook: { type: Type.STRING },
          proves: { type: Type.STRING },
          stack: { type: Type.ARRAY, items: { type: Type.STRING } },
          phaseIndices: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        },
        required: [
          "name",
          "timeline",
          "difficulty",
          "description",
          "hook",
          "proves",
          "stack",
          "phaseIndices",
        ],
      },
    },
  },
  required: ["phases", "portfolioProjects"],
};

// Zod mirror used to validate Gemini's response before it's persisted.
export const roadmapPayloadSchema = z.object({
  phases: z
    .array(
      z.object({
        name: z.string().min(1),
        topics: z.array(z.string().min(1)).min(1),
      })
    )
    .length(5, "Roadmap must have exactly 5 phases"),
  portfolioProjects: z
    .array(
      z.object({
        name: z.string().min(1),
        timeline: z.string(),
        difficulty: z.string(),
        description: z.string(),
        hook: z.string(),
        proves: z.string(),
        stack: z.array(z.string()),
        phaseIndices: z.array(z.number().int().min(0)),
      })
    )
    .length(2, "Roadmap must have exactly 2 portfolio projects"),
});

export type RoadmapPayload = z.infer<typeof roadmapPayloadSchema>;
