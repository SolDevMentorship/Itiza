import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          navigate('/admin/login');
          return;
        }

        const { data: adminData, error } = await supabase
          .from('admin_users')
          .select()
          .eq('user_id', user.id)
          .single();

        if (error || !adminData) {
          setIsAdmin(false);
          navigate('/admin/login');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        navigate('/admin/login');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  return { isAdmin, loading };
}