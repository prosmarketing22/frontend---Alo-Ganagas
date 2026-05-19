export const SupplierLoanSummaryCards = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="loan-summary">
        <div className="loan-summary-grid">
          <div className="loan-summary-card loan-summary-card--loading">
            <div className="loan-summary-loading">Cargando...</div>
          </div>
          <div className="loan-summary-card loan-summary-card--loading">
            <div className="loan-summary-loading">Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const nosDeben = summary.NOS_DEBEN || { total_loans: 0, total_pending: 0 };
  const debemos = summary.DEBEMOS || { total_loans: 0, total_pending: 0 };

  return (
    <div className="loan-summary">
      <div className="loan-summary-grid">
        <div className="loan-summary-card loan-summary-card--nos-deben">
          <div className="loan-summary-card__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <div className="loan-summary-card__content">
            <h3 className="loan-summary-card__title">Proveedores Nos Deben</h3>
            <p className="loan-summary-card__subtitle">Envases prestados a proveedores</p>
            <div className="loan-summary-card__stats">
              <div className="loan-summary-stat">
                <span className="loan-summary-stat__label">Prestamos</span>
                <span className="loan-summary-stat__value">{nosDeben.total_loans}</span>
              </div>
              <div className="loan-summary-stat">
                <span className="loan-summary-stat__label">Pendiente</span>
                <span className="loan-summary-stat__value loan-summary-stat__value--highlight">
                  {nosDeben.total_pending}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="loan-summary-card loan-summary-card--debemos">
          <div className="loan-summary-card__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div className="loan-summary-card__content">
            <h3 className="loan-summary-card__title">Debemos a Proveedores</h3>
            <p className="loan-summary-card__subtitle">Envases que proveedores nos prestan</p>
            <div className="loan-summary-card__stats">
              <div className="loan-summary-stat">
                <span className="loan-summary-stat__label">Prestamos</span>
                <span className="loan-summary-stat__value">{debemos.total_loans}</span>
              </div>
              <div className="loan-summary-stat">
                <span className="loan-summary-stat__label">Pendiente</span>
                <span className="loan-summary-stat__value loan-summary-stat__value--highlight">
                  {debemos.total_pending}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
