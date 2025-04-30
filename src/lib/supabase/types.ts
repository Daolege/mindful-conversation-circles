
export interface User {
  id: string
  email: string
  name: string
}

// Supabase database types extension
export interface Database {
  public: {
    Tables: {
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
