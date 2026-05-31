"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import DynamicFacultyFilter from "@/components/filters/DynamicFacultyFilter";
import FacultyCard from "@/components/faculty/FacultyCard";
import { FacultyCardSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { Faculty } from "@/types";
import { cn } from "@/lib/utils";

interface FacultyFromDB extends Faculty {
  faculty_name?: string;
}

export default function SearchClientDatabase() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [faculties, setFaculties] = useState<FacultyFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const supabase = createClient();

  const fetchFaculties = useCallback(async () => {
    setLoading(true);
    let query_builder = supabase
      .from("faculties")
      .select("*")
      .order("overall_rating", { ascending: false });

    // Text search
    if (query.trim()) {
      query_builder = query_builder.ilike("faculty_name", `%${query.trim()}%`);
    }

    // School filter
    if (selectedSchool) {
      query_builder = query_builder.eq("school_id", selectedSchool);
    }

    // Department filter
    if (selectedDept) {
      query_builder = query_builder.eq("department_id", selectedDept);
    }

    const { data, error } = await query_builder.limit(100);

    if (!error && data) {
      setFaculties(data);
    }
    setLoading(false);
  }, [query, selectedSchool, selectedDept]);

  useEffect(() => {
    const timer = setTimeout(fetchFaculties, 300);
    return () => clearTimeout(timer);
  }, [fetchFaculties]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">Browse Faculties</h1>
        <p className="text-sm text-gray-500">
          Search by name, school, or department
        </p>
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
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            >
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
          {(selectedSchool || selectedDept) && (
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
          className="card p-5 mb-5 overflow-hidden"
        >
          <DynamicFacultyFilter
            onSchoolChange={setSelectedSchool}
            onDepartmentChange={setSelectedDept}
          />
          {(selectedSchool || selectedDept) && (
            <button
              onClick={() => {
                setSelectedSchool(null);
                setSelectedDept(null);
              }}
              className="text-xs text-blush-500 hover:underline mt-4"
            >
              Clear all filters
            </button>
          )}
        </motion.div>
      )}

      {/* Results */}
      <div className="mb-3 text-sm text-gray-400 font-medium">
        {!loading && `${faculties.length} ${faculties.length === 1 ? "faculty" : "faculties"} found`}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <FacultyCardSkeleton key={i} />
          ))}
        </div>
      ) : faculties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-semibold text-gray-700 mb-1">No faculties found</p>
          <p className="text-sm text-gray-400">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {faculties.map((faculty, i) => {
            // Map database fields to component expectations
            const mappedFaculty = {
              ...faculty,
              name: faculty.faculty_name || faculty.name,
              overall_rating: faculty.overall_rating || 5,
              review_count: 0,
              is_verified: false,
            };
            return (
              <FacultyCard
                key={faculty.id}
                faculty={mappedFaculty as Faculty}
                index={i}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
