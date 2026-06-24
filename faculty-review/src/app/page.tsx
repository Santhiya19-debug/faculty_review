import { createClient } from "@/lib/supabase/server";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/shared/HeroSection";
import FeaturesRow from "@/components/shared/FeaturesRow";
import TopFaculties from "@/components/shared/TopFaculties";
import CommunitySnapshot from "@/components/shared/CommunitySnapshot";
import RecentReviews from "@/components/shared/RecentReviews";
import RequestCTA from "@/components/shared/RequestCTA";

export default async function HomePage() {
  const supabase = await createClient();

 // Top rated faculties — join departments and schools
const topFacultiesPromise = supabase
  .from("faculties")
  .select("*, departments(*), schools(*)")
  .order("overall_rating", { ascending: false })
  .limit(8);

// Recent user-submitted reviews
const recentReviewsPromise = supabase
  .from("reviews")
  .select("*, profiles(username), faculties(name, id)")
  .order("created_at", { ascending: false })
  .limit(4);

// Schools for hero section search dropdown
const schoolsPromise = supabase
  .from("schools")
  .select("*")
  .order("name");

const [
  { data: topFaculties },
  { data: recentReviews },
  { data: schools },
] = await Promise.all([
  topFacultiesPromise,
  recentReviewsPromise,
  schoolsPromise,
]);

  return (
  <MainLayout>
    <HeroSection schools={schools || []} />
    <FeaturesRow />
    <TopFaculties faculties={topFaculties || []} />

    <CommunitySnapshot />

    <RequestCTA />

    <RecentReviews reviews={recentReviews || []} />
  </MainLayout>
);
}
