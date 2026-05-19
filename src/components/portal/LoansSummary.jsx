import './LoansSummary.css';

export const LoansSummary = ({ loans }) => {
  if (loans.length === 0) {
    return (
      <div className="loans-summary loans-summary--empty">
        <div className="loans-summary__empty-icon">🧊</div>
        <div className="loans-summary__empty-text">
          No tienes envases prestados
        </div>
      </div>
    );
  }

  return (
    <div className="loans-summary">
      {loans.map((loan) => (
        <div key={loan.id} className="loans-summary__item">
          <div className="loans-summary__header">
            <div className="loans-summary__product">{loan.product_name}</div>
            <div
              className={
                'loans-summary__status' +
                ' loans-summary__status--' + loan.status.toLowerCase()
              }
            >
              {loan.status === 'PENDIENTE' && 'Pendiente'}
              {loan.status === 'PARCIAL' && 'Parcial'}
              {loan.status === 'DEVUELTO' && 'Devuelto'}
            </div>
          </div>
          <div className="loans-summary__details">
            <div className="loans-summary__detail">
              <span className="loans-summary__detail-label">Prestados:</span>
              <span className="loans-summary__detail-value">{loan.quantity_loaned}</span>
            </div>
            <div className="loans-summary__detail">
              <span className="loans-summary__detail-label">Devueltos:</span>
              <span className="loans-summary__detail-value">{loan.quantity_returned}</span>
            </div>
            <div className="loans-summary__detail">
              <span className="loans-summary__detail-label">Pendientes:</span>
              <span className="loans-summary__detail-value loans-summary__detail-value--pending">
                {loan.quantity_pending}
              </span>
            </div>
          </div>
          <div className="loans-summary__date">
            Fecha: {new Date(loan.created_at).toLocaleDateString('es-PE')}
          </div>
        </div>
      ))}
    </div>
  );
};
