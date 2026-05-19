import { useState } from 'react';

export const PaymentMethodCard = ({ method, displayName, icon, color, onToggle, children, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (onToggle && !loading) {
      await onToggle(!method.is_active);
    }
  };

  const handleCardClick = () => {
    if (method.is_active) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`payment-method-card ${method.is_active ? 'payment-method-card--active' : ''}`}>
      <div className="payment-method-card-header" onClick={handleCardClick}>
        <div className="payment-method-card-info">
          <div className="payment-method-card-icon" style={{ background: color }}>
            {icon}
          </div>
          <div className="payment-method-card-details">
            <h3 className="payment-method-card-title">{displayName || method.method_type}</h3>
            <p className="payment-method-card-description">
              {method.is_active ? 'Método activo' : 'Método desactivado'}
            </p>
          </div>
        </div>
        <div className="payment-method-card-actions">
          <label className="payment-method-switch" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={method.is_active}
              onChange={handleToggle}
              disabled={loading}
            />
            <span className="payment-method-switch-slider"></span>
          </label>
          {method.is_active && (
            <svg
              className={`payment-method-expand-icon ${isExpanded ? 'payment-method-expand-icon--rotated' : ''}`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
      {method.is_active && isExpanded && (
        <div className="payment-method-card-body">
          {children}
        </div>
      )}
    </div>
  );
};
