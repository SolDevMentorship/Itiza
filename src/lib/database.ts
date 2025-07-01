import { supabase } from './supabase';
import type { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type Customer = Tables['customers']['Row'];
type Gift = Tables['gifts']['Row'];
type Order = Tables['orders']['Row'];
type OrderItem = Tables['order_items']['Row'];

export const DatabaseService = {
  // Customer operations
  async createCustomer(customer: Omit<Customer, 'customer_id'>) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getCustomerByWallet(walletAddress: string) {
    const { data, error } = await supabase
      .from('customers')
      .select()
      .eq('wallet_address', walletAddress)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Gift operations
  async getAllGifts() {
    const { data, error } = await supabase
      .from('gifts')
      .select()
      .order('name');
    if (error) throw error;
    return data;
  },

  async getGiftById(giftId: number) {
    const { data, error } = await supabase
      .from('gifts')
      .select()
      .eq('gift_id', giftId)
      .single();
    if (error) throw error;
    return data;
  },

  // Order operations
  async createOrder(order: Omit<Order, 'order_id'>, orderItems: Omit<OrderItem, 'order_item_id' | 'order_id'>[]) {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (orderError) throw orderError;

    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: orderData.order_id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) throw itemsError;

    return orderData;
  },

  async getCustomerOrders(customerId: number) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*, gifts (*))
      `)
      .eq('customer_id', customerId)
      .order('order_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateOrderStatus(orderId: number, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};