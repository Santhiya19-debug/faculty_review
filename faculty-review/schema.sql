-- =============================================
-- FACULTY REVIEW PLATFORM - SUPABASE SCHEMA
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DEPARTMENTS TABLE
-- =============================================
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO departments (name, slug, icon) VALUES
  ('Computer Science', 'cs', '💻'),
  ('Electronics & Communication', 'ece', '📡'),
  ('Mechanical Engineering', 'me', '⚙️'),
  ('Civil Engineering', 'ce', '🏗️'),
  ('Information Technology', 'it', '🖥️'),
  ('Electrical Engineering', 'ee', '⚡'),
  ('Business Administration', 'mba', '📊'),
  ('Mathematics', 'math', '📐'),
  ('Physics', 'physics', '🔬'),
  ('Chemistry', 'chemistry', '⚗️');

-- =============================================
-- PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FACULTIES TABLE
-- =============================================
CREATE TABLE faculties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  designation TEXT,
  subjects TEXT[], -- array of subjects taught
  avatar_url TEXT,
  bio TEXT,
  avg_strictness NUMERIC(3,1) DEFAULT 0,
  avg_internal_marks NUMERIC(3,1) DEFAULT 0,
  avg_cat_correction NUMERIC(3,1) DEFAULT 0,
  avg_teaching_quality NUMERIC(3,1) DEFAULT 0,
  avg_attendance NUMERIC(3,1) DEFAULT 0,
  avg_student_friendliness NUMERIC(3,1) DEFAULT 0,
  overall_rating NUMERIC(3,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for search
CREATE INDEX idx_faculties_name ON faculties USING gin(to_tsvector('english', name));
CREATE INDEX idx_faculties_department ON faculties(department_id);
CREATE INDEX idx_faculties_rating ON faculties(overall_rating DESC);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Rating categories (out of 10)
  strictness INTEGER CHECK (strictness BETWEEN 1 AND 10),
  internal_marks INTEGER CHECK (internal_marks BETWEEN 1 AND 10),
  cat_correction INTEGER CHECK (cat_correction BETWEEN 1 AND 10),
  teaching_quality INTEGER CHECK (teaching_quality BETWEEN 1 AND 10),
  attendance_flexibility INTEGER CHECK (attendance_flexibility BETWEEN 1 AND 10),
  student_friendliness INTEGER CHECK (student_friendliness BETWEEN 1 AND 10),
  overall_rating NUMERIC(3,1) GENERATED ALWAYS AS (
    (strictness + internal_marks + cat_correction + teaching_quality + attendance_flexibility + student_friendliness)::numeric / 6
  ) STORED,
  -- Review content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One review per user per faculty
  UNIQUE(faculty_id, user_id)
);

CREATE INDEX idx_reviews_faculty ON reviews(faculty_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- =============================================
-- COMMENTS TABLE
-- =============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_review ON comments(review_id);

-- =============================================
-- VOTES TABLE (upvote/downvote reviews)
-- =============================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

CREATE INDEX idx_votes_review ON votes(review_id);

-- =============================================
-- FACULTY REQUESTS TABLE
-- =============================================
CREATE TABLE faculty_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  faculty_name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  subject TEXT,
  description TEXT,
  upvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_requests_status ON faculty_requests(status);
CREATE INDEX idx_requests_upvotes ON faculty_requests(upvotes DESC);

-- =============================================
-- REQUEST VOTES TABLE
-- =============================================
CREATE TABLE request_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES faculty_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, user_id)
);

