
export interface Instructor {
  id: string;
  name: string;
  email: string;
  bio: string;
  expertise: string;
  avatar_url: string;
  created_at: string;
  status: "active" | "inactive";
}

export interface InstructorFormData {
  name: string;
  email: string;
  bio: string;
  expertise: string;
  avatar_url: string;
  status: "active" | "inactive";
}
