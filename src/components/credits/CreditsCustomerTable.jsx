export const CreditsCustomerTable = ({
  customers,
  loading,
  pagination,
  onPageChange,
  onViewHistory,
  onRegisterPayment,
  onEditLimit
}) => {
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (customer) => {
    const limit = parseFloat(customer.credit_limit) || 0;
    const debt = parseFloat(customer.pending_debt) || 0;

    if (limit === 0) {
      return { label: 'Sin crédito', variant: 'none', icon: '⚪' };
    }
    if (debt === 0) {
      return { label: 'Disponible', variant: 'available', icon: '🟢' };
    }
    if (debt >= limit) {
      return { label: 'Límite alcanzado', variant: 'full', icon: '🔴' };
    }
    return { label: 'Con deuda', variant: 'debt', icon: '🟡' };
  };

  if (loading && customers.length === 0) {
    return (
      <div className="credits-table-container">
        <div className="credits-loading">
          <div className="credits-spinner" />
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="credits-table-container">
        <div className="credits-empty">
          <div className="credits-empty-icon">📋</div>
          <div className="credits-empty-text">No se encontraron clientes con los filtros aplicados</div>
        </div>
      </div>
    );
  }

  return (
    <div className="credits-table-container">
      <div className="credits-table-header">
        <h3 className="credits-table-title">Clientes con Crédito</h3>
        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
          {pagination.total} cliente{pagination.total !== 1 ? 's' : ''}
        </span>
      </div>

      <table className="credits-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Límite</th>
            <th>Consumido</th>
            <th>Disponible</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => {
            const limit = parseFloat(customer.credit_limit) || 0;
            const debt = parseFloat(customer.pending_debt) || 0;
            const available = Math.max(0, limit - debt);
            const status = getStatusBadge(customer);

            return (
              <tr key={customer.id}>
                <td>
                  <div className="credits-customer-name">{customer.full_name}</div>
                  <div className="credits-customer-phone">{customer.phone}</div>
                  {customer.address && (
                    <div className="credits-customer-address">{customer.address}</div>
                  )}
                </td>
                <td>
                  <span className="credits-amount credits-amount--limit">
                    {formatCurrency(limit)}
                  </span>
                </td>
                <td>
                  <span className={`credits-amount ${debt > 0 ? 'credits-amount--debt' : ''}`}>
                    {limit > 0 ? formatCurrency(debt) : '---'}
                  </span>
                </td>
                <td>
                  <span className={`credits-amount ${available > 0 ? 'credits-amount--available' : ''}`}>
                    {limit > 0 ? formatCurrency(available) : '---'}
                  </span>
                </td>
                <td>
                  <span className={`credits-status-badge credits-status-badge--${status.variant}`}>
                    <span>{status.icon}</span>
                    {status.label}
                  </span>
                </td>
                <td>
                  <div className="credits-actions">
                    {limit > 0 && (
                      <button
                        onClick={() => onViewHistory(customer)}
                        className="credits-action-btn credits-action-btn--view"
                        title="Ver historial"
                      >
                        📋
                      </button>
                    )}
                    {debt > 0 && (
                      <button
                        onClick={() => onRegisterPayment(customer)}
                        className="credits-action-btn credits-action-btn--pay"
                        title="Registrar pago"
                      >
                        💰
                      </button>
                    )}
                    <button
                      onClick={() => onEditLimit(customer)}
                      className="credits-action-btn credits-action-btn--edit"
                      title={limit > 0 ? "Editar límite" : "Configurar límite"}
                    >
                      ✏️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {pagination.totalPages > 1 && (
        <div className="credits-pagination">
          <button
            className="credits-pagination-btn"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            ← Anterior
          </button>
          <span className="credits-pagination-info">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            className="credits-pagination-btn"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};
