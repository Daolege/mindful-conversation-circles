
export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: number;
  progress_percent: number;
  completed: boolean;
  lecture_id: string;
  last_watched_at: string;
}

export interface UserCourse {
  id: string;
  user_id: string;
  course_id: number;
  purchased_at: string;
  last_accessed_at: string;
  courses: {
    id: number;
    title: string;
    category?: string;
    description?: string;
    duration?: string;
    featured?: boolean;
    imageurl?: string;
    instructor?: string;
    instructorid?: number;
    lastupdated?: string;
    lectures?: number;
    level?: string;
    whatyouwilllearn?: string[];
    syllabus?: any; // Changed from any[] to any to accept Json type from Supabase
  };
  course_progress?: CourseProgress[];
}
