import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      set({ user: data.user, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Σφάλμα κατά τη σύνδεση',
        loading: false 
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: email.split('@')[0],
            avatar_url: null,
          }
        }
      });
      
      if (error) throw error;

      if (data.user) {
        // Δημιουργία profile με free subscription
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              name: email.split('@')[0],
              subscription_status: 'free',
              subscription_start_date: null,
              subscription_end_date: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      set({ user: data.user, loading: false });
      return data;
    } catch (error: any) {
      const errorMessage = error.message === 'User already registered'
        ? 'Υπάρχει ήδη λογαριασμός με αυτό το email'
        : error.message || 'Σφάλμα κατά την εγγραφή';
      
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Σφάλμα κατά την αποσύνδεση',
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Αρχικοποίηση της κατάστασης του χρήστη
supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.setState({ 
    user: session?.user ?? null, 
    loading: false 
  });
});

// Έλεγχος αρχικής κατάστασης
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.setState({ 
    user: session?.user ?? null, 
    loading: false 
  });
}); 