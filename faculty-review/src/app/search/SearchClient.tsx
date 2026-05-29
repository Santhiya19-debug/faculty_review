"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { School, Department, Faculty } from "@/types";
import FacultyCard from "@/components/faculty/FacultyCard";
import { FacultyCardSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type SortOption = "rating" | "name" | "reviews";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Search & filter state
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("rating");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Data state
  const [schools, setSchools] = useState<School[]>([]);
  const [allDepts, setAllDepts] = useState<Department[]>([]);
  const [filteredDepts, setFilteredDepts] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  // Load schools on mount
  useEffect(() => {
    supabase.from("schools").select("*").order("name")
      .then(({ data }) => setSchools(data || []));
  }, []);

  // Load departments on mount
  useEffect(() => {
    supabase.from("departments").select("*").order("name")
      .then(({ data }) => {
        setAllDepts(data || []);
        setFilteredDepts(data || []);
      });
  }, []);

  // Filter departments when school changes
  useEffect(() => {
    if (selectedSchool) {
      const filtered = allDepts.filter(d => d.school_id === selectedSchool);
      setFilteredDepts(filtered);
      setSelectedDept(""); // reset dept when school changes
    } else {
      setFilteredDepts(allDepts);
    }
  }, [selectedSchool, allDepts]);

  // Fetch faculties
  const fetchFaculties = useCallback(async () => {
    setLoading(true);

    let q = supabase
      .from("faculties")
      .select("*, departments(*), schools(*)")
      .order(
        sort === "rating" ? "overall_rating" :
        sort === "reviews" ? "review_count" : "name",
        { ascending: sort === "name" }
      );

    // Text search by name
    if (query.trim()) {
      q = q.ilike("name", `%${query.trim()}%`);
    }

    // School filter
    if (selectedSchool) {
      q = q.eq("school_id", selectedSchool);
    }

    // Department filter
    if (selectedDept) {
      q = q.eq("department_id", selectedDept);
    }

    const { data } = await q.limit(100);
    setFaculties(data || []);
    setLoading(false);
  }, [query, selectedSchool, selectedDept, sort]);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(fetchFaculties, 300);
    return () => clearTimeout(timer);
  }, [fetchFaculties]);

  const clearFilters = () => {
    setSelectedSchool("");
    setSelectedDept("");
    setSort("rating");
  };

  const hasFilters = selectedSchool || selectedDept || sort !== "rating";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">Browse Faculties</h1>
        <p className="text-sm text-gray-500">
          Search by name, or filter by school and department
        </p>
      </div>

      {/* Search bar + filter toggle */}
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
          {hasFilters && <span className="w-2 h-2 bg-blush-500 rounded-full" />}
        </button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-5 mb-5 overflow-hidden"
          >
            <div className="grid sm:grid-cols-3 gap-4">

              {/* Option 1: School → Department → Faculty */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  School
                </label>
                <div className="relative">
                  <select
                    value={selectedSchool}
                    onChange={e => setSelectedSchool(e.target.value)}
                    className="input-field appearance-none pr-8 text-sm"
                  >
                    <option value="">All Schools</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-blush-400 pointer-events-none" />
                </div>
              </div>

              {/* Option 2: Department */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Department
                  {selectedSchool && filteredDepts.length > 0 && (
                    <span className="ml-1.5 text-blush-400 normal-case font-normal">
                      ({filteredDepts.length})
                    </span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={selectedDept}
                    onChange={e => setSelectedDept(e.target.value)}
                    className="input-field appearance-none pr-8 text-sm"
                    disabled={filteredDepts.length === 0}
                  >
                    <option value="">
                      {filteredDepts.length === 0 ? "No departments" : "All Departments"}
                    </option>
                    {filteredDepts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-blush-400 pointer-events-none" />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Sort By
                </label>
                <div className="flex gap-2">
                  {(["rating", "name", "reviews"] as SortOption[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setSort(s)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all",
                        sort === s
                          ? "bg-blush-500 text-white border-blush-500"
                          : "border-rose-200 text-gray-500 hover:border-blush-300"
                      )}
                    >
                      {s === "rating" ? "⭐ Rating" : s === "reviews" ? "💬 Reviews" : "🔤 Name"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-xs text-blush-500 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter pills */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedSchool && (
            <span className="badge bg-blush-50 text-blush-600 border border-blush-100 gap-1.5">
              🏫 {schools.find(s => s.id === selectedSchool)?.name?.split('(')[1]?.replace(')', '') || "School"}
              <button onClick={() => setSelectedSchool("")} className="hover:text-blush-800">
                <X size={11} />
              </button>
            </span>
          )}
          {selectedDept && (
            <span className="badge bg-blush-50 text-blush-600 border border-blush-100 gap-1.5">
              📚 {allDepts.find(d => d.id === selectedDept)?.name}
              <button onClick={() => setSelectedDept("")} className="hover:text-blush-800">
                <X size={11} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="mb-3 text-sm text-gray-400 font-medium">
        {!loading && `${faculties.length} ${faculties.length === 1 ? "faculty" : "faculties"} found`}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => <FacultyCardSkeleton key={i} />)}
        </div>
      ) : faculties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-semibold text-gray-700 mb-1">No faculties found</p>
          <p className="text-sm text-gray-400">
            {query ? `No results for "${query}"` : "Try a different filter or search by name"}
          </p>
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
