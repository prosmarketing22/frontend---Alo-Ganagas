// ============================================================
// USE PUSH NOTIFICATIONS - Registra el dispositivo en FCM y enruta los pushes
// Solo se activa en plataforma nativa (Capacitor) — en web hace no-op.
// ============================================================
import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../auth/useAuth';
import { notificationService } from '../../services/notificationService';

let cachedToken = null;

export const usePushNotifications = ({ onNavigate } = {}) => {
  const { user, isAuthenticated } = useAuth();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (!isAuthenticated || !user) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    let listeners = [];
    let cancelled = false;

    const setup = async () => {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      // Verificar permisos. En Android 13+ requiere permiso runtime POST_NOTIFICATIONS.
      const perm = await PushNotifications.checkPermissions();
      let status = perm.receive;
      if (status === 'prompt' || status === 'prompt-with-rationale') {
        const req = await PushNotifications.requestPermissions();
        status = req.receive;
      }
      if (status !== 'granted') {
        console.warn('[push] Permiso denegado por el usuario');
        return;
      }

      // Crear canal de notificaciones explícitamente (alta prioridad, sonido, vibración).
      // Esto garantiza que la notificación se muestre con la app cerrada.
      try {
        if (PushNotifications.createChannel) {
          await PushNotifications.createChannel({
            id: 'aloganagas_default',
            name: 'Notificaciones Aló Ganagas',
            description: 'Pedidos, GANAGAS y mantenimiento',
            importance: 5, // MAX (Heads-up + sonido + vibración)
            visibility: 1, // PUBLIC
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#3B82F6'
          });
        }
      } catch (err) {
        console.warn('[push] createChannel fallo (no crítico):', err?.message);
      }

      listeners.push(
        await PushNotifications.addListener('registration', async ({ value: token }) => {
          if (cancelled) return;
          if (cachedToken === token) return;
          cachedToken = token;
          try {
            await notificationService.registerPushToken({ token, platform: 'android' });
            console.log('[push] Token registrado en backend');
          } catch (err) {
            console.error('[push] Error al registrar token:', err);
            cachedToken = null;
          }
        })
      );

      listeners.push(
        await PushNotifications.addListener('registrationError', (err) => {
          console.error('[push] registrationError:', err);
        })
      );

      // Push recibido con la app en foreground -> el WebSocket ya actualizó la UI,
      // así que no mostramos nada extra aquí.
      listeners.push(
        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('[push] foreground:', notification);
        })
      );

      // Usuario tocó la notificación del sistema -> navegamos al destino.
      listeners.push(
        await PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
          const target = notification?.data?.target_path;
          if (target && typeof onNavigate === 'function') {
            onNavigate(target);
          }
        })
      );

      await PushNotifications.register();
    };

    setup().catch((err) => console.error('[push] setup error:', err));

    return () => {
      cancelled = true;
      listeners.forEach((l) => l?.remove?.());
    };
  }, [isAuthenticated, user, onNavigate]);
};

export const clearCachedPushToken = async () => {
  if (!Capacitor.isNativePlatform()) return;
  if (!cachedToken) return;
  try {
    await notificationService.unregisterPushToken(cachedToken);
  } catch (err) {
    console.error('[push] Error al desregistrar token:', err);
  } finally {
    cachedToken = null;
  }
};
