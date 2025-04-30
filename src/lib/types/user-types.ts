
export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  is_active: boolean;
  registration_date: string | null;
  created_at: string;
  last_login_at: string | null;
}

export interface UserWithRoles extends UserProfile {
  roles: string[];
  login_method: string | null;
}

export type UserRole = 'admin' | 'user' | 'instructor';

export type SortField = 'roles' | 'is_active' | 'registration_date' | 'last_login_at' | 'login_method';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface ExportableUserData {
  name: string;
  email: string;
  roles: string;
  status: string;
  registrationDate: string;
  lastLoginDate: string;
  loginMethod: string;
}
