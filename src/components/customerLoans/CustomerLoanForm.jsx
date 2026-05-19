import { useState, useEffect } from 'react';
import { useCustomerApi } from '../../hooks/useApi/useCustomerApi';
import { useWarehouseApi } from '../../hooks/useApi/useWarehouseApi';
import { ComboBoxCliente } from '../common/ComboBoxCliente';
import { API_URL } from '../../config/api.config';
import { CONTAINER_TYPE_LABELS } from '../../utils/constants';

const CONTAINER_OPTIONS = [
  { value: 'BALON_GAS', label: CONTAINER_TYPE_LABELS.BALON_GAS },
  { value: 'BIDON_AGUA', label: CONTAINER_TYPE_LABELS.BIDON_AGUA }
];

export const CustomerLoanForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    warehouse_id: '',
    container_type: '',
    customer_id: '',
    quantity: 1,
    debt_type: 'NOS_DEBEN',
    notes: ''
  });

  const [clientes, setClientes] = useState([]);
  const [emptyStock, setEmptyStock] = useState({});
  const [loadingStock, setLoadingStock] = useState(false);

  const { data: almacenes, fetchWarehouses } = useWarehouseApi();
  const { getCustomerList } = useCustomerApi();

  const isNosDeben = formData.debt_type === 'NOS_DEBEN';

  useEffect(() => {
    fetchWarehouses({ status: 'active' });
    getCustomerList().then(list => {
      if (list) setClientes(list);
    });
  }, []);

  useEffect(() => {
    const cargarStockVacios = async () => {
      if (!formData.warehouse_id) {
        setEmptyStock({});
        return;
      }

      setLoadingStock(true);
      try {
        const response = await fetch(`${API_URL}/inventory/empty-stock/${formData.warehouse_id}`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        });
        const data = await response.json();
        if (data.success) {
          const stockMap = {};
          (data.data || []).forEach(item => {
            stockMap[item.container_type] = item.empty_stock || 0;
          });
          setEmptyStock(stockMap);
        }
      } catch (error) {
        console.error('Error al cargar stock de vacios:', error);
        setEmptyStock({});
      } finally {
        setLoadingStock(false);
      }
    };

    cargarStockVacios();
    setFormData(prev => ({ ...prev, container_type: '', quantity: 1 }));
  }, [formData.warehouse_id]);

  const maxStock = formData.container_type ? (emptyStock[formData.container_type] || 0) : 0;

  useEffect(() => {
    if (isNosDeben && formData.container_type && formData.quantity > maxStock) {
      setFormData(prev => ({ ...prev, quantity: maxStock > 0 ? maxStock : 1 }));
    }
  }, [formData.container_type, maxStock, isNosDeben]);

  const handleWarehouseChange = (e) => {
    setFormData(prev => ({
      ...prev,
      warehouse_id: e.target.value,
      container_type: '',
      quantity: 1
    }));
  };

  const handleDebtTypeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      debt_type: e.target.value,
      quantity: 1
    }));
  };

  const handleContainerTypeChange = (e) => {
    const containerType = e.target.value;
    if (containerType === '') {
      setFormData(prev => ({ ...prev, container_type: '', quantity: 1 }));
      return;
    }

    const newMaxStock = emptyStock[containerType] || 0;

    setFormData(prev => ({
      ...prev,
      container_type: containerType,
      quantity: isNosDeben ? (newMaxStock > 0 ? 1 : 0) : 1
    }));
  };

  const handleQuantityChange = (e) => {
    let value = parseInt(e.target.value) || 0;

    if (isNosDeben && value > maxStock) {
      value = maxStock;
    }
    if (value < 1) value = 1;

    setFormData(prev => ({ ...prev, quantity: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.warehouse_id) {
      alert('Debe seleccionar un almacen');
      return;
    }

    if (!formData.container_type) {
      alert('Debe seleccionar un tipo de envase');
      return;
    }

    if (isNosDeben && formData.quantity > maxStock) {
      alert(`Stock insuficiente. Solo hay ${maxStock} envases vacios disponibles en este almacen.`);
      return;
    }

    if (formData.quantity < 1) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    if (!formData.customer_id) {
      alert('Debe seleccionar un cliente');
      return;
    }

    onSubmit(formData);
  };

  const isSubmitDisabled = () => {
    if (!formData.warehouse_id) return true;
    if (!formData.container_type) return true;
    if (!formData.customer_id) return true;
    if (formData.quantity < 1) return true;
    if (isNosDeben && (maxStock <= 0 || formData.quantity > maxStock)) return true;
    return false;
  };

  const selectedWarehouse = almacenes.find(w => w.id === parseInt(formData.warehouse_id));

  return (
    <form onSubmit={handleSubmit} className="loan-form">
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
                Nos Deben (Prestamos envases al cliente)
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
                Debemos (El cliente nos presta envases)
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
          <label className="loan-form__label">Almacen *</label>
          <select
            value={formData.warehouse_id}
            onChange={handleWarehouseChange}
            className="loan-form__select"
            required
          >
            <option value="">Seleccione un almacen...</option>
            {almacenes.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} {w.is_main ? '(Principal)' : ''}
              </option>
            ))}
          </select>
          <p className="loan-form__help">
            Seleccione el almacen desde el cual se realizara el prestamo
          </p>
        </div>

        <div className="loan-form__field loan-form__field--full">
          <label className="loan-form__label">Tipo de Envase *</label>
          <select
            value={formData.container_type}
            onChange={handleContainerTypeChange}
            className="loan-form__select"
            required
            disabled={!formData.warehouse_id || loadingStock}
          >
            <option value="">
              {!formData.warehouse_id
                ? 'Primero seleccione un almacen...'
                : loadingStock
                  ? 'Cargando stock...'
                  : 'Seleccione un tipo de envase...'
              }
            </option>
            {CONTAINER_OPTIONS.map((ct) => {
              const stock = emptyStock[ct.value] || 0;
              return (
                <option
                  key={ct.value}
                  value={ct.value}
                  disabled={isNosDeben && stock <= 0}
                >
                  {ct.label} (Vacios: {stock})
                </option>
              );
            })}
          </select>
          {formData.container_type && isNosDeben && (
            <p className="loan-form__help loan-form__help--stock">
              Stock disponible en {selectedWarehouse?.name}: <strong>{maxStock}</strong> envases vacios
            </p>
          )}
          {formData.container_type && !isNosDeben && (
            <p className="loan-form__help loan-form__help--stock">
              Stock actual en {selectedWarehouse?.name}: <strong>{maxStock}</strong> envases vacios (aumentara con este registro)
            </p>
          )}
        </div>

        <div className="loan-form__field loan-form__field--full">
          <label className="loan-form__label">Cliente *</label>
          <ComboBoxCliente
            clientes={clientes}
            value={formData.customer_id ? parseInt(formData.customer_id) : null}
            onChange={(id) => setFormData(prev => ({ ...prev, customer_id: id ? String(id) : '' }))}
          />
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
            disabled={!formData.container_type || (isNosDeben && maxStock <= 0)}
          />
          {formData.container_type && isNosDeben && (
            <p className="loan-form__help">
              Maximo: {maxStock} unidades
              {formData.quantity > maxStock && (
                <span className="loan-form__help--error"> (Excede el stock disponible)</span>
              )}
            </p>
          )}
          {formData.container_type && !isNosDeben && (
            <p className="loan-form__help">
              Ingrese la cantidad de envases que el cliente nos presta
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
