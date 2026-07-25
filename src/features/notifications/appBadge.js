// ============================================================
// APP BADGE - Burbuja/contador en el ícono del launcher (Android/iOS)
// Muestra cuántas notificaciones push hay sin leer sobre el ícono de la app.
// Solo actúa en plataforma nativa (Capacitor); en web es no-op.
// ============================================================
import { Capacitor } from '@capacitor/core';

let badgePromise = null;

// Carga perezosa del plugin para no romper el build web ni fallar si el
// plugin nativo no está disponible (p. ej. APK antiguo sin el plugin).
const getBadge = async () => {
  if (!Capacitor.isNativePlatform()) return null;
  if (!badgePromise) {
    badgePromise = import('@capawesome/capacitor-badge')
      .then((m) => m.Badge)
      .catch((err) => {
        console.warn('[badge] plugin no disponible:', err?.message);
        return null;
      });
  }
  return badgePromise;
};

/**
 * Fija el número de la burbuja en el ícono. count <= 0 la elimina.
 * @param {number} count
 */
export const setAppBadge = async (count) => {
  try {
    const Badge = await getBadge();
    if (!Badge) return;

    const n = Math.max(0, Math.floor(Number(count) || 0));
    if (n <= 0) {
      await Badge.clear();
    } else {
      // Asegurar permiso en iOS (en Android no requiere permiso).
      if (Badge.checkPermissions) {
        try {
          const perm = await Badge.checkPermissions();
          if (perm?.display === 'prompt' && Badge.requestPermissions) {
            await Badge.requestPermissions();
          }
        } catch {
          // ignorar: en Android estos métodos pueden no aplicar
        }
      }
      await Badge.set({ count: n });
    }
  } catch (err) {
    console.warn('[badge] no se pudo actualizar:', err?.message);
  }
};

/** Elimina la burbuja del ícono. */
export const clearAppBadge = () => setAppBadge(0);

export default setAppBadge;
