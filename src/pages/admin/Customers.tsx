import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

type Customer = {
  id: number;
  name: string;
  email: string;
  wallet_address: string;
  phone: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
};

type CustomerDetails = Customer & {
  orders: Array<{
    id: number;
    status: string;
    created_at: string;
    order_items: Array<{
      quantity: number;
      gift: {
        name: string;
        price: number;
      };
    }>;
  }>;
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // First, get all customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*');

      if (customersError) throw customersError;

      // Then, for each customer, get their orders count and total spent
      const customersWithStats = await Promise.all(
        (customersData || []).map(async (customer) => {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select(`
              id,
              order_items (quantity, gift:gifts (price))
            `)
            .eq('customer_id', customer.id);

          if (ordersError) throw ordersError;

          const total_orders = ordersData?.length || 0;
          const total_spent = ordersData?.reduce((total, order) => {
            return (
              total +
              order.order_items.reduce(
                (itemTotal, item) =>
                  itemTotal + (item.quantity * (item.gift?.[0]?.price || 0)),
                0
              )
            );
          }, 0) || 0;

          return {
            ...customer,
            total_orders,
            total_spent,
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch customers',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId: number) => {
    try {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (customerError) throw customerError;

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          order_items (quantity, gift:gifts (name, price))
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setSelectedCustomer({
        ...customerData,
        orders: ordersData || [],
        total_orders: ordersData?.length || 0,
        total_spent:
          ordersData?.reduce((total, order) => {
            return (
              total +
              order.order_items.reduce(
                (itemTotal, item) =>
                  itemTotal + (item.quantity * (item.gift?.[0]?.price || 0)),
                0
              )
            );
          }, 0) || 0,
      });
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch customer details',
      });
    }
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
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Manage Customers
      </h2>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wallet Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {customer.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.wallet_address.slice(0, 6)}...
                  {customer.wallet_address.slice(-4)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.total_orders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${customer.total_spent.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchCustomerDetails(customer.id)}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Name
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedCustomer.name}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Email
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedCustomer.email}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Phone
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedCustomer.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Wallet Address
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedCustomer.wallet_address}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Order History
                </h4>
                <div className="space-y-4">
                  {selectedCustomer.orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">
                            Order #{order.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {order.order_items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.quantity}x {item.gift.name}
                            </span>
                            <span>
                              ${(item.quantity * item.gift.price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}