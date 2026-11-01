export interface Client {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  image?: string;
  timestamp?: number;
  // Creación de la cuenta en Firebase Auth (ms); solo en el listado
  createdAt?: number | null;
  // Cuenta habilitada (HU-32); false si el administrador la suspendió
  isActive?: boolean;
}

export interface ClientFilters {
  search?: string;
}