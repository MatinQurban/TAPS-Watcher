export interface ParkingReport {
  id: string;
  lat: number;
  lng: number;
  timestamp: number;
  expiresAt: number;
  officerCount?: number;
  vehicleType?: string;
  direction?: string;
  details?: string;
  imageUrl?: string;
  reportedBy: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface ProximitySettings {
  enabled: boolean;
  carLocation: UserLocation | null;
  radiusMiles: number; // 0.5 - 1
}

export type VehicleType = 'car' | 'motorcycle' | 'bicycle' | 'on-foot' | 'segway' | 'other';

export const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: 'car', label: 'Car' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'on-foot', label: 'On Foot' },
  { value: 'segway', label: 'Segway' },
  { value: 'other', label: 'Other' },
];

export const DIRECTIONS = [
  'Northbound', 'Southbound', 'Eastbound', 'Westbound',
  'Stationary', 'Unknown'
];
