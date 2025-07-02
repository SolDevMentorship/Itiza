import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
//import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type Order = {
  id: number;
  customer_id: number;
  status: string;
  created_at: string;
  customer: {
    name: string;
    email: string;
  };
  order_items: Array<{
    id: number;
    quantity: number;
    gift: {
      name: string;
      price: number;
    };
  }>;
};

const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers (name, email),
          order_items (order_id, quantity, gift:gifts (name, price))
        `)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch orders',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update order status',
      });
    }
  };

  const calculateOrderTotal = (order: Order) => {
    return order.order_items.reduce(
      (total, item) => total + item.quantity * item.gift.price,
      0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Manage Orders</h2>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Order #{order.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusChange(order.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Customer</h4>
              <p className="text-sm text-gray-600">{order.customer.name}</p>
              <p className="text-sm text-gray-600">{order.customer.email}</p>
            </div>

            <div className="px-6 py-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">
                        {item.quantity}x {item.gift.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      ${(item.quantity * item.gift.price).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total</span>
                    <span>${calculateOrderTotal(order).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}