import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Save } from 'lucide-react';
import { CatalogCategory, CatalogCategoryInput, CatalogTask, CatalogTaskInput, TaskUnit } from '@/types/catalog.types';
import { cn, formatPrice } from '@/lib/utils/helpers';
import { TradeIcon } from '@/components/common/AdsIcons';

const UNIT_LABELS: Record<TaskUnit, string> = {
  visita: 'Visita',
  unidad: 'Unidad',
  m2: 'm²',
  jornada: 'Jornada',
};

const fieldClass = `w-full px-2 py-1.5 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--input))]
  text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent`;

const toNumber = (value: string): number | null => (value.trim() === '' ? null : Number(value));

interface CategoryCardProps {
  category: CatalogCategory;
  onUpdateCategory: (id: number, input: CatalogCategoryInput) => Promise<unknown>;
  onUpdateTask: (id: number, input: CatalogTaskInput) => Promise<unknown>;
  onCreateTask: (input: CatalogTaskInput) => Promise<unknown>;
  isSaving: boolean;
}

/** Oficio con sus tareas: rango de referencia, activar o desactivar y crear tareas. */
export const CategoryCard = ({ category, onUpdateCategory, onUpdateTask, onCreateTask, isSaving }: CategoryCardProps) => {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const activeTasks = category.tasks.filter((task) => task.is_active).length;

  return (
    <div className={cn(
      'panel overflow-hidden',
      !category.is_active && 'opacity-70'
    )}>
      <div className="flex items-center justify-between gap-3 p-4">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-left flex-1 min-w-0">
          {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          <span className="w-9 h-9 rounded-xl bg-[hsl(var(--chip))] text-[hsl(var(--chip-foreground))] flex items-center justify-center flex-shrink-0">
            <TradeIcon slug={category.slug} className="w-5 h-5" />
          </span>
          <span className="font-bold text-[hsl(var(--foreground))]">{category.name}</span>
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {activeTasks} de {category.tasks.length} tareas activas
          </span>
        </button>
        <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
          <input
            type="checkbox"
            checked={category.is_active}
            disabled={isSaving}
            onChange={(e) => onUpdateCategory(category.id, { is_active: e.target.checked }).catch(() => undefined)}
            className="w-4 h-4 accent-[hsl(var(--primary))]"
          />
          Oficio activo
        </label>
      </div>

      {open && (
        <div className="border-t border-[hsl(var(--border))]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[hsl(var(--muted-foreground))]">
                <tr>
                  <th className="px-4 py-2 font-medium">Tarea</th>
                  <th className="px-2 py-2 font-medium">Unidad</th>
                  <th className="px-2 py-2 font-medium">Mínimo (COP)</th>
                  <th className="px-2 py-2 font-medium">Máximo (COP)</th>
                  <th className="px-2 py-2 font-medium">Activa</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {category.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} onSave={onUpdateTask} isSaving={isSaving} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-4 py-2 text-xs text-[hsl(var(--muted-foreground))]">
            Rangos de referencia de ciudades grandes: el estimado de Ubaté aplica el factor regional y la tarifa
            mínima por visita. Una tarea sin rango la cotiza el técnico. Las tareas no se borran, se desactivan.
          </p>

          <div className="px-4 pb-4">
            {creating ? (
              <NewTaskForm
                category={category.slug}
                nextOrder={Math.max(0, ...category.tasks.map((task) => task.order)) + 1}
                onCancel={() => setCreating(false)}
                onCreate={(input) => onCreateTask(input).then(() => setCreating(false))}
                isSaving={isSaving}
              />
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold
                           bg-[hsl(var(--primary))]/10 text-[hsl(var(--brand-text))] hover:bg-[hsl(var(--primary))]/20"
              >
                <Plus className="w-4 h-4" />
                Nueva tarea
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface TaskRowProps {
  task: CatalogTask;
  onSave: (id: number, input: CatalogTaskInput) => Promise<unknown>;
  isSaving: boolean;
}

const TaskRow = ({ task, onSave, isSaving }: TaskRowProps) => {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  useEffect(() => {
    setMin(task.reference_min_cop?.toString() ?? '');
    setMax(task.reference_max_cop?.toString() ?? '');
  }, [task]);

  const changed = toNumber(min) !== task.reference_min_cop || toNumber(max) !== task.reference_max_cop;

  return (
    <tr className={cn('border-t border-[hsl(var(--border))]', !task.is_active && 'opacity-60')}>
      <td className="px-4 py-2">
        <p className="font-medium text-[hsl(var(--foreground))]">{task.name}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{task.slug}</p>
      </td>
      <td className="px-2 py-2 whitespace-nowrap">{UNIT_LABELS[task.unit] || task.unit}</td>
      <td className="px-2 py-2 min-w-[8rem]">
        <input type="number" min={0} step={100} value={min} placeholder="Sin rango" aria-label={`Mínimo de ${task.name}`}
          onChange={(e) => setMin(e.target.value)} className={fieldClass} />
      </td>
      <td className="px-2 py-2 min-w-[8rem]">
        <input type="number" min={0} step={100} value={max} placeholder="Sin rango" aria-label={`Máximo de ${task.name}`}
          onChange={(e) => setMax(e.target.value)} className={fieldClass} />
      </td>
      <td className="px-2 py-2">
        <input type="checkbox" checked={task.is_active} disabled={isSaving} aria-label={`${task.name} activa`}
          onChange={(e) => onSave(task.id, { is_active: e.target.checked }).catch(() => undefined)}
          className="w-4 h-4 accent-[hsl(var(--primary))]" />
      </td>
      <td className="px-4 py-2 text-right">
        <button
          disabled={!changed || isSaving}
          title={min && max ? `${formatPrice(Number(min))} – ${formatPrice(Number(max))}` : 'Sin rango'}
          onClick={() => onSave(task.id, { reference_min_cop: toNumber(min), reference_max_cop: toNumber(max) })
            .catch(() => undefined)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold
                     bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] disabled:opacity-40"
        >
          <Save className="w-3.5 h-3.5" />
          Guardar
        </button>
      </td>
    </tr>
  );
};

interface NewTaskFormProps {
  category: string;
  nextOrder: number;
  onCreate: (input: CatalogTaskInput) => Promise<unknown>;
  onCancel: () => void;
  isSaving: boolean;
}

// Como los slugs del catálogo: «Reparar grifo o válvula» → reparar-grifo-o-valvula
const slugify = (text: string) => text
  .normalize('NFD').replace(/\p{M}/gu, '')
  .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);

const NewTaskForm = ({ category, nextOrder, onCreate, onCancel, isSaving }: NewTaskFormProps) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<TaskUnit>('visita');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [source, setSource] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      category, name: name.trim(), slug: slugify(name), unit, source: source.trim(), order: nextOrder,
      reference_min_cop: toNumber(min), reference_max_cop: toNumber(max),
    }).catch(() => undefined);
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 items-end
                                       p-3 rounded-xl bg-[hsl(var(--muted))]/40">
      <label className="lg:col-span-2 text-xs font-medium text-[hsl(var(--muted-foreground))] space-y-1">
        Nombre
        <input required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
      </label>
      <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] space-y-1">
        Unidad
        <select value={unit} onChange={(e) => setUnit(e.target.value as TaskUnit)} className={fieldClass}>
          {(Object.keys(UNIT_LABELS) as TaskUnit[]).map((value) => (
            <option key={value} value={value}>{UNIT_LABELS[value]}</option>
          ))}
        </select>
      </label>
      <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] space-y-1">
        Mínimo (COP)
        <input type="number" min={0} step={100} value={min} placeholder="Sin rango"
          onChange={(e) => setMin(e.target.value)} className={fieldClass} />
      </label>
      <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] space-y-1">
        Máximo (COP)
        <input type="number" min={0} step={100} value={max} placeholder="Sin rango"
          onChange={(e) => setMax(e.target.value)} className={fieldClass} />
      </label>
      <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] space-y-1">
        Fuente
        <input value={source} placeholder="Opcional" onChange={(e) => setSource(e.target.value)} className={fieldClass} />
      </label>
      <div className="lg:col-span-6 flex gap-2 justify-end">
        <button type="button" onClick={onCancel}
          className="px-3 py-2 rounded-lg text-sm font-semibold border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]">
          Cancelar
        </button>
        <button type="submit" disabled={isSaving || !slugify(name)}
          className="px-3 py-2 rounded-lg text-sm font-semibold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]
                     disabled:opacity-40">
          Crear tarea
        </button>
      </div>
    </form>
  );
};
