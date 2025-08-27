import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mbrzrpstrzicaxqqfftk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icnpycHN0cnppY2F4cXFmZnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxOTc3NTYsImV4cCI6MjAzOTc3Mzc1Nn0.QmU1yVGJP6rsPBGz5krcGHKMkvNME5GKvMdGzf6GV2Y'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types (you can generate these with Supabase CLI: supabase gen types typescript)
export interface Database {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string
          user_id: string
          title: string
          destination: string
          start_date: string
          end_date: string
          budget: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          destination: string
          start_date: string
          end_date: string
          budget: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          destination?: string
          start_date?: string
          end_date?: string
          budget?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      price_locks: {
        Row: {
          id: string
          user_id: string
          trip_id: string
          service_type: string
          provider: string
          price: number
          locked_until: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_id: string
          service_type: string
          provider: string
          price: number
          locked_until: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_id?: string
          service_type?: string
          provider?: string
          price?: number
          locked_until?: string
          status?: string
          created_at?: string
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
  }
}