-- =============================================
-- REPORTS TABLE
-- =============================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  prefixes TEXT[] := ARRAY[
    'cooked','halfAwake','backBencher','chronically',
    'academically','technically','theoretically',
    'statistically','suspiciously','mysteriously',
    'hopelessly','barely','accidentally','lowkey',
    'highkey','allegedly','officially','unofficially',
    'reluctantly','aggressively','desperately',
    'ironically','delulu','unhinged','terminally',
    'deadass','professionally','mildly','extremely',
    'objectively','realistically','emotionally',
    'mentally','existentially','concerningly',
    'disturbingly','chaotically','dramatically',
    'catastrophically','segfault','nullPointer',
    'stackOver','infiniteLoop','deadlock',
    'memLeak','syntaxError','runtimePanic',
    'kernelPanic','buildFailed','gitConflict',
    'regexBroke','dockerDown','apiTimeout',
    'overflowed','asyncHell','future','aspiring',
    'certified','selfProclaimed',
    'technicallyCapable',
    'theoreticallyHireable',
    'legallyGraduating',
    'barelyFunctional',
    'academicallyPresent',
    'internalMarks',
    'attendance',
    'proxy',
    'CAT',
    'review',
    'CGPA',
    'deadline',
    'assignment',
    'project',
    'viva',
    'lab',
    'exam',
    'backlog',
    'hidden',
    'silent',
    'ghost',
    'shadow',
    'unknown',
    'anonymous',
    'invisible',
    'absent',
    'deleted',
    'secret',
    'incognito',
    'masked'
  ];

  suffixes TEXT[] := ARRAY[
    'Survivor','Scholar','Trying','Sleeping',
    'Studying','Functioning','Coping','Grinding',
    'Existing','Vibing','Dissociating',
    'Manifesting','Imploding','Spiraling',
    'Debugging','Overthinking','Procrastinating',
    'Brainrotted','NPC','Cooked','Soul',
    'Enjoyer','Debugger','Compiler','Deployer',
    'Committer','Reviewer','Architect',
    'Engineer','Developer','Coder',
    'Optimizer','Tester','Maintainer',
    'Unemployed','Dropout','Intern',
    'Overachiever','Candidate','Innovator',
    'Hunter','Negotiator','Investor',
    'Archaeologist','Calculator',
    'Manipulator','Tracker','Auditor',
    'Reporter','Detective','Investigator',
    'Observer','Witness','Victim',
    'Insider','Commenter','Lurker',
    'Reader','Follower','Member',
    'User','Profile','Entity',
    'Node','Agent','Operator',
    'Moderator','Participant',
    'Guest','Visitor','Browser',
    'Client'
  ];

  random_username TEXT;
BEGIN
  random_username :=
    prefixes[floor(random() * array_length(prefixes, 1) + 1)]
    || '_'
    || suffixes[floor(random() * array_length(suffixes, 1) + 1)]
    || '_'
    || floor(random() * 9000 + 1000)::TEXT;

  INSERT INTO profiles (id, username)
  VALUES (NEW.id, random_username);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update faculty rating averages after review insert/update/delete
CREATE OR REPLACE FUNCTION update_faculty_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE faculties SET
    avg_strictness = (SELECT COALESCE(AVG(strictness), 0) FROM reviews WHERE faculty_id = COALESCE(NEW.faculty_id, OLD.faculty_id)),
    avg_internal_marks = (SELECT COALESCE(AVG(internal_marks), 0) FROM reviews WHERE faculty_id = COALESCE(NEW.faculty_id, OLD.faculty_id)),
    avg_cat_correction = (SELECT COALESCE(AVG(cat_correction), 0) FROM reviews WHERE faculty_id = COALESCE(NEW.faculty_id, OLD.faculty_id)),
    avg_teaching_quality = (SELECT COALESCE(AVG(teaching_quality), 0) FROM reviews WHERE faculty_id = COALESCE(NEW.faculty_id, OLD.faculty_id)),
    avg_attendance = (SELECT COALESCE(AVG(attendance_flexibility), 0) FROM reviews WHERE faculty_id = COALESCE(NEW.faculty_id, OLD.faculty_id)),
    avg_student_friendliness = (SELECT COALESCE(AVG(student_friendliness), 0) FROM reviews WHERE faculty_id = COALESCE(NEW.faculty_id, OLD.faculty_id)),
    overall_rating = (SELECT COALESCE(AVG(overall_rating), 0) FROM reviews WHERE faculty_id = COALESCE(NEW.faculty_id, OLD.faculty_id)),
    review_count = (SELECT COUNT(*) FROM reviews WHERE faculty_id = COALESCE(NEW.faculty_id, OLD.faculty_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.faculty_id, OLD.faculty_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_faculty_ratings();

-- Update helpful_count on votes
CREATE OR REPLACE FUNCTION update_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reviews SET
    helpful_count = (SELECT COUNT(*) FROM votes WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) AND vote_type = 'up') -
                    (SELECT COUNT(*) FROM votes WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) AND vote_type = 'down')
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_helpful_count();

