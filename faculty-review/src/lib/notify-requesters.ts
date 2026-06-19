import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL } from "@/lib/resend";
console.log("notifyAndFulfillRequests called");
console.log("faculty:", facultyName, facultyId);

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function notifyAndFulfillRequests(
  facultyName: string,
  facultyId: string
): Promise<void> {
  console.log("notifyAndFulfillRequests called");
  console.log("faculty:", facultyName, facultyId);
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

  const { error: updateError } = await adminClient
  .from("faculty_requests")
  .update({ status: "fulfilled" })
  .in("id", requestIds);

if (updateError) {
  console.error(updateError);
}

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://faculty-review-vit-vellore-dun.vercel.app/";

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
          subject: `New review added for ${trimmedName} `,,
          html: `
  <div style="
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: auto;
    padding: 32px;
    background: #fff;
    border-radius: 16px;
    border: 1px solid #f1f1f1;
  ">
    <h2 style="color:#ff4d88;margin-bottom:20px;">
      Hey 👋
    </h2>

    <p style="font-size:16px;color:#333;line-height:1.7;">
      Got tea for you ☕
    </p>

    <p style="font-size:16px;color:#333;line-height:1.7;">
      The faculty you requested,
      <strong>${trimmedName}</strong>,
      just got a new review 🎉
    </p>

    <p style="font-size:16px;color:#333;line-height:1.7;">
      Tap below to check what students are saying.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${appUrl}/faculty/${facultyId}"
        style="
          background:#ff4d88;
          color:white;
          text-decoration:none;
          padding:14px 28px;
          border-radius:12px;
          font-weight:600;
          display:inline-block;
        ">
        Spill the tea →
      </a>
    </div>

    <p style="font-size:12px;color:#888;text-align:center;margin-top:30px;">
      Faculty Review • Built by students, for students 💗
    </p>
  </div>
`,
        });
      } catch (err) {
        console.error(err);
      }
    })
  );
}