import { useEffect, useState } from 'react';
import { X, Clock, User, FileText, AlertTriangle } from 'lucide-react';
import { Pqr, PqrAnswerInput } from '@/types/pqr.types';
import { cn, formatDate } from '@/lib/utils/helpers';
import { PQR_ROLE_LABELS, PQR_STATUS_LABELS, PQR_STATUS_STYLES, PQR_TYPE_LABELS } from './pqrLabels';

interface PqrDetailModalProps {
  pqr: Pqr | null;
  onClose: () => void;
  onAnswer: (id: number, input: PqrAnswerInput) => Promise<unknown>;
  isAnswering: boolean;
}

const toMs = (iso: string | null) => (iso ? new Date(iso).getTime() : 0);

/** Detalle de una PQR (A8): pasarla a trámite o cerrarla con la respuesta al usuario. */
export const PqrDetailModal = ({ pqr, onClose, onAnswer, isAnswering }: PqrDetailModalProps) => {
  const [response, setResponse] = useState('');

  useEffect(() => {
    setResponse(pqr?.response || '');
  }, [pqr]);

  if (!pqr) return null;

  const closed = pqr.status === 'cerrada';

  const submit = async (input: PqrAnswerInput) => {
    try {
      await onAnswer(pqr.id, input);
      onClose();
    } catch {
      // El hook ya mostró el error
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity" onClick={onClose} />

        <div className="relative bg-card rounded-2xl text-left shadow-xl w-full sm:max-w-2xl border border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground">
                PQR #{pqr.id} · {PQR_TYPE_LABELS[pqr.type]}
              </h3>
              <span className={cn('chip', PQR_STATUS_STYLES[pqr.status])}>
                {PQR_STATUS_LABELS[pqr.status]}
              </span>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-4 space-y-5">
            {pqr.is_overdue && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--danger-soft))] text-[hsl(var(--danger-foreground))] text-sm font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Venció el plazo de 15 días hábiles sin cerrarse
              </div>
            )}

            {/* Datos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Info icon={User} label="Autor" value={`${PQR_ROLE_LABELS[pqr.author_role]} · ${pqr.author_uid}`} mono />
              <Info icon={FileText} label="Solicitud" value={pqr.service_request_id} mono />
              <Info icon={Clock} label="Registrada" value={formatDate(toMs(pqr.created_at))} />
              <Info icon={Clock} label="Responder antes de" value={formatDate(toMs(pqr.due_at), 'dd/MM/yyyy')} />
              {pqr.closed_at && <Info icon={Clock} label="Cerrada" value={formatDate(toMs(pqr.closed_at))} />}
              {pqr.responded_by && <Info icon={User} label="Respondió" value={pqr.responded_by} />}
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Descripción</p>
              <p className="text-foreground whitespace-pre-wrap bg-muted/40 rounded-lg p-3">{pqr.description}</p>
            </div>

            <div>
              <label htmlFor="pqr-response" className="text-sm font-medium text-muted-foreground">
                Respuesta al usuario {!closed && '(obligatoria para cerrar)'}
              </label>
              <textarea
                id="pqr-response"
                rows={5}
                value={response}
                disabled={closed}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Escribe la respuesta que verá el usuario en la app"
                className="field mt-1 py-2 disabled:opacity-70"
              />
            </div>
          </div>

          {/* Acciones */}
          {!closed && (
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 py-4 border-t border-border">
              {pqr.status === 'abierta' && (
                <button
                  disabled={isAnswering}
                  onClick={() => submit({ status: 'en_tramite' })}
                  className="btn-secondary"
                >
                  Marcar en trámite
                </button>
              )}
              <button
                disabled={isAnswering || !response.trim()}
                onClick={() => submit({ status: 'cerrada', response: response.trim() })}
                className="btn-primary"
              >
                {isAnswering ? 'Enviando…' : 'Responder y cerrar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface InfoProps {
  icon: typeof User;
  label: string;
  value: string;
  mono?: boolean;
}

const Info = ({ icon: Icon, label, value, mono }: InfoProps) => (
  <div className="flex items-start gap-2 min-w-0">
    <Icon className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
    <div className="min-w-0">
      <p className="text-muted-foreground">{label}</p>
      <p className={cn('text-foreground break-all', mono && 'font-mono text-xs')}>{value}</p>
    </div>
  </div>
);
