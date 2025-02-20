import { create } from 'zustand';
import { ParkingSpot, UserLocation } from '../types';
import { useSubscriptionStore } from './subscriptionStore';

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
  }
}));