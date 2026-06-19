-- =============================================
-- PATCH: Add request_comments table (Section 4)
-- Run this in Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS request_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES faculty_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_comments_request ON request_comments(request_id);

ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Request comments public read" ON request_comments FOR SELECT USING (true);
CREATE POLICY "Auth users create request comment" ON request_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own request comment" ON request_comments FOR DELETE USING (auth.uid() = user_id);


