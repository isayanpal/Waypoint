import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "username_taken" }, { status: 409 });
  }

  // Supabase Auth still requires an email internally (session/RLS depend on
  // auth.uid()). Users never see or enter one — we synthesize a placeholder
  // tied to the username so signup needs only username + password.
  const email = `${username.toLowerCase()}@users.waypoint.internal`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  const createdUserId = data.user?.id;

  if (error) {
    // Unique-constraint race on username: the trigger raised, signUp failed,
    // but auth.users may have a row with no profile. Clean it up if we can tell.
    if (createdUserId) {
      await admin.auth.admin.deleteUser(createdUserId);
    }
    return NextResponse.json({ error: "signup_failed", message: error.message }, { status: 409 });
  }

  return NextResponse.json({ userId: createdUserId }, { status: 201 });
}
