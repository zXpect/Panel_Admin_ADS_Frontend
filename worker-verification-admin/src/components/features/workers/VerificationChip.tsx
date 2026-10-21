const LABELS: Record<string, { text: string; className: string }> = {
  approved: { text: 'Verificado', className: 'chip-success' },
  verified: { text: 'Verificado', className: 'chip-success' },
  documents_submitted: { text: 'En revisión', className: 'chip-warning' },
  pending: { text: 'En revisión', className: 'chip-warning' },
  rejected: { text: 'Rechazado', className: 'chip-danger' },
};

/** Estado de verificación del trabajador, siempre con texto (no solo color). */
export const VerificationChip = ({ status }: { status?: string | null }) => {
  const label = status ? LABELS[status] : undefined;
  return (
    <span className={`chip ${label?.className || 'chip-neutral'}`}>
      {label?.text || 'Sin documentos'}
    </span>
  );
};
