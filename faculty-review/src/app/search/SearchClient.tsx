"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { School, Department, Faculty } from "@/types";
import FacultyCard from "@/components/faculty/FacultyCard";
import { FacultyCardSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type SortOption = "rating" | "name" | "reviews";

// How many faculties to show per page
const PAGE_SIZE = 24;

export default function SearchClient() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search & filter state (initialized from URL parameters)
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [selectedSchool, setSelectedSchool] = useState(() => searchParams.get("school") || "");
  const [selectedDept, setSelectedDept] = useState(() => searchParams.get("dept") || "");
  const [sort, setSort] = useState<SortOption>(() => (searchParams.get("sort") as SortOption) || "rating");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination (initialized from URL parameters; 1-indexed in URL, 0-indexed in code)
  const [page, setPage] = useState(() => {
    const p = searchParams.get("page");
    return p ? Math.max(0, parseInt(p, 10) - 1) : 0;
  });
  const [totalCount, setTotalCount] = useState(0);

  // Data
  const [schools, setSchools] = useState<School[]>([]);
  const [allDepts, setAllDepts] = useState<Department[]>([]);
  const [filteredDepts, setFilteredDepts] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  // Ref tracking last synchronized query string to prevent loops and lock navigation source
  const lastSyncedParams = useRef(searchParams.toString());

  // 1. Sync state FROM URL (handles browser Back/Forward navigation)
  useEffect(() => {
    const currentParamsStr = searchParams.toString();
    if (currentParamsStr !== lastSyncedParams.current) {
      const q = searchParams.get("q") || "";
      const school = searchParams.get("school") || "";
      const dept = searchParams.get("dept") || "";
      const sortParam = (searchParams.get("sort") as SortOption) || "rating";
      const pageParam = searchParams.get("page");
      const parsedPage = pageParam ? Math.max(0, parseInt(pageParam, 10) - 1) : 0;

      setQuery(q);
      setSelectedSchool(school);
      setSelectedDept(dept);
      if (["rating", "name", "reviews"].includes(sortParam)) {
        setSort(sortParam);
      }
      setPage(parsedPage);

      lastSyncedParams.current = currentParamsStr;
    }
  }, [searchParams]);

  // 2. Sync state TO URL (handles user-driven filter interactions)
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedSchool) params.set("school", selectedSchool);
    if (selectedDept) params.set("dept", selectedDept);
    if (sort !== "rating") params.set("sort", sort);
    if (page > 0) params.set("page", (page + 1).toString());

    const newParamsStr = params.toString();

    // Only update if local state differs from synced state AND the browser URL matches synced state
    if (newParamsStr !== lastSyncedParams.current && searchParams.toString() === lastSyncedParams.current) {
      lastSyncedParams.current = newParamsStr;
      router.replace(`?${newParamsStr}`, { scroll: false });
    }
  }, [query, selectedSchool, selectedDept, sort, page, router, searchParams]);

  // Load schools once
  useEffect(() => {
    supabase.from("schools").select("id, name").order("name")
      .then(({ data }) => setSchools(data || []));
  }, []);

  // Load departments once
  useEffect(() => {
    supabase.from("departments").select("id, name, school_id, icon, slug").order("name")
      .then(({ data }) => {
        setAllDepts(data || []);
        setFilteredDepts(data || []);
      });
  }, []);

  // Filter departments when school changes
  useEffect(() => {
    if (selectedSchool) {
      setFilteredDepts(allDepts.filter(d => d.school_id === selectedSchool));
      // Guard against clearing state if the change came directly from browser navigation
      if (selectedSchool !== searchParams.get("school")) {
        setSelectedDept("");
        setPage(0);
      }
    } else {
      setFilteredDepts(allDepts);
      if (searchParams.get("school")) {
        setSelectedDept("");
        setPage(0);
      }
    }
  }, [selectedSchool, allDepts, searchParams]);

  // Reset page when filters/sort/query change (only if changed via user-interaction)
  useEffect(() => {
    const urlQ = searchParams.get("q") || "";
    const urlDept = searchParams.get("dept") || "";
    const urlSort = searchParams.get("sort") || "rating";

    if (query !== urlQ || selectedDept !== urlDept || sort !== urlSort) {
      setPage(0);
    }
  }, [query, selectedDept, sort, searchParams]);

  // Fetch faculties — only the fields FacultyCard needs (Opt 2+5)
  const fetchFaculties = useCallback(async () => {
    setLoading(true);

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let q = supabase
      .from("faculties")
      .select(
        `id,
         name,
         designation,
         avatar_url,
         overall_rating,
         review_count,
         teaching_quality,
         strictness,
         attendance_flexibility,
         marks_leniency,
         is_verified,
         school_id,
         department_id,
         last_reviewed_at,
         departments ( id, name, icon, slug ),
         schools ( id, name )`,
        { count: "exact" }
      )
      .order(
        sort === "rating" ? "overall_rating" :
        sort === "reviews" ? "review_count" : "name",
        { ascending: sort === "name" }
      )
      .range(from, to);

    if (query.trim()) q = q.or(
      `name.ilike.${query.trim()}%,name.ilike.% ${query.trim()}%`);
    if (selectedSchool) q = q.eq("school_id", selectedSchool);
    if (selectedDept) q = q.eq("department_id", selectedDept);

    const { data: raw, count } = await q;
    setFaculties((raw || []) as unknown as Faculty[]);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [query, selectedSchool, selectedDept, sort, page]);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(fetchFaculties, 300);
    return () => clearTimeout(timer);
  }, [fetchFaculties]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasFilters = !!(selectedSchool || selectedDept || sort !== "rating");

  const clearFilters = () => {
    setSelectedSchool("");
    setSelectedDept("");
    setSort("rating");
    setPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">Browse Faculties</h1>
        <p className="text-sm text-gray-500">Search by name, or filter by school and department</p>
      </div>

      {/* Search + filter toggle */}
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
              {/* School */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">School</label>
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

              {/* Department */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Department
                  {selectedSchool && filteredDepts.length > 0 && (
                    <span className="ml-1.5 text-blush-400 normal-case font-normal">({filteredDepts.length})</span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={selectedDept}
                    onChange={e => setSelectedDept(e.target.value)}
                    disabled={filteredDepts.length === 0}
                    className="input-field appearance-none pr-8 text-sm"
                  >
                    <option value="">{filteredDepts.length === 0 ? "No departments" : "All Departments"}</option>
                    {filteredDepts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-blush-400 pointer-events-none" />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Sort By</label>
                <div className="flex gap-2">
                  {([ "rating", "name", "reviews" ] as SortOption[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setSort(s)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all",
                        sort === s ? "bg-blush-500 text-white border-blush-500" : "border-rose-200 text-gray-500 hover:border-blush-300"
                      )}
                    >
                      {s === "rating" ? "⭐ Rating" : s === "reviews" ? "💬 Reviews" : "🔤 Name"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 text-xs text-blush-500 hover:underline">
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
              🏫 {schools.find(s => s.id === selectedSchool)?.name?.match(/\(([^)]+)\)/)?.[1] || "School"}
              <button onClick={() => setSelectedSchool("")} className="hover:text-blush-800"><X size={11} /></button>
            </span>
          )}
          {selectedDept && (
            <span className="badge bg-blush-50 text-blush-600 border border-blush-100 gap-1.5">
              📚 {allDepts.find(d => d.id === selectedDept)?.name}
              <button onClick={() => setSelectedDept("")} className="hover:text-blush-800"><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-400 font-medium">
          {!loading && (
            totalCount > 0
              ? `Showing ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, totalCount)} of ${totalCount} faculties`
              : "No faculties found"
          )}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <FacultyCardSkeleton key={i} />)}
        </div>
       ) : faculties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Faculty not found</h3>
          <p className="text-sm text-gray-500 mb-6">
            {query ? `No faculty found for "${query}".` : "Try a different search."}
          </p>
          <Link href="/requests" className="btn-primary inline-flex items-center">
            Request Faculty
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {faculties.map((faculty, i) => (
            <FacultyCard key={faculty.id} faculty={faculty} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-xl border border-rose-200 text-gray-500 hover:border-blush-300 hover:text-blush-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              // Show pages around current page
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    "w-9 h-9 rounded-xl text-sm font-semibold transition-all",
                    pageNum === page
                      ? "bg-blush-500 text-white shadow-pink"
                      : "border border-rose-200 text-gray-500 hover:border-blush-300 hover:text-blush-500"
                  )}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-xl border border-rose-200 text-gray-500 hover:border-blush-300 hover:text-blush-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}