// ============================================================
// SOCKET CONTEXT - Contexto de WebSocket para notificaciones en tiempo real
// ============================================================
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../auth';
import { SOCKET_URL } from '../../config/api.config';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [arrivalNotifications, setArrivalNotifications] = useState([]);
  const [newOrderAlerts, setNewOrderAlerts] = useState([]);
  const [newMaintenanceAlerts, setNewMaintenanceAlerts] = useState([]);
  const audioContextRef = useRef(null);

  // Inicializar AudioContext para generar sonidos
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Reproducir sonido de notificacion usando Web Audio API
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();

      // Reanudar si esta suspendido
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const now = audioContext.currentTime;

      // Crear oscilador para tono principal
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Configurar osciladores
      oscillator1.type = 'sine';
      oscillator2.type = 'sine';

      // Melodia agradable de 3 notas
      oscillator1.frequency.setValueAtTime(880, now); // A5
      oscillator1.frequency.setValueAtTime(1100, now + 0.15); // C#6
      oscillator1.frequency.setValueAtTime(1320, now + 0.3); // E6

      oscillator2.frequency.setValueAtTime(440, now); // A4
      oscillator2.frequency.setValueAtTime(550, now + 0.15); // C#5
      oscillator2.frequency.setValueAtTime(660, now + 0.3); // E5

      // Envelope de volumen
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gainNode.gain.setValueAtTime(0.3, now + 0.1);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.15);
      gainNode.gain.setValueAtTime(0.25, now + 0.2);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.25);
      gainNode.gain.linearRampToValueAtTime(0.35, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      // Conectar
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Reproducir
      oscillator1.start(now);
      oscillator2.start(now);
      oscillator1.stop(now + 0.6);
      oscillator2.stop(now + 0.6);

    } catch (err) {
      console.log('No se pudo reproducir sonido:', err.message);
    }
  }, [getAudioContext]);

  // Conectar al socket cuando el usuario esta autenticado
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
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Conectado:', newSocket.id);
      setIsConnected(true);

      // Autenticar usuario
      newSocket.emit('authenticate', user.id);
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Desconectado');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Error de conexion:', error.message);
    });

    // Escuchar notificacion de llegada de pedido (urgente)
    newSocket.on('arrival_notification', (data) => {
      console.log('[Socket] Notificacion de llegada:', data);

      // Reproducir sonido
      if (data.sound) {
        playNotificationSound();
      }

      // Vibrar si esta disponible
      if (data.vibrate && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }

      // Agregar a la cola de notificaciones de llegada
      setArrivalNotifications(prev => [...prev, {
        id: Date.now(),
        ...data.notification,
        timestamp: new Date()
      }]);
    });

    // Escuchar evento especifico de llegada de repartidor o tecnico
    newSocket.on('delivery_arrived', (data) => {
      console.log('[Socket] Llegada notificada:', data);

      // Reproducir sonido
      playNotificationSound();

      // Vibrar
      if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 300]);
      }

      // Determinar si es llegada de pedido o de mantenimiento
      const isMaintenance = data.type === 'MAINTENANCE_ARRIVAL';

      // Agregar notificacion especial
      setArrivalNotifications(prev => [...prev, {
        id: Date.now(),
        title: isMaintenance ? 'El tecnico ha llegado' : 'Tu pedido ha llegado',
        message: isMaintenance
          ? `El tecnico ha llegado a tu domicilio para el mantenimiento. Preparate para recibirlo.`
          : `El repartidor ha llegado con tu pedido ${data.order_number}`,
        type: 'ARRIVAL',
        order_id: data.order_id,
        schedule_id: data.schedule_id,
        timestamp: new Date()
      }]);
    });

    // Escuchar alerta de nuevo pedido (para usuarios staff - GERENTE, BASE, REPARTIDOR)
    newSocket.on('new_order_alert', (data) => {
      console.log('[Socket] Nuevo pedido:', data);

      if (data.sound) {
        playNotificationSound();
      }

      // Agregar a la cola de alertas de nuevo pedido (para modal)
      setNewOrderAlerts(prev => [...prev, {
        id: Date.now(),
        title: data.notification?.title || 'Nuevo Pedido',
        message: data.notification?.message || '',
        type: 'NEW_ORDER',
        order_id: data.notification?.reference_id,
        order_number: data.notification?.order_number,
        customer_name: data.notification?.customer_name,
        timestamp: new Date()
      }]);
    });

    // Escuchar alerta de nueva solicitud de mantenimiento (para usuarios staff)
    newSocket.on('new_maintenance_alert', (data) => {
      console.log('[Socket] Nueva solicitud de mantenimiento:', data);

      if (data.sound) {
        playNotificationSound();
      }

      // Agregar a la cola de alertas de mantenimiento (para modal)
      setNewMaintenanceAlerts(prev => [...prev, {
        id: Date.now(),
        title: data.notification?.title || 'Nueva Solicitud de Mantenimiento',
        message: data.notification?.message || '',
        type: 'NEW_MAINTENANCE',
        reference_id: data.notification?.reference_id,
        request_number: data.notification?.request_number,
        customer_name: data.notification?.customer_name,
        description: data.notification?.description,
        timestamp: new Date()
      }]);
    });

    // Escuchar notificaciones generales
    newSocket.on('new_notification', (data) => {
      console.log('[Socket] Nueva notificacion:', data);
    });

    // Escuchar actualizacion de contador
    newSocket.on('unread_count_update', (data) => {
      console.log('[Socket] Contador actualizado:', data.count);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?.id, playNotificationSound]);

  // Funcion para remover una notificacion de llegada de la cola
  const dismissArrivalNotification = useCallback((notificationId) => {
    setArrivalNotifications(prev =>
      prev.filter(n => n.id !== notificationId)
    );
  }, []);

  // Funcion para limpiar todas las notificaciones de llegada
  const clearArrivalNotifications = useCallback(() => {
    setArrivalNotifications([]);
  }, []);

  // Funcion para remover una alerta de nuevo pedido
  const dismissNewOrderAlert = useCallback((alertId) => {
    setNewOrderAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  // Funcion para limpiar todas las alertas de nuevo pedido
  const clearNewOrderAlerts = useCallback(() => {
    setNewOrderAlerts([]);
  }, []);

  // Funcion para remover una alerta de mantenimiento
  const dismissNewMaintenanceAlert = useCallback((alertId) => {
    setNewMaintenanceAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  // Funcion para limpiar todas las alertas de mantenimiento
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
