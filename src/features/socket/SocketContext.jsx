// ============================================================
// SOCKET CONTEXT - Contexto de WebSocket para notificaciones en tiempo real
// ============================================================
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../auth';
import { SOCKET_URL } from '../../config/api.config';

const SocketContext = createContext(null);

// ------------------------------------------------------------
// Generador de beep WAV embebido (fallback para cuando Web Audio falla).
// No depende de AudioContext: usa solo ArrayBuffer + Blob.
// Se genera UNA SOLA VEZ y se cachea como Blob URL.
// ------------------------------------------------------------
let cachedBeepUrl = null;
const getBeepBlobUrl = () => {
  if (cachedBeepUrl) return cachedBeepUrl;
  try {
    const sampleRate = 22050;
    const duration = 0.6;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Melodía: 880Hz → 1100Hz → 1320Hz cada 200ms con envelope decay
    const freqs = [880, 1100, 1320];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const segment = Math.min(Math.floor(t / 0.2), 2);
      const freq = freqs[segment];
      const segT = t - segment * 0.2;
      const envelope = Math.min(segT * 20, 1) * Math.exp(-2.5 * segT);
      const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
      view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 32767, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    cachedBeepUrl = URL.createObjectURL(blob);
    return cachedBeepUrl;
  } catch (err) {
    console.warn('[audio] No se pudo generar beep WAV:', err?.message);
    return null;
  }
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [arrivalNotifications, setArrivalNotifications] = useState([]);
  const [newOrderAlerts, setNewOrderAlerts] = useState([]);
  const [newMaintenanceAlerts, setNewMaintenanceAlerts] = useState([]);
  const audioContextRef = useRef(null);
  const fallbackAudioRef = useRef(null);
  // Dedupe: guarda IDs vistos en los últimos 60s para descartar duplicados
  const seenEventIdsRef = useRef(new Map());

  // ------------------------------------------------------------
  // AudioContext (intento principal)
  // ------------------------------------------------------------
  const getAudioContext = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return null;
        audioContextRef.current = new Ctor();
      }
      return audioContextRef.current;
    } catch {
      return null;
    }
  }, []);

  // ------------------------------------------------------------
  // Fallback HTMLAudioElement (cuando Web Audio falla o está suspendido)
  // ------------------------------------------------------------
  const playFallbackAudio = useCallback(() => {
    try {
      const url = getBeepBlobUrl();
      if (!url) return false;
      if (!fallbackAudioRef.current) {
        fallbackAudioRef.current = new Audio(url);
        fallbackAudioRef.current.preload = 'auto';
      }
      const audio = fallbackAudioRef.current;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err) => {
          // En navegadores con políticas estrictas puede requerir gesture
          console.log('[audio] HTML5 fallback rechazado:', err?.message);
        });
      }
      return true;
    } catch (err) {
      console.log('[audio] HTML5 fallback error:', err?.message);
      return false;
    }
  }, []);

  // ------------------------------------------------------------
  // Reproducir sonido: Web Audio API → fallback HTMLAudio
  // ------------------------------------------------------------
  const playNotificationSound = useCallback(() => {
    let webAudioOk = false;
    try {
      const audioContext = getAudioContext();
      if (!audioContext) {
        playFallbackAudio();
        return;
      }

      if (audioContext.state === 'suspended') {
        // resume() devuelve promesa; si falla, no esperamos
        const resumePromise = audioContext.resume();
        if (resumePromise && typeof resumePromise.catch === 'function') {
          resumePromise.catch(() => {});
        }
      }

      // Si AudioContext no está en running después del intento, fallback
      if (audioContext.state !== 'running') {
        playFallbackAudio();
        return;
      }

      const now = audioContext.currentTime;
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator1.type = 'sine';
      oscillator2.type = 'sine';

      oscillator1.frequency.setValueAtTime(880, now);
      oscillator1.frequency.setValueAtTime(1100, now + 0.15);
      oscillator1.frequency.setValueAtTime(1320, now + 0.3);

      oscillator2.frequency.setValueAtTime(440, now);
      oscillator2.frequency.setValueAtTime(550, now + 0.15);
      oscillator2.frequency.setValueAtTime(660, now + 0.3);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gainNode.gain.setValueAtTime(0.3, now + 0.1);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.15);
      gainNode.gain.setValueAtTime(0.25, now + 0.2);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.25);
      gainNode.gain.linearRampToValueAtTime(0.35, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator1.start(now);
      oscillator2.start(now);
      oscillator1.stop(now + 0.6);
      oscillator2.stop(now + 0.6);

      webAudioOk = true;
    } catch (err) {
      console.log('No se pudo reproducir sonido (Web Audio):', err?.message);
    }

    if (!webAudioOk) {
      playFallbackAudio();
    }
  }, [getAudioContext, playFallbackAudio]);

  // ------------------------------------------------------------
  // Helpers de deduplicación
  // ------------------------------------------------------------
  const buildEventKey = useCallback((eventName, data) => {
    const id = data?.notification?.id
      ?? data?.notification?.reference_id
      ?? data?.order_id
      ?? data?.schedule_id;
    if (id != null) return `${eventName}:${id}`;
    return null;
  }, []);

  const isDuplicate = useCallback((key) => {
    if (!key) return false;
    const now = Date.now();
    const seen = seenEventIdsRef.current;
    // Limpieza perezosa de entradas viejas (>60s)
    if (seen.size > 200) {
      for (const [k, ts] of seen) {
        if (now - ts > 60000) seen.delete(k);
      }
    }
    if (seen.has(key)) {
      const ts = seen.get(key);
      if (now - ts < 60000) return true;
    }
    seen.set(key, now);
    return false;
  }, []);

  // ------------------------------------------------------------
  // Conectar al socket cuando el usuario está autenticado
  // ------------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,        // Reintentar siempre (no abandonar)
      reconnectionDelay: 1000,               // Primer intento: 1s
      reconnectionDelayMax: 30000,           // Tope: 30s (evita martilleo)
      randomizationFactor: 0.5,              // Jitter para distribuir reconexiones
      timeout: 20000
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Conectado:', newSocket.id);
      setIsConnected(true);
      newSocket.emit('authenticate', user.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Desconectado:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Error de conexion:', error?.message);
    });

    newSocket.on('reconnect_attempt', (attempt) => {
      console.log('[Socket] Reintentando conexión (intento', attempt, ')');
    });

    // ----------- arrival_notification -----------
    newSocket.on('arrival_notification', (data) => {
      console.log('[Socket] Notificacion de llegada:', data);
      const key = buildEventKey('arrival_notification', data);
      if (isDuplicate(key)) {
        console.log('[Socket] arrival_notification duplicado ignorado:', key);
        return;
      }

      if (data.sound) playNotificationSound();
      if (data.vibrate && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }

      const stableId = data?.notification?.id ?? `arrival-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setArrivalNotifications(prev => {
        if (prev.some(n => n.id === stableId)) return prev;
        return [...prev, {
          id: stableId,
          ...data.notification,
          timestamp: new Date()
        }];
      });
    });

    // ----------- delivery_arrived -----------
    newSocket.on('delivery_arrived', (data) => {
      console.log('[Socket] Llegada notificada:', data);
      const key = buildEventKey('delivery_arrived', data);
      if (isDuplicate(key)) {
        console.log('[Socket] delivery_arrived duplicado ignorado:', key);
        return;
      }

      playNotificationSound();
      if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 300]);
      }

      const isMaintenance = data.type === 'MAINTENANCE_ARRIVAL';
      const stableId = data?.order_id
        ? `delivery-${data.order_id}`
        : data?.schedule_id
          ? `maintenance-${data.schedule_id}`
          : `arrival-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setArrivalNotifications(prev => {
        if (prev.some(n => n.id === stableId)) return prev;
        return [...prev, {
          id: stableId,
          title: isMaintenance ? 'El tecnico ha llegado' : 'Tu pedido ha llegado',
          message: isMaintenance
            ? `El tecnico ha llegado a tu domicilio para el mantenimiento. Preparate para recibirlo.`
            : `El repartidor ha llegado con tu pedido ${data.order_number}`,
          type: 'ARRIVAL',
          order_id: data.order_id,
          schedule_id: data.schedule_id,
          timestamp: new Date()
        }];
      });
    });

    // ----------- new_order_alert -----------
    newSocket.on('new_order_alert', (data) => {
      console.log('[Socket] Nuevo pedido:', data);
      const key = buildEventKey('new_order_alert', data);
      if (isDuplicate(key)) {
        console.log('[Socket] new_order_alert duplicado ignorado:', key);
        return;
      }

      if (data.sound) playNotificationSound();

      const stableId = data?.notification?.id
        ?? (data?.notification?.reference_id ? `order-${data.notification.reference_id}` : `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

      setNewOrderAlerts(prev => {
        if (prev.some(a => a.id === stableId)) return prev;
        return [...prev, {
          id: stableId,
          title: data.notification?.title || 'Nuevo Pedido',
          message: data.notification?.message || '',
          type: 'NEW_ORDER',
          order_id: data.notification?.reference_id,
          order_number: data.notification?.order_number,
          customer_name: data.notification?.customer_name,
          timestamp: new Date()
        }];
      });
    });

    // ----------- new_maintenance_alert -----------
    newSocket.on('new_maintenance_alert', (data) => {
      console.log('[Socket] Nueva solicitud de mantenimiento:', data);
      const key = buildEventKey('new_maintenance_alert', data);
      if (isDuplicate(key)) {
        console.log('[Socket] new_maintenance_alert duplicado ignorado:', key);
        return;
      }

      if (data.sound) playNotificationSound();

      const stableId = data?.notification?.id
        ?? (data?.notification?.reference_id ? `maintenance-${data.notification.reference_id}` : `maintenance-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

      setNewMaintenanceAlerts(prev => {
        if (prev.some(a => a.id === stableId)) return prev;
        return [...prev, {
          id: stableId,
          title: data.notification?.title || 'Nueva Solicitud de Mantenimiento',
          message: data.notification?.message || '',
          type: 'NEW_MAINTENANCE',
          reference_id: data.notification?.reference_id,
          request_number: data.notification?.request_number,
          customer_name: data.notification?.customer_name,
          description: data.notification?.description,
          timestamp: new Date()
        }];
      });
    });

    // ----------- new_notification y unread_count_update -----------
    newSocket.on('new_notification', (data) => {
      console.log('[Socket] Nueva notificacion:', data);
    });

    newSocket.on('unread_count_update', (data) => {
      console.log('[Socket] Contador actualizado:', data.count);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?.id, playNotificationSound, buildEventKey, isDuplicate]);

  const dismissArrivalNotification = useCallback((notificationId) => {
    setArrivalNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearArrivalNotifications = useCallback(() => {
    setArrivalNotifications([]);
  }, []);

  const dismissNewOrderAlert = useCallback((alertId) => {
    setNewOrderAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const clearNewOrderAlerts = useCallback(() => {
    setNewOrderAlerts([]);
  }, []);

  const dismissNewMaintenanceAlert = useCallback((alertId) => {
    setNewMaintenanceAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const clearNewMaintenanceAlerts = useCallback(() => {
    setNewMaintenanceAlerts([]);
  }, []);

  const value = {
    socket,
    isConnected,
    arrivalNotifications,
    dismissArrivalNotification,
    clearArrivalNotifications,
    newOrderAlerts,
    dismissNewOrderAlert,
    clearNewOrderAlerts,
    newMaintenanceAlerts,
    dismissNewMaintenanceAlert,
    clearNewMaintenanceAlerts,
    playNotificationSound
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe usarse dentro de SocketProvider');
  }
  return context;
};

export { SocketContext };
