import { createClient } from "@/lib/supabase/server";
import MainLayout from "@/components/layout/MainLayout";
import SearchClient from "./SearchClient";

export const metadata = { title: "Browse Faculties — Faculty Review" };

export default async function SearchPage() {
  const supabase = await createClient();

  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  return (
    <MainLayout>
      <SearchClient departments={departments || []} />
    </MainLayout>
  );
}
