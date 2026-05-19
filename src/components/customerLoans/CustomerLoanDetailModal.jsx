import { useState, useEffect } from 'react';
import { customerLoanService } from '../../services/customerLoanService';
import { getContainerLabel } from '../../utils/constants';

export const CustomerLoanDetailModal = ({ loan, isOpen, onClose }) => {
  const [returnsHistory, setReturnsHistory] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);

  useEffect(() => {
    if (isOpen && loan?.id) {
      loadReturnsHistory();
    }
  }, [isOpen, loan?.id]);

  const loadReturnsHistory = async () => {
    setLoadingReturns(true);
    try {
      const response = await customerLoanService.getReturnsHistory(loan.id);
      setReturnsHistory(response.data || []);
    } catch (error) {
      console.error('Error al cargar historial de devoluciones:', error);
    } finally {
      setLoadingReturns(false);
    }
  };

  if (!isOpen || !loan) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    const config = {
      1: { label: 'Pendiente', class: 'loan-detail-status--pendiente' },
      2: { label: 'Parcial', class: 'loan-detail-status--parcial' },
      3: { label: 'Devuelto', class: 'loan-detail-status--devuelto' },
      0: { label: 'Anulado', class: 'loan-detail-status--anulado' }
    };
    return config[status] || config[1];
  };

  const pending = loan.quantity - loan.quantity_returned;
  const statusConfig = getStatusConfig(loan.status);
  const progress = loan.quantity > 0 ? (loan.quantity_returned / loan.quantity) * 100 : 0;

  return (
    <div className="loan-modal-overlay" onClick={onClose}>
      <div className="loan-modal loan-modal--detail" onClick={(e) => e.stopPropagation()}>
        <div className="loan-modal-header">
          <h2 className="loan-modal-title">
            <span className="loan-modal-title-icon">📋</span>
            Detalle del Préstamo #{loan.id}
          </h2>
          <button onClick={onClose} className="loan-modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="loan-modal-body">
          <div className="loan-detail-header">
            <span className={`loan-detail-type ${loan.debt_type === 'NOS_DEBEN' ? 'loan-detail-type--nos-deben' : 'loan-detail-type--debemos'}`}>
              {loan.debt_type === 'NOS_DEBEN' ? '📤 Nos Deben' : '📥 Debemos'}
            </span>
            <span className={`loan-detail-status ${statusConfig.class}`}>
              {statusConfig.label}
            </span>
          </div>

          <div className="loan-detail-grid">
            <div className="loan-detail-section">
              <h3 className="loan-detail-section-title">Tipo de Envase</h3>
              <div className="loan-detail-card">
                <div className="loan-detail-row">
                  <span className="loan-detail-label">Tipo:</span>
                  <span className="loan-detail-value loan-detail-value--highlight">{getContainerLabel(loan.container_type)}</span>
                </div>
              </div>
            </div>

            <div className="loan-detail-section">
              <h3 className="loan-detail-section-title">Cliente</h3>
              <div className="loan-detail-card">
                <div className="loan-detail-row">
                  <span className="loan-detail-label">Nombre:</span>
                  <span className="loan-detail-value loan-detail-value--highlight">{loan.customer_name || '-'}</span>
                </div>
                <div className="loan-detail-row">
                  <span className="loan-detail-label">DNI:</span>
                  <span className="loan-detail-value">{loan.customer_dni || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="loan-detail-section">
            <h3 className="loan-detail-section-title">Cantidades</h3>
            <div className="loan-detail-quantities">
              <div className="loan-detail-quantity-item">
                <span className="loan-detail-quantity-value">{loan.quantity}</span>
                <span className="loan-detail-quantity-label">Prestados</span>
              </div>
              <div className="loan-detail-quantity-item loan-detail-quantity-item--returned">
                <span className="loan-detail-quantity-value">{loan.quantity_returned}</span>
                <span className="loan-detail-quantity-label">Devueltos</span>
              </div>
              <div className="loan-detail-quantity-item loan-detail-quantity-item--pending">
                <span className="loan-detail-quantity-value">{pending}</span>
                <span className="loan-detail-quantity-label">Pendientes</span>
              </div>
            </div>
            <div className="loan-detail-progress">
              <div className="loan-detail-progress-bar">
                <div
                  className="loan-detail-progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="loan-detail-progress-text">{progress.toFixed(0)}% devuelto</span>
            </div>
          </div>

          <div className="loan-detail-grid">
            <div className="loan-detail-section">
              <h3 className="loan-detail-section-title">Fechas</h3>
              <div className="loan-detail-card">
                <div className="loan-detail-row">
                  <span className="loan-detail-label">Fecha de préstamo:</span>
                  <span className="loan-detail-value">{formatDate(loan.loan_date)}</span>
                </div>
                {loan.return_date && (
                  <div className="loan-detail-row">
                    <span className="loan-detail-label">Fecha de devolución:</span>
                    <span className="loan-detail-value">{formatDate(loan.return_date)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="loan-detail-section">
              <h3 className="loan-detail-section-title">Registro</h3>
              <div className="loan-detail-card">
                <div className="loan-detail-row">
                  <span className="loan-detail-label">Almacen:</span>
                  <span className="loan-detail-value loan-detail-value--highlight">{loan.warehouse_name || '-'}</span>
                </div>
                <div className="loan-detail-row">
                  <span className="loan-detail-label">Registrado por:</span>
                  <span className="loan-detail-value">{loan.registered_by_name || '-'}</span>
                </div>
                {loan.order_id && (
                  <div className="loan-detail-row">
                    <span className="loan-detail-label">Pedido asociado:</span>
                    <span className="loan-detail-value">#{loan.order_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loan.notes && (
            <div className="loan-detail-section">
              <h3 className="loan-detail-section-title">Notas</h3>
              <div className="loan-detail-notes">
                {loan.notes}
              </div>
            </div>
          )}

          {/* Historial de Devoluciones */}
          {loan.quantity_returned > 0 && (
            <div className="loan-detail-section">
              <h3 className="loan-detail-section-title">📦 Historial de Devoluciones</h3>
              {loadingReturns ? (
                <div className="loan-detail-loading">Cargando historial...</div>
              ) : returnsHistory.length === 0 ? (
                <div className="loan-detail-empty">No hay registros de devoluciones</div>
              ) : (
                <div className="loan-detail-returns-list">
                  {returnsHistory.map((ret) => (
                    <div key={ret.id} className="loan-detail-return-item">
                      <div className="loan-detail-return-header">
                        <span className="loan-detail-return-quantity">
                          {ret.quantity_returned} unidad{ret.quantity_returned > 1 ? 'es' : ''}
                        </span>
                        <span className="loan-detail-return-date">
                          {formatDate(ret.date_time_registration)}
                        </span>
                      </div>
                      <div className="loan-detail-return-by">
                        <span className="loan-detail-return-label">🚚 Repartidor:</span>
                        <span className="loan-detail-return-name">
                          {ret.returned_by_name || 'No registrado'}
                        </span>
                      </div>
                      {ret.notes && (
                        <div className="loan-detail-return-notes">
                          📝 {ret.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="loan-modal-footer">
          <button onClick={onClose} className="loan-btn loan-btn--secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
