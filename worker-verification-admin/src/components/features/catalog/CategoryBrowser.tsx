import { useEffect, useState } from 'react';
import { Info, Plus, Save } from 'lucide-react';
import { CatalogCategory, CatalogCategoryInput, CatalogTask, CatalogTaskInput, TaskUnit } from '@/types/catalog.types';
import { cn, formatPrice } from '@/lib/utils/helpers';
import { TradeIcon } from '@/components/common/AdsIcons';
import { UNIT_LABELS } from './catalogLabels';

const fieldClass = `w-full px-2 py-1.5 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--input))]
  text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent`;

const toNumber = (value: string): number | null => (value.trim() === '' ? null : Number(value));

const countActive = (category: CatalogCategory) => category.tasks.filter((task) => task.is_active).length;

interface CategoryBrowserProps {
  categories: CatalogCategory[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  readOnly: boolean;
  onUpdateCategory: (id: number, input: CatalogCategoryInput) => Promise<unknown>;
  onUpdateTask: (id: number, input: CatalogTaskInput) => Promise<unknown>;
  onCreateTask: (input: CatalogTaskInput) => Promise<unknown>;
  isSaving: boolean;
}

/** Lista de oficios a la izquierda y las tareas del oficio elegido a la derecha. */
export const CategoryBrowser = ({ categories, selectedSlug, onSelect, readOnly, ...detailProps }: CategoryBrowserProps) => {
  const selected = categories.find((category) => category.slug === selectedSlug) || categories[0];

  if (!selected) {
    return <p className="text-sm text-[hsl(var(--muted-foreground))]">No hay oficios en el catálogo.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        Los rangos son de ciudades grandes: el estimado de Ubaté aplica el factor regional y la tarifa mínima por
        visita. Una tarea sin rango la cotiza el técnico. Las tareas no se borran, se desactivan.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-[16rem_1fr] gap-4 items-start">
        {/* En pantallas de menos de 1280 px la lista se vuelve un selector */}
        <label className="xl:hidden block max-w-sm text-xs font-semibold text-[hsl(var(--foreground))] space-y-1">
          Oficio
          <select className="field" value={selected.slug} onChange={(e) => onSelect(e.target.value)}>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name} ({countActive(category)}/{category.tasks.length}){category.is_active ? '' : ' · inactivo'}
              </option>
            ))}
          </select>
        </label>

        <nav aria-label="Oficios" className="hidden xl:block panel p-2 space-y-1">
          {categories.map((category) => {
            const current = category.slug === selected.slug;
            return (
              <button
                key={category.slug}
                onClick={() => onSelect(category.slug)}
                aria-current={current ? 'true' : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors',
                  current
                    ? 'bg-[hsl(var(--chip))] text-[hsl(var(--chip-foreground))]'
                    : 'hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]',
                  !category.is_active && 'opacity-60'
                )}
              >
                <TradeIcon slug={category.slug} className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold truncate">{category.name}</span>
                  <span className="block text-xs text-[hsl(var(--muted-foreground))]">
                    {category.is_active
                      ? `${countActive(category)} de ${category.tasks.length} tareas activas`
                      : 'Oficio inactivo'}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* En modo evaluación se ven las tarifas, pero sus controles quedan deshabilitados */}
        <fieldset disabled={readOnly} className="contents">
          <CategoryDetail key={selected.slug} category={selected} {...detailProps} />
        </fieldset>
      </div>
    </div>
  );
};

interface CategoryDetailProps {
  category: CatalogCategory;
  onUpdateCategory: (id: number, input: CatalogCategoryInput) => Promise<unknown>;
  onUpdateTask: (id: number, input: CatalogTaskInput) => Promise<unknown>;
  onCreateTask: (input: CatalogTaskInput) => Promise<unknown>;
  isSaving: boolean;
}

/** Oficio con sus tareas: rango de referencia, activar o desactivar y crear tareas. */
const CategoryDetail = ({ category, onUpdateCategory, onUpdateTask, onCreateTask, isSaving }: CategoryDetailProps) => {
  const [creating, setCreating] = useState(false);

  return (
    <div className="panel overflow-hidden min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-[hsl(var(--chip))] text-[hsl(var(--chip-foreground))] flex items-center justify-center flex-shrink-0">
            <TradeIcon slug={category.slug} className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">{category.name}</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {countActive(category)} de {category.tasks.length} tareas activas
            </p>
          </div>
        </div>
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

        <div className="px-4 py-4 border-t border-[hsl(var(--border))]">
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
        {/* Solo se ve en la fila con cambios sin guardar */}
        <button
          disabled={!changed || isSaving}
          aria-hidden={!changed}
          tabIndex={changed ? undefined : -1}
          title={min && max ? `${formatPrice(Number(min))} – ${formatPrice(Number(max))}` : 'Sin rango'}
          onClick={() => onSave(task.id, { reference_min_cop: toNumber(min), reference_max_cop: toNumber(max) })
            .catch(() => undefined)}
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold',
            'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] disabled:opacity-40',
            !changed && 'invisible'
          )}
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
