// ============================================================
// ARRIVAL TOAST - Componente de notificacion visual de llegada del repartidor
// Muestra una notificacion prominente con animacion cuando el repartidor llega
// ============================================================
import { useEffect, useState } from 'react';

const ArrivalToast = ({ notifications, onDismiss }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  // Auto-dismiss despues de 15 segundos
  useEffect(() => {
    if (visibleNotifications.length === 0) return;

    const timers = visibleNotifications.map(notification => {
      return setTimeout(() => {
        onDismiss(notification.id);
      }, 15000);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [visibleNotifications, onDismiss]);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="arrival-toast-container">
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className="arrival-toast"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="arrival-toast__icon-container">
            <div className="arrival-toast__icon-pulse"></div>
            <svg className="arrival-toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <path d="M9 10l2 2 4-4" />
            </svg>
          </div>

          <div className="arrival-toast__content">
            <h4 className="arrival-toast__title">{notification.title}</h4>
            <p className="arrival-toast__message">{notification.message}</p>
            {notification.order_number && (
              <span className="arrival-toast__order">
                Pedido: {notification.order_number}
              </span>
            )}
          </div>

          <button
            className="arrival-toast__close"
            onClick={() => onDismiss(notification.id)}
            aria-label="Cerrar notificacion"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="arrival-toast__progress"></div>
        </div>
      ))}

      <style>{`
        .arrival-toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 400px;
          width: calc(100% - 40px);
        }

        @media (max-width: 480px) {
          .arrival-toast-container {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
            width: auto;
          }
        }

        .arrival-toast {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4),
                      0 4px 12px rgba(0, 0, 0, 0.15);
          color: white;
          animation: slideInFromRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                     pulseGlow 2s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }

        .arrival-toast::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 70%
          );
          animation: shimmer 2s infinite;
        }

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4),
                        0 4px 12px rgba(0, 0, 0, 0.15);
          }
          50% {
            box-shadow: 0 10px 50px rgba(16, 185, 129, 0.6),
                        0 4px 20px rgba(0, 0, 0, 0.2);
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .arrival-toast__icon-container {
          position: relative;
          flex-shrink: 0;
        }

        .arrival-toast__icon-pulse {
          position: absolute;
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: iconPulse 1.5s ease-out infinite;
        }

        @keyframes iconPulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .arrival-toast__icon {
          width: 48px;
          height: 48px;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          animation: bounce 1s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .arrival-toast__content {
          flex: 1;
          min-width: 0;
          position: relative;
          z-index: 1;
        }

        .arrival-toast__title {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .arrival-toast__message {
          margin: 0 0 8px 0;
          font-size: 14px;
          opacity: 0.95;
          line-height: 1.4;
        }

        .arrival-toast__order {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .arrival-toast__close {
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .arrival-toast__close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .arrival-toast__close svg {
          width: 16px;
          height: 16px;
          color: white;
        }

        .arrival-toast__progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 0 0 16px 16px;
          animation: progressBar 15s linear forwards;
        }

        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }

        /* Animacion de salida */
        .arrival-toast.dismissing {
          animation: slideOutToRight 0.3s ease-in forwards;
        }

        @keyframes slideOutToRight {
          to {
            opacity: 0;
            transform: translateX(100px) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};

export default ArrivalToast;
