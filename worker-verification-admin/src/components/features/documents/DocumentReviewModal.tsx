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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
      <div
        className="w-full max-w-lg p-6 relative rounded-2xl shadow-xl border transition-all duration-300"
        style={{
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          borderColor: "hsl(var(--border))",
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 hover:opacity-80 transition-opacity"
          style={{
            color: "hsl(var(--muted-foreground))",
          }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <FileText
            className="w-6 h-6"
            style={{ color: "hsl(var(--muted-foreground))" }}
          />
          <h2
            className="text-xl font-semibold"
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

        {/* Ver documento */}
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm mb-6 transition-colors hover:opacity-90"
          style={{
            backgroundColor: "hsl(var(--muted))",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          <ExternalLink className="w-4 h-4" />
          Ver Documento
        </a>

        {/* Acciones */}
        {doc.status === "pending" && (
          <div
            className="pt-4 space-y-3 border-t"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <textarea
              placeholder="Escribe la razón del rechazo..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm resize-none transition-all focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
              style={{
                backgroundColor: "hsl(var(--muted))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
              }}
              rows={3}
            />

            <div className="flex gap-3">
              <button
                onClick={() => onApprove(doc)}
                disabled={isApproving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "hsl(var(--chart-1))",
                  color: "hsl(var(--background))",
                }}
              >
                <CheckCircle className="w-4 h-4" />
                Aprobar
              </button>

              <button
                onClick={handleRejectClick}
                disabled={isRejecting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "hsl(var(--destructive))",
                  color: "hsl(var(--background))",
                }}
              >
                <XCircle className="w-4 h-4" />
                Rechazar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
