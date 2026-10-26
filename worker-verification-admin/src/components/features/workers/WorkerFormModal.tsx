import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Worker, WorkerCreateInput, WorkerUpdateInput } from '@/types/worker.types';
import { useCatalogAdmin } from '@/hooks/useCatalogAdmin';
import { WORKER_CATEGORIES, workerCategorySlugs } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/helpers';

interface WorkerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkerCreateInput | WorkerUpdateInput) => void;
  worker?: Worker | null;
  isSubmitting: boolean;
}

// Mismo valor por defecto que el backend (SystemConfig worker_max_categories, D16)
const DEFAULT_MAX_CATEGORIES = 3;

const EMPTY_FORM = {
  name: '',
  lastName: '',
  email: '',
  phone: '',
  description: '',
  experience: '',
  password: '',
};

/**
 * Crear o editar un trabajador. Como en el registro de la app, los oficios salen
 * del catálogo (hasta `worker_max_categories`); no hay precio por hora (los
 * precios salen del catálogo y la cotización) ni ubicación (la escribe la app).
 */
export const WorkerFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  worker,
  isSubmitting,
}: WorkerFormModalProps) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesError, setCategoriesError] = useState('');

  // Oficios activos y el máximo vienen del catálogo; mientras carga se usa la lista fija
  const { categories: catalog, configs } = useCatalogAdmin();
  const maxConfig = Number(configs.find((config) => config.key === 'worker_max_categories')?.value);
  const maxCategories = maxConfig > 0 ? maxConfig : DEFAULT_MAX_CATEGORIES;
  const options = catalog.length
    ? catalog
        // Un oficio desactivado solo aparece si el trabajador ya lo tiene, para poder quitarlo
        .filter((category) => category.is_active || categories.includes(category.slug))
        .map(({ slug, name, is_active }) => ({ slug, name, isActive: is_active }))
    : WORKER_CATEGORIES.map(({ slug, name }) => ({ slug, name, isActive: true }));

  useEffect(() => {
    if (!isOpen) return;
    setFormData(worker ? {
      name: worker.name,
      lastName: worker.lastName,
      email: worker.email,
      phone: worker.phone || '',
      description: worker.description || '',
      experience: worker.experience || '',
      password: '',
    } : EMPTY_FORM);
    // Un trabajador sin `categories` muestra el oficio que se deduce de su `work` viejo
    setCategories(worker ? workerCategorySlugs(worker) : []);
    setCategoriesError('');
  }, [worker, isOpen]);

  const toggleCategory = (slug: string) => {
    setCategoriesError('');
    if (categories.includes(slug)) {
      setCategories(categories.filter((current) => current !== slug));
    } else if (categories.length < maxCategories) {
      setCategories([...categories, slug]);
    } else {
      setCategoriesError(`Máximo ${maxCategories} oficios por trabajador`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categories.length === 0) {
      setCategoriesError('Elige al menos un oficio');
      return;
    }
    const { email, password, ...profile } = formData;
    // Al editar no se cambia el correo (es el de la cuenta de Firebase Auth) ni la contraseña
    onSubmit(worker ? { ...profile, categories } : { ...profile, email, password, categories });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-0 sm:px-4 sm:pt-4 sm:pb-20 text-center sm:block">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-[hsl(var(--foreground))]/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal - full screen on mobile */}
        <div className="relative w-full h-full sm:h-auto sm:inline-block align-bottom bg-[hsl(var(--card))] sm:rounded-2xl text-left overflow-hidden shadow-xl border-0 sm:border border-[hsl(var(--border))] transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <h3 className="text-base sm:text-lg font-semibold text-[hsl(var(--foreground))]">
              {worker ? 'Editar Trabajador' : 'Crear Trabajador'}
            </h3>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors p-1"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 max-h-[calc(100vh-120px)] sm:max-h-none overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { name: 'name', label: 'Nombre *', type: 'text', required: true },
                { name: 'lastName', label: 'Apellido *', type: 'text', required: true },
                { name: 'email', label: 'Email *', type: 'email', required: true, disabled: !!worker },
                { name: 'phone', label: 'Teléfono *', type: 'tel', required: true },
                { name: 'password', label: 'Contraseña', type: 'password', required: false, hideOnEdit: true },
                { name: 'experience', label: 'Experiencia', type: 'text' },
              ].map(({ name, label, type, required, disabled, hideOnEdit }) => {
                // Ocultar contraseña al editar
                if (hideOnEdit && worker) return null;

                return (
                  <div key={name}>
                    <label htmlFor={`worker-${name}`} className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">
                      {label}
                    </label>
                    <input
                      id={`worker-${name}`}
                      type={type}
                      name={name}
                      required={required}
                      disabled={disabled}
                      value={formData[name as keyof typeof formData]}
                      onChange={handleChange}
                      className="field"
                    />
                    {name === 'password' && !worker && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                        Opcional. Si se deja vacío, se generará una contraseña segura automáticamente
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Oficios */}
            <fieldset className="mt-4">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <legend className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Oficios *</legend>
                <span className="text-xs text-[hsl(var(--muted-foreground))]" aria-live="polite">
                  {categories.length} de {maxCategories}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {options.map(({ slug, name, isActive }) => {
                  const selected = categories.includes(slug);
                  return (
                    <button
                      key={slug}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleCategory(slug)}
                      className={cn(
                        'inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-full text-sm font-semibold border-[1.5px] transition-colors',
                        selected
                          ? 'bg-[hsl(var(--navy))] text-[hsl(var(--on-navy))] border-transparent dark:bg-[hsl(var(--primary))] dark:text-[hsl(var(--primary-foreground))]'
                          : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                      )}
                    >
                      {selected && <Check className="w-4 h-4" aria-hidden="true" />}
                      {name}
                      {!isActive && <span className="font-normal">(inactivo)</span>}
                    </button>
                  );
                })}
              </div>
              <p className={cn(
                'text-xs mt-2',
                categoriesError ? 'text-[hsl(var(--danger-foreground))] font-semibold' : 'text-[hsl(var(--muted-foreground))]'
              )} role={categoriesError ? 'alert' : undefined}>
                {categoriesError || `El primero que elijas es el oficio principal. Los precios salen del catálogo.`}
              </p>
            </fieldset>

            {/* Descripción */}
            <div className="mt-4">
              <label htmlFor="worker-description" className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">
                Descripción
              </label>
              <textarea
                id="worker-description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="field py-2"
                placeholder="Descripción del trabajador..."
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-6 pt-4 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1"
              >
                {isSubmitting ? 'Guardando...' : worker ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
