import { useEffect, useState } from 'react';
import { useSocket } from '../../features/socket';

const AUTO_DISMISS_MS = 20000;

const NewMaintenanceAlertModal = () => {
  const { newMaintenanceAlerts, dismissNewMaintenanceAlert } = useSocket();
  const [currentAlert, setCurrentAlert] = useState(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (newMaintenanceAlerts.length > 0 && !currentAlert) {
      setCurrentAlert(newMaintenanceAlerts[0]);
      setIsExiting(false);
    }
  }, [newMaintenanceAlerts, currentAlert]);

  useEffect(() => {
    if (!currentAlert) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [currentAlert]);

  const handleDismiss = () => {
    if (!currentAlert) return;
    setIsExiting(true);
    setTimeout(() => {
      dismissNewMaintenanceAlert(currentAlert.id);
      setCurrentAlert(null);
      setIsExiting(false);
    }, 300);
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentAlert) return null;

  return (
    <div className={`nma-overlay${isExiting ? ' nma-overlay--exiting' : ''}`} onClick={handleDismiss}>
      <div className={`nma-modal${isExiting ? ' nma-modal--exiting' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="nma-modal__header">
          <div className="nma-modal__icon-container">
            <div className="nma-modal__icon-ring"></div>
            <svg className="nma-modal__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <h3 className="nma-modal__title">Solicitud de Mantenimiento</h3>
        </div>

        <div className="nma-modal__body">
          {currentAlert.request_number && (
            <div className="nma-modal__detail">
              <span className="nma-modal__detail-label">Solicitud</span>
              <span className="nma-modal__detail-value nma-modal__detail-value--highlight">
                {currentAlert.request_number}
              </span>
            </div>
          )}
          {currentAlert.customer_name && (
            <div className="nma-modal__detail">
              <span className="nma-modal__detail-label">Cliente</span>
              <span className="nma-modal__detail-value">{currentAlert.customer_name}</span>
            </div>
          )}
          <div className="nma-modal__detail">
            <span className="nma-modal__detail-label">Hora</span>
            <span className="nma-modal__detail-value">{formatTime(currentAlert.timestamp)}</span>
          </div>
          {currentAlert.description && (
            <p className="nma-modal__message">{currentAlert.description}</p>
          )}
          {!currentAlert.description && currentAlert.message && (
            <p className="nma-modal__message">{currentAlert.message}</p>
          )}
        </div>

        <div className="nma-modal__footer">
          <button className="nma-modal__btn nma-modal__btn--primary" onClick={handleDismiss}>
            Entendido
          </button>
        </div>

        {newMaintenanceAlerts.length > 1 && (
          <div className="nma-modal__queue-badge">
            +{newMaintenanceAlerts.length - 1} mas
          </div>
        )}

        <div className="nma-modal__progress"></div>
      </div>

      <style>{`
        .nma-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          animation: nmaOverlayIn 0.3s ease-out forwards;
          backdrop-filter: blur(4px);
          padding: 16px;
        }

        .nma-overlay--exiting {
          animation: nmaOverlayOut 0.3s ease-in forwards;
        }

        @keyframes nmaOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes nmaOverlayOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .nma-modal {
          background: #fff;
          border-radius: 20px;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3), 0 0 80px rgba(245, 158, 11, 0.15);
          overflow: hidden;
          position: relative;
          animation: nmaModalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .nma-modal--exiting {
          animation: nmaModalOut 0.3s ease-in forwards;
        }

        @keyframes nmaModalIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes nmaModalOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.8) translateY(30px);
          }
        }

        .nma-modal__header {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
          padding: 28px 24px 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .nma-modal__header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
          animation: nmaShimmer 3s ease-in-out infinite;
        }

        @keyframes nmaShimmer {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10%, 10%); }
        }

        .nma-modal__icon-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          margin-bottom: 12px;
        }

        .nma-modal__icon-ring {
          position: absolute;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.4);
          animation: nmaIconRing 1.5s ease-out infinite;
        }

        @keyframes nmaIconRing {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .nma-modal__icon {
          width: 48px;
          height: 48px;
          color: #fff;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
          animation: nmaIconSwing 0.6s ease-in-out 3;
          transform-origin: center center;
          position: relative;
          z-index: 1;
        }

        @keyframes nmaIconSwing {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(15deg); }
          30% { transform: rotate(-12deg); }
          45% { transform: rotate(8deg); }
          60% { transform: rotate(-5deg); }
          75% { transform: rotate(2deg); }
          100% { transform: rotate(0deg); }
        }

        .nma-modal__title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
          letter-spacing: 0.5px;
        }

        .nma-modal__body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .nma-modal__detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .nma-modal__detail-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .nma-modal__detail-value {
          font-size: 15px;
          color: #1e293b;
          font-weight: 600;
        }

        .nma-modal__detail-value--highlight {
          color: #d97706;
          font-size: 16px;
          font-weight: 700;
        }

        .nma-modal__message {
          margin: 0;
          padding: 10px 14px;
          font-size: 14px;
          color: #475569;
          line-height: 1.5;
          background: #fffbeb;
          border-radius: 10px;
          border-left: 3px solid #f59e0b;
        }

        .nma-modal__footer {
          padding: 0 24px 24px;
          display: flex;
          gap: 12px;
        }

        .nma-modal__btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .nma-modal__btn--primary {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #fff;
          box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
        }

        .nma-modal__btn--primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
        }

        .nma-modal__btn--primary:active {
          transform: translateY(0);
        }

        .nma-modal__queue-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.25);
          color: #fff;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(4px);
          z-index: 2;
        }

        .nma-modal__progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
          border-radius: 0 0 20px 20px;
          animation: nmaProgress ${AUTO_DISMISS_MS}ms linear forwards;
        }

        @keyframes nmaProgress {
          from { width: 100%; }
          to { width: 0%; }
        }

        @media (max-width: 480px) {
          .nma-modal {
            max-width: 100%;
          }

          .nma-modal__header {
            padding: 24px 20px 20px;
          }

          .nma-modal__icon-container {
            width: 60px;
            height: 60px;
          }

          .nma-modal__icon-ring {
            width: 60px;
            height: 60px;
          }

          .nma-modal__icon {
            width: 40px;
            height: 40px;
          }

          .nma-modal__title {
            font-size: 20px;
          }

          .nma-modal__body {
            padding: 20px;
          }

          .nma-modal__footer {
            padding: 0 20px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default NewMaintenanceAlertModal;
