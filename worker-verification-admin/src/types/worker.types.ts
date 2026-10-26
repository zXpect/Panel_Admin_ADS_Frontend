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
  experience?: string;
  timestamp: number;
  // Cuenta habilitada (HU-32); false si el administrador la suspendió
  isActive?: boolean;
  // Oficios del catálogo (slugs) y verificación documental; solo lectura
  categories?: string[];
  verificationStatus?: {
    status: 'pending' | 'documents_submitted' | 'approved' | 'rejected' | string;
    timestamp?: number;
    reviewedBy?: string;
    rejectionReason?: string;
  } | null;
}

// Como el registro de la app: oficios del catálogo (slugs, hasta worker_max_categories);
// el backend escribe `work` con el primero. Sin precio (sale del catálogo y la cotización)
// ni ubicación (la escribe la app)
export interface WorkerCreateInput {
  name: string;
  lastName: string;
  email: string;
  categories: string[];
  phone: string;
  description?: string;
  experience?: string;
  password?: string;
}

export interface WorkerCreateResponse {
  success: boolean;
  message: string;
  data: Worker;
  password?: string;
  warning?: string;
}

export interface WorkerUpdateInput {
  name?: string;
  lastName?: string;
  email?: string;
  categories?: string[];
  phone?: string;
  description?: string;
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

export interface BulkUploadResult {
  total_processed: number;
  successful: number;
  failed: number;
  success_details: Array<{
    row: number;
    email: string;
    name: string;
    user_id: string;
    password?: string;
    auth_existed: boolean;
  }>;
  error_details: Array<{
    row: number;
    email: string;
    name: string;
    error: string;
  }>;
  execution_time: number;
}