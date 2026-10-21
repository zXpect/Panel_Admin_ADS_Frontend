import { useState } from 'react';
import { Ban, RotateCcw, X } from 'lucide-react';
import { useAccountStatus } from '@/hooks/useAccountStatus';

interface AccountStatusControlProps {
  uid: string;
  name: string;
  role: 'client' | 'worker';
  // Sin el campo en Firebase la cuenta cuenta como activa
  isActive?: boolean;
}

/** Botón de suspender o reactivar una cuenta (HU-32) con confirmación y motivo. */
export const AccountStatusControl = ({ uid, name, role, isActive = true }: AccountStatusControlProps) => {
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState('');
  const { setStatus, isPending } = useAccountStatus();

  const submit = async () => {
    try {
      await setStatus({ uid, isActive: !isActive, reason: reason.trim() });
      setConfirming(false);
      setReason('');
    } catch {
      // El hook ya mostró el error (p. ej. 409 con un servicio en curso)
    }
  };

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        className={isActive
          ? 'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-[hsl(var(--destructive))]/40 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 transition-colors'
          : 'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity'}
      >
        {isActive ? <Ban className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
        {isActive ? 'Suspender cuenta' : 'Reactivar cuenta'}
      </button>

      {confirming && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70" onClick={() => !isPending && setConfirming(false)} />
          <div className="relative bg-card rounded-lg shadow-xl w-full max-w-md border border-border text-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                {isActive ? 'Suspender' : 'Reactivar'} la cuenta de {name}
              </h3>
              <button onClick={() => setConfirming(false)} disabled={isPending} aria-label="Cerrar"
                className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3 text-sm">
              {isActive ? (
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>No podrá iniciar sesión y su sesión actual se cierra.</li>
                  {role === 'worker' && <li>Sale del mapa y de la búsqueda.</li>}
                  <li>Sus solicitudes que no han iniciado se cancelan y se avisa a la otra parte.</li>
                  <li>Si tiene un servicio en camino o en progreso, no se puede suspender hasta que termine.</li>
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  Podrá volver a iniciar sesión.{role === 'worker' && ' Aparecerá en la búsqueda cuando se conecte.'}
                </p>
              )}
              <label className="block font-medium text-muted-foreground">
                Motivo (queda en el historial)
                <textarea
                  rows={3}
                  maxLength={300}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-[hsl(var(--input))] text-foreground
                             focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
              <button onClick={() => setConfirming(false)} disabled={isPending}
                className="px-4 py-2 rounded-lg border border-border font-semibold text-foreground hover:bg-muted">
                Cancelar
              </button>
              <button onClick={submit} disabled={isPending}
                className={isActive
                  ? 'px-4 py-2 rounded-lg font-semibold bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] disabled:opacity-50'
                  : 'px-4 py-2 rounded-lg font-semibold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] disabled:opacity-50'}
              >
                {isPending ? 'Guardando…' : isActive ? 'Suspender' : 'Reactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/** Etiqueta «Suspendida» para listas y detalles. */
export const SuspendedBadge = () => (
  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
    Cuenta suspendida
  </span>
);
