
export interface Instructor {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  expertise: string | null;
  avatar_url: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface InstructorFormData {
  name: string;
  email: string;
  bio: string;
  expertise: string;
  avatar_url: string;
  status: 'active' | 'inactive';
}
