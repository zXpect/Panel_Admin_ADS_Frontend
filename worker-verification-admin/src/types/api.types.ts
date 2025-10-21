export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  data: T[];
  next?: string;
  previous?: string;
}

export interface DashboardStats {
  workers: {
    total: number;
    available: number;
    online: number;
    byCategory: Record<string, number>;
  };
  clients: {
    total: number;
  };
  documents: {
    pendingTotal: number;
    pendingByType: {
      hojaDeVida: number;
      antecedentesJudiciales: number;
      titulos: number;
      cartasRecomendacion: number;
    };
  };
}