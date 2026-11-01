import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { SystemConfigItem } from '@/types/catalog.types';
import { cn, formatDate } from '@/lib/utils/helpers';
import { CONFIG_GROUPS, CONFIG_LABELS } from './catalogLabels';

interface ConfigPanelProps {
  configs: SystemConfigItem[];
  onSave: (key: string, value: string) => Promise<unknown>;
  isSaving: boolean;
}

/** Parámetros de cotización y búsqueda, en grupos; los cambios aplican a las solicitudes nuevas. */
export const ConfigPanel = ({ configs, onSave, isSaving }: ConfigPanelProps) => {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setDrafts(Object.fromEntries(configs.map((item) => [item.key, item.value])));
  }, [configs]);

  const byKey = Object.fromEntries(configs.map((item) => [item.key, item]));
  const grouped = new Set(CONFIG_GROUPS.flatMap((group) => group.keys));
  // Un parámetro nuevo del backend que el panel todavía no conoce no se pierde: va a «Otros»
  const groups = [
    ...CONFIG_GROUPS,
    { title: 'Otros', description: '', keys: configs.map((item) => item.key).filter((key) => !grouped.has(key)) },
  ]
    .map((group) => ({ ...group, items: group.keys.map((key) => byKey[key]).filter(Boolean) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="space-y-4">
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        Los cambios aplican a las solicitudes nuevas; las ya creadas conservan el precio de referencia con el que se crearon.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        {groups.map((group) => (
          <section key={group.title} className="panel p-4 sm:p-6 space-y-2">
            <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">{group.title}</h2>
            {group.description && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{group.description}</p>
            )}

            <div className="divide-y divide-[hsl(var(--border))]">
              {group.items.map((item) => (
                <ConfigRow
                  key={item.key}
                  item={item}
                  draft={drafts[item.key] ?? item.value}
                  onChange={(value) => setDrafts((current) => ({ ...current, [item.key]: value }))}
                  onSave={onSave}
                  isSaving={isSaving}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

interface ConfigRowProps {
  item: SystemConfigItem;
  draft: string;
  onChange: (value: string) => void;
  onSave: (key: string, value: string) => Promise<unknown>;
  isSaving: boolean;
}

const ConfigRow = ({ item, draft, onChange, onSave, isSaving }: ConfigRowProps) => {
  const meta = CONFIG_LABELS[item.key];
  const changed = draft.trim() !== item.value;

  return (
    <div className="py-3 space-y-2">
      <div>
        <p className="font-semibold text-[hsl(var(--foreground))]">{meta?.label || item.key}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {meta?.hint || item.description} · Actualizado {formatDate(new Date(item.updated_at).getTime())}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-[14rem]">
          {meta?.prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--muted-foreground))]">
              {meta.prefix}
            </span>
          )}
          <input
            aria-label={meta?.label || item.key}
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            className={cn('field', meta?.prefix && 'pl-7', meta?.suffix && 'pr-8')}
          />
          {meta?.suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--muted-foreground))]">
              {meta.suffix}
            </span>
          )}
        </div>
        {/* Solo aparece cuando el valor cambió */}
        {changed && (
          <>
            <button
              disabled={isSaving}
              onClick={() => onSave(item.key, draft.trim()).catch(() => undefined)}
              className="btn-primary min-h-[44px] px-4"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button type="button" onClick={() => onChange(item.value)} className="btn-secondary min-h-[44px] px-3">
              Deshacer
            </button>
          </>
        )}
      </div>
    </div>
  );
};
