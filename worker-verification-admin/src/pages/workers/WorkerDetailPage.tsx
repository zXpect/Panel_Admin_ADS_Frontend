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
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils/helpers';
import { workerCategoryNames } from '@/lib/utils/constants';
import { AccountStatusControl, SuspendedBadge } from '@/components/features/accounts/AccountStatusControl';
import { LoadingNut } from '@/components/common/LoadingNut';

export const WorkerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: worker, isLoading } = useWorker(id!);
  const { requirements, isLoadingRequirements } = useWorkerDocuments(id!);

  if (isLoading || isLoadingRequirements) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingNut />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="text-center py-12">
        <p className="text-[hsl(var(--muted-foreground))]">Trabajador no encontrado</p>
        <Link
          to="/workers"
          className="text-[hsl(var(--brand-text))] hover:underline mt-4 inline-block"
        >
          Volver a la lista
        </Link>
      </div>
    );
  }

  const verificationText = (() => {
    const status = worker.verificationStatus?.status;
    if (status === 'approved' || status === 'verified') return 'Verificado';
    if (status === 'rejected') return 'Rechazado';
    if (status === 'documents_submitted' || status === 'pending') return 'En revisión';
    return 'Sin documentos';
  })();

  return (
    <div className="space-y-6">
      <Link to="/workers" className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold
                                     text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
        <ArrowLeft className="w-4 h-4" />
        Volver a trabajadores
      </Link>

      {/* Perfil */}
      <section className="panel p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-24 h-24 rounded-2xl bg-[hsl(var(--navy))] text-[hsl(var(--brand-on-navy))] flex items-center justify-center text-3xl font-extrabold flex-shrink-0">
            {getInitials(worker.name, worker.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-[28px] leading-9 font-extrabold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))]">
                  {worker.name} {worker.lastName}
                </h1>
                <p className="text-base text-[hsl(var(--muted-foreground))]">
                  {workerCategoryNames(worker) || 'Sin oficio registrado'}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {worker.isActive === false && <SuspendedBadge />}
                <span className={`chip ${worker.isOnline ? 'chip-brand' : 'chip-neutral'}`}>
                  {worker.isOnline ? 'En línea' : 'Desconectado'}
                </span>
                <span className={`chip ${worker.isAvailable ? 'chip-success' : 'chip-danger'}`}>
                  {worker.isAvailable ? 'Disponible' : 'No disponible'}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <AccountStatusControl uid={worker.id} name={`${worker.name} ${worker.lastName}`}
                role="worker" isActive={worker.isActive} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
          {worker.email && (
            <div className="flex items-center gap-3 min-h-[44px] px-4 rounded-xl bg-[hsl(var(--muted))]">
              <Mail className="w-5 h-5 text-[hsl(var(--brand-text))]" />
              <span className="truncate">{worker.email}</span>
            </div>
          )}
          {worker.phone && (
            <div className="flex items-center gap-3 min-h-[44px] px-4 rounded-xl bg-[hsl(var(--muted))]">
              <Phone className="w-5 h-5 text-[hsl(var(--brand-text))]" />
              <span>{worker.phone}</span>
            </div>
          )}
        </div>
      </section>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Star, label: 'Calificación', value: (worker.rating || 0).toFixed(1), extra: `${worker.totalRatings || 0} reseñas` },
          { icon: ShieldCheck, label: 'Verificación', value: verificationText },
          { icon: Briefcase, label: 'Experiencia', value: worker.experience || 'N/A' },
          { icon: MapPin, label: 'Ubicación', value: worker.latitude ? 'Registrada' : 'No registrada' },
        ].map(({ icon: Icon, label, value, extra }) => (
          <div key={label} className="panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[hsl(var(--chip))] text-[hsl(var(--chip-foreground))] flex items-center justify-center">
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{label}</span>
            </div>
            <p className="text-2xl font-extrabold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))]">{value}</p>
            {extra && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{extra}</p>}
          </div>
        ))}
      </div>

      {worker.description && (
        <section className="panel p-6">
          <h2 className="text-lg font-semibold mb-2">Descripción</h2>
          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{worker.description}</p>
        </section>
      )}

      {/* Documentos */}
      {requirements && (
        <section className="panel p-6">
          <h2 className="text-lg font-semibold mb-4">Estado de documentos</h2>
          <div className="space-y-2">
            <RequirementRow label="Hoja de vida" ok={requirements.hasHojaVida} />
            <RequirementRow label="Antecedentes judiciales" ok={requirements.hasAntecedentes} />
            <RequirementRow label="Título o certificación" ok={requirements.hasTitulo} />
            <div className="flex items-center justify-between min-h-[52px] px-4 rounded-xl bg-[hsl(var(--muted))]">
              <span className="font-semibold">Cartas de recomendación</span>
              <span className={`chip ${requirements.hasMinimumCartas ? 'chip-success' : 'chip-neutral'}`}>
                {requirements.cartasCount} / 3
              </span>
            </div>
            <div className="flex items-center justify-between min-h-[52px] px-4 rounded-xl bg-[hsl(var(--chip))]">
              <span className="font-bold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))]">
                Documentación completa
              </span>
              {requirements.isComplete ? (
                <span className="chip chip-success"><CheckCircle className="w-3.5 h-3.5" />Completa</span>
              ) : (
                <span className="chip text-[hsl(var(--chip-foreground))]"><AlertTriangle className="w-3.5 h-3.5" />Incompleta</span>
              )}
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] px-1">
              Se exige hoja de vida, antecedentes y un título o tres cartas de recomendación.
            </p>
          </div>
          <Link to={`/documents/review/${worker.id}`} className="btn-primary w-full mt-5 min-h-[52px]">
            <Clock className="w-5 h-5" />
            Revisar documentos
          </Link>
        </section>
      )}

      {/* Información adicional */}
      <section className="panel p-6">
        <h2 className="text-lg font-semibold mb-4">Información adicional</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-[hsl(var(--muted))]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">ID</span>
            <p className="font-mono text-sm mt-1 break-all">{worker.id}</p>
          </div>
          <div className="p-4 rounded-xl bg-[hsl(var(--muted))]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Registrado</span>
            <p className="mt-1">{worker.timestamp ? formatDate(worker.timestamp) : '—'}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const RequirementRow = ({ label, ok }: { label: string; ok: boolean }) => (
  <div className="flex items-center justify-between min-h-[52px] px-4 rounded-xl bg-[hsl(var(--muted))]">
    <span className="font-semibold">{label}</span>
    {ok ? (
      <span className="chip chip-success"><CheckCircle className="w-3.5 h-3.5" />Subido</span>
    ) : (
      <span className="chip chip-danger"><XCircle className="w-3.5 h-3.5" />Falta</span>
    )}
  </div>
);
