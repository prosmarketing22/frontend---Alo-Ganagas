import { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import { ComboBoxCliente } from '../common/ComboBoxCliente';

export const CreditsAdjustmentModal = ({ onSubmit, onClose, loading }) => {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [formData, setFormData] = useState({
    customer_id: null,
    amount: '',
    adjustment_type: 'subtract',
    description: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      // Cargar todos los clientes para permitir búsqueda completa
      const response = await customerService.getList();
      setCustomers(response.data || []);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);

    if (!formData.customer_id) {
      alert('Debe seleccionar un cliente');
      return;
    }

    if (!amount || amount <= 0) {
      alert('Debe ingresar un monto válido');
      return;
    }

    if (!formData.description.trim()) {
      alert('Debe ingresar una descripción para el ajuste');
      return;
    }

    // Validar que si es tipo 'add' (aumentar deuda), no exceda el límite
    if (formData.adjustment_type === 'add' && selectedCustomer) {
      const creditLimit = parseFloat(selectedCustomer.credit_limit || 0);
      const currentDebt = parseFloat(selectedCustomer.pending_debt || 0);
      const availableCredit = creditLimit - currentDebt;

      if (amount > availableCredit) {
        alert(`El ajuste excedería el límite de crédito.\nCrédito disponible: S/ ${availableCredit.toFixed(2)}`);
        return;
      }
    }

    onSubmit({
      customer_id: formData.customer_id,
      amount: formData.amount,
      adjustment_type: formData.adjustment_type,
      description: formData.description
    });
  };

  const selectedCustomer = formData.customer_id ? customers.find(c => c.id === formData.customer_id) : null;

  return (
    <div className="credits-modal-overlay" onClick={onClose}>
      <div className="credits-modal" onClick={(e) => e.stopPropagation()}>
        <div className="credits-modal-header">
          <h2 className="credits-modal-title">
            ⚙️ Ajuste Manual de Crédito
          </h2>
          <button className="credits-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="credits-modal-body">
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            color: '#92400e'
          }}>
            ⚠️ <strong>Solo para gerencia.</strong> Los ajustes manuales quedan registrados en el historial del cliente.
          </div>

          <form className="credits-form" onSubmit={handleSubmit}>
            <div className="credits-form-group">
              <label className="credits-form-label">Cliente *</label>
              {loadingCustomers ? (
                <div className="credits-loading">
                  <div className="credits-spinner" style={{ width: '20px', height: '20px' }} />
                </div>
              ) : (
                <ComboBoxCliente
                  clientes={customers}
                  value={formData.customer_id}
                  onChange={(id) => setFormData(prev => ({ ...prev, customer_id: id }))}
                  placeholder="Buscar por nombre, DNI, teléfono, dirección, distrito..."
                />
              )}
            </div>

            {selectedCustomer && (
              <div className="credits-customer-info">
                <div className="credits-customer-info-row">
                  <span className="credits-customer-info-label">Límite actual:</span>
                  <span className="credits-customer-info-value" style={{ color: '#3b82f6' }}>
                    S/ {parseFloat(selectedCustomer.credit_limit || 0).toFixed(2)}
                  </span>
                </div>
                <div className="credits-customer-info-row">
                  <span className="credits-customer-info-label">Deuda actual:</span>
                  <span className="credits-customer-info-value" style={{ color: '#ef4444' }}>
                    S/ {parseFloat(selectedCustomer.pending_debt || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="credits-form-group">
              <label className="credits-form-label">Tipo de ajuste *</label>
              <select
                name="adjustment_type"
                value={formData.adjustment_type}
                onChange={handleChange}
                className="credits-form-select"
                required
              >
                <option value="subtract">Reducir deuda (ABONO)</option>
                <option value="add">Aumentar deuda (CARGO)</option>
              </select>
            </div>

            <div className="credits-form-group">
              <label className="credits-form-label">Monto *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="credits-form-input"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="credits-form-group">
              <label className="credits-form-label">Motivo del ajuste *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="credits-form-textarea"
                placeholder="Describir el motivo del ajuste manual..."
                required
              />
            </div>

            <div className="credits-form-actions">
              <button
                type="button"
                onClick={onClose}
                className="credits-form-btn credits-form-btn--secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="credits-form-btn credits-form-btn--primary"
              >
                {loading ? 'Procesando...' : 'Registrar Ajuste'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
