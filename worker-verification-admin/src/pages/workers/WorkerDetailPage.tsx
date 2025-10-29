// src/pages/workers/WorkerDetailPage.tsx
import { useParams, Link } from 'react-router-dom';
import { useWorker } from '@/hooks/useWorkers';
import { useWorkerDocuments } from '@/hooks/useDocuments';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Star,
  DollarSign,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { formatPrice, formatDate, getInitials } from '@/lib/utils/helpers';

export const WorkerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: worker, isLoading } = useWorker(id!);
  const { requirements, isLoadingRequirements } = useWorkerDocuments(id!);

  if (isLoading || isLoadingRequirements) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="text-center py-12">
        <p className="text-[hsl(var(--muted-foreground))]">Trabajador no encontrado</p>
        <Link
          to="/workers"
          className="text-[hsl(var(--primary))] hover:underline mt-4 inline-block"
        >
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 transition-colors">
      {/* Botón volver */}
      <Link
        to="/workers"
        className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a trabajadores</span>
      </Link>

      {/* Tarjeta principal */}
      <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))] rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] text-3xl font-bold shadow-sm">
            {getInitials(worker.name, worker.lastName)}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{worker.name} {worker.lastName}</h1>
                <p className="text-lg text-[hsl(var(--muted-foreground))] mt-1">{worker.work}</p>
              </div>

              <div className="flex gap-2">
                {worker.isOnline ? (
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] text-sm font-medium">
                    En línea
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-sm font-medium">
                    Desconectado
                  </span>
                )}
                {worker.isAvailable ? (
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--chart-2))]/20 text-[hsl(var(--chart-2))] text-sm font-medium">
                    Disponible
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--destructive))]/20 text-[hsl(var(--destructive))] text-sm font-medium">
                    No disponible
                  </span>
                )}
              </div>
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-[hsl(var(--muted-foreground))]">
              {worker.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span>{worker.email}</span>
                </div>
              )}
              {worker.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>{worker.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Star, label: 'Calificación', value: worker.rating.toFixed(1), extra: `${worker.totalRatings} reseñas` },
          { icon: DollarSign, label: 'Precio/hora', value: worker.pricePerHour > 0 ? formatPrice(worker.pricePerHour) : 'N/A' },
          { icon: Briefcase, label: 'Experiencia', value: worker.experience || 'N/A' },
          { icon: MapPin, label: 'Ubicación', value: worker.latitude ? `${worker.latitude.toFixed(4)}, ${worker.longitude?.toFixed(4)}` : 'No registrada' },
        ].map(({ icon: Icon, label, value, extra }) => (
          <div key={label} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] mb-2">
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            {extra && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{extra}</p>}
          </div>
        ))}
      </div>

      {/* Descripción */}
      {worker.description && (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Descripción</h2>
          <p className="text-[hsl(var(--muted-foreground))]">{worker.description}</p>
        </div>
      )}

      {/* Estado de documentos */}
      {requirements && (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Estado de Documentos</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[hsl(var(--foreground))]">Hoja de Vida</span>
              {requirements.hasHojaVida ? (
                <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />
              ) : (
                <XCircle className="w-5 h-5 text-[hsl(var(--destructive))]" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[hsl(var(--foreground))]">Antecedentes Judiciales</span>
              {requirements.hasAntecedentes ? (
                <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />
              ) : (
                <XCircle className="w-5 h-5 text-[hsl(var(--destructive))]" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[hsl(var(--foreground))]">Cartas de Recomendación</span>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                {requirements.cartasCount} / 3
                {requirements.hasMinimumCartas && (
                  <CheckCircle className="w-5 h-5 text-[hsl(var(--success))] inline ml-2" />
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-[hsl(var(--border))]">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Documentación Completa</span>
                {requirements.isComplete ? (
                  <span className="px-3 py-1 bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] rounded-full text-sm font-medium">
                    Completa
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))] rounded-full text-sm font-medium">
                    Incompleta
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            to={`/documents/review/${worker.id}`}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-all font-medium"
          >
            <Clock className="w-4 h-4" />
            <span>Revisar Documentos</span>
          </Link>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Información Adicional</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[hsl(var(--muted-foreground))]">ID:</span>
            <span className="ml-2 text-[hsl(var(--foreground))] font-mono">{worker.id}</span>
          </div>
          <div>
            <span className="text-[hsl(var(--muted-foreground))]">Registrado:</span>
            <span className="ml-2 text-[hsl(var(--foreground))]">{formatDate(worker.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
