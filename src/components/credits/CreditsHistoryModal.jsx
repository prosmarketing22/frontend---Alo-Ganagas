import { useEffect, useState } from 'react';
import { useCustomerCreditApi } from '../../hooks/useApi/useCustomerCreditApi';
import { getUploadUrl } from '../../config/api.config';

export const CreditsHistoryModal = ({ customer, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const { loading, fetchByCustomer } = useCustomerCreditApi();

  useEffect(() => {
    loadHistory();
  }, [customer.id]);

  const loadHistory = async () => {
    try {
      const response = await fetchByCustomer(customer.id, { limit: 50 });
      setTransactions(response.transactions || []);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOriginLabel = (origin) => {
    const labels = {
      'VENTA_CREDITO': 'Venta a crédito',
      'PAGO_PARCIAL': 'Pago parcial',
      'PAGO_TOTAL': 'Pago total',
      'AJUSTE_MANUAL': 'Ajuste manual',
      'PAGO_MIXTO': 'Pago mixto (parte crédito)'
    };
    return labels[origin] || origin;
  };

  const limit = parseFloat(customer.credit_limit) || 0;
  const debt = parseFloat(customer.pending_debt) || 0;
  const available = Math.max(0, limit - debt);

  return (
    <div className="credits-modal-overlay" onClick={onClose}>
      <div className="credits-modal credits-modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="credits-modal-header">
          <h2 className="credits-modal-title">
            📋 Historial de Crédito - {customer.full_name}
          </h2>
          <button className="credits-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="credits-modal-body">
          <div className="credits-customer-info">
            <div className="credits-customer-info-row">
              <span className="credits-customer-info-label">Límite de crédito:</span>
              <span className="credits-customer-info-value" style={{ color: '#3b82f6' }}>
                {formatCurrency(limit)}
              </span>
            </div>
            <div className="credits-customer-info-row">
              <span className="credits-customer-info-label">Consumido:</span>
              <span className="credits-customer-info-value" style={{ color: debt > 0 ? '#ef4444' : '#10b981' }}>
                {formatCurrency(debt)}
              </span>
            </div>
            <div className="credits-customer-info-row">
              <span className="credits-customer-info-label">Disponible:</span>
              <span className="credits-customer-info-value" style={{ color: '#10b981' }}>
                {formatCurrency(available)}
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            Movimientos
          </h3>

          {loading ? (
            <div className="credits-loading">
              <div className="credits-spinner" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="credits-empty">
              <div className="credits-empty-icon">📭</div>
              <div className="credits-empty-text">No hay movimientos registrados</div>
            </div>
          ) : (
            <div className="credits-timeline">
              {transactions.map((tx) => (
                <div key={tx.id} className="credits-timeline-item">
                  <div className={`credits-timeline-dot credits-timeline-dot--${tx.transaction_type.toLowerCase()}`} />
                  <div className="credits-timeline-content">
                    <div className="credits-timeline-header">
                      <span className={`credits-timeline-type credits-timeline-type--${tx.transaction_type.toLowerCase()}`}>
                        {tx.transaction_type === 'CARGO' ? '🔴 CARGO' : '🟢 ABONO'} - {getOriginLabel(tx.origin)}
                      </span>
                      <span className="credits-timeline-amount" style={{
                        color: tx.transaction_type === 'CARGO' ? '#ef4444' : '#10b981'
                      }}>
                        {tx.transaction_type === 'CARGO' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </div>
                    {tx.description && (
                      <div className="credits-timeline-description">{tx.description}</div>
                    )}
                    <div className="credits-timeline-meta">
                      <span>📅 {formatDate(tx.date_time_registration)}</span>
                      {tx.collected_by_name && (
                        <span>🚚 Cobrado por: {tx.collected_by_name}</span>
                      )}
                      {tx.registered_by_name && (
                        <span>👤 Registrado por: {tx.registered_by_name}</span>
                      )}
                      {tx.payment_method && <span>💳 {tx.payment_method}</span>}
                      {tx.order_number && <span>📦 {tx.order_number}</span>}
                    </div>
                    <div className="credits-timeline-balance">
                      Saldo: {formatCurrency(tx.previous_debt)} → {formatCurrency(tx.new_debt)}
                    </div>
                    {tx.voucher_path && (
                      <a
                        href={getUploadUrl(tx.voucher_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.5rem', display: 'inline-block' }}
                      >
                        📎 Ver comprobante
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
