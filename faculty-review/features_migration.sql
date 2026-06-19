-- ==============================================
-- FEATURES MIGRATION
-- Run in Supabase SQL Editor
-- ==============================================

-- FEATURE 3: Track when last review was added per faculty
ALTER TABLE faculties
  ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMPTZ;

-- Index for badge lookup performance
CREATE INDEX IF NOT EXISTS idx_faculties_last_reviewed
  ON faculties (last_reviewed_at DESC NULLS LAST);

-- Trigger: auto-update last_reviewed_at whenever a review is inserted
CREATE OR REPLACE FUNCTION update_faculty_last_reviewed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE faculties
  SET last_reviewed_at = NOW()
  WHERE id = NEW.faculty_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_last_reviewed ON reviews;
CREATE TRIGGER trg_update_last_reviewed
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_faculty_last_reviewed();

-- FEATURE 1: Backfill last_reviewed_at for existing faculties
-- (sets it to the most recent review date for each faculty)
UPDATE faculties f
SET last_reviewed_at = (
  SELECT MAX(r.created_at)
  FROM reviews r
  WHERE r.faculty_id = f.id
)
WHERE EXISTS (
  SELECT 1 FROM reviews r WHERE r.faculty_id = f.id
);