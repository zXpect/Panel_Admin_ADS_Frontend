import { useAuthStore } from '@/store/authStore';

interface PanelTokenClaims {
  username?: string;
  role?: 'admin' | 'evaluador';
  access_until?: string;
}

/** Lee los datos del JWT del panel (sin verificarlo: la API es la que decide los permisos). */
const readClaims = (token: string | null | undefined): PanelTokenClaims => {
  if (!token) return {};
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(payload)))) as PanelTokenClaims;
  } catch {
    return {};
  }
};

/**
 * Rol de la cuenta del panel. Los evaluadores (jurados) pueden revisar documentos, responder PQR
 * y suspender o reactivar cuentas, pero no eliminar, ni hacer carga masiva, ni cambiar tarifas.
 * Ocultar los botones es solo una ayuda: el backend bloquea esas acciones de todos modos.
 */
export const usePanelRole = () => {
  const access = useAuthStore((state) => state.tokens?.access) ?? localStorage.getItem('access_token');
  const claims = readClaims(access);
  return {
    isEvaluator: claims.role === 'evaluador',
    username: claims.username,
    accessUntil: claims.access_until,
  };
};
