import './GanagasMovementTable.css';

const BONUS_TYPE_LABELS = {
  'BONO_ARRANQUE': 'Bono Arranque',
  'BONO_REFERIDO': 'Bono Referido',
  'BONO_10_REFERIDOS': 'Bono 10 Referidos',
  'BONO_LEALTAD': 'Bono Lealtad',
  'USO_SALDO': 'Uso de Saldo',
  'AJUSTE_MANUAL': 'Ajuste Manual'
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const GanagasMovementTable = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="ganagas-movements">
        <div className="ganagas-movements__loading">Cargando movimientos...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="ganagas-movements">
        <div className="ganagas-movements__empty">No hay movimientos registrados</div>
      </div>
    );
  }

  return (
    <div className="ganagas-movements">
      <div className="ganagas-movements__table-wrapper">
        <table className="ganagas-movements__table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Descripcion</th>
              <th>Pedido</th>
              <th>Monto</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {data.map((movement) => (
              <tr key={movement.id}>
                <td>{formatDate(movement.date_time_register)}</td>
                <td className="ganagas-movements__customer">
                  {movement.customer_name || '-'}
                </td>
                <td>
                  <span className={`ganagas-movements__badge ganagas-movements__badge--${movement.bonus_type?.toLowerCase()}`}>
                    {BONUS_TYPE_LABELS[movement.bonus_type] || movement.bonus_type}
                  </span>
                </td>
                <td className="ganagas-movements__description">
                  {movement.description || '-'}
                </td>
                <td>{movement.order_number || '-'}</td>
                <td className={`ganagas-movements__amount ${parseFloat(movement.amount) >= 0 ? 'ganagas-movements__amount--positive' : 'ganagas-movements__amount--negative'}`}>
                  {parseFloat(movement.amount) >= 0 ? '+' : ''}S/ {parseFloat(movement.amount).toFixed(2)}
                </td>
                <td className="ganagas-movements__balance">
                  S/ {parseFloat(movement.new_balance).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
