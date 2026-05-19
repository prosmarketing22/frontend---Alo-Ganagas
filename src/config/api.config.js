/**
 * Configuracion centralizada de URLs de API
 *
 * Este archivo centraliza todas las URLs para evitar hardcoding
 * y facilitar el despliegue en diferentes entornos (dev, staging, prod)
 */

// URL base de la API (con /api)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4024/api';

// URL base del servidor (sin /api) - usado para Socket.IO y archivos estaticos
// Ternario en vez de || porque "/api".replace('/api','') = "" es falsy pero valido (= mismo origin)
export const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:4024';

// URL de Socket.IO (usa BASE_URL por defecto, o VITE_SOCKET_URL si esta definida)
// || undefined como fallback para que io(undefined) auto-detecte el origin
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BASE_URL || undefined;

// Helper para construir URLs de uploads/archivos estaticos
export const getUploadUrl = (path) => {
  if (!path) return null;
  // Si ya es una URL completa, devolverla tal cual
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Si empieza con /, quitarlo para evitar doble slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}/${cleanPath}`;
};

// Entorno actual
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;

// Exportar todo como objeto para importacion con alias
export default {
  API_URL,
  BASE_URL,
  SOCKET_URL,
  getUploadUrl,
  IS_PRODUCTION,
  IS_DEVELOPMENT
};
