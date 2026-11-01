import { useState } from 'react';
import { useAuditLog } from '@/hooks/useCatalogAdmin';
import { AuditEntity, AuditLogEntry, TaskUnit } from '@/types/catalog.types';
import { cn, formatDate, formatPrice } from '@/lib/utils/helpers';
import { Pagination } from '@/components/common/Pagination';
import { LoadingNut } from '@/components/common/LoadingNut';
import { EmptyState } from '@/components/common/EmptyState';
import { EmptyToolboxIcon } from '@/components/common/AdsIcons';
import { AUDIT_ENTITY_LABELS, AUDIT_FIELD_LABELS, CONFIG_LABELS, UNIT_LABELS } from './catalogLabels';

// El backend pagina de a 20 (REST_FRAMEWORK.PAGE_SIZE)
const PAGE_SIZE = 20;

const FILTERS: { value?: AuditEntity; label: string }[] = [
  { label: 'Todo' },
  { value: 'Task', label: 'Tareas' },
  { value: 'ServiceCategory', label: 'Oficios' },
  { value: 'SystemConfig', label: 'Parámetros' },
  { value: 'Account', label: 'Cuentas' },
];

const ROLE_LABELS: Record<string, string> = { worker: 'Trabajador', client: 'Cliente' };

type Values = Record<string, unknown>;

/** Un valor auditado tal como lo lee el administrador: precios, sí/no, unidades. */
const formatValue = (entry: AuditLogEntry, field: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return field.startsWith('reference_') ? 'sin rango' : '—';
  }
  if (typeof value === 'boolean') return value ? 'sí' : 'no';
  if (field.startsWith('reference_')) return formatPrice(Number(value));
  if (field === 'unit') return UNIT_LABELS[value as TaskUnit] || String(value);
  if (entry.entity === 'SystemConfig' && field === 'value') {
    const meta = CONFIG_LABELS[entry.entity_key];
    return `${meta?.prefix || ''}${value}${meta?.suffix ? ` ${meta.suffix}` : ''}`;
  }
  return String(value);
};

/** Qué se cambió: el nombre de la tarea, el oficio, el parámetro o la cuenta. */
const describeTarget = (entry: AuditLogEntry): { title: string; detail: string } => {
  const value = entry.new_value as Values;
  switch (entry.entity) {
    case 'SystemConfig':
      return { title: CONFIG_LABELS[entry.entity_key]?.label || entry.entity_key, detail: '' };
    case 'Account':
      return { title: ROLE_LABELS[String(value.role)] || 'Cuenta', detail: entry.entity_key };
    default:
      return { title: String(value.name || entry.entity_key), detail: entry.entity_key };
  }
};

/** Solo lo que cambió, una línea por campo. */
const describeChange = (entry: AuditLogEntry): string[] => {
  const oldValue = entry.old_value as Values | null;
  const newValue = entry.new_value as Values;

  if (entry.entity === 'Account') {
    const reason = newValue.reason ? [`Motivo: ${newValue.reason}`] : [];
    if (newValue.deleted) return ['Cuenta eliminada'];
    if (newValue.is_active === false) return ['Cuenta suspendida', ...reason];
    if (newValue.is_active === true) return ['Cuenta reactivada', ...reason];
  }
  if (!oldValue) return [entry.entity === 'Task' ? 'Tarea creada' : 'Creado'];

  const changes = Object.keys(newValue)
    .filter((key) => JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key]))
    .map((key) => `${AUDIT_FIELD_LABELS[key] || key}: ${formatValue(entry, key, oldValue[key])} → ${formatValue(entry, key, newValue[key])}`);
  return changes.length > 0 ? changes : ['Sin cambios'];
};

/** Cambios de configuración y cuentas, con el administrador que los hizo. */
export const AuditPanel = () => {
  const [entity, setEntity] = useState<AuditEntity | undefined>();
  const [page, setPage] = useState(1);
  const { entries, count, isLoading, isFetching } = useAuditLog(entity, page);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            onClick={() => { setEntity(filter.value); setPage(1); }}
            className={cn(
              'min-h-[36px] px-3 rounded-full text-xs font-semibold border-[1.5px] transition-colors',
              entity === filter.value
                ? 'bg-[hsl(var(--chip))] text-[hsl(var(--chip-foreground))] border-transparent'
                : 'bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className={cn('panel overflow-hidden transition-opacity', isFetching && !isLoading && 'opacity-70')}>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingNut />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState icon={EmptyToolboxIcon} title="Sin cambios registrados"
            description="Cada cambio de oficios, tareas, parámetros y cuentas aparecerá aquí." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[760px]">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Elemento</th>
                  <th>Cambio</th>
                  <th>Administrador</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const target = describeTarget(entry);
                  return (
                    <tr key={entry.id}>
                      <td className="whitespace-nowrap">{formatDate(new Date(entry.created_at).getTime())}</td>
                      <td className="whitespace-nowrap">{AUDIT_ENTITY_LABELS[entry.entity] || entry.entity}</td>
                      <td className="max-w-[16rem]">
                        <p className="font-semibold">{target.title}</p>
                        {target.detail && (
                          <p className="font-mono text-xs text-[hsl(var(--muted-foreground))] break-all">{target.detail}</p>
                        )}
                      </td>
                      <td>
                        {describeChange(entry).map((line) => (
                          <p key={line} className="break-words">{line}</p>
                        ))}
                      </td>
                      <td className="whitespace-nowrap">{entry.admin}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {count > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          itemsPerPage={PAGE_SIZE}
          totalItems={count}
        />
      )}
    </div>
  );
};
