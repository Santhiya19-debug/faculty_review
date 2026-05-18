import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MainLayout from "@/components/layout/MainLayout";
import FacultyCard from "@/components/faculty/FacultyCard";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("departments").select("name").eq("slug", slug).single();
  return { title: data ? `${data.name} — Faculty Review` : "Department" };
}

export default async function DepartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: department } = await supabase
    .from("departments")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!department) notFound();

  const { data: faculties } = await supabase
    .from("faculties")
    .select("*, departments(*)")
    .eq("department_id", department.id)
    .order("overall_rating", { ascending: false });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{department.icon}</span>
            <h1 className="section-title">{department.name}</h1>
          </div>
          <p className="text-sm text-gray-500">{faculties?.length || 0} faculties in this department</p>
        </div>

        {!faculties || faculties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎓</p>
            <p className="font-semibold text-gray-700">No faculties yet</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to request a faculty in this department!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {faculties.map((faculty, i) => (
              <FacultyCard key={faculty.id} faculty={faculty} index={i} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
