import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes/AppRoutes';
import { useAuthStore } from './store/authStore';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Configurar React Query con manejo de errores mejorado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // No reintentar en errores 4xx (excepto 429)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          if (error?.response?.status === 429) {
            return failureCount < 2;
          }
          return false;
        }
        // Reintentar hasta 2 veces en errores 5xx
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      // En React Query v5, onError se maneja en cada query/mutation individual
      // o usando QueryCache/MutationCache
    },
    mutations: {
      retry: false, // No reintentar mutaciones automáticamente
      // En React Query v5, onError se maneja en cada mutation individual
    },
  },
});

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Inicializar autenticación al cargar la app
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </BrowserRouter>

        {/* React Query Devtools (solo en desarrollo) */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;