import { useState, useEffect, useMemo } from 'react';
import { useProductApi } from '../../hooks/useApi/useProductApi';
import { useCustomerApi } from '../../hooks/useApi/useCustomerApi';
import { API_URL } from '../../config/api.config';

export const LoanForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    customer_id: '',
    supplier_id: '',
    quantity: 1,
    debt_type: 'NOS_DEBEN',
    notes: ''
  });

  const [deudorType, setDeudorType] = useState('CLIENTE');
  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const { data: productos, fetchProducts } = useProductApi();
  const { data: customersData, fetchCustomers } = useCustomerApi();
  const [loadingProveedores, setLoadingProveedores] = useState(false);

  // Determinar si es prestamo que NOS_DEBEN (nosotros prestamos) o DEBEMOS (nos prestan)
  const isNosDeben = formData.debt_type === 'NOS_DEBEN';

  useEffect(() => {
    fetchProducts({ status: 'active', product_type: 'BALON_GAS,BIDON_AGUA' });
    fetchCustomers({ status: 'active' });
  }, []);

  useEffect(() => {
    if (customersData) {
      setClientes(customersData);
    }
  }, [customersData]);

  useEffect(() => {
    if (deudorType === 'PROVEEDOR') {
      loadProveedores();
    }
  }, [deudorType]);

  // Obtener el producto seleccionado y su stock disponible
  const selectedProduct = useMemo(() => {
    if (!formData.product_id || !productos.length) return null;
    return productos.find(p => p.id === parseInt(formData.product_id));
  }, [formData.product_id, productos]);

  const maxStock = selectedProduct?.empty_stock || 0;

  // Ajustar cantidad si excede el stock al cambiar producto (solo para NOS_DEBEN)
  useEffect(() => {
    if (isNosDeben && selectedProduct && formData.quantity > maxStock) {
      setFormData(prev => ({ ...prev, quantity: maxStock > 0 ? maxStock : 1 }));
    }
  }, [selectedProduct, maxStock, isNosDeben]);

  const loadProveedores = async () => {
    setLoadingProveedores(true);
    try {
      const response = await fetch(`${API_URL}/suppliers?status=active`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setProveedores(data.data || []);
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
    } finally {
      setLoadingProveedores(false);
    }
  };

  const handleDebtTypeChange = (e) => {
    const newDebtType = e.target.value;
    setFormData(prev => ({
      ...prev,
      debt_type: newDebtType,
      quantity: 1 // Resetear cantidad al cambiar tipo
    }));
  };

  const handleDeudorTypeChange = (type) => {
    setDeudorType(type);
    setFormData(prev => ({
      ...prev,
      customer_id: '',
      supplier_id: ''
    }));
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    const product = productos.find(p => p.id === parseInt(productId));
    const newMaxStock = product?.empty_stock || 0;

    setFormData(prev => ({
      ...prev,
      product_id: productId,
      // Solo limitar cantidad si es NOS_DEBEN
      quantity: isNosDeben ? (newMaxStock > 0 ? 1 : 0) : 1
    }));
  };

  const handleQuantityChange = (e) => {
    let value = parseInt(e.target.value) || 0;

    // Solo limitar al stock si es NOS_DEBEN
    if (isNosDeben && value > maxStock) {
      value = maxStock;
    }
    if (value < 1) value = 1;

    setFormData(prev => ({ ...prev, quantity: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('Debe seleccionar un producto');
      return;
    }

    // Validacion de stock solo para NOS_DEBEN
    if (isNosDeben && formData.quantity > maxStock) {
      alert(`Stock insuficiente. Solo hay ${maxStock} envases vacios disponibles.`);
      return;
    }

    if (formData.quantity < 1) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    const dataToSubmit = { ...formData };

    if (deudorType === 'CLIENTE') {
      dataToSubmit.supplier_id = null;
    } else {
      dataToSubmit.customer_id = null;
    }

    onSubmit(dataToSubmit);
  };

  // Determinar si el boton debe estar deshabilitado
  const isSubmitDisabled = () => {
    if (!selectedProduct) return true;
    if (formData.quantity < 1) return true;
    // Solo validar stock para NOS_DEBEN
    if (isNosDeben && (maxStock <= 0 || formData.quantity > maxStock)) return true;
    return false;
  };

  return (
    <form onSubmit={handleSubmit} className="loan-form">
      <h3 className="loan-form__title">Registrar Prestamo</h3>

      <div className="loan-form__grid">
        <div className="loan-form__field loan-form__field--full">
          <label className="loan-form__label">Tipo de Deuda *</label>
          <div className="loan-form__radio-group">
            <label className="loan-form__radio">
              <input
                type="radio"
                name="debt_type"
                value="NOS_DEBEN"
                checked={formData.debt_type === 'NOS_DEBEN'}
                onChange={handleDebtTypeChange}
              />
              <span className="loan-form__radio-label loan-form__radio-label--nos-deben">
                Nos Deben (Prestamos envases)
              </span>
            </label>
            <label className="loan-form__radio">
              <input
                type="radio"
                name="debt_type"
                value="DEBEMOS"
                checked={formData.debt_type === 'DEBEMOS'}
                onChange={handleDebtTypeChange}
              />
              <span className="loan-form__radio-label loan-form__radio-label--debemos">
                Debemos (Nos prestan envases)
              </span>
            </label>
          </div>
          <p className="loan-form__help">
            {isNosDeben
              ? 'Nuestro stock de vacios disminuira al registrar'
              : 'Nuestro stock de vacios aumentara al registrar'
            }
          </p>
        </div>

        <div className="loan-form__field loan-form__field--full">
          <label className="loan-form__label">Producto (Envase) *</label>
          <select
            value={formData.product_id}
            onChange={handleProductChange}
            className="loan-form__select"
            required
          >
            <option value="">Seleccione un envase...</option>
            {productos.map(p => (
              <option
                key={p.id}
                value={p.id}
                disabled={isNosDeben && p.empty_stock <= 0}
              >
                {p.code} - {p.name} (Vacios: {p.empty_stock || 0})
              </option>
            ))}
          </select>
          {selectedProduct && isNosDeben && (
            <p className="loan-form__help loan-form__help--stock">
              Stock disponible para prestar: <strong>{maxStock}</strong> envases vacios
            </p>
          )}
          {selectedProduct && !isNosDeben && (
            <p className="loan-form__help loan-form__help--stock">
              Stock actual: <strong>{maxStock}</strong> envases vacios (aumentara con este registro)
            </p>
          )}
        </div>

        <div className="loan-form__field loan-form__field--full">
          <label className="loan-form__label">Tipo de Deudor *</label>
          <div className="loan-form__radio-group">
            <label className="loan-form__radio">
              <input
                type="radio"
                name="deudor_type"
                value="CLIENTE"
                checked={deudorType === 'CLIENTE'}
                onChange={(e) => handleDeudorTypeChange(e.target.value)}
              />
              <span className="loan-form__radio-label">Cliente</span>
            </label>
            <label className="loan-form__radio">
              <input
                type="radio"
                name="deudor_type"
                value="PROVEEDOR"
                checked={deudorType === 'PROVEEDOR'}
                onChange={(e) => handleDeudorTypeChange(e.target.value)}
              />
              <span className="loan-form__radio-label">Proveedor</span>
            </label>
          </div>
        </div>

        <div className="loan-form__field loan-form__field--full">
          <label className="loan-form__label">
            {deudorType === 'CLIENTE' ? 'Cliente *' : 'Proveedor *'}
          </label>
          {deudorType === 'CLIENTE' ? (
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
              className="loan-form__select"
              required
            >
              <option value="">Seleccione un cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.full_name} - {c.document_number}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={formData.supplier_id}
              onChange={(e) => setFormData(prev => ({ ...prev, supplier_id: e.target.value }))}
              className="loan-form__select"
              disabled={loadingProveedores}
              required
            >
              <option value="">Seleccione un proveedor...</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>
                  {p.business_name} - {p.ruc}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="loan-form__field loan-form__field--full">
          <label className="loan-form__label">Cantidad *</label>
          <input
            type="number"
            min="1"
            max={isNosDeben ? (maxStock || 1) : undefined}
            value={formData.quantity}
            onChange={handleQuantityChange}
            className="loan-form__input"
            required
            disabled={!selectedProduct || (isNosDeben && maxStock <= 0)}
          />
          {selectedProduct && isNosDeben && (
            <p className="loan-form__help">
              Maximo: {maxStock} unidades
              {formData.quantity > maxStock && (
                <span className="loan-form__help--error"> (Excede el stock disponible)</span>
              )}
            </p>
          )}
          {selectedProduct && !isNosDeben && (
            <p className="loan-form__help">
              Ingrese la cantidad de envases que le prestaron
            </p>
          )}
        </div>

        <div className="loan-form__field loan-form__field--full">
          <label className="loan-form__label">Observacion</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="loan-form__textarea"
            placeholder="Notas adicionales sobre el prestamo..."
            rows="3"
          />
        </div>
      </div>

      <div className="loan-form__actions">
        <button
          type="button"
          onClick={onCancel}
          className="loan-form__btn loan-form__btn--cancel"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="loan-form__btn loan-form__btn--submit"
          disabled={isSubmitDisabled()}
        >
          Registrar Prestamo
        </button>
      </div>
    </form>
  );
};
