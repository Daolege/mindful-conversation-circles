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
      order_items: {
        Row: {
          id?: number
          order_id: string
          course_id: number
          price: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          order_id: string
          course_id: number
          price: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_id?: string
          course_id?: number
          price?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      },
      orders: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          payment_type: string
          payment_method?: string
          status: string
          created_at: string
          updated_at: string
          order_number?: string
          original_amount?: number
          original_currency?: string
          exchange_rate?: number
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency: string
          payment_type: string
          payment_method?: string
          status: string
          created_at?: string
          updated_at?: string
          order_number?: string
          original_amount?: number
          original_currency?: string
          exchange_rate?: number
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          payment_type?: string
          payment_method?: string
          status?: string
          created_at?: string
          updated_at?: string
          order_number?: string
          original_amount?: number
          original_currency?: string
          exchange_rate?: number
        }
      },
      courses: {
        Row: {
          id: number
          title: string
          instructor: string
          instructorId: number
          category: string
          price: number
          originalPrice: number | null
          imageUrl: string
          rating: number
          ratingCount: number
          studentCount: number
          description: string
          duration: string
          lectures: number
          level: string
          lastUpdated: string
          featured: boolean
          whatYouWillLearn: string[]
          requirements: string[]
          syllabus: {
            title: string
            lectures: {
              title: string
              duration: string
            }[]
          }[]
        }
        Insert: {
          id?: number
          title: string
          instructor: string
          instructorId: number
          category: string
          price: number
          originalPrice?: number | null
          imageUrl: string
          rating: number
          ratingCount: number
          studentCount: number
          description: string
          duration: string
          lectures: number
          level: string
          lastUpdated: string
          featured?: boolean
          whatYouWillLearn: string[]
          requirements: string[]
          syllabus: {
            title: string
            lectures: {
              title: string
              duration: string
            }[]
          }[]
        }
        Update: {
          id?: number
          title?: string
          instructor?: string
          instructorId?: number
          category?: string
          price?: number
          originalPrice?: number | null
          imageUrl?: string
          rating?: number
          ratingCount?: number
          studentCount?: number
          description?: string
          duration?: string
          lectures?: number
          level?: string
          lastUpdated?: string
          featured?: boolean
          whatYouWillLearn?: string[]
          requirements?: string[]
          syllabus?: {
            title: string
            lectures: {
              title: string
              duration: string
            }[]
          }[]
        }
      },
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          currency: string
          interval: 'monthly' | 'quarterly' | 'yearly'
          discount_percentage: number
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          currency?: string
          interval: 'monthly' | 'quarterly' | 'yearly'
          discount_percentage?: number
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          interval?: 'monthly' | 'quarterly' | 'yearly'
          discount_percentage?: number
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      },
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'cancelled' | 'expired' | 'trial'
          start_date: string
          end_date: string
          auto_renew: boolean
          payment_method: string | null
          last_payment_date: string | null
          next_payment_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status: 'active' | 'cancelled' | 'expired' | 'trial'
          start_date?: string
          end_date: string
          auto_renew?: boolean
          payment_method?: string | null
          last_payment_date?: string | null
          next_payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: 'active' | 'cancelled' | 'expired' | 'trial'
          start_date?: string
          end_date?: string
          auto_renew?: boolean
          payment_method?: string | null
          last_payment_date?: string | null
          next_payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
      },
      subscription_history: {
        Row: {
          id: string
          user_id: string
          subscription_id: string
          previous_plan_id: string | null
          new_plan_id: string | null
          change_type: 'new' | 'upgrade' | 'downgrade' | 'cancel' | 'renew'
          amount: number
          currency: string
          effective_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: string
          previous_plan_id?: string | null
          new_plan_id?: string | null
          change_type: 'new' | 'upgrade' | 'downgrade' | 'cancel' | 'renew'
          amount: number
          currency?: string
          effective_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string
          previous_plan_id?: string | null
          new_plan_id?: string | null
          change_type?: 'new' | 'upgrade' | 'downgrade' | 'cancel' | 'renew'
          amount?: number
          currency?: string
          effective_date?: string
          created_at?: string
        }
      },
      subscription_transactions: {
        Row: {
          id: string
          subscription_id: string
          order_id: string | null
          transaction_type: 'payment' | 'refund'
          amount: number
          currency: string
          payment_method: string | null
          status: 'pending' | 'completed' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          order_id?: string | null
          transaction_type: 'payment' | 'refund'
          amount: number
          currency?: string
          payment_method?: string | null
          status: 'pending' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          order_id?: string | null
          transaction_type?: 'payment' | 'refund'
          amount?: number
          currency?: string
          payment_method?: string | null
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
      },
      subscription_notifications: {
        Row: {
          id: string
          user_id: string
          notify_before_expiry: boolean
          notify_on_payment: boolean
          notify_on_price_change: boolean
          expiry_notification_days: number[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notify_before_expiry?: boolean
          notify_on_payment?: boolean
          notify_on_price_change?: boolean
          expiry_notification_days?: number[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notify_before_expiry?: boolean
          notify_on_payment?: boolean
          notify_on_price_change?: boolean
          expiry_notification_days?: number[]
          created_at?: string
          updated_at?: string
        }
      },
      profiles: {
        Row: {
          id: string
          email?: string
          full_name?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id: string
          email?: string
          full_name?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      },
      _migrations: {
        Row: {
          id: number
          name: string
          sql?: string
          executed_at?: string
          success?: boolean
        }
        Insert: {
          id?: number
          name: string
          sql?: string
          executed_at?: string
          success?: boolean
        }
        Update: {
          id?: number
          name?: string
          sql?: string
          executed_at?: string
          success?: boolean
        }
      },
      courses_new: {
        Row: {
          id: number
          title: string
          description?: string
          price?: number
          currency?: string
          thumbnail_url?: string
          instructor_id?: string
          category?: string
          language?: string  // Add language field to match our application code
          status?: string
          is_featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          title: string
          description?: string
          price?: number
          currency?: string
          thumbnail_url?: string
          instructor_id?: string
          category?: string
          language?: string  // Add language field to match our application code
          status?: string
          is_featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string
          price?: number
          currency?: string
          thumbnail_url?: string
          instructor_id?: string
          category?: string
          language?: string  // Add language field to match our application code
          status?: string
          is_featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      },
      site_settings: {
        Row: {
          id: string
          site_name: string | null
          site_description: string | null
          logo_url: string | null
          contact_email: string | null
          support_phone: string | null
          company_name: string | null
          company_full_name: string | null
          company_registration_number: string | null
          company_address: string | null
          copyright_text: string | null
          enable_registration: boolean
          maintenance_mode: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_name?: string | null
          site_description?: string | null
          logo_url?: string | null
          contact_email?: string | null
          support_phone?: string | null
          company_name?: string | null
          company_full_name?: string | null
          company_registration_number?: string | null
          company_address?: string | null
          copyright_text?: string | null
          enable_registration?: boolean
          maintenance_mode?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_name?: string | null
          site_description?: string | null
          logo_url?: string | null
          contact_email?: string | null
          support_phone?: string | null
          company_name?: string | null
          company_full_name?: string | null
          company_registration_number?: string | null
          company_address?: string | null
          copyright_text?: string | null
          enable_registration?: boolean
          maintenance_mode?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      },
      legal_documents: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      },
      payment_icons: {
        Row: {
          id: string
          name: string
          icon_url: string
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          icon_url: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon_url?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      },
      social_media_links: {
        Row: {
          id: string
          name: string
          icon_url: string
          url: string
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          icon_url: string
          url: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon_url?: string
          url?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      },
      contact_methods: {
        Row: {
          id: string
          type: string
          label: string | null
          value: string
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          label?: string | null
          value: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          label?: string | null
          value?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      },
      exchange_rates: {
        Row: {
          id: string
          rate: number
          from_currency: string
          to_currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rate: number
          from_currency: string
          to_currency: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rate?: number
          from_currency?: string
          to_currency?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      },
      homework: {
        Row: {
          id: string
          lecture_id: string
          course_id: number
          title: string
          description?: string
          type: string
          options?: Json
          is_required?: boolean
          created_at?: string
          updated_at?: string
          image_url?: string
          position: number // Add position field
        }
        Insert: {
          id?: string
          lecture_id: string
          course_id: number
          title: string
          description?: string
          type: string
          options?: Json
          is_required?: boolean
          created_at?: string
          updated_at?: string
          image_url?: string
          position?: number // Add optional position field for insert
        }
        Update: {
          id?: string
          lecture_id?: string
          course_id?: number
          title?: string
          description?: string
          type?: string
          options?: Json
          is_required?: boolean
          created_at?: string
          updated_at?: string
          image_url?: string
          position?: number // Add optional position field for update
        }
        Relationships: [
          {
            foreignKeyName: "homework_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "course_lectures"
            referencedColumns: ["id"]
          }
        ]
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
