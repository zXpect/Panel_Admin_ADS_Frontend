export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/token/',
    REFRESH: '/api/auth/token/refresh/',
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
    WEEKLY_TRENDS: '/api/dashboard/weekly-trends',
    MONTHLY_TRENDS: '/api/dashboard/monthly-trends',
    ACTIVITY_STATS: '/api/dashboard/activity-stats', 
  },

  // Workers
  WORKERS: {
    LIST: '/api/workers/',
    DETAIL: (id: string) => `/api/workers/${id}/`,
    CREATE: '/api/workers/',
    UPDATE: (id: string) => `/api/workers/${id}/`,
    DELETE: (id: string) => `/api/workers/${id}/`,
    STATISTICS: '/api/workers/statistics/',
    AVAILABILITY: (id: string) => `/api/workers/${id}/availability/`,
    ONLINE_STATUS: (id: string) => `/api/workers/${id}/online_status/`,
    VERIFICATION_STATUS: (id: string) => `/api/workers/${id}/verification_status/`,
    LOCATION: (id: string) => `/api/workers/${id}/location/`,
    ADD_RATING: (id: string) => `/api/workers/${id}/add_rating/`,
    
    // Carga masiva
    BULK_UPLOAD: '/api/workers/bulk-upload/',
    BULK_TEMPLATE: '/api/workers/bulk-upload-template/',
  },

  // Documents
  DOCUMENTS: {
    PENDING: '/api/documents/pending/',
    WORKER_DOCUMENTS: (workerId: string) => `/api/documents/worker/${workerId}/`,
    HOJA_VIDA: (workerId: string) => `/api/documents/worker/${workerId}/hoja-vida/`,
    ANTECEDENTES: (workerId: string) => `/api/documents/worker/${workerId}/antecedentes/`,
    TITULOS: (workerId: string) => `/api/documents/worker/${workerId}/titulos/`,
    CARTAS: (workerId: string) => `/api/documents/worker/${workerId}/cartas/`,
    CREATE: '/api/documents/',
    APPROVE: '/api/documents/approve/',
    REJECT: '/api/documents/reject/',
    CHECK_REQUIREMENTS: (workerId: string) => `/api/documents/worker/${workerId}/check-requirements/`,
    DELETE: '/api/documents/delete/',
    FILE_URL: '/api/documents/file-url/',
  },

  // Clients
  CLIENTS: {
    LIST: '/api/clients/',
    DETAIL: (id: string) => `/api/clients/${id}/`,
    COUNT: '/api/clients/count/',
  },
} as const;