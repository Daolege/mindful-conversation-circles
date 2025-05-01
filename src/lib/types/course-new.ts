
import { Course } from "./course";

export interface CourseSection {
  id: number | string;
  title: string;
  description?: string;
  position: number;
  lectures?: CourseLecture[];
}

export interface CourseLecture {
  id: number | string;
  title: string;
  description?: string;
  duration?: string;
  position: number;
  video_url?: string;
  has_homework?: boolean;
}

export interface CourseWithDetails extends Course {
  sections?: CourseSection[];
  learning_objectives?: string[];
  requirements?: string[];
  target_audience?: string[];
  instructor_name?: string;
  instructor_bio?: string;
  instructor_avatar?: string;
  materials?: {
    id: string | number;
    name: string;
    url: string;
    position: number;
    is_visible?: boolean;
  }[];
  status?: 'published' | 'draft' | 'archived';
}
