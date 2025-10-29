import { FileX, Info, Upload } from 'lucide-react';

export const NoDocumentsAlert = () => {
  return (
    <div className="bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--muted))]/50 border-2 border-[hsl(var(--border))] rounded-2xl p-16 text-center transition-all duration-300 hover:shadow-lg animate-in fade-in zoom-in-95">
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))]/20 to-[hsl(var(--primary))]/5 border-2 border-[hsl(var(--border))] flex items-center justify-center shadow-lg">
            <FileX className="w-14 h-14 text-[hsl(var(--muted-foreground))]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-xl bg-[hsl(var(--primary))]/10 border-2 border-[hsl(var(--primary))]/30 flex items-center justify-center">
            <Upload className="w-6 h-6 text-[hsl(var(--primary))]" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-3">
          Sin documentos por revisar
        </h3>

        <p className="text-[hsl(var(--muted-foreground))] max-w-md text-lg mb-8">
          El trabajador aún no ha subido ningún documento para revisión.
        </p>

        <div className="mt-2 flex items-start gap-3 p-6 bg-[hsl(var(--primary))]/10 border-2 border-[hsl(var(--primary))]/20 rounded-xl max-w-xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))]/20 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-[hsl(var(--primary))]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
              Documentos requeridos:
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
              Una vez que el trabajador suba los documentos requeridos (Hoja de Vida, Antecedentes Judiciales y Certificaciones), aparecerán aquí para ser revisados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};