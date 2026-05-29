-- ==============================================
-- FACULTY REVIEWS DATABASE SCHEMA
-- Run this FIRST in Supabase SQL Editor
-- ==============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- STEP 1: Add schools table
-- ==============================================
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- STEP 2: Add school_id to existing departments table
-- (safe — only adds column if missing)
-- ==============================================
ALTER TABLE departments
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE SET NULL;

-- ==============================================
-- STEP 3: Add new columns to existing faculties table
-- (safe — only adds columns if missing)
-- ==============================================
ALTER TABLE faculties
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS strictness INTEGER CHECK (strictness BETWEEN 1 AND 10) DEFAULT 5,
  ADD COLUMN IF NOT EXISTS teaching_quality INTEGER CHECK (teaching_quality BETWEEN 1 AND 10) DEFAULT 5,
  ADD COLUMN IF NOT EXISTS attendance_flexibility INTEGER CHECK (attendance_flexibility BETWEEN 1 AND 10) DEFAULT 5,
  ADD COLUMN IF NOT EXISTS marks_leniency INTEGER CHECK (marks_leniency BETWEEN 1 AND 10) DEFAULT 5;

-- ==============================================
-- STEP 4: Create faculty_reviews table
-- (imported reviews — separate from user reviews)
-- ==============================================
CREATE TABLE IF NOT EXISTS faculty_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  review_text TEXT NOT NULL,
  source TEXT DEFAULT 'Community',
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faculty_reviews_faculty ON faculty_reviews(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculties_school ON faculties(school_id);
CREATE INDEX IF NOT EXISTS idx_faculties_teaching ON faculties(teaching_quality DESC);
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);

-- ==============================================
-- STEP 5: RLS Policies
-- ==============================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schools public read" ON schools FOR SELECT USING (true);
CREATE POLICY "Faculty reviews public read" ON faculty_reviews FOR SELECT USING (true);

-- ==============================================
-- HOW TO USE:
-- 1. Run THIS file first (import_schema.sql)
-- 2. Then run import/import_data.sql
-- ==============================================
