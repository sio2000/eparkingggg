import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Location {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface LocationStore {
  locations: Location[];
  channel: RealtimeChannel | null;
  addLocation: (location: Omit<Location, 'id' | 'timestamp'>) => Promise<void>;
  subscribeToLocations: () => Promise<void>;
  unsubscribeFromLocations: () => void;
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  locations: [],
  channel: null,

  addLocation: async (location) => {
    try {
      console.log('Sharing location:', location); // Debug log
      const { error } = await supabase
        .from('locations')
        .insert([{
          user_id: location.user_id,
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error inserting location:', error);
        throw error;
      }
      console.log('Location shared successfully'); // Debug log
    } catch (error) {
      console.error('Error adding location:', error);
    }
  },

  subscribeToLocations: async () => {
    try {
      // Fetch existing locations first
      const { data: existingLocations } = await supabase
        .from('locations')
        .select('*')
        .order('timestamp', { ascending: false });

      if (existingLocations) {
        set({ locations: existingLocations });
      }

      // Subscribe to realtime changes
      const channel = supabase
        .channel('public:locations')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT',
            schema: 'public',
            table: 'locations'
          },
          (payload) => {
            console.log('New location received:', payload);
            set(state => ({
              locations: [payload.new as Location, ...state.locations]
            }));
          }
        )
        .subscribe();

      set({ channel });
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