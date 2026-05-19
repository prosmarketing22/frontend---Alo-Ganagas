import '../../styles/components/salesHistory.css';

export const SalesSummaryCard = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="sales-summary">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="sales-card sales-card--loading">
            <div className="sales-card-header">
              <span className="sales-card-label">Cargando...</span>
            </div>
            <div className="sales-card-value">---</div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-MX').format(value || 0);
  };

  return (
    <div className="sales-summary">
      {/* Total Ventas */}
      <div className="sales-card sales-card--total">
        <div className="sales-card-header">
          <span className="sales-card-label">Total Ventas</span>
          <div className="sales-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>
        <div className="sales-card-value">{formatCurrency(summary.total_sales)}</div>
        <div className="sales-card-detail">Ingresos totales del periodo</div>
      </div>

      {/* Pedidos Completados */}
      <div className="sales-card sales-card--completed">
        <div className="sales-card-header">
          <span className="sales-card-label">Pedidos Completados</span>
          <div className="sales-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>
        <div className="sales-card-value">{formatNumber(summary.completed_orders)}</div>
        <div className="sales-card-detail">Entregas realizadas con éxito</div>
      </div>

      {/* Pedidos Cancelados */}
      <div className="sales-card sales-card--cancelled">
        <div className="sales-card-header">
          <span className="sales-card-label">Pedidos Cancelados</span>
          <div className="sales-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        </div>
        <div className="sales-card-value">{formatNumber(summary.cancelled_orders)}</div>
        <div className="sales-card-detail">Pedidos no entregados</div>
      </div>

      {/* Promedio por Venta */}
      <div className="sales-card sales-card--average">
        <div className="sales-card-header">
          <span className="sales-card-label">Promedio por Venta</span>
          <div className="sales-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
        </div>
        <div className="sales-card-value">{formatCurrency(summary.average_sale)}</div>
        <div className="sales-card-detail">Ticket promedio por pedido</div>
      </div>
    </div>
  );
};
