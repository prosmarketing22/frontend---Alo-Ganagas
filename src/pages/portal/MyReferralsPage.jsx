import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalApi } from '../../hooks/useApi/usePortalApi';
import { ReferralShareCard } from '../../components/portal/ReferralShareCard';
import './MyReferralsPage.css';

export const MyReferralsPage = () => {
  const navigate = useNavigate();
  const { getMyReferrals, getReferralCode } = usePortalApi();
  const [referrals, setReferrals] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      const [referralsData, codeData] = await Promise.all([
        getMyReferrals(),
        getReferralCode()
      ]);
      setReferrals(referralsData || []);
      setReferralCode(codeData?.code || '');
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-referrals-page">
        <div className="my-referrals-page__loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="my-referrals-page">
      <div className="my-referrals-page__header">
        <h1 className="my-referrals-page__title">Mis Referidos</h1>
        <button
          className="my-referrals-page__back"
          onClick={() => navigate('/portal')}
        >
          Volver
        </button>
      </div>

      <div className="my-referrals-page__share">
        <ReferralShareCard code={referralCode} />
      </div>

      <div className="my-referrals-page__section">
        <h2 className="my-referrals-page__section-title">
          Mis Referidos ({referrals.length})
        </h2>
        {referrals.length === 0 ? (
          <div className="my-referrals-page__empty">
            <div className="my-referrals-page__empty-icon">👥</div>
            <div className="my-referrals-page__empty-text">
              Aún no tienes referidos
            </div>
            <div className="my-referrals-page__empty-description">
              Comparte tu código con amigos y gana beneficios cuando se registren
            </div>
          </div>
        ) : (
          <div className="my-referrals-page__list">
            {referrals.map((referral) => (
              <div key={referral.id} className="my-referrals-page__item">
                <div className="my-referrals-page__item-avatar">
                  {referral.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="my-referrals-page__item-info">
                  <div className="my-referrals-page__item-name">
                    {referral.full_name}
                  </div>
                  <div className="my-referrals-page__item-date">
                    Registrado: {new Date(referral.created_at).toLocaleDateString('es-PE')}
                  </div>
                </div>
                <div
                  className={
                    'my-referrals-page__item-status' +
                    (referral.is_active ? ' my-referrals-page__item-status--active' : '')
                  }
                >
                  {referral.is_active ? 'Activo' : 'Inactivo'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