-- Update request vote count
CREATE OR REPLACE FUNCTION update_request_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE faculty_requests SET
    upvotes = (SELECT COUNT(*) FROM request_votes WHERE request_id = COALESCE(NEW.request_id, OLD.request_id))
  WHERE id = COALESCE(NEW.request_id, OLD.request_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_request_vote_change
  AFTER INSERT OR DELETE ON request_votes
  FOR EACH ROW EXECUTE FUNCTION update_request_votes();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles: public read username only, own profile full access
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Departments: public read
CREATE POLICY "Departments public read" ON departments FOR SELECT USING (true);

-- Faculties: public read
CREATE POLICY "Faculties public read" ON faculties FOR SELECT USING (true);

-- Reviews: public read, authenticated create/edit own
CREATE POLICY "Reviews public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "Auth users create review" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own review" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own review" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Comments: public read, authenticated create/delete own
CREATE POLICY "Comments public read" ON comments FOR SELECT USING (true);
CREATE POLICY "Auth users create comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comment" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Votes: public read, authenticated manage own
CREATE POLICY "Votes public read" ON votes FOR SELECT USING (true);
CREATE POLICY "Auth users vote" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own vote" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own vote" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Faculty requests: public read, authenticated create
CREATE POLICY "Requests public read" ON faculty_requests FOR SELECT USING (true);
CREATE POLICY "Auth users create request" ON faculty_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own request" ON faculty_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own request" ON faculty_requests FOR DELETE USING (auth.uid() = user_id);

-- Request votes
CREATE POLICY "Request votes public read" ON request_votes FOR SELECT USING (true);
CREATE POLICY "Auth users vote request" ON request_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own request vote" ON request_votes FOR DELETE USING (auth.uid() = user_id);

-- Reports: authenticated only
CREATE POLICY "Auth users create report" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users view own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- =============================================
-- SEED SAMPLE FACULTY DATA
-- =============================================
INSERT INTO faculties (name, department_id, designation, subjects, bio, overall_rating, review_count)
SELECT
  'Dr. Ria Sharma',
  (SELECT id FROM departments WHERE slug = 'cs'),
  'Associate Professor',
  ARRAY['Data Structures', 'Algorithms'],
  'Known for clear explanations and fair evaluations.',
  8.2, 35
UNION ALL
SELECT
  'Prof. Arvind Mehta',
  (SELECT id FROM departments WHERE slug = 'cs'),
  'Professor',
  ARRAY['Operating Systems', 'Computer Networks'],
  'Strict but fair, excellent teaching methodology.',
  7.9, 48
UNION ALL
SELECT
  'Dr. Neha Verma',
  (SELECT id FROM departments WHERE slug = 'it'),
  'Assistant Professor',
  ARRAY['Web Technologies', 'Database Management'],
  'Very approachable and student-friendly.',
  9.1, 43
UNION ALL
SELECT
  'Prof. Karan Singh',
  (SELECT id FROM departments WHERE slug = 'me'),
  'Professor',
  ARRAY['Thermodynamics', 'Fluid Mechanics'],
  'Experienced professor with industry background.',
  7.5, 84;
