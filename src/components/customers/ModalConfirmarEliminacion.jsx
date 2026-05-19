import { useState, useEffect } from 'react';
import { useCustomerApi } from '../../hooks/useApi/useCustomerApi';

export const ModalConfirmarEliminacion = ({ customer, isOpen, onClose, onConfirm }) => {
  const { checkPendingLoans, loading } = useCustomerApi();
  const [loansData, setLoansData] = useState({ hasPendingLoans: false, loans: [] });
  const [loadingLoans, setLoadingLoans] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      loadPendingLoans();
    }
  }, [isOpen, customer]);

  const loadPendingLoans = async () => {
    setLoadingLoans(true);
    try {
      const response = await checkPendingLoans(customer.id);
      setLoansData(response || { hasPendingLoans: false, loans: [] });
    } catch (err) {
      console.error('Error al cargar préstamos pendientes:', err);
      setLoansData({ hasPendingLoans: false, loans: [] });
    } finally {
      setLoadingLoans(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(customer.id);
  };

  if (!isOpen) return null;

  return (
    <div className="customers-modal-overlay">
      <div className="customers-modal customers-modal--confirm-delete">
        <div className="customers-modal-header">
          <h2 className="customers-modal-title">
            <span className="customers-modal-title-icon">⚠️</span>
            Confirmar Eliminación
          </h2>
          <button onClick={onClose} className="customers-modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="customers-modal-body">
          {loadingLoans ? (
            <div className="customers-modal-loading">
              <div className="customers-spinner"></div>
              <span>Verificando información del cliente...</span>
            </div>
          ) : (
            <>
              <div className="delete-confirm-warning">
                <div className="delete-confirm-warning-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <h3 className="delete-confirm-title">
                  ¿Está seguro de eliminar a este cliente?
                </h3>
                <p className="delete-confirm-customer">
                  {customer?.full_name}
                </p>
                <p className="delete-confirm-description">
                  Esta acción es permanente. El cliente no podrá acceder a su cuenta ni ser reactivado.
                </p>
              </div>

              {loansData.hasPendingLoans && loansData.loans.length > 0 && (
                <div className="delete-confirm-loans-alert">
                  <div className="delete-confirm-loans-header">
                    <span className="delete-confirm-loans-icon">🚨</span>
                    <h4 className="delete-confirm-loans-title">
                      Este cliente tiene préstamos pendientes ({loansData.pendingLoansCount})
                    </h4>
                  </div>
                  <div className="delete-confirm-loans-list">
                    {loansData.loans.map((loan, index) => (
                      <div key={loan.id || index} className="delete-confirm-loan-item">
                        <div className="delete-confirm-loan-type">
                          <span className={`delete-confirm-loan-badge ${loan.debt_type === 'NOS_DEBEN' ? 'delete-confirm-loan-badge--positive' : 'delete-confirm-loan-badge--negative'}`}>
                            {loan.debt_type === 'NOS_DEBEN' ? 'NOS DEBE' : 'LE DEBEMOS'}
                          </span>
                        </div>
                        <div className="delete-confirm-loan-details">
                          <span className="delete-confirm-loan-product">
                            {loan.product_name || 'Producto'}
                          </span>
                          <span className="delete-confirm-loan-quantity">
                            Pendiente: <strong>{loan.quantity - (loan.quantity_returned || 0)}</strong> unidades
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="delete-confirm-loans-warning">
                    Asegúrese de resolver estos préstamos antes de eliminar al cliente para mantener la integridad de sus registros.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="customers-modal-footer">
          <button
            onClick={onClose}
            className="customers-btn customers-btn--secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="customers-btn customers-btn--danger"
            disabled={loading || loadingLoans}
          >
            {loading ? 'Eliminando...' : 'Eliminar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
};
