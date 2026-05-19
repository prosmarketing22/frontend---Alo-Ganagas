import { getContainerLabel } from '../../utils/constants';

export const CustomerLoanTable = ({ data, onViewDetails, onRegisterReturn, loading }) => {
  const getRowClass = (debtType) => {
    return debtType === 'NOS_DEBEN'
      ? 'loan-table-row loan-table-row--nos-deben'
      : 'loan-table-row loan-table-row--debemos';
  };

  const getStatusBadge = (status) => {
    const config = {
      1: { label: 'Pendiente', class: 'loan-badge--pendiente' },
      2: { label: 'Parcial', class: 'loan-badge--parcial' },
      3: { label: 'Devuelto', class: 'loan-badge--devuelto' },
      0: { label: 'Anulado', class: 'loan-badge--anulado' }
    };
    const c = config[status] || config[1];
    return (
      <span className={`loan-badge ${c.class}`}>
        {c.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loan-table-container">
        <div className="loan-table-loading">
          <div className="loan-loading-spinner"></div>
          <p className="loan-loading-text">Cargando prestamos de clientes...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="loan-table-container">
        <div className="loan-table-empty">
          <div className="loan-empty-icon">📋</div>
          <p className="loan-empty-text">No se encontraron prestamos de clientes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loan-table-container">
      <div className="loan-table-wrapper">
        <table className="loan-table">
          <thead>
            <tr>
              <th>Tipo Envase</th>
              <th>Almacen</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Devuelto</th>
              <th>Pendiente</th>
              <th>Fecha</th>
              <th>Responsable</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map(loan => {
              const pending = loan.quantity - loan.quantity_returned;
              return (
                <tr key={loan.id} className={getRowClass(loan.debt_type)}>
                  <td>
                    <div className="loan-table-product">
                      <div className="loan-table-product-name">{getContainerLabel(loan.container_type)}</div>
                    </div>
                  </td>
                  <td>
                    <span className="loan-table-warehouse">{loan.warehouse_name || '-'}</span>
                  </td>
                  <td>
                    <span className="loan-table-debtor">{loan.customer_name || '-'}</span>
                  </td>
                  <td>
                    <span className={`loan-type ${loan.debt_type === 'NOS_DEBEN' ? 'loan-type--nos-deben' : 'loan-type--debemos'}`}>
                      {loan.debt_type === 'NOS_DEBEN' ? 'Nos deben' : 'Debemos'}
                    </span>
                  </td>
                  <td>
                    <span className="loan-table-quantity">{loan.quantity}</span>
                  </td>
                  <td>
                    <span className="loan-table-returned">{loan.quantity_returned}</span>
                  </td>
                  <td>
                    <span className="loan-table-pending">{pending}</span>
                  </td>
                  <td>
                    <span className="loan-table-date">{formatDate(loan.loan_date)}</span>
                  </td>
                  <td>
                    <span className="loan-table-responsible">{loan.registered_by_name || '-'}</span>
                  </td>
                  <td>
                    {getStatusBadge(loan.status)}
                  </td>
                  <td>
                    <div className="loan-table-actions">
                      {onViewDetails && (
                        <button
                          onClick={() => onViewDetails(loan)}
                          className="loan-action-btn loan-action-btn--view"
                        >
                          Ver
                        </button>
                      )}
                      {loan.status !== 3 && loan.status !== 0 && (
                        <button
                          onClick={() => onRegisterReturn(loan)}
                          className="loan-action-btn loan-action-btn--return"
                        >
                          Devolver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
