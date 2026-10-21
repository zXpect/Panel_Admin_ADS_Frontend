import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Worker } from '@/types/worker.types';
import { WORKER_CATEGORIES, workToCategoryName } from '@/lib/utils/constants';

interface WorkerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  worker?: Worker | null;
  isSubmitting: boolean;
}

export const WorkerFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  worker,
  isSubmitting,
}: WorkerFormModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    work: '',
    phone: '',
    description: '',
    pricePerHour: 0,
    experience: '',
    latitude: 0,
    longitude: 0,
    password: '',
  });

  useEffect(() => {
    if (worker) {
      setFormData({
        name: worker.name,
        lastName: worker.lastName,
        email: worker.email,
        // Un `work` viejo ('Electricista') se muestra con su oficio oficial ('Electricidad')
        work: workToCategoryName(worker.work),
        phone: worker.phone || '',
        description: worker.description || '',
        pricePerHour: worker.pricePerHour,
        experience: worker.experience || '',
        latitude: worker.latitude,
        longitude: worker.longitude,
        password: '',
      });
    } else {
      setFormData({
        name: '',
        lastName: '',
        email: '',
        work: '',
        phone: '',
        description: '',
        pricePerHour: 0,
        experience: '',
        latitude: 0,
        longitude: 0,
        password: '',
      });
    }
  }, [worker, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
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
                { name: 'pricePerHour', label: 'Precio/hora (COP)', type: 'number' },
                { name: 'experience', label: 'Experiencia', type: 'text' },
                { name: 'latitude', label: 'Latitud', type: 'number', step: 'any' },
                { name: 'longitude', label: 'Longitud', type: 'number', step: 'any' },
              ].map(({ name, label, type, required, disabled, hideOnEdit, step }) => {
                // Ocultar contraseña al editar
                if (hideOnEdit && worker) return null;

                return (
                  <div key={name} className={name === 'password' ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      name={name}
                      required={required}
                      disabled={disabled}
                      step={step}
                      value={(formData as any)[name]}
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

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">
                  Categoría *
                </label>
                <select
                  name="work"
                  required
                  value={formData.work}
                  onChange={handleChange}
                  className="field"
                >
                  <option value="">Seleccionar categoría</option>
                  {WORKER_CATEGORIES.map((category) => (
                    <option key={category.slug} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="field"
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
