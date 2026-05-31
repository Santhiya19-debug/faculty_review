import { createClient } from "@/lib/supabase/server";

interface StatCard {
  emoji: string;
  label: string;
  value: number;
}

// Format number with + suffix and commas e.g. 1,421+
function formatCount(n: number): string {
  return n.toLocaleString() + "+";
}

export default async function CommunitySnapshot() {
  const supabase = await createClient();

  // Run all 4 counts in parallel — each is a lightweight COUNT query
  const [
    { count: facultyCount },
    { count: reviewCount },
    { count: schoolCount },
    { count: deptCount },
  ] = await Promise.all([
    supabase.from("faculties").select("*", { count: "exact", head: true }),
    supabase.from("faculty_reviews").select("*", { count: "exact", head: true }),
    supabase.from("schools").select("*", { count: "exact", head: true }),
    supabase.from("departments").select("*", { count: "exact", head: true }),
  ]);

  const stats: StatCard[] = [
    { emoji: "👨‍🏫", label: "Faculties Listed", value: facultyCount ?? 0 },
    { emoji: "📝", label: "Reviews Shared", value: reviewCount ?? 0 },
    { emoji: "🏫", label: "Schools Covered", value: schoolCount ?? 0 },
    { emoji: "📚", label: "Departments", value: deptCount ?? 0 },
  ];

  return (
    <section className="py-10 sm:py-12 bg-white border-y border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-blush-400 uppercase tracking-widest mb-2">
            Live Database
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-800">
            Community Snapshot
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Real numbers, real students, real reviews.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="card p-5 sm:p-6 flex flex-col items-center text-center group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Emoji icon */}
              <div className="w-12 h-12 bg-blush-50 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-blush-100 group-hover:scale-110 transition-transform duration-200">
                {stat.emoji}
              </div>

              {/* Count */}
              <p className="font-display font-bold text-3xl sm:text-4xl text-gray-800 leading-none mb-2">
                {formatCount(stat.value)}
              </p>

              {/* Label */}
              <p className="text-xs sm:text-sm font-medium text-gray-500 leading-tight">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
