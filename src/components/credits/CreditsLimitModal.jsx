import { useState } from 'react';
import { customerService } from '../../services/customerService';

export const CreditsLimitModal = ({ customer, onSubmit, onClose }) => {
  const [creditLimit, setCreditLimit] = useState(
    parseFloat(customer.credit_limit) || 0
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (creditLimit < 0) {
      setError('El límite de crédito no puede ser negativo');
      return;
    }

    const currentDebt = parseFloat(customer.pending_debt) || 0;
    if (creditLimit < currentDebt && creditLimit > 0) {
      setError(`El límite no puede ser menor a la deuda actual (${formatCurrency(currentDebt)})`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await customerService.update(customer.id, {
        credit_limit: creditLimit
      });
      onSubmit();
    } catch (err) {
      setError(err.message || 'Error al actualizar el límite de crédito');
    } finally {
      setLoading(false);
    }
  };

  const currentDebt = parseFloat(customer.pending_debt) || 0;
  const currentLimit = parseFloat(customer.credit_limit) || 0;

  return (
    <div className="credits-modal-overlay" onClick={onClose}>
      <div className="credits-modal" onClick={(e) => e.stopPropagation()}>
        <div className="credits-modal-header">
          <h2 className="credits-modal-title">
            💳 Configurar Límite de Crédito
          </h2>
          <button className="credits-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="credits-modal-body">
          <div className="credits-customer-info">
            <div className="credits-customer-info-row">
              <span className="credits-customer-info-label">Cliente:</span>
              <span className="credits-customer-info-value">
                {customer.full_name}
              </span>
            </div>
            <div className="credits-customer-info-row">
              <span className="credits-customer-info-label">Teléfono:</span>
              <span className="credits-customer-info-value">
                {customer.phone || 'No registrado'}
              </span>
            </div>
            <div className="credits-customer-info-row">
              <span className="credits-customer-info-label">Límite actual:</span>
              <span className="credits-customer-info-value">
                {currentLimit > 0 ? formatCurrency(currentLimit) : 'Sin crédito'}
              </span>
            </div>
            {currentDebt > 0 && (
              <div className="credits-customer-info-row">
                <span className="credits-customer-info-label">Deuda actual:</span>
                <span className="credits-customer-info-value" style={{ color: '#ef4444' }}>
                  {formatCurrency(currentDebt)}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form className="credits-form" onSubmit={handleSubmit}>
            <div className="credits-form-group">
              <label className="credits-form-label">Nuevo límite de crédito (S/)</label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                className="credits-form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
              <small style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                Ingrese 0 para deshabilitar el crédito del cliente
              </small>
            </div>

            <div className="credits-form-group">
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                {[100, 200, 500, 1000, 2000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setCreditLimit(amount)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      background: creditLimit === amount ? '#3b82f6' : '#f8fafc',
                      color: creditLimit === amount ? 'white' : '#64748b',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    S/ {amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="credits-form-actions">
              <button
                type="button"
                onClick={onClose}
                className="credits-form-btn credits-form-btn--secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="credits-form-btn credits-form-btn--primary"
              >
                {loading ? 'Guardando...' : 'Guardar Límite'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
