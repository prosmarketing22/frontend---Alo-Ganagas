import { useState } from 'react';
import { useCashRegisterApi } from '../../hooks/useApi/useCashRegisterApi';
import './CashRegisterOpenModal.css';

const PAYMENT_METHODS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'YAPE', label: 'Yape' },
  { value: 'PLIN', label: 'Plin' },
  { value: 'FISE', label: 'FISE' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' }
];

export const CashRegisterOpenModal = ({
  isOpen,
  onClose,
  onSubmit,
  repartidores = []
}) => {
  const { checkOpenRegister } = useCashRegisterApi();

  const [formData, setFormData] = useState({
    user_id: '',
    notes: ''
  });
  const [balances, setBalances] = useState([
    { payment_method: 'EFECTIVO', amount: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasOpenRegister, setHasOpenRegister] = useState(false);

  if (!isOpen) return null;

  const handleUserChange = async (userId) => {
    setFormData(prev => ({ ...prev, user_id: userId }));
    setError('');
    setHasOpenRegister(false);

    if (userId) {
      try {
        const result = await checkOpenRegister(userId);
        if (result.hasOpenRegister) {
          setHasOpenRegister(true);
          setError('Este repartidor ya tiene una caja abierta.');
        }
      } catch (err) {
        console.error('Error checking register:', err);
      }
    }
  };

  const handleAddPaymentMethod = () => {
    const usedMethods = balances.map(b => b.payment_method);
    const availableMethods = PAYMENT_METHODS.filter(m => !usedMethods.includes(m.value));

    if (availableMethods.length === 0) {
      alert('Ya agregaste todos los metodos de pago disponibles');
      return;
    }

    setBalances(prev => [...prev, {
      payment_method: availableMethods[0].value,
      amount: ''
    }]);
  };

  const handleRemovePaymentMethod = (index) => {
    if (balances.length <= 1) return;
    setBalances(prev => prev.filter((_, i) => i !== index));
  };

  const handleBalanceChange = (index, field, value) => {
    setBalances(prev => prev.map((b, i) =>
      i === index ? { ...b, [field]: value } : b
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.user_id) {
      setError('Seleccione un repartidor');
      return;
    }

    if (hasOpenRegister) {
      setError('Este repartidor ya tiene una caja abierta');
      return;
    }

    // Formatear balances
    const openingBalances = balances
      .filter(b => b.amount && parseFloat(b.amount) >= 0)
      .map(b => ({
        payment_method: b.payment_method,
        amount: parseFloat(b.amount) || 0
      }));

    setLoading(true);
    try {
      await onSubmit({
        user_id: parseInt(formData.user_id),
        opening_balances: openingBalances,
        notes: formData.notes || null
      });
    } catch (err) {
      setError(err.message || 'Error al abrir caja');
    } finally {
      setLoading(false);
    }
  };

  const usedMethods = balances.map(b => b.payment_method);

  return (
    <div className="open-modal-overlay" onClick={onClose}>
      <div className="open-modal" onClick={e => e.stopPropagation()}>
        <div className="open-modal__header">
          <h3>Abrir Caja</h3>
          <button className="open-modal__close" onClick={onClose}>X</button>
        </div>

        <form onSubmit={handleSubmit} className="open-modal__form">
          {error && <div className="open-modal__error">{error}</div>}

          <div className="open-modal__field">
            <label>Repartidor *</label>
            <select
              value={formData.user_id}
              onChange={(e) => handleUserChange(e.target.value)}
              required
            >
              <option value="">Seleccione repartidor</option>
              {repartidores.map(r => (
                <option key={r.id} value={r.id}>{r.full_name}</option>
              ))}
            </select>
          </div>

          {hasOpenRegister && (
            <div className="open-modal__warning">
              Este repartidor ya tiene una caja abierta. Debe cerrarla primero.
            </div>
          )}

          <div className="open-modal__section">
            <div className="open-modal__section-header">
              <h4>Montos de Apertura</h4>
              <button
                type="button"
                onClick={handleAddPaymentMethod}
                className="open-modal__btn-add"
                disabled={balances.length >= PAYMENT_METHODS.length}
              >
                + Agregar
              </button>
            </div>

            {balances.map((balance, index) => (
              <div key={index} className="open-modal__balance-row">
                <select
                  value={balance.payment_method}
                  onChange={(e) => handleBalanceChange(index, 'payment_method', e.target.value)}
                >
                  {PAYMENT_METHODS.filter(
                    m => m.value === balance.payment_method || !usedMethods.includes(m.value)
                  ).map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>

                <div className="open-modal__amount-input">
                  <span>S/</span>
                  <input
                    type="number"
                    value={balance.amount}
                    onChange={(e) => handleBalanceChange(index, 'amount', e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                {balances.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePaymentMethod(index)}
                    className="open-modal__btn-remove"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="open-modal__field">
            <label>Notas (opcional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observaciones sobre la apertura..."
              rows={2}
            />
          </div>

          <div className="open-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="open-modal__btn open-modal__btn--cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="open-modal__btn open-modal__btn--submit"
              disabled={loading || hasOpenRegister}
            >
              {loading ? 'Abriendo...' : 'Abrir Caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashRegisterOpenModal;
