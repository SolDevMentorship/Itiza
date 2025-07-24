import { supabase } from './supabase';

export interface Gift {
  gift_id: number;
  name: string;
  description: string;
  price: string;
  image_url?: string;
  stock_quantity: number;
}

export const GiftService = {
  async getAllGifts(): Promise<Gift[]> {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getGiftById(id: number): Promise<Gift | null> {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('gift_id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createGift(gift: Omit<Gift, 'gift_id'>): Promise<Gift> {
    const { data, error } = await supabase
      .from('gifts')
      .insert([gift])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGift(gift: Partial<Gift> & { gift_id: number }): Promise<Gift> {
    const { data, error } = await supabase
      .from('gifts')
      .update(gift)
      .eq('gift_id', gift.gift_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteGift(id: number): Promise<void> {
    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('gift_id', id);

    if (error) throw error;
  },

  async updateStock(id: number, quantity: number): Promise<void> {
    const { error } = await supabase
      .from('gifts')
      .update({ stock_quantity: quantity })
      .eq('gift_id', id);

    if (error) throw error;
  }
};
