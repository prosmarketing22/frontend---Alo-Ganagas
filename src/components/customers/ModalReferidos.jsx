import { useState, useEffect } from 'react';
import { useCustomerApi } from '../../hooks/useApi/useCustomerApi';
import { BadgeNivel } from './BadgeNivel';

export const ModalReferidos = ({ customer, isOpen, onClose }) => {
  const { getReferrals, loading } = useCustomerApi();
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    if (isOpen && customer) {
      loadReferrals();
    }
  }, [isOpen, customer]);

  const loadReferrals = async () => {
    try {
      const data = await getReferrals(customer.id);
      setReferrals(data);
    } catch (err) {
      console.error('Error al cargar referidos:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin compras';
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  if (!isOpen) return null;

  return (
    <div className="customers-modal-overlay">
      <div className="customers-modal customers-modal--lg">
        <div className="customers-modal-header">
          <h2 className="customers-modal-title">
            <span className="customers-modal-title-icon">👥</span>
            Referidos de {customer?.full_name}
          </h2>
          <button onClick={onClose} className="customers-modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="customers-modal-body">
          {loading ? (
            <div className="customers-modal-loading">
              <div className="customers-spinner"></div>
              <span>Cargando referidos...</span>
            </div>
          ) : referrals.length === 0 ? (
            <div className="customers-modal-empty">
              <span className="customers-modal-empty-icon">🔍</span>
              <p>Este cliente no tiene referidos</p>
            </div>
          ) : (
            <>
              <div className="customers-referrals-summary">
                <span className="customers-referrals-summary-label">Total de referidos:</span>
                <span className="customers-referrals-summary-value">{referrals.length}</span>
              </div>

              <div className="customers-modal-table-wrapper">
                <table className="customers-referrals-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Telefono</th>
                      <th>Nivel</th>
                      <th>Saldo GANAGAS</th>
                      <th>Primera Compra</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((referral) => (
                      <tr key={referral.id}>
                        <td>
                          <div className="customers-referral-info">
                            <span className="customers-referral-name">{referral.full_name}</span>
                            <span className="customers-referral-email">{referral.email}</span>
                          </div>
                        </td>
                        <td>{referral.phone || '-'}</td>
                        <td>
                          <BadgeNivel nivel={referral.loyalty_level} />
                        </td>
                        <td className="customers-referral-balance">
                          S/ {parseFloat(referral.ganagas_balance || 0).toFixed(2)}
                        </td>
                        <td>{formatDate(referral.first_purchase_date)}</td>
                        <td>
                          <span className={`customers-status ${referral.status === 'active' ? 'customers-status--active' : 'customers-status--inactive'}`}>
                            {referral.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="customers-modal-footer">
          <button onClick={onClose} className="customers-btn customers-btn--secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
