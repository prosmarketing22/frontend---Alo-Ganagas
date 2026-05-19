import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import '../../styles/components/maintenance.css';

export const MaintenanceRequestTable = ({ requests = [], loading, totalCount = 0 }) => {
  const formatRelativeDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: es
      });
    } catch {
      return '-';
    }
  };

  const formatFullDate = (date) => {
    try {
      return format(new Date(date), "dd MMM yyyy", { locale: es });
    } catch {
      return '-';
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      URGENTE: { bg: '#fee2e2', color: '#dc2626', text: 'Urgente' },
      ALTA: { bg: '#fef3c7', color: '#d97706', text: 'Alta' },
      NORMAL: { bg: '#dbeafe', color: '#2563eb', text: 'Normal' }
    };
    const style = styles[priority] || styles.NORMAL;
    return (
      <span
        className="maintenance-priority-badge"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {style.text}
      </span>
    );
  };

  const getRequestTypeBadge = (type) => {
    const types = {
      preventivo: { bg: '#d1fae5', color: '#059669', text: 'Preventivo' },
      correctivo: { bg: '#fee2e2', color: '#dc2626', text: 'Correctivo' },
      urgente: { bg: '#fef3c7', color: '#d97706', text: 'Urgente' }
    };
    const style = types[type?.toLowerCase()] || { bg: '#e5e7eb', color: '#6b7280', text: type || 'General' };
    return (
      <span
        className="maintenance-type-badge"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {style.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="maintenance-table-container">
        <div className="maintenance-table-loading">
          <div className="maintenance-loading-spinner"></div>
          <span className="maintenance-loading-text">Cargando solicitudes de mantenimiento...</span>
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="maintenance-table-container">
        <div className="maintenance-table-empty">
          <div className="maintenance-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <p className="maintenance-empty-title">No hay solicitudes pendientes</p>
          <p className="maintenance-empty-text">
            No hay solicitudes de mantenimiento enviadas por los clientes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-table-container">
      <div className="maintenance-table-header">
        <div className="maintenance-table-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="M9 14l2 2 4-4" />
          </svg>
          Solicitudes de Mantenimiento Pendientes
          <span className="maintenance-table-count">{totalCount}</span>
        </div>
      </div>

      <div className="maintenance-table-wrapper">
        <table className="maintenance-table">
          <thead>
            <tr>
              <th>N° Solicitud</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Prioridad</th>
              <th>Fecha Solicitud</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>
                  <span className="maintenance-request-number">
                    {request.request_number}
                  </span>
                </td>
                <td>
                  <div className="maintenance-customer">
                    <span className="maintenance-customer-name">
                      {request.customer_name}{request.address ? ` (${request.address}${request.district ? `, ${request.district}` : ''})` : ''}
                    </span>
                    <span className="maintenance-customer-phone">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {request.customer_phone || '-'}
                    </span>
                  </div>
                </td>
                <td>
                  {getRequestTypeBadge(request.request_type)}
                </td>
                <td>
                  <div className="maintenance-description">
                    <span className="maintenance-description-text" title={request.description}>
                      {request.description?.length > 50
                        ? `${request.description.substring(0, 50)}...`
                        : request.description || '-'}
                    </span>
                  </div>
                </td>
                <td>
                  {getPriorityBadge(request.priority)}
                </td>
                <td>
                  {request.request_datetime ? (
                    <div className="maintenance-date">
                      <span className="maintenance-date-main">
                        {formatFullDate(request.request_datetime)}
                      </span>
                      <span className="maintenance-date-relative">
                        {formatRelativeDate(request.request_datetime)}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--color-neutral-400)' }}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
