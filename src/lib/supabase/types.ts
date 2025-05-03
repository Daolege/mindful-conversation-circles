export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface User {
  id: string
  email: string
  name: string
}

// Supabase database types extension
export interface Database {
  public: {
    Tables: {
      // Add translations table schema
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
          updated_at?: string
        }
      },
      // Add languages table schema
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
          enabled?: boolean
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
          updated_at?: string
        }
      },
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
          site_name: string
          site_description: string
          logo_url: string
          contact_email: string
          support_phone: string
          company_name: string
          company_full_name: string
          company_registration_number: string
          company_address: string
          copyright_text: string
          enable_registration: boolean
          maintenance_mode: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_name?: string
          site_description?: string
          logo_url?: string
          contact_email?: string
          support_phone?: string
          company_name?: string
          company_full_name?: string
          company_registration_number?: string
          company_address?: string
          copyright_text?: string
          enable_registration?: boolean
          maintenance_mode?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_name?: string
          site_description?: string
          logo_url?: string
          contact_email?: string
          support_phone?: string
          company_name?: string
          company_full_name?: string
          company_registration_number?: string
          company_address?: string
          copyright_text?: string
          enable_registration?: boolean
          maintenance_mode?: boolean
          created_at?: string
          updated_at?: string
        }
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
      },
      contact_methods: {
        Row: {
          id: string
          type: string
          label: string
          value: string
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          label?: string
          value: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          label?: string
          value?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      },
      exchange_rates: {
        Row: {
          id: string
          cny_to_usd: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cny_to_usd: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cny_to_usd?: number
          created_at?: string
          updated_at?: string
        }
      },
      course_highlights: {
        Row: {
          id: string
          course_id: number
          icon: string
          content: string
          position: number
          is_visible: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          course_id: number
          icon: string
          content: string
          position?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: number
          icon?: string
          content?: string
          position?: number
          is_visible?: boolean
          updated_at?: string
        }
      },
      default_course_highlights: {
        Row: {
          id: string
          icon: string
          content: string
          position: number
          is_visible: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          icon: string
          content: string
          position?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          icon?: string
          content?: string
          position?: number
          is_visible?: boolean
          updated_at?: string
        }
      }
    },
    Views: {
      [_ in never]: never
    },
    Functions: {
      check_translation_exists: {
        Args: {
          p_language_code: string
          p_namespace: string
          p_key: string
        }
        Returns: Json
      },
      update_translation: {
        Args: {
          p_id: number
          p_value: string
        }
        Returns: void
      },
      insert_translation: {
        Args: {
          p_language_code: string
          p_namespace: string
          p_key: string
          p_value: string
        }
        Returns: void
      },
      get_namespace_translations: {
        Args: {
          p_language_code: string
          p_namespace: string
        }
        Returns: {key: string, value: string}[]
      },
      upsert_translations_batch: {
        Args: {
          translations_json: Json
        }
        Returns: void
      },
      admin_add_course_item: {
        Args: Record<string, unknown>
        Returns: unknown
      },
      create_test_subscription: {
        Args: Record<string, unknown>
        Returns: unknown
      },
      enroll_user_in_course: {
        Args: Record<string, unknown>
        Returns: unknown
      },
      get_dashboard_stats: {
        Args: Record<string, unknown>
        Returns: unknown
      },
      get_financial_stats: {
        Args: Record<string, unknown>
        Returns: unknown
      },
      get_payment_method_stats: {
        Args: Record<string, unknown>
        Returns: unknown
      },
      has_role: {
        Args: Record<string, unknown>
        Returns: unknown
      },
      update_course_progress: {
        Args: Record<string, unknown>
        Returns: unknown
      },
      update_exchange_rate: {
        Args: Record<string, unknown>
        Returns: unknown
      },
      update_site_settings: {
        Args: Record<string, unknown>
        Returns: unknown
      },
      user_has_course_access: {
        Args: Record<string, unknown>
        Returns: unknown
      },
      delete_order: {
        Args: Record<string, unknown>
        Returns: unknown
      },
      reset_course_highlights: {
        Args: { p_course_id: number }
        Returns: void
      }
    },
    Enums: {
      [_ in never]: never
    },
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Add shorter type aliases for common database function types
export type DbFunctionNames = keyof Database['public']['Functions'];
