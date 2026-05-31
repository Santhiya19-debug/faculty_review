-- ==============================================
-- PERFORMANCE INDEXES
-- Run this in Supabase SQL Editor
-- Safe to run multiple times (IF NOT EXISTS)
-- ==============================================

-- faculties: name search (full-text + ilike)
CREATE INDEX IF NOT EXISTS idx_faculties_name_text
  ON faculties USING gin(to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_faculties_name_lower
  ON faculties (lower(name) text_pattern_ops);

-- faculties: school + department filtering
CREATE INDEX IF NOT EXISTS idx_faculties_school_id
  ON faculties (school_id);

CREATE INDEX IF NOT EXISTS idx_faculties_department_id
  ON faculties (department_id);

-- faculties: sorting
CREATE INDEX IF NOT EXISTS idx_faculties_overall_rating
  ON faculties (overall_rating DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_faculties_review_count
  ON faculties (review_count DESC NULLS LAST);

-- faculty_reviews: faculty lookup (join speed)
CREATE INDEX IF NOT EXISTS idx_faculty_reviews_faculty_id
  ON faculty_reviews (faculty_id);

CREATE INDEX IF NOT EXISTS idx_faculty_reviews_created
  ON faculty_reviews (created_at DESC);

-- reviews (user-submitted): faculty lookup
CREATE INDEX IF NOT EXISTS idx_reviews_faculty_id
  ON reviews (faculty_id);

CREATE INDEX IF NOT EXISTS idx_reviews_created
  ON reviews (created_at DESC);

-- faculty_requests: status + date sorting
CREATE INDEX IF NOT EXISTS idx_requests_status
  ON faculty_requests (status);

CREATE INDEX IF NOT EXISTS idx_requests_created
  ON faculty_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_requests_upvotes
  ON faculty_requests (upvotes DESC);

-- departments: school lookup
CREATE INDEX IF NOT EXISTS idx_departments_school_id
  ON departments (school_id);

-- schools: name lookup
CREATE INDEX IF NOT EXISTS idx_schools_name_lower
  ON schools (lower(name));
