"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface School {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  school_id: string | null;
}

interface Faculty {
  id: string;
  faculty_name: string;
  school_id: string | null;
  department_id: string | null;
}

interface DynamicFilterProps {
  onFacultySelect?: (faculty: Faculty) => void;
  onSchoolChange?: (schoolId: string | null) => void;
  onDepartmentChange?: (deptId: string | null) => void;
}

export default function DynamicFacultyFilter({
  onFacultySelect,
  onSchoolChange,
  onDepartmentChange,
}: DynamicFilterProps) {
  const supabase = createClient();

  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);

  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [filteredDepts, setFilteredDepts] = useState<Department[]>([]);
  const [filteredFaculties, setFilteredFaculties] = useState<Faculty[]>([]);

  const [loading, setLoading] = useState(false);

  // Fetch schools on mount
  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("name");
      if (!error && data) setSchools(data);
      setLoading(false);
    };
    fetchSchools();
  }, []);

  // Fetch all departments on mount
  useEffect(() => {
    const fetchDepts = async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");
      if (!error && data) setDepartments(data);
    };
    fetchDepts();
  }, []);

  // Fetch all faculties on mount (for search)
  useEffect(() => {
    const fetchFaculties = async () => {
      const { data, error } = await supabase
        .from("faculties")
        .select("*")
        .order("faculty_name");
      if (!error && data) setFaculties(data);
    };
    fetchFaculties();
  }, []);

  // Filter departments when school changes
  useEffect(() => {
    if (selectedSchool) {
      const filtered = departments.filter(d => d.school_id === selectedSchool);
      setFilteredDepts(filtered);
    } else {
      setFilteredDepts(departments);
    }
    setSelectedDept(null); // Reset dept when school changes
    setFilteredFaculties([]); // Reset faculties
  }, [selectedSchool, departments]);

  // Filter faculties when school/dept changes
  useEffect(() => {
    let filtered = faculties;

    if (selectedSchool) {
      filtered = filtered.filter(f => f.school_id === selectedSchool);
    }
    if (selectedDept) {
      filtered = filtered.filter(f => f.department_id === selectedDept);
    }

    setFilteredFaculties(filtered);
    onDepartmentChange?.(selectedDept || null);
  }, [selectedDept, selectedSchool, faculties]);

  useEffect(() => {
    onSchoolChange?.(selectedSchool || null);
  }, [selectedSchool]);

  return (
    <div className="space-y-4">
      {/* School Filter */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          School
        </label>
        <div className="relative">
          <select
            value={selectedSchool || ""}
            onChange={e => setSelectedSchool(e.target.value || null)}
            disabled={loading}
            className="input-field appearance-none pr-8"
          >
            <option value="">All Schools</option>
            {schools.map(school => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blush-400 pointer-events-none" />
        </div>
      </div>

      {/* Department Filter */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Department
        </label>
        <div className="relative">
          <select
            value={selectedDept || ""}
            onChange={e => setSelectedDept(e.target.value || null)}
            disabled={filteredDepts.length === 0}
            className="input-field appearance-none pr-8"
          >
            <option value="">
              {selectedSchool ? "All Departments" : "Select a school first"}
            </option>
            {filteredDepts.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blush-400 pointer-events-none" />
        </div>
      </div>

      {/* Faculty Results */}
      {filteredFaculties.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Faculties ({filteredFaculties.length})
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredFaculties.map(fac => (
              <button
                key={fac.id}
                onClick={() => onFacultySelect?.(fac)}
                className="w-full text-left text-sm bg-white border border-rose-200 hover:bg-rose-50 hover:border-blush-300 rounded-xl px-3 py-2 transition-colors"
              >
                {fac.faculty_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {selectedSchool && selectedDept && filteredFaculties.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">No faculties found for this combination</p>
        </div>
      )}
    </div>
  );
}
