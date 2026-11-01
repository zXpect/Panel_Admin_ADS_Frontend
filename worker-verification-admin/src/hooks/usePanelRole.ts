import { useAuthStore } from '@/store/authStore';

interface PanelTokenClaims {
  username?: string;
  name?: string;
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

/** Iniciales para el avatar: «Fabián Ballesteros» → FB, «jurado1» → JU, «admin.ads» → AA. */
const initialsOf = (name: string) => {
  const words = name.split(/[\s._-]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2);
  return letters.toUpperCase();
};

/**
 * Cuenta y rol del panel.
 * El nombre es el completo de la cuenta de Django o, si no tiene, el usuario con el que entró.
 * Los evaluadores (jurados) pueden revisar documentos, responder PQR
 * y suspender o reactivar cuentas, pero no eliminar, ni hacer carga masiva, ni cambiar tarifas.
 * Ocultar los botones es solo una ayuda: el backend bloquea esas acciones de todos modos.
 */
export const usePanelRole = () => {
  const access = useAuthStore((state) => state.tokens?.access) ?? localStorage.getItem('access_token');
  const claims = readClaims(access);
  const displayName = claims.name || claims.username || 'Admin';
  return {
    isEvaluator: claims.role === 'evaluador',
    username: claims.username,
    // Las sesiones anteriores a este cambio no traen el nombre en el token
    displayName,
    initials: initialsOf(displayName),
    accessUntil: claims.access_until,
  };
};
