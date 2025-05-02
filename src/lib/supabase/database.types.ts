
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      translations: {
        Row: {
          id: number
          language_code: string
          namespace: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          language_code: string
          namespace: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          language_code?: string
          namespace?: string
          key?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          id: number
          code: string
          name: string
          nativeName: string
          enabled: boolean
          rtl?: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          code: string
          name: string
          nativeName: string
          enabled: boolean
          rtl?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          code?: string
          name?: string
          nativeName?: string
          enabled?: boolean
          rtl?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      upsert_translations_batch: {
        Args: { translations_json: Json }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
