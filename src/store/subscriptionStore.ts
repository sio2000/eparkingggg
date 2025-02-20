import { create } from 'zustand';
import { supabase } from '../lib/supabase';

type SubscriptionStatus = 'free' | 'premium';

interface SubscriptionState {
  status: SubscriptionStatus;
  startDate: string | null;
  endDate: string | null;
  loading: boolean;
  error: string | null;
  fetchSubscriptionStatus: () => Promise<void>;
  updateSubscriptionStatus: (status: SubscriptionStatus) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  status: 'free',
  startDate: null,
  endDate: null,
  loading: false,
  error: null,

  fetchSubscriptionStatus: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ status: 'free', startDate: null, endDate: null, loading: false });
        return;
      }

      set({ loading: true });
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_start_date, subscription_end_date')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                subscription_status: 'free',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);
          
          if (insertError) throw insertError;
          
          set({
            status: 'free',
            startDate: null,
            endDate: null,
            loading: false
          });
          return;
        }
        throw error;
      }

      set({
        status: profile?.subscription_status || 'free',
        startDate: profile?.subscription_start_date || null,
        endDate: profile?.subscription_end_date || null,
        loading: false
      });
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      set({ 
        error: error.message,
        status: 'free',
        startDate: null,
        endDate: null,
        loading: false 
      });
    }
  },

  updateSubscriptionStatus: async (status: SubscriptionStatus) => {
    try {
      set({ loading: true });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const startDate = new Date().toISOString();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      const endDateISO = endDate.toISOString();

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: status,
          subscription_start_date: startDate,
          subscription_end_date: endDateISO,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      set({ 
        status, 
        startDate,
        endDate: endDateISO,
        loading: false 
      });
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  }
})); 