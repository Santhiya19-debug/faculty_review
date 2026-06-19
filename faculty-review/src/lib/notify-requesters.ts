import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL } from "@/lib/resend";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Given a faculty name and their new DB id:
 * 1. Find all pending faculty_requests matching the name (case-insensitive)
 * 2. Also find everyone who upvoted those requests
 * 3. Mark the requests as 'fulfilled'
 * 4. Email every unique person (requesters + upvoters) via Resend
 */
export async function notifyAndFulfillRequests(
  facultyName: string,
  facultyId: string
): Promise<void> {
  const { data: matchingRequests, error } = await adminClient
    .from("faculty_requests")
    .select("id, user_id, faculty_name")
    .eq("status", "pending")
    .ilike("faculty_name", facultyName.trim());

  if (error || !matchingRequests || matchingRequests.length === 0) return;

  const requestIds = matchingRequests.map((r) => r.id);

  // Start with original requesters
  const userIdSet = new Set<string>(matchingRequests.map((r) => r.user_id));

  // Add everyone who upvoted any of these requests
  const { data: upvoters } = await adminClient
    .from("request_votes")
    .select("user_id")
    .in("request_id", requestIds);

  upvoters?.forEach((v) => userIdSet.add(v.user_id));

  const uniqueUserIds = [...userIdSet];

  // Mark all matched requests as fulfilled
  await adminClient
    .from("faculty_requests")
    .update({ status: "fulfilled" })
    .in("id", requestIds);

  // Send email to each unique person (requesters + upvoters)
  for (const userId of uniqueUserIds) {
    try {
      const { data: userData } = await adminClient.auth.admin.getUserById(userId);
      const email = userData?.user?.email;
      if (!email) continue;

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app";

      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `${facultyName} is now on Faculty Review ✨`,
        html: `
          <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
            <div style="background:linear-gradient(135deg,#fff5f7,#fef0f3);border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
              <p style="font-size:32px;margin:0 0 8px;">🎓</p>
              <h1 style="color:#ff3d6b;font-size:22px;margin:0;">Faculty Now Available!</h1>
            </div>
            <p style="color:#374151;font-size:15px;line-height:1.6;">
              Great news! The faculty you requested or upvoted —
              <strong style="color:#111827;">${facultyName}</strong> —
              is now available on Faculty Review.
            </p>
            <p style="color:#374151;font-size:15px;line-height:1.6;">
              You can now view their profile, read community reviews, and share your own experience.
            </p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${appUrl}/faculty/${facultyId}"
                style="background:#ff3d6b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:600;font-size:14px;display:inline-block;">
                View Faculty →
              </a>
            </div>
            <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px;">
              Faculty Review — Built by students, for students.
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error(`Failed to notify user ${userId}:`, err);
    }
  }
}