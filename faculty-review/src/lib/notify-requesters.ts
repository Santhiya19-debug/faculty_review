import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL } from "@/lib/resend";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function notifyAndFulfillRequests(
  facultyName: string,
  facultyId: string
): Promise<void> {
  const trimmedName = facultyName.trim();

  const { data: matchingRequests, error } = await adminClient
    .from("faculty_requests")
    .select("id, user_id")
    .eq("status", "pending")
    .ilike("faculty_name", trimmedName);

  if (error || !matchingRequests?.length) return;

  const requestIds = matchingRequests.map((r) => r.id);

  const userIdSet = new Set(
    matchingRequests.map((r) => r.user_id)
  );

  const { data: upvoters } = await adminClient
    .from("request_votes")
    .select("user_id")
    .in("request_id", requestIds);

  upvoters?.forEach((v) => userIdSet.add(v.user_id));

  const uniqueUserIds = [...userIdSet];

  adminClient
    .from("faculty_requests")
    .update({ status: "fulfilled" })
    .in("id", requestIds)
    .then()
    .catch(console.error);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://your-app.vercel.app";

  await Promise.all(
    uniqueUserIds.map(async (userId) => {
      try {
        const { data } =
          await adminClient.auth.admin.getUserById(userId);

        const email = data?.user?.email;
        if (!email) return;

        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: `${trimmedName} is now on Faculty Review ✨`,
          html: `
            <p>${trimmedName} is now available.</p>
            <a href="${appUrl}/faculty/${facultyId}">
              View Faculty
            </a>
          `,
        });
      } catch (err) {
        console.error(err);
      }
    })
  );
}