import { useState, useEffect } from 'react';
import { API_URL } from '../../config/api.config';
import { ComboBoxProducto } from '../common/ComboBoxProducto';
import { ComboBoxAlmacen } from '../common/ComboBoxAlmacen';
import { useAlertToast } from '../common/AlertToast';
import { CONTAINER_TYPE_LABELS } from '../../utils/constants';

export const TransferForm = ({ onSubmit, onCancel }) => {
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');
  const [almacenes, setAlmacenes] = useState([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [reason, setReason] = useState('');
  const [referenceDocument, setReferenceDocument] = useState('');

  const [productosAgregados, setProductosAgregados] = useState([]);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState('');
  const [cantidadLlenos, setCantidadLlenos] = useState(0);
  const [cantidad, setCantidad] = useState(0);

  const [productosConStock, setProductosConStock] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);

  const [emptyStock, setEmptyStock] = useState([]);
  const [loadingEmptyStock, setLoadingEmptyStock] = useState(false);
  const [emptyItemsToTransfer, setEmptyItemsToTransfer] = useState({});

  const { showAlert, AlertComponent } = useAlertToast();

  useEffect(() => {
    loadAlmacenes();
  }, []);

  const loadAlmacenes = async () => {
    setLoadingAlmacenes(true);
    try {
      const response = await fetch(`${API_URL}/warehouses?status=active`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await response.json();
      setAlmacenes(data.data || []);
    } catch (err) {
      console.error('Error al cargar almacenes:', err);
    } finally {
      setLoadingAlmacenes(false);
    }
  };

  const loadProductosConStock = async (warehouseId) => {
    if (!warehouseId) {
      setProductosConStock([]);
      return;
    }

    setLoadingStock(true);
    try {
      const response = await fetch(`${API_URL}/products/stock/${warehouseId}`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await response.json();

      const productosConStockFiltrados = (data.data || []).filter(
        item => item.available_stock > 0
      );

      const productosFormateados = productosConStockFiltrados.map(item => ({
        id: item.product_id,
        name: item.product_name,
        code: item.product_code,
        product_type: item.product_type,
        brand_name: item.brand_name,
        available_stock: item.available_stock
      }));

      setProductosConStock(productosFormateados);
    } catch (err) {
      console.error('Error al cargar productos con stock:', err);
      setProductosConStock([]);
    } finally {
      setLoadingStock(false);
    }
  };

  const loadEmptyStock = async (warehouseId) => {
    if (!warehouseId) {
      setEmptyStock([]);
      return;
    }

    setLoadingEmptyStock(true);
    try {
      const response = await fetch(`${API_URL}/inventory/empty-stock/${warehouseId}`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await response.json();
      setEmptyStock(data.data || []);
    } catch (err) {
      console.error('Error al cargar stock de vacios:', err);
      setEmptyStock([]);
    } finally {
      setLoadingEmptyStock(false);
    }
  };

  useEffect(() => {
    if (sourceWarehouseId) {
      loadProductosConStock(sourceWarehouseId);
      loadEmptyStock(sourceWarehouseId);
    }
  }, [sourceWarehouseId]);

  const esProductoEnvase = (producto) => {
    return producto?.product_type === 'BALON_GAS' || producto?.product_type === 'BIDON_AGUA';
  };

  const productoSeleccionado = productosConStock.find(p => p.id === parseInt(productoSeleccionadoId));
  const esEnvase = esProductoEnvase(productoSeleccionado);

  const stockActual = productoSeleccionado
    ? { available_stock: productoSeleccionado.available_stock }
    : { available_stock: 0 };

  const productosDisponibles = productosConStock.filter(
    p => !productosAgregados.some(item => item.product.id === p.id)
  );

  const almacenesDestino = almacenes.filter(a => a.id.toString() !== sourceWarehouseId);

  const getEmptyStockByType = (key) => {
    const stockByType = {};
    emptyStock.forEach(e => {
      const containerType = e.container_type;
      stockByType[containerType] = (stockByType[containerType] || 0) + (e.empty_stock || 0);
    });
    return stockByType[key] || 0;
  };

  const handleEmptyQuantityChange = (key, value) => {
    const maxStock = getEmptyStockByType(key);
    const parsed = Math.min(parseInt(value) || 0, maxStock);
    setEmptyItemsToTransfer(prev => ({
      ...prev,
      [key]: parsed
    }));
  };

  const handleAgregarProducto = () => {
    if (!productoSeleccionadoId) return;
    const producto = productosConStock.find(p => p.id === parseInt(productoSeleccionadoId));
    if (!producto) return;

    if (esEnvase) {
      if (cantidadLlenos > stockActual.available_stock) {
        alert(`Stock insuficiente de llenos. Disponible: ${stockActual.available_stock}`);
        return;
      }
      if (cantidadLlenos === 0) {
        alert('Debe ingresar una cantidad de llenos');
        return;
      }
    } else {
      if (cantidad > stockActual.available_stock) {
        alert(`Stock insuficiente. Disponible: ${stockActual.available_stock}`);
        return;
      }
      if (cantidad === 0) {
        alert('Debe ingresar una cantidad');
        return;
      }
    }

    const nuevoItem = {
      product: producto,
      quantity_full: esEnvase ? cantidadLlenos : 0,
      quantity: !esEnvase ? cantidad : 0,
      stock_disponible: stockActual.available_stock
    };

    setProductosAgregados(prev => [...prev, nuevoItem]);
    setProductoSeleccionadoId('');
    setCantidadLlenos(0);
    setCantidad(0);
  };

  const handleEliminarProducto = (index) => {
    setProductosAgregados(prev => prev.filter((_, i) => i !== index));
  };

  const hasEmptyItemsToTransfer = () => {
    return Object.values(emptyItemsToTransfer).some(qty => qty > 0);
  };

  const validarFormulario = () => {
    const errores = [];

    if (!sourceWarehouseId) {
      errores.push('Debe seleccionar un almacen de origen');
    }

    if (!destinationWarehouseId) {
      errores.push('Debe seleccionar un almacen de destino');
    }

    if (sourceWarehouseId && destinationWarehouseId && sourceWarehouseId === destinationWarehouseId) {
      errores.push('El almacen de origen y destino no pueden ser el mismo');
    }

    if (productosAgregados.length === 0 && !hasEmptyItemsToTransfer()) {
      errores.push('Debe agregar al menos un producto o envase vacio para transferir');
    }

    productosAgregados.forEach((item) => {
      if (esProductoEnvase(item.product)) {
        if (item.quantity_full <= 0) {
          errores.push(`El producto "${item.product.name}" debe tener una cantidad de llenos mayor a 0`);
        }
        if (item.quantity_full > item.stock_disponible) {
          errores.push(`El producto "${item.product.name}" solo tiene ${item.stock_disponible} llenos disponibles`);
        }
      } else {
        if (item.quantity <= 0) {
          errores.push(`El producto "${item.product.name}" debe tener una cantidad mayor a 0`);
        }
        if (item.quantity > item.stock_disponible) {
          errores.push(`El producto "${item.product.name}" solo tiene ${item.stock_disponible} unidades disponibles`);
        }
      }
    });

    Object.entries(emptyItemsToTransfer).forEach(([key, qty]) => {
      if (qty > 0) {
        const disponible = getEmptyStockByType(key);
        if (qty > disponible) {
          const label = CONTAINER_TYPE_LABELS[key] || key;
          errores.push(`${label} vacios: solo hay ${disponible} disponibles`);
        }
      }
    });

    return errores;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errores = validarFormulario();

    if (errores.length > 0) {
      showAlert({ errors: errores, type: 'error' });
      return;
    }

    const items = productosAgregados.map(item => ({
      product_id: item.product.id,
      quantity_full: item.quantity_full
    }));

    const empty_items = Object.entries(emptyItemsToTransfer)
      .filter(([, qty]) => qty > 0)
      .map(([key, quantity]) => {
        return {
          container_type: key,
          quantity
        };
      });

    onSubmit({
      source_warehouse_id: parseInt(sourceWarehouseId),
      destination_warehouse_id: parseInt(destinationWarehouseId),
      reason,
      reference_document: referenceDocument,
      items,
      empty_items
    });
  };

  const getAlmacenNombre = (id) => {
    const almacen = almacenes.find(a => a.id.toString() === id);
    return almacen?.name || '';
  };

  return (
    <form onSubmit={handleSubmit} className="inventory-form inventory-form--simple">
      <div className="inventory-form__transfer-header">
        <h4 className="inventory-form__section-title">Transferencia entre Almacenes</h4>
        <p className="inventory-form__description">
          Mueva productos de un almacen a otro. El stock se descontara del origen y se agregara al destino.
        </p>
      </div>

      <div className="inventory-form__transfer-warehouses">
        <div className="inventory-form__section">
          <label className="inventory-form__label">
            Almacen de Origen *
          </label>
          {loadingAlmacenes ? (
            <p className="inventory-form__loading">Cargando almacenes...</p>
          ) : (
            <ComboBoxAlmacen
              almacenes={almacenes}
              value={sourceWarehouseId ? parseInt(sourceWarehouseId) : null}
              onChange={(id) => {
                setSourceWarehouseId(id ? id.toString() : '');
                setProductosAgregados([]);
                setProductoSeleccionadoId('');
                setProductosConStock([]);
                setEmptyStock([]);
                setEmptyItemsToTransfer({});
              }}
              placeholder="Seleccionar almacen origen..."
              required
            />
          )}
        </div>

        <div className="inventory-form__transfer-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>

        <div className="inventory-form__section">
          <label className="inventory-form__label">
            Almacen de Destino *
          </label>
          {loadingAlmacenes ? (
            <p className="inventory-form__loading">Cargando almacenes...</p>
          ) : (
            <ComboBoxAlmacen
              almacenes={almacenesDestino}
              value={destinationWarehouseId ? parseInt(destinationWarehouseId) : null}
              onChange={(id) => setDestinationWarehouseId(id ? id.toString() : '')}
              placeholder="Seleccionar almacen destino..."
              required
              disabled={!sourceWarehouseId}
            />
          )}
        </div>
      </div>

      {sourceWarehouseId && destinationWarehouseId && (
        <div className="inventory-form__add-section">
          <h4 className="inventory-form__section-title">Agregar Producto a Transferir</h4>

          {loadingStock ? (
            <p className="inventory-form__loading">Cargando productos con stock...</p>
          ) : productosDisponibles.length === 0 && productosAgregados.length === 0 ? (
            <p className="inventory-form__empty">No hay productos con stock en este almacen</p>
          ) : productosDisponibles.length === 0 ? (
            <p className="inventory-form__hint">Ya agregaste todos los productos disponibles</p>
          ) : (
            <>
              <div className="inventory-form__field">
                <label className="inventory-form__label">Producto</label>
                <ComboBoxProducto
                  productos={productosDisponibles}
                  value={productoSeleccionadoId ? parseInt(productoSeleccionadoId) : null}
                  onChange={(id) => {
                    setProductoSeleccionadoId(id ? id.toString() : '');
                    setCantidadLlenos(0);
                    setCantidad(0);
                  }}
                  placeholder="Buscar producto por nombre, codigo o marca..."
                />
              </div>

              {productoSeleccionadoId && (
                <div className="inventory-form__stock-info">
                  <div className="inventory-form__stock-badge">
                    <span className="inventory-form__stock-label">
                      Stock en {getAlmacenNombre(sourceWarehouseId)}:
                    </span>
                    {esEnvase ? (
                      <span className="inventory-form__stock-value inventory-form__stock-value--full">
                        {stockActual.available_stock} llenos
                      </span>
                    ) : (
                      <span className="inventory-form__stock-value">
                        {stockActual.available_stock} unidades
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {productoSeleccionadoId && esEnvase && (
            <div className="inventory-form__field">
              <label className="inventory-form__label">Llenos a transferir</label>
              <input
                type="number"
                min="0"
                max={stockActual.available_stock}
                value={cantidadLlenos}
                onChange={(e) => setCantidadLlenos(Math.min(parseInt(e.target.value) || 0, stockActual.available_stock))}
                className="inventory-form__input inventory-form__input--llenos"
                placeholder="0"
              />
            </div>
          )}

          {productoSeleccionadoId && !esEnvase && (
            <div className="inventory-form__field">
              <label className="inventory-form__label">Cantidad a transferir</label>
              <input
                type="number"
                min="1"
                max={stockActual.available_stock}
                value={cantidad}
                onChange={(e) => setCantidad(Math.min(parseInt(e.target.value) || 0, stockActual.available_stock))}
                className="inventory-form__input"
              />
            </div>
          )}

          {productoSeleccionadoId && (
            <button
              type="button"
              onClick={handleAgregarProducto}
              className="inventory-form__btn inventory-form__btn--add"
              disabled={esEnvase ? cantidadLlenos === 0 : cantidad === 0}
            >
              + Agregar a Transferencia
            </button>
          )}
        </div>
      )}

      {sourceWarehouseId && destinationWarehouseId && (
        <div className="inventory-form__add-section">
          <h4 className="inventory-form__section-title">Envases Vacios a Transferir</h4>

          {loadingEmptyStock ? (
            <p className="inventory-form__loading">Cargando stock de vacios...</p>
          ) : emptyStock.length === 0 ? (
            <p className="inventory-form__empty">No hay envases vacios en este almacen</p>
          ) : (
            <div className="inventory-form__transfer-quantities">
              {(() => {
                const stockByType = {};
                emptyStock.forEach(e => {
                  const key = e.container_type;
                  stockByType[key] = (stockByType[key] || 0) + (e.empty_stock || 0);
                });
                return Object.entries(stockByType).map(([key, totalStock]) => (
                  <div key={key} className="inventory-form__field">
                    <label className="inventory-form__label">
                      {CONTAINER_TYPE_LABELS[key] || key} vacios
                      <span className="inventory-form__stock-badge" style={{ marginLeft: '8px' }}>
                        <span className="inventory-form__stock-value inventory-form__stock-value--empty">
                          Disponible: {totalStock}
                        </span>
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={totalStock}
                      value={emptyItemsToTransfer[key] || 0}
                      onChange={(e) => handleEmptyQuantityChange(key, e.target.value)}
                      className="inventory-form__input inventory-form__input--vacios"
                      placeholder="0"
                    />
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      )}

      {(productosAgregados.length > 0 || hasEmptyItemsToTransfer()) && (
        <div className="inventory-form__list">
          <h4 className="inventory-form__section-title">
            Resumen de Transferencia
          </h4>
          <div className="inventory-form__list-items">
            {productosAgregados.map((item, index) => (
              <div key={index} className="inventory-form__list-item inventory-form__list-item--transfer">
                <div className="inventory-form__list-item-info">
                  <span className="inventory-form__list-item-name">{item.product.name}</span>
                  {esProductoEnvase(item.product) ? (
                    <span className="inventory-form__list-item-detail">
                      <span className="text-green">{item.quantity_full} llenos</span>
                    </span>
                  ) : (
                    <span className="inventory-form__list-item-detail">{item.quantity} unidades</span>
                  )}
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

            {Object.entries(emptyItemsToTransfer)
              .filter(([, qty]) => qty > 0)
              .map(([key, qty]) => (
                <div key={key} className="inventory-form__list-item inventory-form__list-item--transfer">
                  <div className="inventory-form__list-item-info">
                    <span className="inventory-form__list-item-name">
                      {CONTAINER_TYPE_LABELS[key] || key}
                    </span>
                    <span className="inventory-form__list-item-detail">
                      <span className="text-blue">{qty} vacios</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEmptyQuantityChange(key, 0)}
                    className="inventory-form__list-item-remove"
                  >
                    &times;
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="inventory-form__extra">
        <div className="inventory-form__field">
          <label className="inventory-form__label">Motivo (opcional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="inventory-form__input"
            placeholder="Ej: Reposicion de sucursal"
          />
        </div>
        <div className="inventory-form__field">
          <label className="inventory-form__label">Documento (opcional)</label>
          <input
            type="text"
            value={referenceDocument}
            onChange={(e) => setReferenceDocument(e.target.value)}
            className="inventory-form__input"
            placeholder="Ej: TRF-001"
          />
        </div>
      </div>

      <div className="inventory-form__actions">
        <button type="button" onClick={onCancel} className="inventory-form__btn inventory-form__btn--cancel">
          Cancelar
        </button>
        <button
          type="submit"
          className="inventory-form__btn inventory-form__btn--submit"
        >
          Realizar Transferencia
        </button>
      </div>

      <AlertComponent />
    </form>
  );
};
