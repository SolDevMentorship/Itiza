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
      customers: {
        Row: {
          customer_id: number
          name: string
          email: string | null
          wallet_address: string
          blockchain_network: string | null
          phone: string | null
          street: string | null
          city: string | null
          state: string | null
          zip: string | null
          country: string | null
        }
        Insert: {
          customer_id?: number
          name: string
          email?: string | null
          wallet_address: string
          blockchain_network?: string | null
          phone?: string | null
          street?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          country?: string | null
        }
        Update: {
          customer_id?: number
          name?: string
          email?: string | null
          wallet_address?: string
          blockchain_network?: string | null
          phone?: string | null
          street?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          country?: string | null
        }
      }
      gifts: {
        Row: {
          gift_id: number
          name: string
          description: string | null
          price: number
          stock_quantity: number
          image_url: string | null
        }
        Insert: {
          gift_id?: number
          name: string
          description?: string | null
          price: number
          stock_quantity: number
          image_url?: string | null
        }
        Update: {
          gift_id?: number
          name?: string
          description?: string | null
          price?: number
          stock_quantity?: number
          image_url?: string | null
        }
      }
      order_items: {
        Row: {
          order_item_id: number
          order_id: number
          gift_id: number
          quantity: number
          unit_price: number
        }
        Insert: {
          order_item_id?: number
          order_id: number
          gift_id: number
          quantity: number
          unit_price: number
        }
        Update: {
          order_item_id?: number
          order_id?: number
          gift_id?: number
          quantity?: number
          unit_price?: number
        }
      }
      orders: {
        Row: {
          order_id: number
          customer_id: number
          order_date: string
          total_amount: number
          status: string
          recipient_name: string
          recipient_street: string
          recipient_city: string
          recipient_state: string | null
          recipient_zip: string | null
          recipient_country: string | null
          gift_message: string | null
          tracking_number: string | null
        }
        Insert: {
          order_id?: number
          customer_id: number
          order_date: string
          total_amount: number
          status: string
          recipient_name: string
          recipient_street: string
          recipient_city: string
          recipient_state?: string | null
          recipient_zip?: string | null
          recipient_country?: string | null
          gift_message?: string | null
          tracking_number?: string | null
        }
        Update: {
          order_id?: number
          customer_id?: number
          order_date?: string
          total_amount?: number
          status?: string
          recipient_name?: string
          recipient_street?: string
          recipient_city?: string
          recipient_state?: string | null
          recipient_zip?: string | null
          recipient_country?: string | null
          gift_message?: string | null
          tracking_number?: string | null
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