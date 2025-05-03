
// Define commonly used types for the Supabase tables
export interface ContactMethod {
  id: string;
  type: string;
  label: string | null;
  value: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaLink {
  id: string;
  name: string;
  icon_url: string;
  url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Helper function to handle query errors
export function handleContactMethodsQueryError<T>(data: T | null, error: any): T {
  if (error) {
    console.error("Supabase query error:", error);
    throw error;
  }
  
  return data as T;
}

// Type-safe Supabase query helper
export function safeSupabaseSelect<T>(tableName: string, select: string = '*') {
  return {
    async getAll() {
      const { data, error } = await (supabase as any)
        .from(tableName)
        .select(select);
      
      return handleContactMethodsQueryError<T[]>(data, error);
    },
    
    async getOne(id: string) {
      const { data, error } = await (supabase as any)
        .from(tableName)
        .select(select)
        .eq('id', id)
        .single();
      
      return handleContactMethodsQueryError<T>(data, error);
    }
  };
}
