import { useState, useEffect } from 'react';
import { useProductApi } from '../../hooks/useApi/useProductApi';
import { inventoryService } from '../../services/inventoryService';
import { API_URL } from '../../config/api.config';
import { ComboBoxProducto } from '../common/ComboBoxProducto';
import { ComboBoxAlmacen } from '../common/ComboBoxAlmacen';
import { useAlertToast } from '../common/AlertToast';
import { CONTAINER_TYPE_LABELS } from '../../utils/constants';

export const ExitForm = ({ onSubmit, onCancel }) => {
  const [almacenId, setAlmacenId] = useState('');
  const [almacenes, setAlmacenes] = useState([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [reason, setReason] = useState('');
  const [referenceDocument, setReferenceDocument] = useState('');

  // Stock disponible en el almacen seleccionado
  const [stockDisponible, setStockDisponible] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);

  // Productos llenos a retirar
  const [productosLlenos, setProductosLlenos] = useState([]);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState('');
  const [cantidadLlenos, setCantidadLlenos] = useState(0);

  // Vacios a retirar (agrupados por tipo)
  const [vaciosBalones, setVaciosBalones] = useState(0);
  const [vaciosBidones, setVaciosBidones] = useState(0);

  // Totales de vacios disponibles en el almacen
  const [totalVaciosBalones, setTotalVaciosBalones] = useState(0);
  const [totalVaciosBidones, setTotalVaciosBidones] = useState(0);

  const { data: productos, fetchProducts } = useProductApi();
  const { showAlert, AlertComponent } = useAlertToast();

  useEffect(() => {
    fetchProducts({ status: 'active', limit: 1000 });
    loadAlmacenes();
  }, []);

  const loadAlmacenes = async () => {
    setLoadingAlmacenes(true);
    try {
      const response = await fetch(`${API_URL}/warehouses?status=active`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await response.json();
      const almacenesActivos = data.data || [];
      setAlmacenes(almacenesActivos);

      // Pre-seleccionar almacen principal
      const almacenPrincipal = almacenesActivos.find(a => a.is_main);
      if (almacenPrincipal) {
        setAlmacenId(almacenPrincipal.id.toString());
        loadStockAlmacen(almacenPrincipal.id);
      } else if (almacenesActivos.length > 0) {
        setAlmacenId(almacenesActivos[0].id.toString());
        loadStockAlmacen(almacenesActivos[0].id);
      }
    } catch (err) {
      console.error('Error al cargar almacenes:', err);
    } finally {
      setLoadingAlmacenes(false);
    }
  };

  const loadStockAlmacen = async (warehouseId) => {
    if (!warehouseId) return;
    setLoadingStock(true);
    try {
      const response = await fetch(`${API_URL}/products/stock/${warehouseId}`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await response.json();
      const stock = data.data || [];
      setStockDisponible(stock);
    } catch (err) {
      console.error('Error al cargar stock del almacen:', err);
    } finally {
      setLoadingStock(false);
    }

    loadEmptyStock(warehouseId);
  };

  const loadEmptyStock = async (warehouseId) => {
    try {
      const response = await inventoryService.getEmptyStock(warehouseId);
      if (response.success && response.data) {
        let vacBal = 0;
        let vacBid = 0;
        response.data.forEach(item => {
          if (item.container_type === 'BALON_GAS') {
            vacBal += item.empty_stock || 0;
          } else if (item.container_type === 'BIDON_AGUA') {
            vacBid += item.empty_stock || 0;
          }
        });
        setTotalVaciosBalones(vacBal);
        setTotalVaciosBidones(vacBid);
      } else {
        setTotalVaciosBalones(0);
        setTotalVaciosBidones(0);
      }
    } catch (err) {
      console.error('Error al cargar stock de vacios:', err);
      setTotalVaciosBalones(0);
      setTotalVaciosBidones(0);
    }
  };

  const handleAlmacenChange = (id) => {
    setAlmacenId(id ? id.toString() : '');
    setProductosLlenos([]);
    setVaciosBalones(0);
    setVaciosBidones(0);
    if (id) {
      loadStockAlmacen(id);
    }
  };

  // Filtrar productos que tengan stock de llenos en este almacen
  const productosConStock = stockDisponible.filter(s => s.available_stock > 0);
  const productosDisponibles = productosConStock.filter(
    s => !productosLlenos.some(item => item.product_id === s.product_id)
  );

  const productoSeleccionadoStock = stockDisponible.find(
    s => s.product_id === parseInt(productoSeleccionadoId)
  );
  const maxCantidad = productoSeleccionadoStock?.available_stock || 0;

  const handleAgregarProducto = () => {
    if (!productoSeleccionadoId || cantidadLlenos <= 0) return;

    const stockItem = stockDisponible.find(s => s.product_id === parseInt(productoSeleccionadoId));
    if (!stockItem) return;

    const nuevoItem = {
      product_id: stockItem.product_id,
      product_name: stockItem.product_name,
      product_code: stockItem.product_code,
      product_type: stockItem.product_type,
      quantity_full: cantidadLlenos,
      available_stock: stockItem.available_stock
    };

    setProductosLlenos(prev => [...prev, nuevoItem]);
    setProductoSeleccionadoId('');
    setCantidadLlenos(0);
  };

  const handleEliminarProducto = (index) => {
    setProductosLlenos(prev => prev.filter((_, i) => i !== index));
  };

  const validarFormulario = () => {
    const errores = [];

    if (!almacenId) {
      errores.push('Debe seleccionar un almacén de origen');
    }

    if (productosLlenos.length === 0 && vaciosBalones === 0 && vaciosBidones === 0) {
      errores.push('Debe agregar al menos un producto lleno o indicar vacíos a retirar');
    }

    // Validar cantidades de productos llenos
    productosLlenos.forEach((item) => {
      if (item.quantity_full <= 0) {
        errores.push(`El producto "${item.product_name}" debe tener una cantidad mayor a 0`);
      }
      if (item.quantity_full > item.available_stock) {
        errores.push(`El producto "${item.product_name}" solo tiene ${item.available_stock} unidades disponibles`);
      }
    });

    // Validar cantidades de vacios
    if (vaciosBalones > totalVaciosBalones) {
      errores.push(`Solo hay ${totalVaciosBalones} balones vacíos disponibles (intentó retirar ${vaciosBalones})`);
    }
    if (vaciosBidones > totalVaciosBidones) {
      errores.push(`Solo hay ${totalVaciosBidones} bidones vacíos disponibles (intentó retirar ${vaciosBidones})`);
    }

    return errores;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errores = validarFormulario();

    if (errores.length > 0) {
      showAlert({ errors: errores, type: 'error' });
      return;
    }

    const formData = {
      warehouse_id: parseInt(almacenId),
      reason: reason || 'Salida de inventario',
      reference_document: referenceDocument,
      movement_type: 'SALIDA',
      items: productosLlenos.map(item => ({
        product_id: item.product_id,
        quantity_full: item.quantity_full,
        quantity_empty: 0,
        quantity: 0
      })),
      vacios_balones: vaciosBalones,
      vacios_bidones: vaciosBidones
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="inventory-form inventory-form--simple">
      {/* Almacen de origen */}
      <div className="inventory-form__section">
        <label className="inventory-form__label">
          Almacen de origen *
        </label>
        {loadingAlmacenes ? (
          <p className="inventory-form__loading">Cargando almacenes...</p>
        ) : (
          <ComboBoxAlmacen
            almacenes={almacenes}
            value={almacenId ? parseInt(almacenId) : null}
            onChange={handleAlmacenChange}
            placeholder="Seleccionar almacen..."
            required
          />
        )}
      </div>

      {almacenId && (
        <>
          {/* Seccion: Productos Llenos a Retirar */}
          <div className="inventory-form__section">
            <h4 className="inventory-form__section-title">Productos Llenos a Retirar</h4>

            {loadingStock ? (
              <p className="inventory-form__loading">Cargando stock...</p>
            ) : productosConStock.length === 0 ? (
              <p className="inventory-form__empty">No hay productos con stock en este almacen</p>
            ) : (
              <div className="inventory-form__add-section">
                <div className="inventory-form__field">
                  <label className="inventory-form__label">Producto</label>
                  <select
                    value={productoSeleccionadoId}
                    onChange={(e) => {
                      setProductoSeleccionadoId(e.target.value);
                      setCantidadLlenos(0);
                    }}
                    className="inventory-form__select"
                  >
                    <option value="">Seleccionar producto...</option>
                    {productosDisponibles.map(item => (
                      <option key={item.product_id} value={item.product_id}>
                        {item.product_name} ({item.product_code}) - Stock: {item.available_stock}
                      </option>
                    ))}
                  </select>
                </div>

                {productoSeleccionadoId && (
                  <>
                    <div className="inventory-form__field">
                      <label className="inventory-form__label">
                        Cantidad a retirar (max: {maxCantidad})
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={maxCantidad}
                        value={cantidadLlenos}
                        onChange={(e) => {
                          const val = Math.min(parseInt(e.target.value) || 0, maxCantidad);
                          setCantidadLlenos(val);
                        }}
                        className="inventory-form__input"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAgregarProducto}
                      className="inventory-form__btn inventory-form__btn--add"
                      disabled={cantidadLlenos <= 0}
                    >
                      + Agregar
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Lista de productos agregados */}
            {productosLlenos.length > 0 && (
              <div className="inventory-form__list">
                <div className="inventory-form__list-items">
                  {productosLlenos.map((item, index) => (
                    <div key={index} className="inventory-form__list-item">
                      <div className="inventory-form__list-item-info">
                        <span className="inventory-form__list-item-name">{item.product_name}</span>
                        <span className="inventory-form__list-item-detail">
                          {item.quantity_full} llenos a retirar
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEliminarProducto(index)}
                        className="inventory-form__list-item-remove"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Seccion: Vacios a Retirar */}
          <div className="inventory-form__section">
            <h4 className="inventory-form__section-title">Vacios a Retirar</h4>

            <div className="inventory-form__vacios-grid">
              {/* Balones de gas vacios */}
              <div className="inventory-form__vacios-item">
                <div className="inventory-form__vacios-header">
                  <span className="inventory-form__vacios-icon">🔵</span>
                  <span className="inventory-form__vacios-label">Balones Vacios</span>
                </div>
                <div className="inventory-form__vacios-stock">
                  Disponibles: <strong>{totalVaciosBalones}</strong>
                </div>
                <div className="inventory-form__vacios-input-row">
                  <label>Retirar:</label>
                  <input
                    type="number"
                    min="0"
                    max={totalVaciosBalones}
                    value={vaciosBalones}
                    onChange={(e) => {
                      const val = Math.min(parseInt(e.target.value) || 0, totalVaciosBalones);
                      setVaciosBalones(val);
                    }}
                    className="inventory-form__input inventory-form__input--small"
                    disabled={totalVaciosBalones === 0}
                  />
                </div>
              </div>

              {/* Bidones de agua vacios */}
              <div className="inventory-form__vacios-item">
                <div className="inventory-form__vacios-header">
                  <span className="inventory-form__vacios-icon">💧</span>
                  <span className="inventory-form__vacios-label">Bidones de Agua Vacios</span>
                </div>
                <div className="inventory-form__vacios-stock">
                  Disponibles: <strong>{totalVaciosBidones}</strong>
                </div>
                <div className="inventory-form__vacios-input-row">
                  <label>Retirar:</label>
                  <input
                    type="number"
                    min="0"
                    max={totalVaciosBidones}
                    value={vaciosBidones}
                    onChange={(e) => {
                      const val = Math.min(parseInt(e.target.value) || 0, totalVaciosBidones);
                      setVaciosBidones(val);
                    }}
                    className="inventory-form__input inventory-form__input--small"
                    disabled={totalVaciosBidones === 0}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Motivo y documento */}
      <div className="inventory-form__extra">
        <div className="inventory-form__field">
          <label className="inventory-form__label">Motivo (opcional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="inventory-form__input"
            placeholder="Ej: Devolucion a proveedor, Merma, etc."
          />
        </div>
        <div className="inventory-form__field">
          <label className="inventory-form__label">Documento de referencia (opcional)</label>
          <input
            type="text"
            value={referenceDocument}
            onChange={(e) => setReferenceDocument(e.target.value)}
            className="inventory-form__input"
            placeholder="Ej: Guia 001-123"
          />
        </div>
      </div>

      {/* Resumen */}
      {(productosLlenos.length > 0 || vaciosBalones > 0 || vaciosBidones > 0) && (
        <div className="inventory-form__summary">
          <h4 className="inventory-form__summary-title">Resumen de Salida</h4>
          {productosLlenos.length > 0 && (
            <div className="inventory-form__summary-row">
              <span>Productos llenos:</span>
              <span>{productosLlenos.reduce((sum, p) => sum + p.quantity_full, 0)} unidades</span>
            </div>
          )}
          {vaciosBalones > 0 && (
            <div className="inventory-form__summary-row">
              <span>Balones vacios:</span>
              <span>{vaciosBalones} unidades</span>
            </div>
          )}
          {vaciosBidones > 0 && (
            <div className="inventory-form__summary-row">
              <span>Bidones vacios:</span>
              <span>{vaciosBidones} unidades</span>
            </div>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="inventory-form__actions">
        <button type="button" onClick={onCancel} className="inventory-form__btn inventory-form__btn--cancel">
          Cancelar
        </button>
        <button
          type="submit"
          className="inventory-form__btn inventory-form__btn--submit"
        >
          Confirmar Salida
        </button>
      </div>

      <AlertComponent />
    </form>
  );
};
