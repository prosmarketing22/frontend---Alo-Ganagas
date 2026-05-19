import { useNavigate } from 'react-router-dom';
import './BalanceCard.css';

export const BalanceCard = ({ balance }) => {
  const navigate = useNavigate();
  const formattedBalance = Number(balance || 0).toFixed(2);

  return (
    <div className="balance-card">
      <div className="balance-card__header">
        <div className="balance-card__icon">
          <svg className="balance-card__svg-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 6v12M9 9.5c0-.828 1.343-1.5 3-1.5s3 .672 3 1.5-1.343 1.5-3 1.5-3 .672-3 1.5 1.343 1.5 3 1.5 3-.672 3-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="balance-card__title">Mi Billetera GANAGAS</div>
      </div>
      <div className="balance-card__balance">
        <span className="balance-card__currency">S/</span>
        <span className="balance-card__amount">{formattedBalance}</span>
      </div>
      <div className="balance-card__footer">
        <span className="balance-card__footer-text">
          Saldo disponible para tus proximos pedidos
        </span>
        <button
          className="balance-card__use-btn"
          onClick={() => navigate('/portal/create-order')}
        >
          Usar saldo
        </button>
      </div>
    </div>
  );
};
