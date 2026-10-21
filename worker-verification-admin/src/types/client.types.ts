export interface Client {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  image?: string;
  timestamp?: number;
  // Cuenta habilitada (HU-32); false si el administrador la suspendió
  isActive?: boolean;
}

export interface ClientFilters {
  search?: string;
}