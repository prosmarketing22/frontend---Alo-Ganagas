import { useState, useRef } from 'react';
import './CashRegisterExpenseModal.css';

const PAYMENT_METHOD_LABELS = {
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  FISE: 'FISE',
  TRANSFERENCIA: 'Transferencia'
};

export const CashRegisterExpenseModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  paymentMethods = ['EFECTIVO']
}) => {
  const [formData, setFormData] = useState({
    category_id: '',
    payment_method: 'EFECTIVO',
    amount: '',
    description: ''
  });
  const [voucherFile, setVoucherFile] = useState(null);
  const [voucherPreview, setVoucherPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten imagenes');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar 5MB');
        return;
      }
      setVoucherFile(file);
      setVoucherPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherFile(null);
    setVoucherPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.category_id) {
      setError('Seleccione una categoria');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Ingrese un monto valido');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, voucherFile);
    } catch (err) {
      setError(err.message || 'Error al registrar gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-modal-overlay" onClick={onClose}>
      <div className="expense-modal" onClick={e => e.stopPropagation()}>
        <div className="expense-modal__header">
          <h3>Registrar Gasto</h3>
          <button className="expense-modal__close" onClick={onClose}>X</button>
        </div>

        <form onSubmit={handleSubmit} className="expense-modal__form">
          {error && <div className="expense-modal__error">{error}</div>}

          <div className="expense-modal__field">
            <label>Categoria *</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="expense-modal__field">
            <label>Metodo de Pago *</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              required
            >
              {paymentMethods.filter(m => m !== 'CREDITO' && m !== 'MIXTO').map(method => (
                <option key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method] || method}
                </option>
              ))}
            </select>
          </div>

          <div className="expense-modal__field">
            <label>Monto (S/) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
            />
          </div>

          <div className="expense-modal__field">
            <label>Descripcion</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripcion del gasto (opcional)"
              maxLength={255}
            />
          </div>

          <div className="expense-modal__field">
            <label>Comprobante (opcional)</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="expense-modal__file-input"
            />
            {voucherPreview && (
              <div className="expense-modal__preview">
                <img src={voucherPreview} alt="Vista previa" />
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="expense-modal__preview-remove"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>

          <div className="expense-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="expense-modal__btn expense-modal__btn--cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="expense-modal__btn expense-modal__btn--submit"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashRegisterExpenseModal;
