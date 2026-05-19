import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalApi } from '../../hooks/useApi/usePortalApi';
import { LoansSummary } from '../../components/portal/LoansSummary';
import './MyLoansPage.css';

export const MyLoansPage = () => {
  const navigate = useNavigate();
  const { getMyLoans } = usePortalApi();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const data = await getMyLoans();
      setLoans(data || []);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-loans-page">
        <div className="my-loans-page__loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="my-loans-page">
      <div className="my-loans-page__header">
        <h1 className="my-loans-page__title">Mis Envases</h1>
        <button
          className="my-loans-page__back"
          onClick={() => navigate('/portal')}
        >
          Volver
        </button>
      </div>

      <div className="my-loans-page__info">
        <div className="my-loans-page__info-icon">ℹ️</div>
        <div className="my-loans-page__info-text">
          Aquí puedes ver el estado de los envases que tienes en préstamo.
          Recuerda devolverlos en tu próxima compra.
        </div>
      </div>

      <LoansSummary loans={loans} />
    </div>
  );
};
