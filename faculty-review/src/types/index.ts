export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface School {
  id: string;
  name: string;
  created_at?: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string | null;
  icon: string | null;
  school_id: string | null;
  created_at?: string;
  schools?: School;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Faculty {
  id: string;
  name: string;
  department_id: string | null;
  school_id: string | null;
  designation: string | null;
  subjects?: string[] | null;
  avatar_url: string | null;
  bio?: string | null;
  // Original rating fields (user reviews)
  avg_strictness?: number;
  avg_internal_marks?: number;
  avg_cat_correction?: number;
  avg_teaching_quality?: number;
  avg_attendance?: number;
  avg_student_friendliness?: number;
  // Imported/auto-generated metric fields
  strictness?: number | null;
  teaching_quality?: number | null;
  attendance_flexibility?: number | null;
  marks_leniency?: number | null;
  overall_rating: number;
  review_count: number;
  is_verified: boolean;
  created_at?: string;
  // Joined relations
  departments?: Department;
  schools?: School;
}

export interface ImportedReview {
  id: string;
  faculty_id: string;
  review_text: string;
  source: string | null;
  upvotes: number;
  created_at: string;
}

export interface Review {
  id: string;
  faculty_id: string;
  user_id: string;
  strictness: number;
  internal_marks: number;
  cat_correction: number;
  teaching_quality: number;
  attendance_flexibility: number;
  student_friendliness: number;
  overall_rating: number;
  title: string;
  content: string;
  helpful_count: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  user_vote?: 'up' | 'down' | null;
}

export interface Comment {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

export interface FacultyRequest {
  id: string;
  user_id: string;
  faculty_name: string;
  department_id: string | null;
  subject: string | null;
  description: string | null;
  upvotes: number;
  status: 'pending' | 'fulfilled' | 'rejected';
  created_at: string;
  departments?: Department;
  profiles?: Profile;
  user_voted?: boolean;
}

export interface RatingCategory {
  key: keyof Pick<Review, 'strictness' | 'internal_marks' | 'cat_correction' | 'teaching_quality' | 'attendance_flexibility' | 'student_friendliness'>;
  label: string;
  emoji: string;
  description: string;
}

export const RATING_CATEGORIES: RatingCategory[] = [
  { key: 'strictness', label: 'Strictness Level', emoji: '😤', description: 'How strict is the faculty?' },
  { key: 'internal_marks', label: 'Internal Marks Fairness', emoji: '📊', description: 'Are internal marks given fairly?' },
  { key: 'cat_correction', label: 'CAT Correction Style', emoji: '📝', description: 'How fair is the correction?' },
  { key: 'teaching_quality', label: 'Teaching Quality', emoji: '🎓', description: 'How well do they teach?' },
  { key: 'attendance_flexibility', label: 'Attendance Flexibility', emoji: '📅', description: 'How flexible with attendance?' },
  { key: 'student_friendliness', label: 'Student Friendliness', emoji: '🤝', description: 'How approachable are they?' },
];
