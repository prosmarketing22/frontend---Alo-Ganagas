import './SummaryCard.css';

export const SummaryCard = ({ title, value, icon, color = 'blue' }) => {
  return (
    <div className={'summary-card summary-card--' + color}>
      <div className="summary-card__icon">
        {icon}
      </div>
      <div className="summary-card__content">
        <div className="summary-card__title">{title}</div>
        <div className="summary-card__value">{value}</div>
      </div>
    </div>
  );
};
