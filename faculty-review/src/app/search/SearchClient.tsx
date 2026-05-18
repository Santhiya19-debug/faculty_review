"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Department, Faculty } from "@/types";
import FacultyCard from "@/components/faculty/FacultyCard";
import { FacultyCardSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";

interface SearchClientProps {
  departments: Department[];
}

type SortOption = "rating" | "reviews" | "name";

export default function SearchClient({ departments }: SearchClientProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedDept, setSelectedDept] = useState(searchParams.get("dept") || "");
  const [sort, setSort] = useState<SortOption>("rating");
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const supabase = createClient();

  const fetchFaculties = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("faculties")
      .select("*, departments(*)")
      .order(
        sort === "rating" ? "overall_rating" : sort === "reviews" ? "review_count" : "name",
        { ascending: sort === "name" }
      );

    if (query.trim()) {
      q = q.ilike("name", `%${query.trim()}%`);
    }

    if (selectedDept) {
      const dept = departments.find(d => d.slug === selectedDept);
      if (dept) q = q.eq("department_id", dept.id);
    }

    const { data } = await q.limit(50);
    setFaculties(data || []);
    setLoading(false);
  }, [query, selectedDept, sort]);

  useEffect(() => {
    const timer = setTimeout(fetchFaculties, 300);
    return () => clearTimeout(timer);
  }, [fetchFaculties]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">Browse Faculties</h1>
        <p className="text-sm text-gray-500">Find and review faculties across all departments</p>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3 mb-4 flex-col sm:flex-row">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blush-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search faculty name..."
            className="input-field pl-10"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="btn-secondary flex items-center gap-2 sm:w-auto"
        >
          <SlidersHorizontal size={15} />
          Filters
          {(selectedDept || sort !== "rating") && (
            <span className="w-2 h-2 bg-blush-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {filtersOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="card p-4 mb-5 overflow-hidden"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Department</label>
              <div className="relative">
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="input-field appearance-none pr-8"
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.slug}>{d.icon} {d.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blush-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Sort By</label>
              <div className="flex gap-2">
                {(["rating", "reviews", "name"] as SortOption[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${
                      sort === s ? "bg-blush-500 text-white border-blush-500" : "border-rose-200 text-gray-500 hover:border-blush-300"
                    }`}
                  >
                    {s === "rating" ? "⭐ Rating" : s === "reviews" ? "💬 Reviews" : "🔤 Name"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(selectedDept || sort !== "rating") && (
            <button
              onClick={() => { setSelectedDept(""); setSort("rating"); }}
              className="mt-3 text-xs text-blush-500 hover:underline"
            >
              Clear filters
            </button>
          )}
        </motion.div>
      )}

      {/* Department Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
        <button
          onClick={() => setSelectedDept("")}
          className={`shrink-0 badge py-1.5 px-3 border transition-all ${
            !selectedDept ? "bg-blush-500 text-white border-blush-500" : "bg-white text-gray-600 border-rose-200 hover:border-blush-300"
          }`}
        >
          All
        </button>
        {departments.map(d => (
          <button
            key={d.id}
            onClick={() => setSelectedDept(d.slug === selectedDept ? "" : d.slug)}
            className={`shrink-0 badge py-1.5 px-3 border transition-all ${
              selectedDept === d.slug ? "bg-blush-500 text-white border-blush-500" : "bg-white text-gray-600 border-rose-200 hover:border-blush-300"
            }`}
          >
            {d.icon} {d.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mb-3 text-sm text-gray-400 font-medium">
        {!loading && `${faculties.length} ${faculties.length === 1 ? "faculty" : "faculties"} found`}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => <FacultyCardSkeleton key={i} />)}
        </div>
      ) : faculties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-semibold text-gray-700 mb-1">No faculties found</p>
          <p className="text-sm text-gray-400">Try a different search or request a faculty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {faculties.map((faculty, i) => (
            <FacultyCard key={faculty.id} faculty={faculty} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
