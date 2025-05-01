
import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  account_status?: string;
  last_sign_in_at?: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    data: any;
    error: Error | null;
    userStatus?: { isActive: boolean };
  }>;
  signUp: (email: string, password: string, name: string) => Promise<{
    data: any;
    error: Error | null;
  }>;
  signOut: () => Promise<any>;
  setAdmin: () => Promise<{
    data: any;
    error: Error | null;
  }>;
  recoverSession: () => Promise<Session | null>;
}
