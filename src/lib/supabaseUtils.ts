import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { defaultPaymentIcons, defaultSocialMediaLinks, defaultLegalDocuments, defaultExchangeRates } from "./defaultData";

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
  cny_to_usd?: number;
}

// Old schema type for handling legacy data
interface LegacyExchangeRate {
  id: string;
  cny_to_usd: number;
  created_at: string;
  updated_at: string;
  [key: string]: any;
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

export interface UserRole {
  user_id: string;
  role: string;
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

// Type-safe Supabase query helper with type assertion and table name handling
export function safeSupabaseSelect<T>(tableName: string, select: string = '*') {
  return {
    async getAll() {
      try {
        // Using type assertion to bypass TypeScript's strict checking for table names
        const { data, error } = await (supabase
          .from(tableName as any)
          .select(select) as any);
        
        // Return default data if error or if the API can't be reached
        if (error) {
          console.error(`Error querying ${tableName}:`, error);
          // Return appropriate default data based on table name
          if (tableName === 'payment_icons') return defaultPaymentIcons as T[];
          if (tableName === 'social_media_links') return defaultSocialMediaLinks as T[];
          if (tableName === 'legal_documents') return Object.values(defaultLegalDocuments) as T[];
          if (tableName === 'exchange_rates') return defaultExchangeRates as T[];
          throw error;
        }
        
        return data as T[];
      } catch (error) {
        console.error(`Error in safeSupabaseSelect for ${tableName}:`, error);
        // Return appropriate default data based on table name
        if (tableName === 'payment_icons') return defaultPaymentIcons as T[];
        if (tableName === 'social_media_links') return defaultSocialMediaLinks as T[];
        if (tableName === 'legal_documents') return Object.values(defaultLegalDocuments) as T[];
        if (tableName === 'exchange_rates') return defaultExchangeRates as T[];
        throw error;
      }
    },
    
    async getOne(id: string) {
      try {
        // Using type assertion to bypass TypeScript's strict checking for table names
        const { data, error } = await (supabase
          .from(tableName as any)
          .select(select)
          .eq('id', id)
          .single() as any);
        
        if (error) throw error;
        return data as T;
      } catch (error) {
        console.error(`Error in safeSupabaseSelect.getOne for ${tableName}:`, error);
        throw error;
      }
    },

    async getByFilter(filterField: string, filterValue: any) {
      try {
        // Using type assertion to bypass TypeScript's strict checking for table names
        const { data, error } = await (supabase
          .from(tableName as any)
          .select(select)
          .eq(filterField, filterValue) as any);
        
        if (error) throw error;
        
        // For legal documents, return default if not found
        if (tableName === 'legal_documents' && filterField === 'slug' && (!data || data.length === 0)) {
          // @ts-ignore - Type assertion
          return [defaultLegalDocuments[filterValue]] as T[];
        }
        
        return data as T[];
      } catch (error) {
        console.error(`Error in safeSupabaseSelect.getByFilter for ${tableName}:`, error);
        
        // For legal documents, return default if error
        if (tableName === 'legal_documents' && filterField === 'slug') {
          // @ts-ignore - Type assertion
          return [defaultLegalDocuments[filterValue]] as T[];
        }
        
        throw error;
      }
    },

    async getOrdered(orderField: string = 'display_order', ascending: boolean = true) {
      try {
        // Using type assertion to bypass TypeScript's strict checking for table names
        const { data, error } = await (supabase
          .from(tableName as any)
          .select(select)
          .order(orderField, { ascending }) as any);
        
        // Return default data if error or if the API can't be reached
        if (error) {
          console.error(`Error querying ${tableName}:`, error);
          // Return appropriate default data based on table name
          if (tableName === 'payment_icons') return defaultPaymentIcons as T[];
          if (tableName === 'social_media_links') return defaultSocialMediaLinks as T[];
          if (tableName === 'exchange_rates') return defaultExchangeRates as T[];
          throw error;
        }
        
        return data as T[];
      } catch (error) {
        console.error(`Error in safeSupabaseSelect.getOrdered for ${tableName}:`, error);
        // Return appropriate default data based on table name
        if (tableName === 'payment_icons') return defaultPaymentIcons as T[];
        if (tableName === 'social_media_links') return defaultSocialMediaLinks as T[];
        if (tableName === 'exchange_rates') return defaultExchangeRates as T[];
        throw error;
      }
    }
  };
}

// Flexible Supabase mutation helper with type assertion and table name handling
export function safeSupabaseMutation<T>(tableName: string) {
  return {
    async insert(record: Partial<T>) {
      try {
        // Using type assertion to bypass TypeScript's strict checking for table names
        const { data, error } = await (supabase
          .from(tableName as any)
          .insert(record)
          .select() as any);
        
        if (error) throw error;
        return { data: data as T[], error: null };
      } catch (error: any) {
        console.error(`Error in safeSupabaseMutation.insert for ${tableName}:`, error);
        return { data: null, error };
      }
    },
    
    async update(id: string, updates: Partial<T>) {
      try {
        // Using type assertion to bypass TypeScript's strict checking for table names
        const { data, error } = await (supabase
          .from(tableName as any)
          .update(updates)
          .eq('id', id)
          .select() as any);
        
        if (error) throw error;
        return { data: data as T[], error: null };
      } catch (error: any) {
        console.error(`Error in safeSupabaseMutation.update for ${tableName}:`, error);
        return { data: null, error };
      }
    },

    async upsert(records: Partial<T> | Partial<T>[]) {
      try {
        // Using type assertion to bypass TypeScript's strict checking for table names
        const { data, error } = await (supabase
          .from(tableName as any)
          .upsert(records)
          .select() as any);
        
        if (error) throw error;
        return { data: data as T[], error: null };
      } catch (error: any) {
        console.error(`Error in safeSupabaseMutation.upsert for ${tableName}:`, error);
        return { data: null, error };
      }
    },
    
    async delete(id: string) {
      try {
        // Using type assertion to bypass TypeScript's strict checking for table names
        const { data, error } = await (supabase
          .from(tableName as any)
          .delete()
          .eq('id', id) as any);
        
        if (error) throw error;
        return { data, error: null };
      } catch (error: any) {
        console.error(`Error in safeSupabaseMutation.delete for ${tableName}:`, error);
        return { data: null, error };
      }
    },

    async deleteAll() {
      try {
        // Using type assertion to bypass TypeScript's strict checking for table names
        const { data, error } = await (supabase
          .from(tableName as any)
          .delete()
          .not('id', 'is', null) as any);
        
        if (error) throw error;
        return { data, error: null };
      } catch (error: any) {
        console.error(`Error in safeSupabaseMutation.deleteAll for ${tableName}:`, error);
        return { data: null, error };
      }
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
  getLatest: async () => {
    try {
      // First try to get data with the new structure
      const { data: newStructureData, error: newStructureError } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (newStructureError) {
        throw newStructureError;
      }
      
      if (newStructureData && newStructureData.length > 0) {
        // Check if we have the new structure with rate field
        if ('rate' in newStructureData[0]) {
          console.log("Using new exchange_rates structure with rate field");
          return newStructureData as ExchangeRate[];
        }
        
        // If we have the old structure with cny_to_usd field, convert it
        if ('cny_to_usd' in newStructureData[0]) {
          console.log("Using old exchange_rates structure with cny_to_usd field, converting");
          // Type assertion to properly handle the old schema
          const oldStructureData = newStructureData as unknown as LegacyExchangeRate[];
          
          return oldStructureData.map(item => ({
            id: item.id,
            rate: item.cny_to_usd,
            from_currency: 'CNY',
            to_currency: 'USD',
            created_at: item.created_at,
            updated_at: item.updated_at,
            cny_to_usd: item.cny_to_usd
          })) as ExchangeRate[];
        }
      }
      
      // If no data or unrecognized structure, use default data
      console.log("No exchange_rates data found, using defaults");
      return defaultExchangeRates;
    } catch (error) {
      console.error("Error in exchangeRatesService.getLatest:", error);
      return defaultExchangeRates;
    }
  },
  
  getAllHistory: async (page: number = 1, pageSize: number = 10, dateRange?: { from: Date, to: Date } | null) => {
    try {
      let query = supabase
        .from('exchange_rates')
        .select('*', { count: 'exact' });
      
      // Add date filtering if provided
      if (dateRange && dateRange.from && dateRange.to) {
        query = query.gte('created_at', dateRange.from.toISOString())
                    .lte('created_at', dateRange.to.toISOString());
      }
      
      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) {
        console.error("Error fetching exchange rate history:", error);
        throw error;
      }
      
      // Handle empty results
      if (!data || data.length === 0) {
        console.log("No exchange rate history found, using defaults");
        return { 
          data: defaultExchangeRates, 
          count: defaultExchangeRates.length,
          page,
          pageSize
        };
      }
      
      // Explicitly type our data for safety
      type RawDataItem = Record<string, any>;
      
      // Convert legacy data format if needed
      const formattedData = (data as RawDataItem[]).map(item => {
        if (!item) return null; // Skip null or undefined items
        
        if ('rate' in item) {
          return item as ExchangeRate;
        } else if ('cny_to_usd' in item) {
          // Convert legacy format
          return {
            id: item.id || '',
            rate: item.cny_to_usd,
            from_currency: 'CNY',
            to_currency: 'USD',
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
            cny_to_usd: item.cny_to_usd
          } as ExchangeRate;
        }
        // Fallback for unexpected data structure
        return {
          id: item.id || '',
          rate: 0,
          from_currency: 'CNY',
          to_currency: 'USD',
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        } as ExchangeRate;
      }).filter(item => item !== null) as ExchangeRate[]; // Remove null items and assert type
      
      return { 
        data: formattedData, 
        count: count || formattedData.length,
        page,
        pageSize
      };
    } catch (error) {
      console.error("Error in exchangeRatesService.getAllHistory:", error);
      return { 
        data: defaultExchangeRates, 
        count: defaultExchangeRates.length,
        page: 1,
        pageSize: 10
      };
    }
  },
  
  insert: async (rate: Partial<ExchangeRate>) => {
    try {
      // Make sure required fields are provided
      if (!rate.rate || !rate.from_currency || !rate.to_currency) {
        throw new Error("Missing required fields: rate, from_currency, and to_currency are required");
      }
      
      // Create insert data with required fields
      const insertData = {
        rate: rate.rate,
        from_currency: rate.from_currency,
        to_currency: rate.to_currency,
        // For backward compatibility with old schema
        cny_to_usd: rate.from_currency === 'CNY' && rate.to_currency === 'USD' ? rate.rate : undefined,
        created_at: rate.created_at || new Date().toISOString(),
        updated_at: rate.updated_at || new Date().toISOString()
      };
      
      console.log("Preparing exchange rate data:", insertData);
      
      // Check if a record with the same currency pair already exists
      const { data: existingRates, error: queryError } = await supabase
        .from('exchange_rates')
        .select('id')
        .eq('from_currency', rate.from_currency)
        .eq('to_currency', rate.to_currency)
        .limit(1);
      
      if (queryError) {
        console.error("Error checking for existing records:", queryError);
        throw queryError;
      }
      
      let result;
      
      // If the record exists, update it instead of inserting
      if (existingRates && existingRates.length > 0) {
        console.log("Updating existing exchange rate record:", existingRates[0].id);
        result = await supabase
          .from('exchange_rates')
          .update(insertData)
          .eq('id', existingRates[0].id)
          .select();
      } else {
        // No existing record, perform insert
        console.log("Inserting new exchange rate record");
        result = await supabase
          .from('exchange_rates')
          .insert(insertData)
          .select();
      }
      
      const { data, error } = result;
      
      if (error) {
        if (error.code === '23505') { // Unique violation error code
          console.error("Unique constraint violation. This currency pair already exists.");
          throw new Error("This currency pair already exists in the database");
        }
        throw error;
      }
      
      console.log("Exchange rate saved successfully:", data);
      
      return { data, error: null };
    } catch (error) {
      console.error("Error in exchangeRatesService.insert:", error);
      return { data: null, error };
    }
  }
};

export const siteSettingsService = {
  get: async () => {
    try {
      // Using type assertion to bypass TypeScript's strict checking for table names
      const { data, error } = await (supabase
        .from('site_settings' as any)
        .select('*')
        .single() as any);
      
      if (error) throw error;
      return data as SiteSettings;
    } catch (error) {
      console.error("Error getting site settings:", error);
      // Return default site settings if there's an error
      return import('./defaultData').then(module => module.defaultSiteSettings);
    }
  },
  update: (updates: Partial<SiteSettings>) => safeSupabaseMutation<SiteSettings>('site_settings').update('1', updates)
};

// About page settings service
export const aboutPageSettingsService = {
  get: async () => {
    try {
      // Using type assertion to bypass TypeScript's strict checking for table names
      const { data, error } = await (supabase
        .from('about_page_settings' as any)
        .select('*')
        .single() as any);
      
      if (error) throw error;
      return data as AboutPageSettings;
    } catch (error) {
      console.error("Error getting about page settings:", error);
      // Could add default about page settings if needed
      throw error;
    }
  },
  update: (updates: Partial<AboutPageSettings>) => 
    safeSupabaseMutation<AboutPageSettings>('about_page_settings').update('1', updates)
};

// User roles service
export const userRolesService = {
  getByUserId: async (userId: string) => {
    try {
      // Using type assertion to bypass TypeScript's strict checking for table names
      const { data, error } = await (supabase
        .from('user_roles' as any)
        .select('*')
        .eq('user_id', userId) as any);
      
      if (error) throw error;
      return data as UserRole[];
    } catch (error) {
      console.error("Error getting user roles:", error);
      return [];
    }
  },
  getAll: () => safeSupabaseSelect<UserRole>('user_roles').getAll(),
  addRole: (userId: string, role: string) => 
    safeSupabaseMutation<UserRole>('user_roles').insert({ user_id: userId, role }),
  removeRole: async (userId: string, role: string) => {
    try {
      // Using type assertion to bypass TypeScript's strict checking for table names
      const { data, error } = await (supabase
        .from('user_roles' as any)
        .delete()
        .eq('user_id', userId)
        .eq('role', role) as any);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error("Error removing user role:", error);
      return { data: null, error };
    }
  }
};
