import { create } from 'zustand';
import { ParkingSpot, UserLocation } from '../types';
import { useSubscriptionStore } from './subscriptionStore';
import { supabase } from '../lib/supabase';

interface DelayedSpot extends ParkingSpot {
  availableAt: number;
}

interface ParkingState {
  spots: ParkingSpot[];
  delayedSpots: DelayedSpot[];
  userLocation: UserLocation | null;
  selectedSpot: ParkingSpot | null;
  selectedDistance: number;
  setSpots: (spots: ParkingSpot[]) => void;
  addSpot: (spot: ParkingSpot) => void;
  removeSpot: (spotId: string) => void;
  setUserLocation: (location: UserLocation) => void;
  setSelectedSpot: (spot: ParkingSpot | null) => void;
  setSelectedDistance: (distance: number) => void;
  getVisibleSpots: () => ParkingSpot[];
  unpark: (spotId: string) => Promise<void>;
  handleUnpark: (location: UserLocation) => Promise<void>;
}

const DELAY_TIME = 60000; // 1 minute in milliseconds

export const useParkingStore = create<ParkingState>((set, get) => ({
  spots: [],
  delayedSpots: [],
  userLocation: null,
  selectedSpot: null,
  selectedDistance: 1,

  setSpots: (spots) => set({ spots }),

  addSpot: (spot) => {
    const status = useSubscriptionStore.getState().status;

    if (status === 'premium') {
      set((state) => ({ spots: [spot, ...state.spots] }));
    } else {
      const delayedSpot: DelayedSpot = {
        ...spot,
        availableAt: Date.now() + DELAY_TIME
      };

      set((state) => ({ 
        delayedSpots: [...state.delayedSpots, delayedSpot]
      }));

      setTimeout(() => {
        set((state) => {
          const updatedDelayedSpots = state.delayedSpots.filter(
            (s) => s.id !== delayedSpot.id
          );

          // Ensure we trigger a state update
          return {
            spots: [spot, ...state.spots],
            delayedSpots: updatedDelayedSpots
          };
        });
      }, DELAY_TIME);
    }
  },

  removeSpot: (spotId) => 
    set((state) => ({
      spots: state.spots.filter((spot) => spot.id !== spotId),
      delayedSpots: state.delayedSpots.filter((spot) => spot.id !== spotId)
    })),

  setUserLocation: (location) => set({ userLocation: location }),
  
  setSelectedSpot: (spot) => set({ selectedSpot: spot }),
  
  setSelectedDistance: (distance) => set({ selectedDistance: distance }),

  getVisibleSpots: () => {
    const state = get();
    const status = useSubscriptionStore.getState().status;
    
    if (status === 'premium') {
      return [...state.spots];
    } else {
      const now = Date.now();
      const availableDelayedSpots = state.delayedSpots
        .filter((spot) => spot.availableAt <= now)
        .map(({ availableAt, ...spot }) => spot);
      
      // Combine both arrays and return a new reference
      return [...state.spots, ...availableDelayedSpots];
    }
  },

  unpark: async (spotId: string) => {
    try {
      console.log('Attempting to unpark from spot:', spotId);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Get the spot first
      const { data: spot, error: fetchError } = await supabase
        .from('parking_spots')
        .select('*')
        .eq('id', spotId)
        .single();

      if (fetchError) {
        console.error('Error fetching spot:', fetchError);
        return;
      }

      if (!spot) {
        console.error('Spot not found');
        return;
      }

      console.log('Current spot:', spot);

      // Update the spot
      const { error: updateError } = await supabase
        .from('parking_spots')
        .update({
          is_active: false
        })
        .eq('id', spotId);

      if (updateError) {
        console.error('Error updating spot:', updateError);
        return;
      }

      console.log('Spot updated successfully');

      // Update local state
      set(state => ({
        spots: state.spots.filter(s => s.id !== spotId)
      }));

    } catch (error) {
      console.error('Error in unpark:', error);
    }
  },

  handleUnpark: async (location: UserLocation) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Create the new spot
      const newSpot = {
        user_id: user.id,
        latitude: location.latitude,
        longitude: location.longitude,
        user_email: user.email,
        is_active: true,
        size: 'medium',
        is_accessible: false
      };

      // Insert into database
      const { data, error } = await supabase
        .from('parking_spots')
        .insert(newSpot)
        .select()
        .single();

      if (error) throw error;

      // Update local state to add the new spot
      set((state) => ({
        spots: [...state.spots, data]
      }));

    } catch (error) {
      console.error('Error in handleUnpark:', error);
      throw error;
    }
  }
}));