import React, { useState, useRef } from 'react';
import { Upload, Download, X, CheckCircle, XCircle, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';
import axiosInstance from '@/api/axiosConfig';

interface BulkUploadResult {
  total_processed: number;
  successful: number;
  failed: number;
  success_details: Array<{
    row: number;
    email: string;
    name: string;
    user_id: string;
    password?: string;
    auth_existed: boolean;
  }>;
  error_details: Array<{
    row: number;
    email: string;
    name: string;
    error: string;
  }>;
  execution_time: number;
}

const BulkWorkersUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar extensión
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('El archivo debe ser un Excel (.xlsx o .xls)');
        return;
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo es demasiado grande (máximo 10MB)');
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axiosInstance.post('/api/workers/bulk-upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 360000,
      });

      if (response.data.success) {
        setUploadResult(response.data.data);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(response.data.error || 'Error al procesar el archivo');
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || 'Error al subir el archivo';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get('/api/workers/bulk-upload-template/', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_trabajadores.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading template:', err);
      setError('Error al descargar la plantilla');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadCredentials = () => {
    if (!uploadResult?.success_details.length) return;

    const csvContent = [
      ['Fila', 'Nombre', 'Email', 'Contraseña', 'Usuario ID', 'Estado'],
      ...uploadResult.success_details.map(detail => [
        detail.row,
        detail.name,
        detail.email,
        detail.password || 'N/A',
        detail.user_id,
        detail.auth_existed ? 'Usuario existente' : 'Nuevo usuario'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `credenciales_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            Carga Masiva de Trabajadores
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Sube un archivo Excel con los datos de múltiples trabajadores
          </p>
        </div>
        <button
          onClick={handleDownloadTemplate}
          disabled={isDownloadingTemplate}
className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-colors"
        >
          {isDownloadingTemplate ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span>Descargar Plantilla</span>
        </button>
      </div>

      {/* Instrucciones */}
      <div className="bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 rounded-2xl p-6 transition-colors">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[hsl(var(--primary))] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[hsl(var(--foreground))]">
            <p className="font-semibold mb-2">Instrucciones:</p>
            <ul className="list-disc list-inside space-y-1 text-[hsl(var(--muted-foreground))]">
              <li>Descarga la plantilla de Excel haciendo clic en "Descargar Plantilla"</li>
              <li>Completa los datos de los trabajadores en el archivo</li>
              <li>Los campos obligatorios son: nombre, apellido, email, teléfono y categoría</li>
              <li>La contraseña es opcional - si no la proporcionas, se generará automáticamente</li>
              <li>El ID se generará automáticamente en Firebase Realtime Database</li>
              <li>Sube el archivo completado usando el área de carga o arrastrando el archivo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Área de carga */}
      <div className="bg-[hsl(var(--card))] rounded-2xl shadow border border-[hsl(var(--border))] p-6 transition-colors">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            selectedFile
              ? 'border-[hsl(var(--chart-3))] bg-[hsl(var(--chart-3))]/5'
              : 'border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          
          {selectedFile ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 text-[hsl(var(--chart-3))]">
                <FileSpreadsheet className="w-12 h-12" />
                <div className="text-left">
                  <p className="font-semibold text-lg text-[hsl(var(--foreground))]">{selectedFile.name}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--chart-3))] text-white rounded-lg 
                             hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Subir Archivo</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleCancelFile}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] 
                             rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          ) : (
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
              <p className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
                Arrastra tu archivo Excel aquí
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                o haz clic para seleccionarlo
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Formatos aceptados: .xlsx, .xls (máximo 10MB)
              </p>
            </label>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))]/20 rounded-2xl p-4 transition-colors">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-[hsl(var(--destructive))] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[hsl(var(--destructive))]">Error</p>
              <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      {uploadResult && (
        <div className="space-y-4">
          {/* Resumen */}
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow border border-[hsl(var(--border))] p-6 transition-colors">
            <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-4">Resumen del Proceso</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[hsl(var(--chart-1))]/10 rounded-xl p-4 border border-[hsl(var(--chart-1))]/20">
                <p className="text-sm text-[hsl(var(--chart-1))] font-medium">Total Procesados</p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{uploadResult.total_processed}</p>
              </div>
              
              <div className="bg-[hsl(var(--chart-3))]/10 rounded-xl p-4 border border-[hsl(var(--chart-3))]/20">
                <p className="text-sm text-[hsl(var(--chart-3))] font-medium">Exitosos</p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{uploadResult.successful}</p>
              </div>
              
              <div className="bg-[hsl(var(--destructive))]/10 rounded-xl p-4 border border-[hsl(var(--destructive))]/20">
                <p className="text-sm text-[hsl(var(--destructive))] font-medium">Fallidos</p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{uploadResult.failed}</p>
              </div>
              
              <div className="bg-[hsl(var(--muted))] rounded-xl p-4 border border-[hsl(var(--border))]">
                <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">Tiempo</p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))]">
                  {uploadResult.execution_time.toFixed(1)}s
                </p>
              </div>
            </div>

            {uploadResult.successful > 0 && (
              <button
                onClick={handleDownloadCredentials}
                className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--chart-1))] text-white rounded-lg 
                           hover:opacity-90 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Descargar Credenciales ({uploadResult.successful})</span>
              </button>
            )}
          </div>

          {/* Trabajadores creados exitosamente */}
          {uploadResult.success_details.length > 0 && (
            <div className="bg-[hsl(var(--card))] rounded-2xl shadow border border-[hsl(var(--border))] p-6 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--chart-3))]" />
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
                  Trabajadores Creados ({uploadResult.successful})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[hsl(var(--muted))]">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-[hsl(var(--foreground))]">Fila</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-[hsl(var(--foreground))]">Nombre</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-[hsl(var(--foreground))]">Email</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-[hsl(var(--foreground))]">Usuario ID</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-[hsl(var(--foreground))]">Contraseña</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-[hsl(var(--foreground))]">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {uploadResult.success_details.map((detail, index) => (
                      <tr key={index} className="hover:bg-[hsl(var(--muted))]">
                        <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))]">{detail.row}</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))]">{detail.name}</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">{detail.email}</td>
                        <td className="px-4 py-3 text-sm font-mono text-[hsl(var(--muted-foreground))] text-xs">{detail.user_id}</td>
                        <td className="px-4 py-3 text-sm font-mono text-[hsl(var(--chart-3))]">
                          {detail.password || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            detail.auth_existed
                              ? 'bg-[hsl(var(--chart-2))]/20 text-[hsl(var(--chart-2))]'
                              : 'bg-[hsl(var(--chart-3))]/20 text-[hsl(var(--chart-3))]'
                          }`}>
                            {detail.auth_existed ? 'Usuario existente' : 'Nuevo usuario'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Errores */}
          {uploadResult.error_details.length > 0 && (
            <div className="bg-[hsl(var(--card))] rounded-2xl shadow border border-[hsl(var(--border))] p-6 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-6 h-6 text-[hsl(var(--destructive))]" />
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
                  Errores ({uploadResult.failed})
                </h3>
              </div>
              
              <div className="space-y-3">
                {uploadResult.error_details.map((detail, index) => (
                  <div key={index} className="bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))]/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-[hsl(var(--destructive))]">
                          Fila {detail.row}: {detail.name}
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{detail.email}</p>
                        <p className="text-sm text-[hsl(var(--destructive))] mt-2">
                          <span className="font-medium">Error:</span> {detail.error}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkWorkersUpload;