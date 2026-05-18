import { createClient } from "@/lib/supabase/server";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/shared/HeroSection";
import FeaturesRow from "@/components/shared/FeaturesRow";
import TopFaculties from "@/components/shared/TopFaculties";
import RecentReviews from "@/components/shared/RecentReviews";
import RequestCTA from "@/components/shared/RequestCTA";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch top rated faculties
  const { data: topFaculties } = await supabase
    .from("faculties")
    .select("*, departments(*)")
    .order("overall_rating", { ascending: false })
    .limit(8);

  // Fetch recent reviews
  const { data: recentReviews } = await supabase
    .from("reviews")
    .select("*, profiles(username), faculties(name, id)")
    .order("created_at", { ascending: false })
    .limit(4);

  // Fetch departments
  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  return (
    <MainLayout>
      <HeroSection departments={departments || []} />
      <FeaturesRow />
      <TopFaculties faculties={topFaculties || []} />
      <RecentReviews reviews={recentReviews || []} />
      <RequestCTA />
    </MainLayout>
  );
}
