import { ShieldCheck } from 'lucide-react';
import { usePanelRole } from '@/hooks/usePanelRole';

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
};

/** Aviso fijo para las cuentas de evaluación (jurados): qué pueden hacer y hasta cuándo. */
export const EvaluatorBanner = () => {
  const { isEvaluator, accessUntil } = usePanelRole();
  if (!isEvaluator) return null;

  return (
    <div role="status"
      className="flex items-start gap-3 px-4 py-3 md:px-10 border-b border-[hsl(var(--border))]
                 bg-[hsl(var(--chip))] text-[hsl(var(--chip-foreground))] text-sm leading-5">
      <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={1.9} />
      <p>
        <strong className="font-semibold">Modo evaluación.</strong>{' '}
        Puedes revisar y aprobar o rechazar documentos, responder PQR y suspender o reactivar cuentas.
        Eliminar, la carga masiva y los cambios de tarifas están desactivados.
        {accessUntil && <> Acceso hasta el {formatDate(accessUntil)}.</>}
      </p>
    </div>
  );
};
