import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalApi } from '../../hooks/useApi/usePortalApi';
import { BalanceCard } from '../../components/portal/BalanceCard';
import './MyGanagasPage.css';

const movementIcons = {
  BONO_ARRANQUE: '🎁',
  BONO_REFERIDO: '👥',
  BONO_10_REFERIDOS: '🏆',
  BONO_LEALTAD: '⭐',
  USO_SALDO: '🛒',
  AJUSTE_MANUAL: '⚙️',
  BONO_CUMPLEAÑOS: '🎂'
};

const movementColors = {
  BONO_ARRANQUE: 'green',
  BONO_REFERIDO: 'blue',
  BONO_10_REFERIDOS: 'gold',
  BONO_LEALTAD: 'teal',
  USO_SALDO: 'red',
  AJUSTE_MANUAL: 'gray',
  BONO_CUMPLEAÑOS: 'purple'
};

const movementLabels = {
  BONO_ARRANQUE: 'Bono de arranque por compra',
  BONO_REFERIDO: 'Bono por patrocinio:',
  BONO_10_REFERIDOS: 'Bono por 10 Referidos',
  BONO_LEALTAD: 'Bono de Lealtad',
  USO_SALDO: 'Uso de Saldo',
  AJUSTE_MANUAL: 'Ajuste Manual',
  BONO_CUMPLEAÑOS: 'Bono de Cumpleaños'
};

// Determinar el tipo efectivo del movimiento basado en la descripcion
const getEffectiveType = (movement) => {
  // Si la descripcion contiene "cumpleaños", es un bono de cumpleaños
  if (movement.description?.toLowerCase().includes('cumpleaños')) {
    return 'BONO_CUMPLEAÑOS';
  }
  // Si la descripcion contiene "comision recurrente", es comision de referido
  if (movement.description?.toLowerCase().includes('comision recurrente')) {
    return 'BONO_REFERIDO';
  }
  return movement.bonus_type;
};

export const MyGanagasPage = () => {
  const navigate = useNavigate();
  const { getMyGanagas } = usePortalApi();
  const [balance, setBalance] = useState(0);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGanagas();
  }, []);

  const loadGanagas = async () => {
    try {
      const response = await getMyGanagas();
      // La respuesta tiene estructura: { data: { balance, history, pagination } }
      const ganagasData = response?.data || response || {};
      setBalance(ganagasData.balance || 0);
      setMovements(ganagasData.history || []);
    } catch (error) {
      console.error('Error loading GANAGAS:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-ganagas-page">
        <div className="my-ganagas-page__loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="my-ganagas-page">
      <div className="my-ganagas-page__header">
        <h1 className="my-ganagas-page__title">Mi GANAGAS</h1>
        <button
          className="my-ganagas-page__back"
          onClick={() => navigate('/portal')}
        >
          Volver
        </button>
      </div>

      <div className="my-ganagas-page__balance">
        <BalanceCard balance={balance} />
      </div>

      <div className="my-ganagas-page__info">
        <div className="my-ganagas-page__info-icon">💡</div>
        <div className="my-ganagas-page__info-text">
          <strong>GANAGAS</strong> es tu programa de beneficios. Gana saldo con cada referido
          y úsalo para pagar tus pedidos.
        </div>
      </div>

      <div className="my-ganagas-page__section">
        <h2 className="my-ganagas-page__section-title">Historial de Movimientos</h2>
        {movements.length === 0 ? (
          <div className="my-ganagas-page__empty">
            <div className="my-ganagas-page__empty-icon">📋</div>
            <div className="my-ganagas-page__empty-text">
              No tienes movimientos aún
            </div>
          </div>
        ) : (
          <div className="my-ganagas-page__movements">
            {movements.map((movement) => {
              const effectiveType = getEffectiveType(movement);
              return (
              <div key={movement.id} className="my-ganagas-page__movement">
                <div
                  className={
                    'my-ganagas-page__movement-icon' +
                    ' my-ganagas-page__movement-icon--' + (movementColors[effectiveType] || 'gray')
                  }
                >
                  {movementIcons[effectiveType] || '💰'}
                </div>
                <div className="my-ganagas-page__movement-info">
                  <div className="my-ganagas-page__movement-title">
                    {movementLabels[effectiveType] || movement.bonus_type}
                  </div>
                  {movement.description && (
                    <div className="my-ganagas-page__movement-description">
                      {movement.description}
                    </div>
                  )}
                  <div className="my-ganagas-page__movement-date">
                    {new Date(movement.date_time_register).toLocaleString('es-PE')}
                  </div>
                </div>
                <div
                  className={
                    'my-ganagas-page__movement-amount' +
                    (movement.amount > 0 ? ' my-ganagas-page__movement-amount--positive' : ' my-ganagas-page__movement-amount--negative')
                  }
                >
                  {movement.amount > 0 ? '+' : ''}S/. {Number(movement.amount).toFixed(2)}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
