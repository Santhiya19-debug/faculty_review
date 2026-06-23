import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const baseUrl = "https://faculty-review-vit-vellore-dun.vercel.app";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: faculties, error } = await supabase
    .from("faculties")
    .select("id");

  if (error) {
    console.error("Sitemap faculty fetch failed:", error);
  }

  const facultyUrls =
    faculties?.map((faculty) => ({
      url: `${baseUrl}/faculty/${faculty.id}`,
      lastModified: new Date(),
      priority: 0.9,
    })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${baseUrl}/browse-faculties`,
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: `${baseUrl}/departments`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}/requests`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      priority: 0.7,
    },
    ...facultyUrls,
  ];
}