import { BadgeNivel } from './BadgeNivel';

export const CustomerTable = ({ data, onEdit, onDelete, onViewReferrals, onViewPrices, onToggleStatus, loading }) => {
  const formatCurrency = (value) => {
    return `S/ ${parseFloat(value || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  if (loading) {
    return (
      <div className="customers-table-loading">
        <div className="customers-spinner"></div>
        <span>Cargando clientes...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="customers-table-empty">
        <span className="customers-table-empty-icon">👤</span>
        <p>No se encontraron clientes</p>
      </div>
    );
  }

  return (
    <div className="customers-table-container">
      <table className="customers-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Codigo</th>
            <th>DNI</th>
            <th>Tipo</th>
            <th>Telefono</th>
            <th>Nivel</th>
            <th>Saldo GANAGAS</th>
            <th>Referidos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((customer) => (
            <tr key={customer.id}>
              <td>
                <div className="customers-info">
                  <span className="customers-info-name">{customer.full_name}</span>
                  <span className="customers-info-email">{customer.email}</span>
                  {customer.address && (
                    <span className="customers-info-address" title={customer.address}>
                      {customer.address}{customer.district ? ` - ${customer.district}` : ''}
                    </span>
                  )}
                </div>
              </td>
              <td>
                <span className="customers-referral-code" title="Codigo para compartir">
                  {customer.referral_code || '-'}
                </span>
              </td>
              <td>{customer.dni || '-'}</td>
              <td>
                <span className={`customers-type ${customer.customer_type === 'NEGOCIO' ? 'customers-type--negocio' : ''}`}>
                  {customer.customer_type === 'PERSONA_NATURAL' ? 'Natural' : 'Negocio'}
                </span>
              </td>
              <td>{customer.phone || '-'}</td>
              <td>
                <BadgeNivel nivel={customer.loyalty_level} />
              </td>
              <td className="customers-balance">
                {formatCurrency(customer.ganagas_balance)}
              </td>
              <td>
                <button
                  onClick={() => onViewReferrals(customer)}
                  className="customers-referrals-btn"
                  title="Ver referidos"
                >
                  {customer.active_referrals_count || 0}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </button>
              </td>
              <td>
                <button
                  onClick={() => onToggleStatus(customer)}
                  className={`customers-status-btn ${customer.status === 'active' ? 'customers-status-btn--active' : 'customers-status-btn--inactive'}`}
                  title={customer.status === 'active' ? 'Clic para inactivar' : 'Clic para activar'}
                >
                  {customer.status === 'active' ? 'Activo' : 'Inactivo'}
                </button>
              </td>
              <td>
                <div className="customers-actions">
                  <button
                    onClick={() => onViewPrices(customer)}
                    className="customers-action-btn customers-action-btn--prices"
                    title="Precios especiales"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(customer)}
                    className="customers-action-btn customers-action-btn--edit"
                    title="Editar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(customer)}
                    className="customers-action-btn customers-action-btn--delete"
                    title="Eliminar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
