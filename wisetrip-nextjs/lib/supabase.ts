import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          destination: string | null
          start_date: string
          end_date: string
          budget: number | null
          currency: string | null
          status: string | null
          is_public: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          destination?: string | null
          start_date: string
          end_date: string
          budget?: number | null
          currency?: string | null
          status?: string | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          destination?: string | null
          start_date?: string
          end_date?: string
          budget?: number | null
          currency?: string | null
          status?: string | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          dietary: string[]
          accessibility: string[]
          pace: string | null
          interests: string[]
          locale: string | null
          home_airport: string | null
          preferred_transport: string[]
          budget_band: string | null
          ai_profile: any
          updated_at: string
        }
        Insert: {
          user_id: string
          dietary?: string[]
          accessibility?: string[]
          pace?: string | null
          interests?: string[]
          locale?: string | null
          home_airport?: string | null
          preferred_transport?: string[]
          budget_band?: string | null
          ai_profile?: any
          updated_at?: string
        }
        Update: {
          user_id?: string
          dietary?: string[]
          accessibility?: string[]
          pace?: string | null
          interests?: string[]
          locale?: string | null
          home_airport?: string | null
          preferred_transport?: string[]
          budget_band?: string | null
          ai_profile?: any
          updated_at?: string
        }
      }
      wisetrip_plans: {
        Row: {
          id: number
          price_id: string
          plan_type: string
          price: number
          monthly_limit: number
          created_at: string
          updated_at: string
        }
      }
      wisetrip_subscriptions: {
        Row: {
          id: number
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          price_id: string
          status: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
}