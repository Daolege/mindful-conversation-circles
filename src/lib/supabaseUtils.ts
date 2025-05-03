
import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

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

export interface PaymentIcon {
  id: string;
  name: string;
  icon_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LegalDocument {
  id: string;
  slug: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  id: string;
  rate: number;
  from_currency: string;
  to_currency: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string | null;
  site_description: string | null;
  logo_url: string | null;
  contact_email: string | null;
  support_phone: string | null;
  company_name: string | null;
  company_full_name: string | null;
  company_registration_number: string | null;
  company_address: string | null;
  copyright_text: string | null;
  enable_registration: boolean;
  maintenance_mode: boolean;
  created_at: string;
  updated_at: string;
}

// Additional types needed based on errors
export interface AboutPageSettings {
  id: string;
  title: string;
  subtitle: string;
  story: string;
  mission: string;
  vision: string;
  team_members: any; // Consider using a more specific type
  stats: any; // Consider using a more specific type
  is_visible: boolean;
  updated_at: string;
  updated_by: string;
}

export interface OrderStats {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface CourseProgressData {
  progress_percent: number;
}

// Universal error handler for Supabase queries
export function handleQueryError<T>(data: T | null, error: PostgrestError | null, defaultValue?: T): T {
  if (error) {
    console.error("Supabase query error:", error);
    throw error;
  }
  
  return data as T || defaultValue as T;
}

// Export aliases for specific table error handlers (for backward compatibility)
export const handleContactMethodsQueryError = handleQueryError;
export const handleSocialMediaLinksQueryError = handleQueryError;
export const handlePaymentIconsQueryError = handleQueryError;
export const handleLegalDocumentsQueryError = handleQueryError;
export const handleExchangeRatesQueryError = handleQueryError;
export const handleSiteSettingsQueryError = handleQueryError;
export const handleSupabaseQueryError = handleQueryError;
export const handleAboutPageQueryError = handleQueryError;
export const handleCoursesQueryError = handleQueryError;
export const handleInstructorsQueryError = handleQueryError;

// Additional error handlers for specific tables
export const handleOrderStatsQueryError = handleQueryError;
export const handleCourseProgressQueryError = handleQueryError;
export const handleHomeworkQueryError = handleQueryError;
export const handleHomeworkSubmissionsQueryError = handleQueryError;
export const handleUserRolesQueryError = handleQueryError;

// Type-safe Supabase query helper with type assertion and @ts-ignore for table name flexibility
export function safeSupabaseSelect<T>(tableName: string, select: string = '*') {
  return {
    async getAll() {
      // @ts-ignore - Suppressing type error for table name
      const { data, error } = await supabase
        .from(tableName)
        .select(select);
      
      return handleQueryError<T[]>(data as T[], error);
    },
    
    async getOne(id: string) {
      // @ts-ignore - Suppressing type error for table name
      const { data, error } = await supabase
        .from(tableName)
        .select(select)
        .eq('id', id)
        .single();
      
      return handleQueryError<T>(data as T, error);
    },

    async getByFilter(filterField: string, filterValue: any) {
      // @ts-ignore - Suppressing type error for table name
      const { data, error } = await supabase
        .from(tableName)
        .select(select)
        .eq(filterField, filterValue);
      
      return handleQueryError<T[]>(data as T[], error);
    },

    async getOrdered(orderField: string = 'display_order', ascending: boolean = true) {
      // @ts-ignore - Suppressing type error for table name
      const { data, error } = await supabase
        .from(tableName)
        .select(select)
        .order(orderField, { ascending });
      
      return handleQueryError<T[]>(data as T[], error);
    }
  };
}

// Flexible Supabase mutation helper with type assertion and @ts-ignore for table name flexibility
export function safeSupabaseMutation<T>(tableName: string) {
  return {
    async insert(record: Partial<T>) {
      // @ts-ignore - Suppressing type error for table name
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select();
      
      return { data: data as T[], error };
    },
    
    async update(id: string, updates: Partial<T>) {
      // @ts-ignore - Suppressing type error for table name
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select();
      
      return { data: data as T[], error };
    },

    async upsert(records: Partial<T> | Partial<T>[]) {
      // @ts-ignore - Suppressing type error for table name
      const { data, error } = await supabase
        .from(tableName)
        .upsert(records)
        .select();
      
      return { data: data as T[], error };
    },
    
    async delete(id: string) {
      // @ts-ignore - Suppressing type error for table name
      const { data, error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      return { data, error };
    },

    async deleteAll() {
      // @ts-ignore - Suppressing type error for table name
      const { data, error } = await supabase
        .from(tableName)
        .delete()
        .not('id', 'is', null);
      
      return { data, error };
    }
  };
}

// Generic data services
export const contactMethodsService = {
  getAll: () => safeSupabaseSelect<ContactMethod>('contact_methods').getAll(),
  getOrdered: () => safeSupabaseSelect<ContactMethod>('contact_methods').getOrdered(),
  upsert: (records: Partial<ContactMethod>[]) => safeSupabaseMutation<ContactMethod>('contact_methods').upsert(records),
  deleteAll: () => safeSupabaseMutation<ContactMethod>('contact_methods').deleteAll()
};

export const socialMediaService = {
  getAll: () => safeSupabaseSelect<SocialMediaLink>('social_media_links').getAll(),
  getOrdered: () => safeSupabaseSelect<SocialMediaLink>('social_media_links').getOrdered(),
  upsert: (records: Partial<SocialMediaLink>[]) => safeSupabaseMutation<SocialMediaLink>('social_media_links').upsert(records),
  deleteAll: () => safeSupabaseMutation<SocialMediaLink>('social_media_links').deleteAll()
};

export const paymentIconsService = {
  getAll: () => safeSupabaseSelect<PaymentIcon>('payment_icons').getAll(),
  getOrdered: () => safeSupabaseSelect<PaymentIcon>('payment_icons').getOrdered(),
  upsert: (records: Partial<PaymentIcon>[]) => safeSupabaseMutation<PaymentIcon>('payment_icons').upsert(records),
  deleteAll: () => safeSupabaseMutation<PaymentIcon>('payment_icons').deleteAll()
};

export const legalDocumentsService = {
  getAll: () => safeSupabaseSelect<LegalDocument>('legal_documents').getAll(),
  getBySlug: (slug: string) => safeSupabaseSelect<LegalDocument>('legal_documents').getByFilter('slug', slug),
  upsert: (document: Partial<LegalDocument>) => safeSupabaseMutation<LegalDocument>('legal_documents').upsert(document)
};

export const exchangeRatesService = {
  getLatest: () => safeSupabaseSelect<ExchangeRate>('exchange_rates').getOrdered('created_at', false),
  insert: (rate: Partial<ExchangeRate>) => safeSupabaseMutation<ExchangeRate>('exchange_rates').insert(rate)
};

export const siteSettingsService = {
  get: async () => {
    // @ts-ignore - Suppressing type error for table name
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single();
    
    return handleQueryError<SiteSettings>(data as SiteSettings, error);
  },
  update: (updates: Partial<SiteSettings>) => safeSupabaseMutation<SiteSettings>('site_settings').update('1', updates)
};

// About page settings service
export const aboutPageSettingsService = {
  get: async () => {
    // @ts-ignore - Suppressing type error for table name
    const { data, error } = await supabase
      .from('about_page_settings')
      .select('*')
      .single();
    
    return handleQueryError<AboutPageSettings>(data as AboutPageSettings, error);
  },
  update: (updates: Partial<AboutPageSettings>) => 
    safeSupabaseMutation<AboutPageSettings>('about_page_settings').update('1', updates)
};
