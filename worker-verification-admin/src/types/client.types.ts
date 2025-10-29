export interface Client {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  image?: string;
  timestamp?: number;
}

export interface ClientFilters {
  search?: string;
}