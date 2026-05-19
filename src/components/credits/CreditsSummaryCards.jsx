export const CreditsSummaryCards = ({ summary, loading }) => {
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading && !summary) {
    return (
      <div className="credits-summary-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="credits-summary-card">
            <div className="credits-loading">
              <div className="credits-spinner" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      key: 'debt',
      icon: '💸',
      label: 'Deuda Total Pendiente',
      value: formatCurrency(summary?.total_pending_debt || 0),
      description: 'Por cobrar a clientes',
      variant: 'debt'
    },
    {
      key: 'limit',
      icon: '💳',
      label: 'Crédito Otorgado',
      value: formatCurrency(summary?.total_credit_granted || 0),
      description: 'En límites de crédito',
      variant: 'limit'
    },
    {
      key: 'customers',
      icon: '👥',
      label: 'Clientes con Crédito',
      value: summary?.customers_with_credit || 0,
      description: `${summary?.customers_with_debt || 0} con deuda activa`,
      variant: 'customers'
    },
    {
      key: 'available',
      icon: '✅',
      label: 'Disponible Total',
      value: formatCurrency(summary?.total_available_credit || 0),
      description: 'Crédito sin usar',
      variant: 'available'
    }
  ];

  return (
    <div className="credits-summary-grid">
      {cards.map((card) => (
        <div key={card.key} className={`credits-summary-card credits-summary-card--${card.variant}`}>
          <div className="credits-summary-card-header">
            <div className="credits-summary-card-icon">{card.icon}</div>
            <span className="credits-summary-card-label">{card.label}</span>
          </div>
          <div className="credits-summary-card-value">{card.value}</div>
          <div className="credits-summary-card-description">{card.description}</div>
        </div>
      ))}
    </div>
  );
};
