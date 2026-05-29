import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MainLayout from "@/components/layout/MainLayout";
import FacultyDetailClient from "./FacultyDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("faculties").select("name").eq("id", id).single();
  return { title: data ? `${data.name} — Faculty Review` : "Faculty" };
}

export default async function FacultyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch faculty with departments AND schools
  const { data: faculty } = await supabase
    .from("faculties")
    .select("*, departments(*), schools(*)")
    .eq("id", id)
    .single();

  if (!faculty) notFound();

  // Fetch user-submitted reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(username)")
    .eq("faculty_id", id)
    .order("helpful_count", { ascending: false });

  // Fetch imported community reviews from faculty_reviews table
  const { data: importedReviews, error: importedError } = await supabase
    .from("faculty_reviews")
    .select("*")
    .eq("faculty_id", id)
    .order("created_at", { ascending: false });

  console.log("=== FACULTY REVIEWS DEBUG ===");
  console.log("Faculty ID being queried:", id);
  console.log("importedReviews:", importedReviews);
  console.log("importedError:", importedError);
  console.log("=============================");

  const { data: { user } } = await supabase.auth.getUser();

  // Attach vote info to user reviews
  let reviewsWithVotes = reviews || [];
  if (user && reviews) {
    const { data: votes } = await supabase
      .from("votes")
      .select("review_id, vote_type")
      .eq("user_id", user.id);
    const voteMap = new Map(votes?.map(v => [v.review_id, v.vote_type]) || []);
    reviewsWithVotes = reviews.map(r => ({
      ...r,
      user_vote: voteMap.get(r.id) || null,
    }));
  }

  return (
    <MainLayout>
      <FacultyDetailClient
        faculty={faculty}
        initialReviews={reviewsWithVotes}
        importedReviews={importedReviews || []}
        currentUserId={user?.id || null}
      />
    </MainLayout>
  );
}