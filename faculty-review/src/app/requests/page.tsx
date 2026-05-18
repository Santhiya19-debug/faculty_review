import { createClient } from "@/lib/supabase/server";
import MainLayout from "@/components/layout/MainLayout";
import RequestsClient from "./RequestsClient";

export const metadata = { title: "Faculty Requests — Faculty Review" };

export default async function RequestsPage() {
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("faculty_requests")
    .select("*, departments(*), profiles(username)")
    .eq("status", "pending")
    .order("upvotes", { ascending: false });

  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  const { data: { user } } = await supabase.auth.getUser();

  let requestsWithVotes = requests || [];
  if (user && requests) {
    const { data: votes } = await supabase
      .from("request_votes")
      .select("request_id")
      .eq("user_id", user.id);
    const votedIds = new Set(votes?.map(v => v.request_id) || []);
    requestsWithVotes = requests.map(r => ({ ...r, user_voted: votedIds.has(r.id) }));
  }

  return (
    <MainLayout>
      <RequestsClient
        initialRequests={requestsWithVotes}
        departments={departments || []}
        currentUserId={user?.id || null}
      />
    </MainLayout>
  );
}
