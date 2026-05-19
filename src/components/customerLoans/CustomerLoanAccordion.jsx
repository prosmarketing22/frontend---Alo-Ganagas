import { useState, useEffect } from 'react';
import { useCustomerLoanApi } from '../../hooks/useApi/useCustomerLoanApi';
import { getContainerLabel } from '../../utils/constants';
import './CustomerLoanAccordion.css';

export const CustomerLoanAccordion = ({ onRegisterReturn, onNewLoan, refreshTrigger }) => {
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [filters, setFilters] = useState({ search: '', debt_type: '' });
  const [customers, setCustomers] = useState([]);
  const [localError, setLocalError] = useState(null);

  const { getGroupedByCustomer, loading } = useCustomerLoanApi();

  useEffect(() => {
    loadGroupedData();
  }, [refreshTrigger]);

  const loadGroupedData = async (searchFilters = filters) => {
    setLocalError(null);
    try {
      const data = await getGroupedByCustomer(searchFilters);
      setCustomers(data || []);
    } catch (err) {
      console.error('Error al cargar datos agrupados:', err);
      setLocalError(err.message || 'Error al cargar los préstamos');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadGroupedData(filters);
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    if (field === 'debt_type') {
      loadGroupedData(newFilters);
    }
  };

  const handleClearFilters = () => {
    const cleared = { search: '', debt_type: '' };
    setFilters(cleared);
    loadGroupedData(cleared);
  };

  const toggleCustomer = (customerId) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loan-accordion">
        <div className="loan-accordion__loading">
          <div className="loan-accordion__spinner"></div>
          <p>Cargando préstamos de clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loan-accordion">
      <div className="loan-accordion__header">
        <form onSubmit={handleSearch} className="loan-accordion__filters">
          <div className="loan-accordion__search-group">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar cliente..."
              className="loan-accordion__search-input"
            />
            <button type="submit" className="loan-accordion__search-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>
          <select
            value={filters.debt_type}
            onChange={(e) => handleFilterChange('debt_type', e.target.value)}
            className="loan-accordion__filter-select"
          >
            <option value="">Todos los tipos</option>
            <option value="NOS_DEBEN">Nos deben</option>
            <option value="DEBEMOS">Les debemos</option>
          </select>
          {(filters.search || filters.debt_type) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="loan-accordion__clear-btn"
            >
              Limpiar
            </button>
          )}
        </form>
        <button onClick={onNewLoan} className="loan-accordion__new-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo Préstamo
        </button>
      </div>

      {localError && (
        <div className="loan-accordion__error">
          <span className="loan-accordion__error-icon">⚠️</span>
          <span>{localError}</span>
        </div>
      )}

      {!loading && customers.length === 0 && !localError ? (
        <div className="loan-accordion__empty">
          <div className="loan-accordion__empty-icon">📋</div>
          <p>No hay registros de préstamos de clientes</p>
        </div>
      ) : customers.length === 0 ? null : (
        <div className="loan-accordion__list">
          {customers.map(customer => (
            <div
              key={customer.customer_id}
              className={`loan-accordion__item ${expandedCustomer === customer.customer_id ? 'loan-accordion__item--expanded' : ''}`}
            >
              <div
                className="loan-accordion__customer-header"
                onClick={() => toggleCustomer(customer.customer_id)}
              >
                <div className="loan-accordion__customer-info">
                  <div className="loan-accordion__expand-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {expandedCustomer === customer.customer_id
                        ? <polyline points="6 9 12 15 18 9"/>
                        : <polyline points="9 6 15 12 9 18"/>
                      }
                    </svg>
                  </div>
                  <div className={`loan-accordion__customer-avatar ${customer.total_pending === 0 ? 'loan-accordion__customer-avatar--settled' : ''}`}>
                    {customer.total_pending === 0 ? '✓' : customer.customer_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="loan-accordion__customer-details">
                    <div className="loan-accordion__customer-name-row">
                      <span className="loan-accordion__customer-name">{customer.customer_name}</span>
                      {customer.total_pending === 0 && (
                        <span className="loan-accordion__settled-badge">Al día</span>
                      )}
                    </div>
                    <span className="loan-accordion__customer-phone">{customer.customer_phone || 'Sin teléfono'}</span>
                    {customer.customer_address && (
                      <span className="loan-accordion__customer-address">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {customer.customer_address}
                      </span>
                    )}
                  </div>
                </div>

                <div className="loan-accordion__customer-summary">
                  {customer.summary_by_type.map((item, idx) => (
                    <div key={idx} className="loan-accordion__product-badge">
                      <span className="loan-accordion__product-name">{getContainerLabel(item.container_type)}</span>
                      <span className={`loan-accordion__product-qty ${item.debt_type === 'NOS_DEBEN' ? 'loan-accordion__product-qty--nos-deben' : 'loan-accordion__product-qty--debemos'}`}>
                        {item.debt_type === 'NOS_DEBEN' ? '+' : '-'}{item.pending}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="loan-accordion__customer-total">
                  {customer.total_pending > 0 ? (
                    <>
                      <span className="loan-accordion__total-label">Total pendiente:</span>
                      <span className="loan-accordion__total-value">{customer.total_pending} unid.</span>
                    </>
                  ) : (
                    <>
                      <span className="loan-accordion__total-label">Total préstamos:</span>
                      <span className="loan-accordion__total-value loan-accordion__total-value--settled">{customer.total_loans || 0}</span>
                    </>
                  )}
                </div>

                <div className="loan-accordion__customer-actions" onClick={e => e.stopPropagation()}>
                  {customer.pending_loans && customer.pending_loans.length > 0 && (
                    <button
                      onClick={() => {
                        const enrichedLoans = customer.pending_loans.map(loan => ({
                          ...loan,
                          customer_name: customer.customer_name
                        }));
                        const containerTypes = [...new Set(enrichedLoans.map(l => l.container_type))];
                        if (containerTypes.length > 1) {
                          onRegisterReturn({ pendingLoans: enrichedLoans, customer_name: customer.customer_name, selectType: true });
                        } else {
                          onRegisterReturn(enrichedLoans[0]);
                        }
                      }}
                      className="loan-accordion__action-btn loan-accordion__action-btn--return"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="1 4 1 10 7 10"/>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                      </svg>
                      Registrar Devolución
                    </button>
                  )}
                </div>
              </div>

              {expandedCustomer === customer.customer_id && (
                <div className="loan-accordion__content">
                  <div className="loan-accordion__section">
                    <h4 className="loan-accordion__section-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                        <line x1="9" y1="21" x2="9" y2="9"/>
                      </svg>
                      Resumen por Tipo de Envase
                    </h4>
                    <div className="loan-accordion__summary-grid">
                      {customer.summary_by_type.map((item, idx) => (
                        <div key={idx} className={`loan-accordion__summary-card ${item.debt_type === 'NOS_DEBEN' ? 'loan-accordion__summary-card--nos-deben' : 'loan-accordion__summary-card--debemos'}`}>
                          <div className="loan-accordion__summary-product">{getContainerLabel(item.container_type)}</div>
                          <div className="loan-accordion__summary-type">
                            {item.debt_type === 'NOS_DEBEN' ? 'Nos debe' : 'Le debemos'}
                          </div>
                          <div className="loan-accordion__summary-stats">
                            <div className="loan-accordion__stat">
                              <span className="loan-accordion__stat-label">Prestado</span>
                              <span className="loan-accordion__stat-value">{item.total_quantity}</span>
                            </div>
                            <div className="loan-accordion__stat">
                              <span className="loan-accordion__stat-label">Devuelto</span>
                              <span className="loan-accordion__stat-value">{item.total_returned}</span>
                            </div>
                            <div className="loan-accordion__stat loan-accordion__stat--highlight">
                              <span className="loan-accordion__stat-label">Pendiente</span>
                              <span className="loan-accordion__stat-value">{item.pending}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="loan-accordion__section">
                    <h4 className="loan-accordion__section-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      Historial de Movimientos
                    </h4>
                    <div className="loan-accordion__history">
                      <table className="loan-accordion__history-table">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Tipo Envase</th>
                            <th>Cantidad</th>
                            <th>Tipo Deuda</th>
                            <th>Responsable</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customer.history.map((item, idx) => (
                            <tr key={idx} className={`loan-accordion__history-row loan-accordion__history-row--${item.movement_type.toLowerCase()}`}>
                              <td>
                                <span className="loan-accordion__history-date">{formatDate(item.date)}</span>
                              </td>
                              <td>
                                <span className={`loan-accordion__movement-badge loan-accordion__movement-badge--${item.movement_type.toLowerCase()}`}>
                                  {item.movement_type === 'PRESTAMO' ? 'Préstamo' : 'Devolución'}
                                </span>
                              </td>
                              <td>
                                <span className="loan-accordion__history-product">{getContainerLabel(item.container_type)}</span>
                              </td>
                              <td>
                                <span className={`loan-accordion__history-qty ${item.movement_type === 'PRESTAMO' ? 'loan-accordion__history-qty--out' : 'loan-accordion__history-qty--in'}`}>
                                  {item.movement_type === 'PRESTAMO' ? '-' : '+'}{item.quantity}
                                </span>
                              </td>
                              <td>
                                <span className={`loan-accordion__debt-type ${item.debt_type === 'NOS_DEBEN' ? 'loan-accordion__debt-type--nos-deben' : 'loan-accordion__debt-type--debemos'}`}>
                                  {item.debt_type === 'NOS_DEBEN' ? 'Nos debe' : 'Le debemos'}
                                </span>
                              </td>
                              <td>
                                <span className="loan-accordion__history-user">
                                  {item.movement_type === 'PRESTAMO'
                                    ? (item.registered_by_name || '-')
                                    : (item.returned_by_name || '-')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="loan-accordion__section">
                    <h4 className="loan-accordion__section-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      Préstamos Activos ({customer.pending_loans.length})
                    </h4>
                    {customer.pending_loans.length === 0 ? (
                      <p className="loan-accordion__no-pending">No hay préstamos pendientes</p>
                    ) : (
                      <div className="loan-accordion__pending-list">
                        {customer.pending_loans.map(loan => (
                          <div key={loan.id} className={`loan-accordion__pending-card ${loan.debt_type === 'NOS_DEBEN' ? 'loan-accordion__pending-card--nos-deben' : 'loan-accordion__pending-card--debemos'}`}>
                            <div className="loan-accordion__pending-info">
                              <div className="loan-accordion__pending-product">{getContainerLabel(loan.container_type)}</div>
                              <div className="loan-accordion__pending-meta">
                                <span>Fecha: {formatDateShort(loan.loan_date)}</span>
                                <span className={loan.debt_type === 'NOS_DEBEN' ? 'text-red' : 'text-blue'}>
                                  {loan.debt_type === 'NOS_DEBEN' ? 'Nos debe' : 'Le debemos'}
                                </span>
                              </div>
                            </div>
                            <div className="loan-accordion__pending-stats">
                              <div className="loan-accordion__pending-stat">
                                <span className="loan-accordion__pending-label">Prestado</span>
                                <span className="loan-accordion__pending-value">{loan.quantity}</span>
                              </div>
                              <div className="loan-accordion__pending-stat">
                                <span className="loan-accordion__pending-label">Devuelto</span>
                                <span className="loan-accordion__pending-value">{loan.quantity_returned}</span>
                              </div>
                              <div className="loan-accordion__pending-stat loan-accordion__pending-stat--highlight">
                                <span className="loan-accordion__pending-label">Pendiente</span>
                                <span className="loan-accordion__pending-value">{loan.quantity - loan.quantity_returned}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => onRegisterReturn({ ...loan, customer_name: customer.customer_name })}
                              className="loan-accordion__pending-action"
                            >
                              Devolver
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
