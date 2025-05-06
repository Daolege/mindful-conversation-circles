
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
  file_url?: string;
  submitted_at?: string;
}
