
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
      site_settings: {
        Row: {
          id?: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          created_at?: string
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
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_table_exists: {
        Args: {
          table_name: string
        }
        Returns: boolean
      }
      execute_sql: {
        Args: {
          sql_statement: string
        }
        Returns: unknown
      }
      insert_order_item: {
        Args: {
          p_order_id: string
          p_course_id: number
          p_price: number
          p_currency: string
        }
        Returns: {
          id: number
          order_id: string
          course_id: number
          price: number
          currency: string
        }[]
      },
      admin_add_course_item: {
        Args: Record<string, unknown>
        Returns: unknown
      }
      create_test_subscription: {
        Args: Record<string, unknown>
        Returns: unknown
      }
      enroll_user_in_course: {
        Args: Record<string, unknown>
        Returns: unknown
      }
      get_dashboard_stats: {
        Args: Record<string, unknown>
        Returns: unknown
      }
      get_financial_stats: {
        Args: Record<string, unknown>
        Returns: unknown
      }
      get_payment_method_stats: {
        Args: Record<string, unknown>
        Returns: unknown
      }
      has_role: {
        Args: Record<string, unknown>
        Returns: unknown
      }
      update_course_progress: {
        Args: Record<string, unknown>
        Returns: unknown
      }
      update_exchange_rate: {
        Args: Record<string, unknown>
        Returns: unknown
      }
      update_site_settings: {
        Args: Record<string, unknown>
        Returns: unknown
      }
      user_has_course_access: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
