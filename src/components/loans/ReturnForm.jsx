import { useState } from 'react';

export const ReturnForm = ({ loan, onSubmit, onCancel }) => {
  const pending = loan.quantity - loan.quantity_returned;
  const [quantity, setQuantity] = useState(pending);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity <= 0 || quantity > pending) {
      alert('La cantidad a devolver debe ser mayor a 0 y no exceder lo pendiente');
      return;
    }
    onSubmit(loan.id, quantity);
  };

  return (
    <form onSubmit={handleSubmit} className="return-form">
      <h3 className="return-form__title">Registrar Devolucion</h3>

      <div className="return-form__summary">
        <div className="return-form__summary-item">
          <span className="return-form__summary-label">Producto:</span>
          <span className="return-form__summary-value">{loan.product_name}</span>
        </div>
        <div className="return-form__summary-item">
          <span className="return-form__summary-label">Deudor:</span>
          <span className="return-form__summary-value">{loan.debtor_name}</span>
        </div>
        <div className="return-form__summary-item">
          <span className="return-form__summary-label">Tipo:</span>
          <span className={`return-form__summary-value ${loan.debt_type === 'NOS_DEBEN' ? 'return-form__summary-value--nos-deben' : 'return-form__summary-value--debemos'}`}>
            {loan.debt_type === 'NOS_DEBEN' ? 'Nos Deben' : 'Debemos'}
          </span>
        </div>
        <div className="return-form__summary-divider"></div>
        <div className="return-form__summary-item">
          <span className="return-form__summary-label">Cantidad Total:</span>
          <span className="return-form__summary-value">{loan.quantity}</span>
        </div>
        <div className="return-form__summary-item">
          <span className="return-form__summary-label">Ya Devuelto:</span>
          <span className="return-form__summary-value">{loan.quantity_returned}</span>
        </div>
        <div className="return-form__summary-item return-form__summary-item--highlight">
          <span className="return-form__summary-label">Pendiente:</span>
          <span className="return-form__summary-value return-form__summary-value--pending">{pending}</span>
        </div>
      </div>

      <div className="return-form__field">
        <label className="return-form__label">Cantidad a Devolver *</label>
        <input
          type="number"
          min="1"
          max={pending}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          className="return-form__input"
          required
        />
        <p className="return-form__help">Maximo: {pending} unidades</p>
      </div>

      <div className="return-form__actions">
        <button
          type="button"
          onClick={onCancel}
          className="return-form__btn return-form__btn--cancel"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="return-form__btn return-form__btn--submit"
        >
          Registrar Devolucion
        </button>
      </div>
    </form>
  );
};
