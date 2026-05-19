import './GanagasSummaryCards.css';

export const GanagasSummaryCards = ({ summary, loading = false }) => {
  if (loading) {
    return (
      <div className="ganagas-summary">
        <div className="ganagas-summary__loading">Cargando estadisticas...</div>
      </div>
    );
  }

  if (!summary) return null;

  const { totals = {}, top_customers = [] } = summary;

  return (
    <div className="ganagas-summary">
      <div className="ganagas-summary__cards">
        <div className="ganagas-summary__card ganagas-summary__card--earned">
          <div className="ganagas-summary__card-icon">+</div>
          <div className="ganagas-summary__card-content">
            <span className="ganagas-summary__card-value">
              S/ {parseFloat(totals.total_earned || 0).toFixed(2)}
            </span>
            <span className="ganagas-summary__card-label">Total Otorgado</span>
          </div>
        </div>

        <div className="ganagas-summary__card ganagas-summary__card--used">
          <div className="ganagas-summary__card-icon">-</div>
          <div className="ganagas-summary__card-content">
            <span className="ganagas-summary__card-value">
              S/ {parseFloat(totals.total_used || 0).toFixed(2)}
            </span>
            <span className="ganagas-summary__card-label">Total Usado</span>
          </div>
        </div>

        <div className="ganagas-summary__card ganagas-summary__card--balance">
          <div className="ganagas-summary__card-icon">$</div>
          <div className="ganagas-summary__card-content">
            <span className="ganagas-summary__card-value">
              S/ {parseFloat(totals.total_balance_accumulated || 0).toFixed(2)}
            </span>
            <span className="ganagas-summary__card-label">Saldo Acumulado</span>
          </div>
        </div>

        <div className="ganagas-summary__card ganagas-summary__card--customers">
          <div className="ganagas-summary__card-icon">U</div>
          <div className="ganagas-summary__card-content">
            <span className="ganagas-summary__card-value">
              {totals.active_customers || 0}
            </span>
            <span className="ganagas-summary__card-label">Clientes Activos</span>
          </div>
        </div>
      </div>

      {top_customers.length > 0 && (
        <div className="ganagas-summary__top">
          <h4 className="ganagas-summary__top-title">Top 10 Clientes con Mayor Saldo</h4>
          <div className="ganagas-summary__top-list">
            {top_customers.map((customer, index) => (
              <div key={customer.id} className="ganagas-summary__top-item">
                <span className="ganagas-summary__top-rank">{index + 1}</span>
                <div className="ganagas-summary__top-customer">
                  <span className="ganagas-summary__top-name">{customer.full_name}</span>
                  {customer.address && (
                    <span className="ganagas-summary__top-address">{customer.address}</span>
                  )}
                  {customer.district && (
                    <span className="ganagas-summary__top-district">{customer.district}</span>
                  )}
                </div>
                <span className="ganagas-summary__top-phone">{customer.phone}</span>
                <span className="ganagas-summary__top-balance">
                  S/ {parseFloat(customer.ganagas_balance).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
