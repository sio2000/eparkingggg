export type ParkingSpotSize = 'small' | 'medium' | 'large';

export interface ParkingSpot {
  id: string;
  latitude: number;
  longitude: number;
  size: ParkingSpotSize;
  isAccessible: boolean;
  createdAt: number;
  expiresAt: number;
  userId: string;
  userName?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}