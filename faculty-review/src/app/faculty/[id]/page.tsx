import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MainLayout from "@/components/layout/MainLayout";
import FacultyDetailClient from "./FacultyDetailClient";

export const metadata = {
  title: "Faculty Review",
  description: "Faculty reviews for VIT students",
};

export default async function FacultyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch faculty with departments AND schools
  const facultyPromise = supabase
  .from("faculties")
  .select("*, departments(*), schools(*)")
  .eq("id", id)
  .single();

const reviewsPromise = supabase
  .from("reviews")
  .select("*, profiles(username)")
  .eq("faculty_id", id)
  .order("helpful_count", { ascending: false });

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