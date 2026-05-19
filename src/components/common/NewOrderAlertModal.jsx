import { useEffect, useState } from 'react';
import { useSocket } from '../../features/socket';

const AUTO_DISMISS_MS = 20000;

const NewOrderAlertModal = () => {
  const { newOrderAlerts, dismissNewOrderAlert } = useSocket();
  const [currentAlert, setCurrentAlert] = useState(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (newOrderAlerts.length > 0 && !currentAlert) {
      setCurrentAlert(newOrderAlerts[0]);
      setIsExiting(false);
    }
  }, [newOrderAlerts, currentAlert]);

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
      dismissNewOrderAlert(currentAlert.id);
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
    <div className={`noa-overlay${isExiting ? ' noa-overlay--exiting' : ''}`} onClick={handleDismiss}>
      <div className={`noa-modal${isExiting ? ' noa-modal--exiting' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="noa-modal__header">
          <div className="noa-modal__bell-container">
            <div className="noa-modal__bell-ring"></div>
            <svg className="noa-modal__bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h3 className="noa-modal__title">Nuevo Pedido</h3>
        </div>

        <div className="noa-modal__body">
          {currentAlert.order_number && (
            <div className="noa-modal__detail">
              <span className="noa-modal__detail-label">Pedido</span>
              <span className="noa-modal__detail-value noa-modal__detail-value--highlight">
                {currentAlert.order_number}
              </span>
            </div>
          )}
          {currentAlert.customer_name && (
            <div className="noa-modal__detail">
              <span className="noa-modal__detail-label">Cliente</span>
              <span className="noa-modal__detail-value">{currentAlert.customer_name}</span>
            </div>
          )}
          <div className="noa-modal__detail">
            <span className="noa-modal__detail-label">Hora</span>
            <span className="noa-modal__detail-value">{formatTime(currentAlert.timestamp)}</span>
          </div>
          {currentAlert.message && (
            <p className="noa-modal__message">{currentAlert.message}</p>
          )}
        </div>

        <div className="noa-modal__footer">
          <button className="noa-modal__btn noa-modal__btn--primary" onClick={handleDismiss}>
            Entendido
          </button>
        </div>

        {newOrderAlerts.length > 1 && (
          <div className="noa-modal__queue-badge">
            +{newOrderAlerts.length - 1} mas
          </div>
        )}

        <div className="noa-modal__progress"></div>
      </div>

      <style>{`
        .noa-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          animation: noaOverlayIn 0.3s ease-out forwards;
          backdrop-filter: blur(4px);
          padding: 16px;
        }

        .noa-overlay--exiting {
          animation: noaOverlayOut 0.3s ease-in forwards;
        }

        @keyframes noaOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes noaOverlayOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .noa-modal {
          background: #fff;
          border-radius: 20px;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3), 0 0 80px rgba(37, 99, 235, 0.15);
          overflow: hidden;
          position: relative;
          animation: noaModalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .noa-modal--exiting {
          animation: noaModalOut 0.3s ease-in forwards;
        }

        @keyframes noaModalIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes noaModalOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.8) translateY(30px);
          }
        }

        .noa-modal__header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
          padding: 28px 24px 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .noa-modal__header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
          animation: noaShimmer 3s ease-in-out infinite;
        }

        @keyframes noaShimmer {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10%, 10%); }
        }

        .noa-modal__bell-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          margin-bottom: 12px;
        }

        .noa-modal__bell-ring {
          position: absolute;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.4);
          animation: noaBellRing 1.5s ease-out infinite;
        }

        @keyframes noaBellRing {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .noa-modal__bell-icon {
          width: 48px;
          height: 48px;
          color: #fff;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
          animation: noaBellSwing 0.6s ease-in-out 3;
          transform-origin: top center;
          position: relative;
          z-index: 1;
        }

        @keyframes noaBellSwing {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(15deg); }
          30% { transform: rotate(-12deg); }
          45% { transform: rotate(8deg); }
          60% { transform: rotate(-5deg); }
          75% { transform: rotate(2deg); }
          100% { transform: rotate(0deg); }
        }

        .noa-modal__title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
          letter-spacing: 0.5px;
        }

        .noa-modal__body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .noa-modal__detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .noa-modal__detail-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .noa-modal__detail-value {
          font-size: 15px;
          color: #1e293b;
          font-weight: 600;
        }

        .noa-modal__detail-value--highlight {
          color: #2563eb;
          font-size: 16px;
          font-weight: 700;
        }

        .noa-modal__message {
          margin: 0;
          padding: 10px 14px;
          font-size: 14px;
          color: #475569;
          line-height: 1.5;
          background: #f1f5f9;
          border-radius: 10px;
          border-left: 3px solid #2563eb;
        }

        .noa-modal__footer {
          padding: 0 24px 24px;
          display: flex;
          gap: 12px;
        }

        .noa-modal__btn {
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

        .noa-modal__btn--primary {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #fff;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
        }

        .noa-modal__btn--primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
        }

        .noa-modal__btn--primary:active {
          transform: translateY(0);
        }

        .noa-modal__queue-badge {
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

        .noa-modal__progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(90deg, #2563eb, #60a5fa);
          border-radius: 0 0 20px 20px;
          animation: noaProgress ${AUTO_DISMISS_MS}ms linear forwards;
        }

        @keyframes noaProgress {
          from { width: 100%; }
          to { width: 0%; }
        }

        @media (max-width: 480px) {
          .noa-modal {
            max-width: 100%;
          }

          .noa-modal__header {
            padding: 24px 20px 20px;
          }

          .noa-modal__bell-container {
            width: 60px;
            height: 60px;
          }

          .noa-modal__bell-ring {
            width: 60px;
            height: 60px;
          }

          .noa-modal__bell-icon {
            width: 40px;
            height: 40px;
          }

          .noa-modal__title {
            font-size: 20px;
          }

          .noa-modal__body {
            padding: 20px;
          }

          .noa-modal__footer {
            padding: 0 20px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default NewOrderAlertModal;
