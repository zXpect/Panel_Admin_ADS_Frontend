import { FileX, Info } from 'lucide-react';

export const NoDocumentsAlert = () => {
  return (
    <div className="bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-2xl p-12 text-center transition-colors">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-[hsl(var(--muted))] border-2 border-[hsl(var(--border))] flex items-center justify-center mb-4">
          <FileX className="w-10 h-10 text-[hsl(var(--muted-foreground))]" />
        </div>
        
        <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">
          Sin documentos
        </h3>
        
        <p className="text-[hsl(var(--muted-foreground))] max-w-md">
          El trabajador aún no ha subido ningún documento para revisión.
        </p>

        <div className="mt-6 flex items-start gap-2 p-4 bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 rounded-lg max-w-md">
          <Info className="w-5 h-5 text-[hsl(var(--primary))] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[hsl(var(--muted-foreground))] text-left">
            Una vez que el trabajador suba los documentos requeridos (Hoja de Vida, Antecedentes Judiciales y Certificaciones), aparecerán aquí para ser revisados.
          </p>
        </div>
      </div>
    </div>
  );
};