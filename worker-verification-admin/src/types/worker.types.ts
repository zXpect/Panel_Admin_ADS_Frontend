export interface Worker {
  id: string;
  name: string;
  lastName: string;
  email: string;
  work: string;
  fcmToken?: string;
  isAvailable: boolean;
  isOnline: boolean;
  image?: string;
  phone?: string;
  description?: string;
  latitude: number;
  longitude: number;
  rating: number;
  totalRatings: number;
  pricePerHour: number;
  experience?: string;
  timestamp: number;
}

export interface WorkerCreateInput {
  id: string;
  name: string;
  lastName: string;
  email: string;
  work: string;
  phone?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  pricePerHour?: number;
  experience?: string;
}

export interface WorkerUpdateInput {
  name?: string;
  lastName?: string;
  email?: string;
  work?: string;
  phone?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  pricePerHour?: number;
  experience?: string;
  isAvailable?: boolean;
  isOnline?: boolean;
}

export interface WorkerFilters {
  category?: string;
  available?: boolean;
  online?: boolean;
  search?: string;
}

export interface WorkerStatistics {
  total: number;
  available: number;
  online: number;
  by_category: Record<string, number>;
}