import { useState } from "react";
import { X, CheckCircle, XCircle, ExternalLink, FileText } from "lucide-react";
import { formatDate, getStatusColor, getStatusText } from "@/lib/utils/helpers";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils/helpers";

interface DocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: any;
  title: string;
  onApprove: (doc: any) => void;
  onReject: (doc: any, reason: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export const DocumentReviewModal = ({
  isOpen,
  onClose,
  doc,
  title,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: DocumentReviewModalProps) => {
  const [rejectionReason, setRejectionReason] = useState("");

  if (!isOpen || !doc) return null;

  const handleRejectClick = () => {
    if (!rejectionReason.trim()) {
      toast.error("Debes ingresar una razón para el rechazo");
      return;
    }
    onReject(doc, rejectionReason);
    setRejectionReason("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 transition-all animate-in fade-in duration-300">
      <div
        className="w-full max-w-lg p-8 relative rounded-2xl shadow-2xl border-2 transition-all duration-300 animate-in zoom-in-95"
        style={{
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          borderColor: "hsl(var(--border))",
        }}
      >
        {/* Botón cerrar mejorado */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--muted))] transition-all duration-200 group"
          style={{
            color: "hsl(var(--muted-foreground))",
          }}
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Header mejorado */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary))]/10 flex items-center justify-center">
            <FileText
              className="w-6 h-6"
              style={{ color: "hsl(var(--primary))" }}
            />
          </div>
          <h2
            className="text-2xl font-bold"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {title}
          </h2>
        </div>

        {/* Estado */}
<span
  className={cn(
    "inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 shadow-sm transition-colors",
    getStatusColor(doc.status)
  )}
>
  {getStatusText(doc.status)}
</span>

        {/* Info del documento */}
        <div className="text-sm space-y-2 mb-5">
          <p style={{ color: "hsl(var(--muted-foreground))" }}>
            Subido:{" "}
            <span style={{ color: "hsl(var(--foreground))" }}>
              {formatDate(doc.uploadedAt)}
            </span>
          </p>
          {doc.reviewedAt && (
            <p style={{ color: "hsl(var(--muted-foreground))" }}>
              Revisado:{" "}
              <span style={{ color: "hsl(var(--foreground))" }}>
                {formatDate(doc.reviewedAt)}
              </span>
            </p>
          )}

          {doc.rejectionReason && (
            <div
              className="p-3 rounded-lg mt-3 border"
              style={{
                backgroundColor: "hsl(var(--destructive) / 0.1)",
                borderColor: "hsl(var(--destructive) / 0.4)",
              }}
            >
              <p
                className="font-semibold text-sm"
                style={{ color: "hsl(var(--destructive))" }}
              >
                Razón de rechazo:
              </p>
              <p
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "hsl(var(--destructive))" }}
              >
                {doc.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* Ver documento mejorado */}
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 px-5 py-3 rounded-xl shadow-md mb-6 transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/20 hover:bg-[hsl(var(--primary))]/20"
        >
          <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-semibold">Ver Documento</span>
        </a>

        {/* Acciones mejoradas */}
        {doc.status === "pending" && (
          <div
            className="pt-6 space-y-4 border-t-2"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <div>
              <label className="block text-sm font-semibold mb-2 text-[hsl(var(--foreground))]">
                Razón de rechazo (opcional)
              </label>
              <textarea
                placeholder="Escribe aquí la razón del rechazo si corresponde..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm resize-none transition-all duration-200 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent border-2 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] focus:bg-[hsl(var(--background))]"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onApprove(doc)}
                disabled={isApproving}
                className="group flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-[hsl(var(--chart-2))] text-white hover:bg-[hsl(var(--chart-2))]/90"
              >
                <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Aprobar
              </button>

              <button
                onClick={handleRejectClick}
                disabled={isRejecting}
                className="group flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-[hsl(var(--destructive))] text-white hover:bg-[hsl(var(--destructive))]/90"
              >
                <XCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Rechazar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
