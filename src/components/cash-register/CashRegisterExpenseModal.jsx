import { useState, useEffect, useRef } from 'react';
import { useCashRegisterApi } from '../../hooks/useApi/useCashRegisterApi';
import { useExpenseCategoryApi } from '../../hooks/useApi/useExpenseCategoryApi';
import './CashRegisterExpenseModal.css';

export const CashRegisterExpenseModal = ({ cashRegisterId, onClose, onSuccess }) => {
  const { registerExpense, paymentMethods, fetchPaymentMethods, loading } = useCashRegisterApi();
  const { categories, fetchCategories } = useExpenseCategoryApi();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    category_id: '',
    payment_method: 'EFECTIVO',
    amount: '',
    description: ''
  });
  const [voucherFile, setVoucherFile] = useState(null);
  const [voucherPreview, setVoucherPreview] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories(false); // Solo activas
    fetchPaymentMethods();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo - solo imagenes
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Solo se permiten imagenes (JPG, PNG, WEBP)');
        return;
      }
      // Validar tamano (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar los 5MB');
        return;
      }

      setVoucherFile(file);
      setError('');

      // Preview de imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoucherPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVoucher = () => {
    setVoucherFile(null);
    setVoucherPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.category_id) {
      setError('Seleccione una categoria');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Ingrese un monto valido');
      return;
    }
    if (!voucherFile) {
      setError('Debe adjuntar el comprobante del gasto');
      return;
    }

    setSaving(true);
    try {
      const result = await registerExpense(cashRegisterId, {
        category_id: parseInt(formData.category_id),
        payment_method: formData.payment_method,
        amount: parseFloat(formData.amount),
        description: formData.description.trim()
      }, voucherFile);

      if (result.success) {
        onSuccess && onSuccess(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const expensePaymentMethods = ['EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA'];

  return (
    <div className="expense-modal-overlay" onClick={onClose}>
      <div className="expense-modal" onClick={e => e.stopPropagation()}>
        <div className="expense-modal__header">
          <h3>Registrar Gasto</h3>
          <button className="expense-modal__close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="expense-modal__form">
          {error && (
            <div className="expense-modal__error">{error}</div>
          )}

          <div className="expense-modal__field">
            <label>Categoria *</label>
            <select
              value={formData.category_id}
              onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
              required
            >
              <option value="">Seleccione una categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="expense-modal__row">
            <div className="expense-modal__field">
              <label>Metodo de Pago *</label>
              <select
                value={formData.payment_method}
                onChange={e => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
              >
                {expensePaymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div className="expense-modal__field">
              <label>Monto *</label>
              <div className="expense-modal__amount-input">
                <span>S/</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          <div className="expense-modal__field">
            <label>Descripcion</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detalle del gasto (opcional)"
              rows={2}
            />
          </div>

          <div className="expense-modal__field">
            <label>Comprobante *</label>
            <div className="expense-modal__voucher">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {!voucherFile ? (
                <button
                  type="button"
                  className="expense-modal__voucher-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Adjuntar foto del comprobante
                </button>
              ) : (
                <div className="expense-modal__voucher-preview">
                  <img src={voucherPreview} alt="Preview" />
                  <button
                    type="button"
                    className="expense-modal__voucher-remove"
                    onClick={removeVoucher}
                  >
                    ×
                  </button>
                  <span className="expense-modal__voucher-name">{voucherFile.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="expense-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="expense-modal__btn expense-modal__btn--cancel"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="expense-modal__btn expense-modal__btn--save"
              disabled={saving || loading}
            >
              {saving ? 'Guardando...' : 'Registrar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashRegisterExpenseModal;
