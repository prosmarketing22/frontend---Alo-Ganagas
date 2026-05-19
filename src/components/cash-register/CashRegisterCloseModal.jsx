import { useState, useEffect } from 'react';
import { useCashRegisterApi } from '../../hooks/useApi/useCashRegisterApi';
import './CashRegisterCloseModal.css';

export const CashRegisterCloseModal = ({ cashRegister, onClose, onSuccess }) => {
  const { closeRegister, loading } = useCashRegisterApi();

  const [actualAmounts, setActualAmounts] = useState({});
  const [closingNotes, setClosingNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Inicializar montos actuales con los esperados
    if (cashRegister?.balances) {
      const amounts = {};
      cashRegister.balances.forEach(b => {
        const expected = parseFloat(b.opening_amount || 0) +
                        parseFloat(b.sales_amount || 0) -
                        parseFloat(b.expenses_amount || 0);
        amounts[b.payment_method] = expected.toFixed(2);
      });
      setActualAmounts(amounts);
    }
  }, [cashRegister]);

  const handleAmountChange = (method, value) => {
    setActualAmounts(prev => ({
      ...prev,
      [method]: value
    }));
  };

  const calculateDifference = (method) => {
    const balance = cashRegister.balances.find(b => b.payment_method === method);
    if (!balance) return 0;

    const expected = parseFloat(balance.opening_amount || 0) +
                    parseFloat(balance.sales_amount || 0) -
                    parseFloat(balance.expenses_amount || 0);
    const actual = parseFloat(actualAmounts[method] || 0);
    return actual - expected;
  };

  const getTotalExpected = () => {
    return (cashRegister.balances || []).reduce((sum, b) => {
      return sum + parseFloat(b.opening_amount || 0) +
             parseFloat(b.sales_amount || 0) -
             parseFloat(b.expenses_amount || 0);
    }, 0);
  };

  const getTotalActual = () => {
    return Object.values(actualAmounts).reduce((sum, val) => {
      return sum + parseFloat(val || 0);
    }, 0);
  };

  const getTotalDifference = () => {
    return getTotalActual() - getTotalExpected();
  };

  const hasDifference = () => {
    return Math.abs(getTotalDifference()) > 0.01;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasDifference() && !confirmed) {
      setConfirmed(true);
      return;
    }

    setError('');
    setSaving(true);

    try {
      const actualBalances = cashRegister.balances.map(b => ({
        payment_method: b.payment_method,
        actual_amount: parseFloat(actualAmounts[b.payment_method] || 0)
      }));

      const result = await closeRegister(cashRegister.id, {
        actual_balances: actualBalances,
        closing_notes: closingNotes.trim()
      });

      if (result.success) {
        onSuccess && onSuccess(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return `S/ ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const totalExpected = getTotalExpected();
  const totalActual = getTotalActual();
  const totalDiff = getTotalDifference();

  return (
    <div className="close-modal-overlay" onClick={onClose}>
      <div className="close-modal" onClick={e => e.stopPropagation()}>
        <div className="close-modal__header">
          <h3>Cerrar Caja</h3>
          <button className="close-modal__close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="close-modal__form">
          {error && (
            <div className="close-modal__error">{error}</div>
          )}

          <div className="close-modal__info">
            <p><strong>Caja:</strong> {cashRegister.register_number}</p>
            <p><strong>Fecha:</strong> {new Date(cashRegister.open_date).toLocaleDateString('es-PE')}</p>
          </div>

          {/* Advertencia si hay diferencias */}
          {confirmed && hasDifference() && (
            <div className={`close-modal__warning ${totalDiff >= 0 ? 'close-modal__warning--positive' : 'close-modal__warning--negative'}`}>
              <strong>
                {totalDiff >= 0 ? 'Sobrante detectado' : 'Faltante detectado'}
              </strong>
              <p>
                Diferencia total: <strong>{formatCurrency(Math.abs(totalDiff))}</strong>
              </p>
              <p>La caja sera enviada para revision del supervisor.</p>
            </div>
          )}

          {/* Tabla de saldos */}
          <div className="close-modal__balances">
            <table>
              <thead>
                <tr>
                  <th>Metodo</th>
                  <th>Esperado</th>
                  <th>Actual</th>
                  <th>Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {(cashRegister.balances || []).map(balance => {
                  const expected = parseFloat(balance.opening_amount || 0) +
                                  parseFloat(balance.sales_amount || 0) -
                                  parseFloat(balance.expenses_amount || 0);
                  const diff = calculateDifference(balance.payment_method);

                  return (
                    <tr key={balance.id}>
                      <td className="close-modal__method">{balance.payment_method}</td>
                      <td className="close-modal__expected">{formatCurrency(expected)}</td>
                      <td>
                        <div className="close-modal__actual-input">
                          <span>S/</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={actualAmounts[balance.payment_method] || ''}
                            onChange={e => handleAmountChange(balance.payment_method, e.target.value)}
                            disabled={confirmed}
                          />
                        </div>
                      </td>
                      <td className={`close-modal__diff ${diff > 0 ? 'close-modal__diff--positive' : diff < 0 ? 'close-modal__diff--negative' : ''}`}>
                        {diff !== 0 && (diff > 0 ? '+' : '')}{formatCurrency(diff)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>TOTAL</strong></td>
                  <td><strong>{formatCurrency(totalExpected)}</strong></td>
                  <td><strong>{formatCurrency(totalActual)}</strong></td>
                  <td className={`close-modal__diff ${totalDiff > 0 ? 'close-modal__diff--positive' : totalDiff < 0 ? 'close-modal__diff--negative' : ''}`}>
                    <strong>{totalDiff !== 0 && (totalDiff > 0 ? '+' : '')}{formatCurrency(totalDiff)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notas de cierre */}
          <div className="close-modal__field">
            <label>Observaciones de cierre (opcional)</label>
            <textarea
              value={closingNotes}
              onChange={e => setClosingNotes(e.target.value)}
              placeholder="Notas adicionales sobre el cierre de caja..."
              rows={3}
              disabled={confirmed}
            />
          </div>

          <div className="close-modal__actions">
            {!confirmed ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="close-modal__btn close-modal__btn--cancel"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="close-modal__btn close-modal__btn--submit"
                  disabled={saving || loading}
                >
                  {hasDifference() ? 'Continuar con diferencia' : 'Cerrar Caja'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmed(false)}
                  className="close-modal__btn close-modal__btn--cancel"
                  disabled={saving}
                >
                  Volver a editar
                </button>
                <button
                  type="submit"
                  className="close-modal__btn close-modal__btn--confirm"
                  disabled={saving || loading}
                >
                  {saving ? 'Cerrando...' : 'Confirmar cierre'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashRegisterCloseModal;
