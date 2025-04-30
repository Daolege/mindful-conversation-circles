
import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  // Add missing properties to fix type errors
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    roles?: string[];
    registration_date?: string;
  };
  account_status?: string;
  last_sign_in_at?: string | null;
}

export interface SignInResponse {
  data: any;
  error: Error | null;
  userStatus?: { isActive: boolean };
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResponse>;
  signUp: (email: string, password: string, name: string) => Promise<{ data: any, error: Error | null }>;
  signOut: () => Promise<void>;
  setAdmin: () => Promise<{ error: Error | null, data: any }>;
}
