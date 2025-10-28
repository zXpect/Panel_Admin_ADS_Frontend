import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Worker } from '@/types/worker.types';
import { WORKER_CATEGORIES } from '@/lib/utils/constants';

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
    id: '',
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
  });

  useEffect(() => {
    if (worker) {
      setFormData({
        id: worker.id,
        name: worker.name,
        lastName: worker.lastName,
        email: worker.email,
        work: worker.work,
        phone: worker.phone || '',
        description: worker.description || '',
        pricePerHour: worker.pricePerHour,
        experience: worker.experience || '',
        latitude: worker.latitude,
        longitude: worker.longitude,
      });
    } else {
      setFormData({
        id: `worker_${Date.now()}`,
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
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-[hsl(var(--foreground))]/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-[hsl(var(--background))] rounded-2xl text-left overflow-hidden shadow-xl border border-[hsl(var(--border))] transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              {worker ? 'Editar Trabajador' : 'Crear Trabajador'}
            </h3>
            <button
              onClick={onClose}
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'name', label: 'Nombre *', type: 'text', required: true },
                { name: 'lastName', label: 'Apellido *', type: 'text', required: true },
                { name: 'email', label: 'Email *', type: 'email', required: true },
                { name: 'phone', label: 'Teléfono', type: 'tel' },
                { name: 'pricePerHour', label: 'Precio/hora (COP)', type: 'number' },
                { name: 'experience', label: 'Experiencia', type: 'text' },
                { name: 'latitude', label: 'Latitud', type: 'number' },
                { name: 'longitude', label: 'Longitud', type: 'number' },
              ].map(({ name, label, type, required }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    required={required}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-colors"
                  />
                </div>
              ))}

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
                  className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-colors"
                >
                  <option value="">Seleccionar categoría</option>
                  {WORKER_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
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
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent resize-none transition-colors"
                placeholder="Descripción del trabajador..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
