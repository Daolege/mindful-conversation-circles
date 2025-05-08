
import { Json } from '@/lib/supabase/database.types';

export interface Homework {
  id?: string;
  lecture_id: string;
  course_id: number;
  title: string;
  description?: string;
  type: string;
  options?: Json | {
    choices?: string[];
    question?: string;
    [key: string]: any;
  };
  is_required?: boolean;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  position?: number;
}

export interface HomeworkSubmission {
  id?: string;
  homework_id: string;
  user_id: string;
  lecture_id: string;
  course_id: number;
  answer?: string;
  content?: string; // Keep content field for backward compatibility 
  file_url?: string;
  status?: string; // Simplified status, no longer using union type
  score?: number;
  feedback?: string;
  submitted_at?: string;
  created_at?: string;
  reviewed_at?: string;
  user_name?: string;
  user_email?: string;
  homework?: {
    id: string;
    title: string;
    type: string;
    description?: string;
  };
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

export interface HomeworkStats {
  enrolledStudents: number;
  totalSubmissions: number;
  homeworkLectures: number;
  recentSubmissions: number;
}
