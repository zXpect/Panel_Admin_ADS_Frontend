import { useState } from 'react';
import { History } from 'lucide-react';
import { useAuditLog } from '@/hooks/useCatalogAdmin';
import { AuditEntity } from '@/types/catalog.types';
import { cn, formatDate } from '@/lib/utils/helpers';

const ENTITY_LABELS: Record<AuditEntity, string> = {
  SystemConfig: 'Parámetro',
  ServiceCategory: 'Oficio',
  Task: 'Tarea',
  Account: 'Cuenta',
};

const FILTERS: { value?: AuditEntity; label: string }[] = [
  { label: 'Todo' },
  { value: 'Task', label: 'Tareas' },
  { value: 'ServiceCategory', label: 'Oficios' },
  { value: 'SystemConfig', label: 'Parámetros' },
  { value: 'Account', label: 'Cuentas' },
];

/** Solo los campos que cambiaron entre el valor anterior y el nuevo. */
const describeChange = (oldValue: Record<string, unknown> | null, newValue: Record<string, unknown>): string => {
  if (!oldValue) return 'Creado';
  const changes = Object.keys(newValue)
    .filter((key) => JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key]))
    .map((key) => `${key}: ${JSON.stringify(oldValue[key] ?? null)} → ${JSON.stringify(newValue[key])}`);
  return changes.join(' · ') || 'Sin cambios';
};

/** Últimos cambios de configuración y cuentas, con el administrador que los hizo. */
export const AuditPanel = () => {
  const [entity, setEntity] = useState<AuditEntity | undefined>();
  const { entries, isLoading } = useAuditLog(entity);

  return (
    <div className="panel p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[hsl(var(--brand-text))]" />
          <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Historial de cambios</h2>
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setEntity(filter.value)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold border',
                entity === filter.value
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-transparent'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Cargando…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Sin cambios registrados</p>
      ) : (
        <ul className="divide-y divide-[hsl(var(--border))] text-sm">
          {entries.map((entry) => (
            <li key={entry.id} className="py-2 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
              <span className="text-[hsl(var(--muted-foreground))] whitespace-nowrap sm:w-36">
                {formatDate(new Date(entry.created_at).getTime())}
              </span>
              <span className="font-semibold sm:w-24">{ENTITY_LABELS[entry.entity] || entry.entity}</span>
              <span className="font-mono text-xs sm:w-48 break-all">{entry.entity_key}</span>
              <span className="flex-1 break-all text-[hsl(var(--foreground))]">
                {describeChange(entry.old_value, entry.new_value)}
              </span>
              <span className="text-[hsl(var(--muted-foreground))] whitespace-nowrap">{entry.admin}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
