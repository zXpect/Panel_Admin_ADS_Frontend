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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Botón volver mejorado */}
      <Link
        to="/workers"
        className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]
                   transition-all duration-200 hover:gap-3 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Volver a trabajadores</span>
      </Link>

      {/* Tarjeta principal mejorada */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))]/10 via-[hsl(var(--card))] to-[hsl(var(--primary))]/5
                      rounded-2xl shadow-lg border-2 border-[hsl(var(--border))] p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--primary))]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70
                          flex items-center justify-center text-[hsl(var(--primary-foreground))] text-3xl font-bold shadow-xl
                          transform hover:scale-110 transition-transform duration-300">
            {getInitials(worker.name, worker.lastName)}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold text-[hsl(var(--foreground))]">{worker.name} {worker.lastName}</h1>
                <p className="text-xl text-[hsl(var(--muted-foreground))] mt-2 font-medium">{worker.work}</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {worker.isOnline ? (
                  <span className="px-4 py-2 rounded-full bg-[hsl(var(--chart-3))]/20 text-[hsl(var(--chart-3))] text-sm font-semibold
                                   border border-[hsl(var(--chart-3))]/30 shadow-sm">
                    En línea
                  </span>
                ) : (
                  <span className="px-4 py-2 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-sm font-semibold
                                   border border-[hsl(var(--border))] shadow-sm">
                    Desconectado
                  </span>
                )}
                {worker.isAvailable ? (
                  <span className="px-4 py-2 rounded-full bg-[hsl(var(--chart-2))]/20 text-[hsl(var(--chart-2))] text-sm font-semibold
                                   border border-[hsl(var(--chart-2))]/30 shadow-sm">
                    Disponible
                  </span>
                ) : (
                  <span className="px-4 py-2 rounded-full bg-[hsl(var(--destructive))]/20 text-[hsl(var(--destructive))] text-sm font-semibold
                                   border border-[hsl(var(--destructive))]/30 shadow-sm">
                    No disponible
                  </span>
                )}
              </div>
            </div>

            {/* Contacto mejorado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-[hsl(var(--muted-foreground))]">
              {worker.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--background))]/50 hover:bg-[hsl(var(--background))]
                                transition-colors duration-300">
                  <Mail className="w-5 h-5 text-[hsl(var(--primary))]" />
                  <span className="font-medium">{worker.email}</span>
                </div>
              )}
              {worker.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--background))]/50 hover:bg-[hsl(var(--background))]
                                transition-colors duration-300">
                  <Phone className="w-5 h-5 text-[hsl(var(--primary))]" />
                  <span className="font-medium">{worker.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Métricas mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Star, label: 'Calificación', value: worker.rating.toFixed(1), extra: `${worker.totalRatings} reseñas`, color: 'chart-2' },
          { icon: DollarSign, label: 'Precio/hora', value: worker.pricePerHour > 0 ? formatPrice(worker.pricePerHour) : 'N/A', color: 'primary' },
          { icon: Briefcase, label: 'Experiencia', value: worker.experience || 'N/A', color: 'chart-1' },
          { icon: MapPin, label: 'Ubicación', value: worker.latitude ? `${worker.latitude.toFixed(4)}, ${worker.longitude?.toFixed(4)}` : 'No registrada', color: 'chart-4' },
        ].map(({ icon: Icon, label, value, extra, color }) => (
          <div key={label} className="group bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl p-6 shadow-md
                                       hover:shadow-xl hover:border-[hsl(var(--${color}))]/30 transition-all duration-300
                                       transform hover:scale-105 hover:-translate-y-1">
            <div className={`flex items-center gap-2 text-[hsl(var(--${color}))] mb-3`}>
              <div className={`w-10 h-10 rounded-lg bg-[hsl(var(--${color}))]/10 flex items-center justify-center
                              group-hover:bg-[hsl(var(--${color}))]/20 group-hover:scale-110 transition-all duration-300`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-3xl font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--${color}))] transition-colors">{value}</p>
            {extra && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 font-medium">{extra}</p>}
          </div>
        ))}
      </div>

      {/* Descripción mejorada */}
      {worker.description && (
        <div className="bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl p-6 shadow-md
                        hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-bold mb-4 text-[hsl(var(--foreground))]">Descripción</h2>
          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{worker.description}</p>
        </div>
      )}

      {/* Estado de documentos mejorado */}
      {requirements && (
        <div className="bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl p-6 shadow-md
                        hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-bold mb-6 text-[hsl(var(--foreground))]">Estado de Documentos</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--background))]/50
                            hover:bg-[hsl(var(--background))] transition-colors duration-300">
              <span className="font-semibold text-[hsl(var(--foreground))]">Hoja de Vida</span>
              {requirements.hasHojaVida ? (
                <CheckCircle className="w-6 h-6 text-[hsl(var(--chart-2))]" />
              ) : (
                <XCircle className="w-6 h-6 text-[hsl(var(--destructive))]" />
              )}
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--background))]/50
                            hover:bg-[hsl(var(--background))] transition-colors duration-300">
              <span className="font-semibold text-[hsl(var(--foreground))]">Antecedentes Judiciales</span>
              {requirements.hasAntecedentes ? (
                <CheckCircle className="w-6 h-6 text-[hsl(var(--chart-2))]" />
              ) : (
                <XCircle className="w-6 h-6 text-[hsl(var(--destructive))]" />
              )}
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--background))]/50
                            hover:bg-[hsl(var(--background))] transition-colors duration-300">
              <span className="font-semibold text-[hsl(var(--foreground))]">Cartas de Recomendación</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                  {requirements.cartasCount} / 3
                </span>
                {requirements.hasMinimumCartas && (
                  <CheckCircle className="w-6 h-6 text-[hsl(var(--chart-2))]" />
                )}
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[hsl(var(--border))]">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--primary))]/5">
                <span className="font-bold text-[hsl(var(--foreground))]">Documentación Completa</span>
                {requirements.isComplete ? (
                  <span className="px-4 py-2 bg-[hsl(var(--chart-2))]/20 text-[hsl(var(--chart-2))] rounded-full text-sm font-bold
                                   border border-[hsl(var(--chart-2))]/30 shadow-sm">
                    Completa
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-[hsl(var(--chart-5))]/20 text-[hsl(var(--chart-5))] rounded-full text-sm font-bold
                                   border border-[hsl(var(--chart-5))]/30 shadow-sm">
                    Incompleta
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            to={`/documents/review/${worker.id}`}
            className="mt-6 w-full group flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--primary))]
                       text-[hsl(var(--primary-foreground))] rounded-xl hover:shadow-lg transition-all duration-300
                       font-semibold hover:scale-105"
          >
            <Clock className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Revisar Documentos</span>
          </Link>
        </div>
      )}

      {/* Información adicional mejorada */}
      <div className="bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl p-6 shadow-md
                      hover:shadow-xl transition-all duration-300">
        <h2 className="text-xl font-bold mb-4 text-[hsl(var(--foreground))]">Información Adicional</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[hsl(var(--background))]/50 hover:bg-[hsl(var(--background))] transition-colors duration-300">
            <span className="text-sm text-[hsl(var(--muted-foreground))] font-medium uppercase tracking-wide">ID</span>
            <p className="text-lg text-[hsl(var(--foreground))] font-mono font-semibold mt-1">{worker.id}</p>
          </div>
          <div className="p-4 rounded-xl bg-[hsl(var(--background))]/50 hover:bg-[hsl(var(--background))] transition-colors duration-300">
            <span className="text-sm text-[hsl(var(--muted-foreground))] font-medium uppercase tracking-wide">Registrado</span>
            <p className="text-lg text-[hsl(var(--foreground))] font-semibold mt-1">{formatDate(worker.timestamp)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
