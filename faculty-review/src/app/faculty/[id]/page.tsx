import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MainLayout from "@/components/layout/MainLayout";
import FacultyDetailClient from "./FacultyDetailClient";

export const metadata = {
  title: "Faculty Review",
  description: "Faculty reviews for VIT students",
};

export default async function FacultyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch faculty with departments AND schools
  const facultyPromise = supabase
    .from("faculties")
    .select("*, departments(*), schools(*)")
    .eq("id", id)
    .single();

  // Fetch user-submitted reviews
  const reviewsPromise = supabase
    .from("reviews")
    .select("*, profiles(username)")
    .eq("faculty_id", id)
    .order("helpful_count", { ascending: false });

  // Fetch imported community reviews from faculty_reviews table
  const importedReviewsPromise = supabase
    .from("faculty_reviews")
    .select("*")
    .eq("faculty_id", id)
    .order("created_at", { ascending: false });

  const userPromise = supabase.auth.getUser();

  const [
    { data: faculty },
    { data: reviews },
    { data: importedReviews },
    {
      data: { user },
    },
  ] = await Promise.all([
    facultyPromise,
    reviewsPromise,
    importedReviewsPromise,
    userPromise,
  ]);

  if (!faculty) notFound();

  // Attach vote info to user reviews
  let reviewsWithVotes = reviews || [];

  if (user && reviews) {
    const { data: votes } = await supabase
      .from("votes")
      .select("review_id, vote_type")
      .eq("user_id", user.id);

    const voteMap = new Map(
      votes?.map((v) => [v.review_id, v.vote_type]) || []
    );

    reviewsWithVotes = reviews.map((r) => ({
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