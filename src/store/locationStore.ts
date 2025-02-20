import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Location {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  user_email?: string;
}

interface LocationStore {
  locations: Location[];
  channel: RealtimeChannel | null;
  addLocation: (location: { latitude: number; longitude: number }) => Promise<void>;
  subscribeToLocations: () => Promise<void>;
  unsubscribeFromLocations: () => void;
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  locations: [],
  channel: null,

  addLocation: async (location) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw userError;
      }
      if (!user) {
        console.error('No user found');
        throw new Error('No user found');
      }

      console.log('Current user:', user);
      console.log('Adding location:', location);

      // Insert location
      const { data, error: insertError } = await supabase
        .from('locations')
        .insert({
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          user_email: user.email
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Location added:', data);

      // Update local state
      set(state => ({
        locations: [data as Location, ...state.locations]
      }));

    } catch (error) {
      console.error('Error in addLocation:', error);
      throw error;
    }
  },

  subscribeToLocations: async () => {
    try {
      // Unsubscribe from any existing subscription
      get().unsubscribeFromLocations();

      // Set up realtime subscription
      const channel = supabase
        .channel('any')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'locations' },
          (payload) => {
            console.log('New location received:', payload.new);
            const newLocation = payload.new as Location;
            set(state => ({
              locations: [newLocation, ...state.locations]
            }));
          }
        )
        .subscribe();

      // Fetch initial data
      const { data: locations, error: fetchError } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      console.log('Initial locations:', locations);
      set({ 
        channel,
        locations: locations || [] 
      });

    } catch (error) {
      console.error('Error in subscribeToLocations:', error);
      throw error;
    }
  },

  unsubscribeFromLocations: () => {
    const { channel } = get();
    if (channel) {
      channel.unsubscribe();
      set({ channel: null });
    }
  }
})); 