    import { useState } from 'react';
    import { useMutation } from '@tanstack/react-query';
    import { workerBulkService, BulkUploadResult } from '@/api/services/workerBulkService';
    import toast from 'react-hot-toast';

    export const useBulkUpload = () => {
    const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);

    // Mutación: subir archivo
    const uploadMutation = useMutation({
        mutationFn: (file: File) => workerBulkService.uploadWorkers(file),
        onSuccess: (response) => {
        if (response.success && response.data) {
            setUploadResult(response.data);
            const { successful, failed } = response.data;

            if (failed === 0) {
            toast.success(`✅ ${successful} trabajadores creados exitosamente`);
            } else if (successful === 0) {
            toast.error(`❌ No se pudo crear ningún trabajador. ${failed} errores`);
            } else {
            toast(`⚠️ Proceso completado con ${successful} éxitos y ${failed} errores`);
            }
        } else {
            toast.error(response.error ?? 'Error al procesar el archivo');
        }
        },
        onError: (error: any) => {
        console.error('Error uploading workers:', error);
        toast.error(
            error?.response?.data?.error ??
            error?.message ??
            'Error al subir el archivo'
        );
        },
    });

    // Mutación: descargar plantilla
    const downloadTemplateMutation = useMutation({
        mutationFn: () => workerBulkService.downloadTemplate(),
        onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'template_trabajadores.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success('✅ Plantilla descargada exitosamente');
        },
        onError: (error: any) => {
        console.error('Error downloading template:', error);
        toast.error('Error al descargar la plantilla');
        },
    });

    // Validar archivo antes de subir
    const validateAndUpload = (file: File) => {
        const validation = workerBulkService.validateFile(file);

        if (!validation.valid) {
        // ✅ Corregido: aseguramos pasar un string
        toast.error(validation.error ?? 'Archivo no válido');
        return;
        }

        uploadMutation.mutate(file);
    };

    // Descargar credenciales CSV
    const downloadCredentials = () => {
        if (!uploadResult?.success_details?.length) {
        toast.error('No hay credenciales para descargar');
        return;
        }

        try {
        const csvContent = workerBulkService.formatCredentialsForDownload(
            uploadResult.success_details
        );

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `credenciales_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success('✅ Credenciales descargadas exitosamente');
        } catch (error) {
        console.error('Error downloading credentials:', error);
        toast.error('Error al descargar las credenciales');
        }
    };

    // Limpiar resultados
    const clearResults = () => {
        setUploadResult(null);
    };

    return {
        // Estados
        uploadResult,
        isUploading: uploadMutation.isPending,
        isDownloadingTemplate: downloadTemplateMutation.isPending,
        uploadError: uploadMutation.error,

        // Funciones
        uploadWorkers: validateAndUpload,
        downloadTemplate: downloadTemplateMutation.mutate,
        downloadCredentials,
        clearResults,
    };
    };
