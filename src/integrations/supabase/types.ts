export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      _migrations: {
        Row: {
          executed_at: string | null
          id: number
          name: string | null
          sql: string | null
          success: boolean | null
        }
        Insert: {
          executed_at?: string | null
          id?: number
          name?: string | null
          sql?: string | null
          success?: boolean | null
        }
        Update: {
          executed_at?: string | null
          id?: number
          name?: string | null
          sql?: string | null
          success?: boolean | null
        }
        Relationships: []
      }
      about_page_settings: {
        Row: {
          id: string
          is_visible: boolean | null
          mission: string | null
          stats: Json | null
          story: string | null
          subtitle: string | null
          team_members: Json | null
          title: string
          updated_at: string | null
          updated_by: string | null
          vision: string | null
        }
        Insert: {
          id?: string
          is_visible?: boolean | null
          mission?: string | null
          stats?: Json | null
          story?: string | null
          subtitle?: string | null
          team_members?: Json | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          vision?: string | null
        }
        Update: {
          id?: string
          is_visible?: boolean | null
          mission?: string | null
          stats?: Json | null
          story?: string | null
          subtitle?: string | null
          team_members?: Json | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          vision?: string | null
        }
        Relationships: []
      }
      contact_methods: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean | null
          label: string | null
          type: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          label?: string | null
          type: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          label?: string | null
          type?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      course_audiences: {
        Row: {
          content: string
          course_id: number | null
          icon: string | null
          id: string
          is_visible: boolean | null
          position: number
        }
        Insert: {
          content: string
          course_id?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number
        }
        Update: {
          content?: string
          course_id?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_audiences_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_new"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollment_guides: {
        Row: {
          content: string | null
          course_id: number
          created_at: string
          guide_type: string
          id: string
          image_url: string | null
          link: string | null
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          course_id: number
          created_at?: string
          guide_type: string
          id?: string
          image_url?: string | null
          link?: string | null
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          course_id?: number
          created_at?: string
          guide_type?: string
          id?: string
          image_url?: string | null
          link?: string | null
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollment_guides_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_new"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          course_id: number | null
          enrolled_at: string | null
          id: string
          last_accessed_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          course_id?: number | null
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          course_id?: number | null
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_new"
            referencedColumns: ["id"]
          },
        ]
      }
      course_highlights: {
        Row: {
          content: string
          course_id: number
          created_at: string
          icon: string
          id: string
          is_visible: boolean
          position: number
          updated_at: string
        }
        Insert: {
          content: string
          course_id: number
          created_at?: string
          icon: string
          id?: string
          is_visible?: boolean
          position?: number
          updated_at?: string
        }
        Update: {
          content?: string
          course_id?: number
          created_at?: string
          icon?: string
          id?: string
          is_visible?: boolean
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_highlights_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_new"
            referencedColumns: ["id"]
          },
        ]
      }
      course_learning_objectives: {
        Row: {
          content: string
          course_id: number | null
          icon: string | null
          id: string
          is_visible: boolean | null
          position: number
        }
        Insert: {
          content: string
          course_id?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number
        }
        Update: {
          content?: string
          course_id?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_learning_objectives_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_new"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lectures: {
        Row: {
          created_at: string | null
          duration: string | null
          id: string
          is_free: boolean | null
          position: number
          requires_homework_completion: boolean | null
          section_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: string | null
          id?: string
          is_free?: boolean | null
          position?: number
          requires_homework_completion?: boolean | null
          section_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: string | null
          id?: string
          is_free?: boolean | null
          position?: number
          requires_homework_completion?: boolean | null
          section_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lectures_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_materials: {
        Row: {
          course_id: number | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          name: string
          position: number
          url: string
        }
        Insert: {
          course_id?: number | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          name: string
          position?: number
          url: string
        }
        Update: {
          course_id?: number | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          name?: string
          position?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_new"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          completed: boolean | null
          course_id: number
          created_at: string | null
          id: string
          last_watched_at: string | null
          lecture_id: string
          progress_percent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          course_id: number
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          lecture_id: string
          progress_percent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          course_id?: number
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          lecture_id?: string
          progress_percent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_requirements: {
        Row: {
          content: string
          course_id: number | null
          icon: string | null
          id: string
          is_visible: boolean | null
          position: number
        }
        Insert: {
          content: string
          course_id?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number
        }
        Update: {
          content?: string
          course_id?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_requirements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_new"
            referencedColumns: ["id"]
          },
        ]
      }
      course_section_configs: {
        Row: {
          course_id: number
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          section_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: number
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          section_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: number
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          section_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      course_sections: {
        Row: {
          course_id: number | null
          created_at: string | null
          id: string
          position: number
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: number | null
          created_at?: string | null
          id?: string
          position?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: number | null
          created_at?: string | null
          id?: string
          position?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_new"
            referencedColumns: ["id"]
          },
        ]
      }
      course_statistics: {
        Row: {
          average_rating: number | null
          completion_count: number | null
          completion_rate: number | null
          course_id: number | null
          enrollment_count: number | null
          id: string
          rating_count: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          completion_count?: number | null
          completion_rate?: number | null
          course_id?: number | null
          enrollment_count?: number | null
          id?: string
          rating_count?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          completion_count?: number | null
          completion_rate?: number | null
          course_id?: number | null
          enrollment_count?: number | null
          id?: string
          rating_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_statistics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_new"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          description: string
          display_order: number
          duration: string | null
          enrollment_count: number
          featured: boolean | null
          highlights: string[] | null
          id: number
          imageurl: string | null
          instructor: string | null
          language: string
          lastupdated: string | null
          lectures: number | null
          level: string | null
          materials: Json | null
          originalprice: number | null
          price: number
          published_at: string | null
          rating: number | null
          ratingcount: number | null
          requirements: string[]
          studentcount: number | null
          syllabus: Json
          target_audience: string[] | null
          title: string
          video_url: string | null
          whatyouwilllearn: string[]
        }
        Insert: {
          category?: string | null
          description: string
          display_order: number
          duration?: string | null
          enrollment_count?: number
          featured?: boolean | null
          highlights?: string[] | null
          id?: number
          imageurl?: string | null
          instructor?: string | null
          language?: string
          lastupdated?: string | null
          lectures?: number | null
          level?: string | null
          materials?: Json | null
          originalprice?: number | null
          price: number
          published_at?: string | null
          rating?: number | null
          ratingcount?: number | null
          requirements: string[]
          studentcount?: number | null
          syllabus: Json
          target_audience?: string[] | null
          title: string
          video_url?: string | null
          whatyouwilllearn: string[]
        }
        Update: {
          category?: string | null
          description?: string
          display_order?: number
          duration?: string | null
          enrollment_count?: number
          featured?: boolean | null
          highlights?: string[] | null
          id?: number
          imageurl?: string | null
          instructor?: string | null
          language?: string
          lastupdated?: string | null
          lectures?: number | null
          level?: string | null
          materials?: Json | null
          originalprice?: number | null
          price?: number
          published_at?: string | null
          rating?: number | null
          ratingcount?: number | null
          requirements?: string[]
          studentcount?: number | null
          syllabus?: Json
          target_audience?: string[] | null
          title?: string
          video_url?: string | null
          whatyouwilllearn?: string[]
        }
        Relationships: []
      }
      courses_new: {
        Row: {
          allows_one_time_purchase: boolean
          allows_subscription: boolean
          category: string | null
          created_at: string | null
          currency: string
          description: string | null
          display_order: number
          enrollment_count: number | null
          id: number
          is_featured: boolean | null
          language: string | null
          lecture_count: number | null
          materialsvisible: boolean | null
          original_price: number | null
          price: number
          published_at: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          allows_one_time_purchase?: boolean
          allows_subscription?: boolean
          category?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          display_order?: number
          enrollment_count?: number | null
          id?: number
          is_featured?: boolean | null
          language?: string | null
          lecture_count?: number | null
          materialsvisible?: boolean | null
          original_price?: number | null
          price?: number
          published_at?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          allows_one_time_purchase?: boolean
          allows_subscription?: boolean
          category?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          display_order?: number
          enrollment_count?: number | null
          id?: number
          is_featured?: boolean | null
          language?: string | null
          lecture_count?: number | null
          materialsvisible?: boolean | null
          original_price?: number | null
          price?: number
          published_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      default_course_highlights: {
        Row: {
          content: string
          created_at: string
          icon: string
          id: string
          is_visible: boolean
          position: number
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          icon: string
          id?: string
          is_visible?: boolean
          position?: number
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          icon?: string
          id?: string
          is_visible?: boolean
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      default_module_items: {
        Row: {
          content: string
          icon: string
          id: string
          module_type: string
          position: number
        }
        Insert: {
          content: string
          icon: string
          id?: string
          module_type: string
          position: number
        }
        Update: {
          content?: string
          icon?: string
          id?: string
          module_type?: string
          position?: number
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          created_at: string | null
          from_currency: string
          id: string
          rate: number
          to_currency: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_currency: string
          id?: string
          rate: number
          to_currency: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_currency?: string
          id?: string
          rate?: number
          to_currency?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: string
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: string
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string | null
          id: string
          message: string
          status: string | null
          subject: string
          type: string | null
          updated_at: string | null
          user_email: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          status?: string | null
          subject: string
          type?: string | null
          updated_at?: string | null
          user_email?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          status?: string | null
          subject?: string
          type?: string | null
          updated_at?: string | null
          user_email?: string | null
        }
        Relationships: []
      }
      homework: {
        Row: {
          course_id: number
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_required: boolean | null
          lecture_id: string
          options: Json | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          course_id: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_required?: boolean | null
          lecture_id: string
          options?: Json | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          course_id?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_required?: boolean | null
          lecture_id?: string
          options?: Json | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_course"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_new"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_submissions: {
        Row: {
          answer: string | null
          course_id: number
          file_url: string | null
          homework_id: string
          id: string
          lecture_id: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          answer?: string | null
          course_id: number
          file_url?: string | null
          homework_id: string
          id?: string
          lecture_id: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          answer?: string | null
          course_id?: number
          file_url?: string | null
          homework_id?: string
          id?: string
          lecture_id?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_course"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_homework"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homework"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_submissions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homework"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          expertise: string | null
          id: string
          name: string
          status: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          expertise?: string | null
          id?: string
          name: string
          status?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          expertise?: string | null
          id?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      module_settings: {
        Row: {
          course_id: number
          created_at: string | null
          icon: string | null
          id: string
          module_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: number
          created_at?: string | null
          icon?: string | null
          id?: string
          module_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: number
          created_at?: string | null
          icon?: string | null
          id?: string
          module_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          admin_notes: string | null
          amount: number
          course_id: number | null
          created_at: string | null
          currency: string | null
          exchange_rate: number | null
          id: string
          is_refundable: boolean | null
          order_number: string | null
          original_amount: number | null
          original_currency: string | null
          payment_type: string
          refund_applied_at: string | null
          refund_processed_at: string | null
          refund_processed_by: string | null
          refund_reason: string | null
          refund_status: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          course_id?: number | null
          created_at?: string | null
          currency?: string | null
          exchange_rate?: number | null
          id?: string
          is_refundable?: boolean | null
          order_number?: string | null
          original_amount?: number | null
          original_currency?: string | null
          payment_type: string
          refund_applied_at?: string | null
          refund_processed_at?: string | null
          refund_processed_by?: string | null
          refund_reason?: string | null
          refund_status?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          course_id?: number | null
          created_at?: string | null
          currency?: string | null
          exchange_rate?: number | null
          id?: string
          is_refundable?: boolean | null
          order_number?: string | null
          original_amount?: number | null
          original_currency?: string | null
          payment_type?: string
          refund_applied_at?: string | null
          refund_processed_at?: string | null
          refund_processed_by?: string | null
          refund_reason?: string | null
          refund_status?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          registration_date: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          registration_date?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          registration_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      refund_reasons: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean | null
          reason: string
        }
        Insert: {
          created_at?: string | null
          display_order: number
          id?: string
          is_active?: boolean | null
          reason: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          reason?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_email: string | null
          created_at: string | null
          enable_registration: boolean | null
          id: string
          logo_url: string | null
          maintenance_mode: boolean | null
          site_description: string | null
          site_name: string
          support_phone: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          enable_registration?: boolean | null
          id?: string
          logo_url?: string | null
          maintenance_mode?: boolean | null
          site_description?: string | null
          site_name?: string
          support_phone?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          enable_registration?: boolean | null
          id?: string
          logo_url?: string | null
          maintenance_mode?: boolean | null
          site_description?: string | null
          site_name?: string
          support_phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_history: {
        Row: {
          amount: number
          change_type: string
          created_at: string
          currency: string
          effective_date: string
          id: string
          new_plan_id: string | null
          previous_plan_id: string | null
          subscription_id: string
          user_id: string
        }
        Insert: {
          amount: number
          change_type: string
          created_at?: string
          currency?: string
          effective_date?: string
          id?: string
          new_plan_id?: string | null
          previous_plan_id?: string | null
          subscription_id: string
          user_id: string
        }
        Update: {
          amount?: number
          change_type?: string
          created_at?: string
          currency?: string
          effective_date?: string
          id?: string
          new_plan_id?: string | null
          previous_plan_id?: string | null
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_new_plan_id_fkey"
            columns: ["new_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_previous_plan_id_fkey"
            columns: ["previous_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_notifications: {
        Row: {
          created_at: string
          expiry_notification_days: number[]
          id: string
          notify_before_expiry: boolean
          notify_on_payment: boolean
          notify_on_price_change: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expiry_notification_days?: number[]
          id?: string
          notify_before_expiry?: boolean
          notify_on_payment?: boolean
          notify_on_price_change?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expiry_notification_days?: number[]
          id?: string
          notify_before_expiry?: boolean
          notify_on_payment?: boolean
          notify_on_price_change?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          discount_percentage: number
          display_order: number
          id: string
          interval: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          discount_percentage?: number
          display_order?: number
          id?: string
          interval: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          discount_percentage?: number
          display_order?: number
          id?: string
          interval?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscription_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          order_id: string | null
          payment_method: string | null
          status: string
          subscription_id: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          payment_method?: string | null
          status: string
          subscription_id: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          payment_method?: string | null
          status?: string
          subscription_id?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_courses: {
        Row: {
          course_id: number
          id: string
          last_accessed_at: string | null
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          course_id: number
          id?: string
          last_accessed_at?: string | null
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: number
          id?: string
          last_accessed_at?: string | null
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean
          created_at: string
          end_date: string
          id: string
          last_payment_date: string | null
          next_payment_date: string | null
          payment_method: string | null
          plan_id: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          end_date: string
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_method?: string | null
          plan_id: string
          start_date?: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          end_date?: string
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_method?: string | null
          plan_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      video_completion_settings: {
        Row: {
          completion_threshold: number
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          completion_threshold?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          completion_threshold?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      video_progress: {
        Row: {
          completed: boolean | null
          course_id: number
          id: string
          last_position: number | null
          last_watched_at: string | null
          lecture_id: string
          total_duration: number | null
          user_id: string
          watch_count: number | null
          watch_duration: number | null
          watch_percentage: number | null
        }
        Insert: {
          completed?: boolean | null
          course_id: number
          id?: string
          last_position?: number | null
          last_watched_at?: string | null
          lecture_id: string
          total_duration?: number | null
          user_id: string
          watch_count?: number | null
          watch_duration?: number | null
          watch_percentage?: number | null
        }
        Update: {
          completed?: boolean | null
          course_id?: number
          id?: string
          last_position?: number | null
          last_watched_at?: string | null
          lecture_id?: string
          total_duration?: number | null
          user_id?: string
          watch_count?: number | null
          watch_duration?: number | null
          watch_percentage?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_default_module_items: {
        Args: {
          p_course_id: number
          p_module_type: string
          p_table_name: string
        }
        Returns: undefined
      }
      admin_add_course_item: {
        Args: {
          p_table_name: string
          p_course_id: number
          p_content: string
          p_position: number
          p_id: string
          p_is_visible: boolean
        }
        Returns: undefined
      }
      create_test_subscription: {
        Args: { user_id: string; plan_interval?: string }
        Returns: undefined
      }
      enroll_user_in_course: {
        Args: { p_user_id: string; p_course_id: number; p_purchased_at: string }
        Returns: undefined
      }
      fix_homework_constraints: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_course_section_config: {
        Args: { p_course_id: number; p_section_type: string }
        Returns: Json
      }
      get_dashboard_stats: {
        Args: { p_demo?: boolean }
        Returns: Json
      }
      get_financial_stats: {
        Args: { p_demo?: boolean }
        Returns: Json
      }
      get_module_settings: {
        Args: { p_course_id: number; p_module_type: string }
        Returns: Json
      }
      get_module_visibilities: {
        Args: { p_course_id: number }
        Returns: Json
      }
      get_payment_method_stats: {
        Args: { p_demo?: boolean }
        Returns: Json
      }
      has_role: {
        Args: { role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      reset_course_highlights: {
        Args: { p_course_id: number }
        Returns: undefined
      }
      update_chapter_count_highlight: {
        Args: { p_course_id: number }
        Returns: undefined
      }
      update_course_progress: {
        Args: {
          p_user_id: string
          p_course_id: number
          p_progress_percent: number
          p_completed: boolean
          p_lecture_id: string
        }
        Returns: undefined
      }
      update_exchange_rate: {
        Args: { p_from_currency: string; p_to_currency: string; p_rate: number }
        Returns: undefined
      }
      update_site_settings: {
        Args: {
          p_site_name: string
          p_site_description: string
          p_contact_email: string
          p_support_phone: string
          p_enable_registration: boolean
          p_maintenance_mode: boolean
        }
        Returns: undefined
      }
      upsert_course_section_config: {
        Args: {
          p_course_id: number
          p_section_type: string
          p_title: string
          p_description: string
          p_icon: string
        }
        Returns: undefined
      }
      user_has_course_access: {
        Args: { course_id: number }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "user" | "instructor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "user", "instructor"],
    },
  },
} as const
