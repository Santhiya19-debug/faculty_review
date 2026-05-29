import MainLayout from "@/components/layout/MainLayout";
import SearchClient from "./SearchClient";

export const metadata = { title: "Browse Faculties — Faculty Review" };

// No server-side data needed — SearchClient loads everything dynamically
export default function SearchPage() {
  return (
    <MainLayout>
      <SearchClient />
    </MainLayout>
  );
}
