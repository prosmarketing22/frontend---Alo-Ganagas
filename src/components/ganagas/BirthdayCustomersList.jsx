import './BirthdayCustomersList.css';

export const BirthdayCustomersList = ({ customers = [], loading = false }) => {
  if (loading) {
    return (
      <div className="birthday-list">
        <div className="birthday-list__loading">Cargando...</div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="birthday-list">
        <div className="birthday-list__empty">
          <span className="birthday-list__empty-icon">🎂</span>
          <p>No hay clientes con cumpleanos hoy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="birthday-list">
      <h4 className="birthday-list__title">
        <span>🎂</span> Clientes con Cumpleanos Hoy
      </h4>
      <p className="birthday-list__auto-note">Los bonos se otorgan automaticamente</p>
      <div className="birthday-list__items">
        {customers.map((customer) => {
          const bonusGranted = customer.birthday_bonus_granted;

          return (
            <div
              key={customer.id}
              className={`birthday-list__item ${bonusGranted ? 'birthday-list__item--granted' : ''}`}
            >
              <div className="birthday-list__customer-info">
                <span className="birthday-list__customer-name">{customer.full_name}</span>
                {customer.address && (
                  <span className="birthday-list__customer-address">{customer.address}</span>
                )}
                {customer.district && (
                  <span className="birthday-list__customer-district">{customer.district}</span>
                )}
                <span className="birthday-list__customer-phone">{customer.phone}</span>
                <span className="birthday-list__customer-balance">
                  Saldo: S/ {parseFloat(customer.ganagas_balance || 0).toFixed(2)}
                </span>
              </div>
              {bonusGranted ? (
                <div className="birthday-list__granted-badge">
                  <span className="birthday-list__granted-icon">✓</span>
                  <span className="birthday-list__granted-text">Bono otorgado</span>
                </div>
              ) : (
                <div className="birthday-list__pending-badge">
                  <span className="birthday-list__pending-icon">⏳</span>
                  <span className="birthday-list__pending-text">Pendiente</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
