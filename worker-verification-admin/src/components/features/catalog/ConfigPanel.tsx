import { useEffect, useState } from 'react';
import { Save, SlidersHorizontal } from 'lucide-react';
import { SystemConfigItem } from '@/types/catalog.types';
import { formatDate } from '@/lib/utils/helpers';

// Nombre y ayuda visibles de cada parámetro; los demás muestran su clave y descripción
const CONFIG_LABELS: Record<string, { label: string; hint: string }> = {
  quote_min_visit_fee_cop: { label: 'Tarifa mínima por visita (COP)', hint: 'Piso del precio de cualquier solicitud' },
  quote_regional_factor_pct: { label: 'Factor regional (%)', hint: 'Ajuste de la referencia de ciudades grandes para Ubaté (−15 = 15 % menos)' },
  quote_max_price_cop: { label: 'Precio máximo de una cotización (COP)', hint: 'Tope del valor que puede cotizar un técnico' },
  worker_max_categories: { label: 'Oficios máximos por trabajador', hint: 'Entre 1 y 7' },
  search_weight_distance: { label: 'Peso de la cercanía en la búsqueda', hint: 'Entre 0 y 1' },
  search_weight_rating: { label: 'Peso de la calificación en la búsqueda', hint: 'Entre 0 y 1' },
  search_neutral_rating: { label: 'Calificación de un técnico nuevo', hint: 'Se usa mientras no tiene calificaciones (0 a 5)' },
};

const ORDER = Object.keys(CONFIG_LABELS);

interface ConfigPanelProps {
  configs: SystemConfigItem[];
  onSave: (key: string, value: string) => Promise<unknown>;
  isSaving: boolean;
}

/** Parámetros de cotización y búsqueda; los cambios aplican a las solicitudes nuevas. */
export const ConfigPanel = ({ configs, onSave, isSaving }: ConfigPanelProps) => {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setDrafts(Object.fromEntries(configs.map((item) => [item.key, item.value])));
  }, [configs]);

  const sorted = [...configs].sort((a, b) => {
    const ia = ORDER.indexOf(a.key), ib = ORDER.indexOf(b.key);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.key.localeCompare(b.key);
  });

  return (
    <div className="panel p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-5 h-5 text-[hsl(var(--brand-text))]" />
        <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Parámetros de cotización y búsqueda</h2>
      </div>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        Los cambios aplican a las solicitudes nuevas; las ya creadas conservan el precio de referencia con el que se crearon.
      </p>

      <div className="divide-y divide-[hsl(var(--border))]">
        {sorted.map((item) => {
          const meta = CONFIG_LABELS[item.key];
          const draft = drafts[item.key] ?? item.value;
          const changed = draft.trim() !== item.value;
          return (
            <div key={item.key} className="py-3 grid grid-cols-1 md:grid-cols-[1fr_12rem_auto] gap-2 md:items-center">
              <div>
                <p className="font-semibold text-[hsl(var(--foreground))]">{meta?.label || item.key}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {meta?.hint || item.description} · Actualizado {formatDate(new Date(item.updated_at).getTime())}
                </p>
              </div>
              <input
                aria-label={meta?.label || item.key}
                value={draft}
                onChange={(e) => setDrafts((current) => ({ ...current, [item.key]: e.target.value }))}
                className="field"
              />
              <button
                disabled={!changed || isSaving}
                onClick={() => onSave(item.key, draft.trim()).catch(() => undefined)}
                className="btn-primary min-h-[44px] px-4"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
