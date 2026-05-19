import './DebtCard.css';

const MoneyIcon = () => (
  <svg className="debt-card__svg" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
    <path d="M12 6v12M9 9.5c0-.828 1.343-1.5 3-1.5s3 .672 3 1.5-1.343 1.5-3 1.5-3 .672-3 1.5 1.343 1.5 3 1.5 3-.672 3-1.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const GasBalloonIcon = () => (
  <svg className="debt-card__svg" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 3.17 2.11 5.85 5 6.71V22h4v-6.29c2.89-.86 5-3.54 5-6.71 0-3.87-3.13-7-7-7z" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5" />
    <path d="M10 22h4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="9" r="2" fill="#EF4444" opacity="0.6" />
  </svg>
);

const WaterJugIcon = () => (
  <svg className="debt-card__svg" viewBox="0 0 24 24" fill="none">
    <path d="M8 2h8v3H8V2z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M6 8c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v11c0 1.66-1.34 3-3 3H9c-1.66 0-3-1.34-3-3V8z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5" />
    <path d="M10 12c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const ChevronRight = () => (
  <svg className="debt-card__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const DebtCard = ({
  pendingDebt = 0,
  pendingGasBalloons = 0,
  pendingWaterContainers = 0,
  onItemClick
}) => {
  const hasDebt = pendingDebt > 0 || pendingGasBalloons > 0 || pendingWaterContainers > 0;

  const items = [
    {
      key: 'money',
      icon: <MoneyIcon />,
      label: 'Deudas en dinero',
      value: `S/ ${pendingDebt.toFixed(2)}`,
      hasAlert: pendingDebt > 0
    },
    {
      key: 'gas',
      icon: <GasBalloonIcon />,
      label: 'Balones de gas',
      value: `${pendingGasBalloons} ${pendingGasBalloons === 1 ? 'unidad' : 'unidades'}`,
      hasAlert: pendingGasBalloons > 0
    },
    {
      key: 'water',
      icon: <WaterJugIcon />,
      label: 'Botellones de agua',
      value: `${pendingWaterContainers} ${pendingWaterContainers === 1 ? 'unidad' : 'unidades'}`,
      hasAlert: pendingWaterContainers > 0
    }
  ];

  return (
    <div className={`debt-card ${hasDebt ? 'debt-card--has-debt' : 'debt-card--no-debt'}`}>
      <div className="debt-card__header">
        <h3 className="debt-card__title">
          {hasDebt ? 'Tienes pendientes' : 'Sin deudas pendientes'}
        </h3>
      </div>

      <div className="debt-card__content">
        {items.map((item) => (
          <button
            key={item.key}
            className="debt-card__item"
            onClick={() => onItemClick?.(item.key)}
            type="button"
          >
            <div className="debt-card__item-icon">
              {item.icon}
            </div>
            <span className="debt-card__item-label">{item.label}</span>
            <span className={`debt-card__item-value${item.hasAlert ? ' debt-card__item-value--alert' : ''}`}>
              {item.value}
            </span>
            <ChevronRight />
          </button>
        ))}
      </div>

      {hasDebt && (
        <p className="debt-card__note">
          Recuerda devolver los envases en tu proximo pedido
        </p>
      )}
    </div>
  );
};
