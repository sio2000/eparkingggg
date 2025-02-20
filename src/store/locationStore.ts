import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Location {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  user_email?: string;
  created_at: string;
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
        return;
      }
      if (!user) {
        console.error('No user found');
        return;
      }

      console.log('Adding location for user:', user.email);

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
        return;
      }

      console.log('Location added:', data);

      // Update local state
      if (data) {
        set(state => ({
          locations: [data as Location, ...state.locations]
        }));
      }

    } catch (error) {
      console.error('Error in addLocation:', error);
    }
  },

  subscribeToLocations: async () => {
    try {
      // Unsubscribe from existing subscription
      get().unsubscribeFromLocations();

      // Fetch initial locations
      const { data: locations, error: fetchError } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching locations:', fetchError);
        return;
      }

      console.log('Initial locations:', locations);

      // Subscribe to changes
      const channel = supabase
        .channel('locations_channel')
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

      // Set initial state
      set({ 
        channel,
        locations: locations || [] 
      });

    } catch (error) {
      console.error('Error in subscribeToLocations:', error);
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