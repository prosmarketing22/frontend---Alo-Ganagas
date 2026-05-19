import { useState, useEffect } from 'react';
import './CashRegisterCloseModal.css';

const PAYMENT_METHOD_LABELS = {
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  FISE: 'FISE',
  TRANSFERENCIA: 'Transferencia',
  CREDITO: 'Credito',
  MIXTO: 'Mixto'
};

export const CashRegisterCloseModal = ({
  isOpen,
  onClose,
  onSubmit,
  cashRegister
}) => {
  const [actualBalances, setActualBalances] = useState([]);
  const [closingNotes, setClosingNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cashRegister?.balances) {
      setActualBalances(
        cashRegister.balances.map(b => ({
          payment_method: b.payment_method,
          expected_amount: parseFloat(b.expected_amount || 0),
          actual_amount: ''
        }))
      );
    }
  }, [cashRegister]);

  if (!isOpen) return null;

  const handleAmountChange = (method, value) => {
    setActualBalances(prev =>
      prev.map(b =>
        b.payment_method === method ? { ...b, actual_amount: value } : b
      )
    );
    setError('');
  };

  const calculateTotals = () => {
    const totalExpected = actualBalances.reduce((sum, b) => sum + b.expected_amount, 0);
    const totalActual = actualBalances.reduce((sum, b) => sum + (parseFloat(b.actual_amount) || 0), 0);
    const difference = totalExpected - totalActual;
    return { totalExpected, totalActual, difference };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar que todos los montos esten ingresados
    const missingAmounts = actualBalances.filter(b => b.actual_amount === '');
    if (missingAmounts.length > 0) {
      setError('Debe ingresar el monto real de todos los metodos de pago');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        actual_balances: actualBalances.map(b => ({
          payment_method: b.payment_method,
          actual_amount: parseFloat(b.actual_amount) || 0
        })),
        closing_notes: closingNotes || null
      });
    } catch (err) {
      setError(err.message || 'Error al cerrar caja');
    } finally {
      setLoading(false);
    }
  };

  const { totalExpected, totalActual, difference } = calculateTotals();

  return (
    <div className="close-modal-overlay" onClick={onClose}>
      <div className="close-modal" onClick={e => e.stopPropagation()}>
        <div className="close-modal__header">
          <h3>Cerrar Caja {cashRegister?.register_number}</h3>
          <button className="close-modal__close" onClick={onClose}>X</button>
        </div>

        <form onSubmit={handleSubmit} className="close-modal__form">
          {error && <div className="close-modal__error">{error}</div>}

          <div className="close-modal__info">
            <p>Ingrese el monto real que tiene en cada metodo de pago.</p>
          </div>

          <div className="close-modal__balances">
            {actualBalances.map((balance) => (
              <div key={balance.payment_method} className="close-modal__balance-row">
                <div className="close-modal__balance-method">
                  {PAYMENT_METHOD_LABELS[balance.payment_method] || balance.payment_method}
                </div>
                <div className="close-modal__balance-expected">
                  <span className="close-modal__label">Esperado:</span>
                  <span className="close-modal__value">
                    S/ {balance.expected_amount.toFixed(2)}
                  </span>
                </div>
                <div className="close-modal__balance-actual">
                  <span className="close-modal__label">Real:</span>
                  <input
                    type="number"
                    value={balance.actual_amount}
                    onChange={(e) => handleAmountChange(balance.payment_method, e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="close-modal__balance-diff">
                  {balance.actual_amount !== '' && (
                    <span className={
                      parseFloat(balance.actual_amount) === balance.expected_amount
                        ? 'close-modal__diff--ok'
                        : parseFloat(balance.actual_amount) < balance.expected_amount
                          ? 'close-modal__diff--negative'
                          : 'close-modal__diff--positive'
                    }>
                      {parseFloat(balance.actual_amount) === balance.expected_amount
                        ? 'OK'
                        : `${parseFloat(balance.actual_amount) < balance.expected_amount ? '-' : '+'} S/ ${Math.abs(balance.expected_amount - parseFloat(balance.actual_amount)).toFixed(2)}`
                      }
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="close-modal__summary">
            <div className="close-modal__summary-row">
              <span>Total Esperado:</span>
              <span>S/ {totalExpected.toFixed(2)}</span>
            </div>
            <div className="close-modal__summary-row">
              <span>Total Real:</span>
              <span>S/ {totalActual.toFixed(2)}</span>
            </div>
            <div className={`close-modal__summary-row close-modal__summary-row--diff ${
              Math.abs(difference) < 0.01
                ? 'close-modal__summary-row--ok'
                : difference > 0
                  ? 'close-modal__summary-row--negative'
                  : 'close-modal__summary-row--positive'
            }`}>
              <span>Diferencia:</span>
              <span>
                {Math.abs(difference) < 0.01
                  ? 'S/ 0.00'
                  : `${difference > 0 ? '-' : '+'} S/ ${Math.abs(difference).toFixed(2)}`
                }
              </span>
            </div>
          </div>

          {Math.abs(difference) >= 0.01 && (
            <div className="close-modal__warning">
              <strong>Atencion:</strong> Hay una diferencia de S/ {Math.abs(difference).toFixed(2)}.
              La caja quedara pendiente de aprobacion por su supervisor.
            </div>
          )}

          <div className="close-modal__field">
            <label>Notas de cierre (opcional)</label>
            <textarea
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              placeholder="Observaciones sobre el cierre de caja..."
              rows={3}
            />
          </div>

          <div className="close-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="close-modal__btn close-modal__btn--cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="close-modal__btn close-modal__btn--submit"
              disabled={loading}
            >
              {loading ? 'Cerrando...' : 'Cerrar Caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashRegisterCloseModal;
