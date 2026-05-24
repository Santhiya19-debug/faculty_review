import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const error = searchParams.get("error");

  // OAuth error returned by Google/Supabase (e.g. user closed popup)
  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          );
        },
      },
    }
  );

  // Exchange the code for a session
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.user) {
    console.error("OAuth exchange error:", exchangeError?.message);
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }

  // Ensure a profile row exists for this OAuth user.
  // The DB trigger handles email/password signups automatically,
  // but OAuth users may arrive before the trigger fires on first login.
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (!existingProfile) {
    // Generate a random fun username (same style as the DB trigger)
    const adjectives = ["sleepy", "chaos", "angry", "confused", "tired", "blessed", "cursed", "silent", "loud", "soft"];
    const nouns = ["penguin", "coder", "student", "nerd", "ghost", "wizard", "panda", "cat", "fox", "duck"];
    const randomUsername =
      adjectives[Math.floor(Math.random() * adjectives.length)] +
      "_" +
      nouns[Math.floor(Math.random() * nouns.length)] +
      "_" +
      Math.floor(1000 + Math.random() * 9000);

    await supabase.from("profiles").insert({
      id: data.user.id,
      username: randomUsername,
    });
  }

  // Redirect to the intended destination (default: home)
  return NextResponse.redirect(`${origin}${next}`);
}
