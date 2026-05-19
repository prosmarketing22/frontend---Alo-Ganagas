// ============================================================
// USE NOTIFICATIONS - Hook para acceder al contexto de notificaciones
// ============================================================
import { useContext } from 'react';
import { NotificationContext } from './NotificationContext';

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }

  return context;
};
