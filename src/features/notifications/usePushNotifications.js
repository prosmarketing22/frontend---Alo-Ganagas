// ============================================================
// USE PUSH NOTIFICATIONS - Registra el dispositivo en FCM y enruta los pushes
// Solo se activa en plataforma nativa (Capacitor) — en web hace no-op.
//
// GARANTÍA: la notificación se muestra y SUENA SIEMPRE:
//   - App CERRADA / en 2º plano / pantalla bloqueada -> FCM entrega la
//     notificación a la bandeja del sistema usando el canal PUSH_CHANNEL_ID
//     (importancia MAX + sonido propio). Lo maneja el SO, no la app.
//   - App ABIERTA (foreground) -> el SO NO muestra la push automáticamente;
//     aquí la re-emitimos con LocalNotifications sobre el MISMO canal, así
//     también aparece en la bandeja y suena.
// ============================================================
import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../auth/useAuth';
import { notificationService } from '../../services/notificationService';

let cachedToken = null;

// Canal DEDICADO para pedidos/alertas. Se usa un id NUEVO (v2) a propósito:
// los canales de Android son INMUTABLES tras crearse; si un install viejo creó
// 'aloganagas_default' con sonido/importancia incorrectos, cambiar sus ajustes
// no surte efecto. Un id nuevo fuerza a Android a crear el canal desde cero con
// importancia MAX + sonido propio. DEBE COINCIDIR con:
//   - AndroidManifest.xml (com.google.firebase.messaging.default_notification_channel_id)
//   - backend pushNotificationService.js (android.notification.channelId)
export const PUSH_CHANNEL_ID = 'aloganagas_pedidos';
// Nombre del recurso de sonido en android/app/src/main/res/raw/ (SIN extensión).
const PUSH_SOUND = 'notificacion';

// Contador para ids de notificaciones locales (deben ser enteros únicos).
let localNotifId = 1;

export const usePushNotifications = ({ onNavigate } = {}) => {
  const { user, isAuthenticated } = useAuth();
  const initializedRef = useRef(false);
  // onNavigate cambia de referencia en cada render (se define inline en el caller).
  // Lo guardamos en un ref para NO incluirlo en las dependencias del efecto y evitar
  // que el efecto se reinicie (lo que antes descartaba el token FCM por la bandera cancelled).
  const onNavigateRef = useRef(onNavigate);
  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  // Si el usuario cierra sesión, permitir re-registrar el token en el próximo login.
  useEffect(() => {
    if (!isAuthenticated) {
      initializedRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (!isAuthenticated || !user) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    let listeners = [];

    const setup = async () => {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const { LocalNotifications } = await import('@capacitor/local-notifications');

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

      // LocalNotifications comparte POST_NOTIFICATIONS; pedir permiso por si acaso
      // (necesario para mostrar la notificación cuando la app está en foreground).
      try {
        const lp = await LocalNotifications.checkPermissions();
        if (lp.display === 'prompt' || lp.display === 'prompt-with-rationale') {
          await LocalNotifications.requestPermissions();
        }
      } catch (err) {
        console.warn('[push] LocalNotifications permiso (no crítico):', err?.message);
      }

      // Crear el canal de alta prioridad con SONIDO PROPIO. Se crea con AMBOS
      // plugins para que tanto la push (SO) como la notificación local usen
      // exactamente el mismo canal (mismo sonido/importancia).
      const channel = {
        id: PUSH_CHANNEL_ID,
        name: 'Pedidos y alertas Aló Ganagas',
        description: 'Nuevos pedidos, GANAGAS y mantenimiento',
        importance: 5, // MAX (Heads-up + sonido + vibración, visible en pantalla bloqueada)
        visibility: 1, // PUBLIC (se muestra contenido en la pantalla de bloqueo)
        sound: PUSH_SOUND, // res/raw/notificacion.wav (sin extensión)
        vibration: true,
        lights: true,
        lightColor: '#3B82F6'
      };
      try {
        if (PushNotifications.createChannel) {
          await PushNotifications.createChannel(channel);
        }
      } catch (err) {
        console.warn('[push] createChannel (push) fallo (no crítico):', err?.message);
      }
      try {
        if (LocalNotifications.createChannel) {
          await LocalNotifications.createChannel(channel);
        }
      } catch (err) {
        console.warn('[push] createChannel (local) fallo (no crítico):', err?.message);
      }

      // El token FCM llega de forma asíncrona vía este listener. NO debe descartarse:
      // siempre intentamos registrarlo en el backend.
      listeners.push(
        await PushNotifications.addListener('registration', async ({ value: token }) => {
          if (cachedToken === token) return;
          try {
            await notificationService.registerPushToken({ token, platform: 'android' });
            cachedToken = token;
            console.log('[push] Token registrado en backend');
          } catch (err) {
            console.error('[push] Error al registrar token:', err);
          }
        })
      );

      listeners.push(
        await PushNotifications.addListener('registrationError', (err) => {
          console.error('[push] registrationError:', err);
        })
      );

      // Push recibido con la app en FOREGROUND. En Android el SO NO muestra la
      // notificación en este caso: la entrega directamente a la app. Para cumplir
      // "siempre se ve y suena", la re-emitimos como notificación local sobre el
      // canal de alta prioridad (mismo sonido). En background NO se dispara este
      // evento (lo maneja la bandeja del sistema), así que no hay duplicados.
      listeners.push(
        await PushNotifications.addListener('pushNotificationReceived', async (notification) => {
          console.log('[push] foreground:', notification);
          try {
            const data = notification?.data || {};
            const title = notification?.title || data.title || 'Aló Ganagas';
            const body = notification?.body || data.body || data.message || 'Tienes una nueva notificación';
            await LocalNotifications.schedule({
              notifications: [
                {
                  id: (localNotifId++ % 2147483000) + 1,
                  title,
                  body,
                  channelId: PUSH_CHANNEL_ID,
                  sound: PUSH_SOUND, // pre-Android 8; en 8+ manda el canal
                  // smallIcon omitido a propósito: el plugin usa el ícono de la
                  // app por defecto (siempre existe). Evita fallos de recurso.
                  // Propaga el destino para navegar al tocar la notificación local.
                  extra: { target_path: data.target_path || '' }
                }
              ]
            });
          } catch (err) {
            console.error('[push] No se pudo mostrar notificación local en foreground:', err?.message);
          }
        })
      );

      // Usuario tocó la notificación PUSH del sistema (app en background/cerrada)
      // -> navegamos al destino.
      listeners.push(
        await PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
          const target = notification?.data?.target_path;
          if (target && typeof onNavigateRef.current === 'function') {
            onNavigateRef.current(target);
          }
        })
      );

      // Usuario tocó la notificación LOCAL (la que mostramos en foreground) -> navegar.
      listeners.push(
        await LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
          const target = notification?.extra?.target_path;
          if (target && typeof onNavigateRef.current === 'function') {
            onNavigateRef.current(target);
          }
        })
      );

      await PushNotifications.register();
    };

    setup().catch((err) => console.error('[push] setup error:', err));

    return () => {
      listeners.forEach((l) => l?.remove?.());
      listeners = [];
    };
  }, [isAuthenticated, user]);
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
