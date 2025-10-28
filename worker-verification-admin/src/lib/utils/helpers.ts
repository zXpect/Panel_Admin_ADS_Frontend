// src/utils/helpers.ts
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatear fecha
 */
export const formatDate = (timestamp: number, formatStr: string = 'dd/MM/yyyy HH:mm'): string => {
  return format(new Date(timestamp), formatStr, { locale: es });
};

/**
 * Formatear fecha relativa (hace X tiempo)
 */
export const formatRelativeDate = (timestamp: number): string => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: es });
};

/**
 * Formatear precio
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Formatear rating
 */
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Obtener iniciales de nombre
 */
export const getInitials = (name?: string, lastName?: string): string => {
  const firstInitial = name?.charAt(0)?.toUpperCase() || '';
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
  return firstInitial + lastInitial || 'U';
};

/**
 * Validar email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Truncar texto
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Obtener color de badge según estado
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Obtener texto en español de estado
 */
export const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  };
  return texts[status] || status;
};