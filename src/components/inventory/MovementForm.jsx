import { useState, useEffect } from 'react';
import { useProductApi } from '../../hooks/useApi/useProductApi';
import { inventoryService } from '../../services/inventoryService';
import { API_URL } from '../../config/api.config';
import { ComboBoxProducto } from '../common/ComboBoxProducto';
import { ComboBoxAlmacen } from '../common/ComboBoxAlmacen';
import { useAlertToast } from '../common/AlertToast';
import { getContainerLabel } from '../../utils/constants';

export const MovementForm = ({ tipo, onSubmit, onCancel }) => {
  const [proveedorId, setProveedorId] = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [reason, setReason] = useState('');
  const [referenceDocument, setReferenceDocument] = useState('');

  // Almacén
  const [almacenId, setAlmacenId] = useState('');
  const [almacenes, setAlmacenes] = useState([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);

  // Lista de productos agregados
  const [productosAgregados, setProductosAgregados] = useState([]);

  // Para agregar nuevo producto
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState('');
  const [llenosRecibidos, setLlenosRecibidos] = useState(0);
  const [vaciosEntregados, setVaciosEntregados] = useState(0);
  const [cantidad, setCantidad] = useState('');
  const [nuevoCosto, setNuevoCosto] = useState('');

  const { data: productos, fetchProducts } = useProductApi();
  const { showAlert, AlertComponent } = useAlertToast();

  // Saldos netos por tipo de producto
  const [saldos, setSaldos] = useState({ BALON_GAS: null, BIDON_AGUA: null });
  const [loadingSaldos, setLoadingSaldos] = useState(false);

  // Stock de vacios por tipo de envase en el almacen seleccionado
  const [emptyStockByType, setEmptyStockByType] = useState({ BALON_GAS: 0, BIDON_AGUA: 0 });
  const [loadingStockVacios, setLoadingStockVacios] = useState(false);

  useEffect(() => {
    fetchProducts({ status: 'active', limit: 1000 });
    loadAlmacenes();
    if (tipo === 'ENTRADA') {
      loadProveedores();
    }
  }, [tipo]);

  const loadAlmacenes = async () => {
    setLoadingAlmacenes(true);
    try {
      const response = await fetch(`${API_URL}/warehouses?status=active`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await response.json();
      const almacenesActivos = data.data || [];
      setAlmacenes(almacenesActivos);

      // Pre-seleccionar almacén principal
      const almacenPrincipal = almacenesActivos.find(a => a.is_main);
      if (almacenPrincipal) {
        setAlmacenId(almacenPrincipal.id.toString());
      } else if (almacenesActivos.length > 0) {
        setAlmacenId(almacenesActivos[0].id.toString());
      }
    } catch (err) {
      console.error('Error al cargar almacenes:', err);
    } finally {
      setLoadingAlmacenes(false);
    }
  };

  const loadProveedores = async () => {
    setLoadingProveedores(true);
    try {
      const response = await fetch(`${API_URL}/suppliers?status=active`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await response.json();
      setProveedores(data.data || []);
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
    } finally {
      setLoadingProveedores(false);
    }
  };

  // Cargar saldos cuando cambia el proveedor
  useEffect(() => {
    if (proveedorId && tipo === 'ENTRADA') {
      loadSaldos();
    }
  }, [proveedorId]);

  const loadSaldos = async () => {
    setLoadingSaldos(true);
    try {
      const response = await inventoryService.getSupplierEmptyBalance(proveedorId);
      if (response.success && response.data) {
        setSaldos({
          BALON_GAS: response.data.BALON_GAS || { saldo_neto: 0 },
          BIDON_AGUA: response.data.BIDON_AGUA || { saldo_neto: 0 }
        });
      } else {
        setSaldos({ BALON_GAS: { saldo_neto: 0 }, BIDON_AGUA: { saldo_neto: 0 } });
      }
    } catch (err) {
      console.error('Error al cargar saldos:', err);
      setSaldos({ BALON_GAS: { saldo_neto: 0 }, BIDON_AGUA: { saldo_neto: 0 } });
    } finally {
      setLoadingSaldos(false);
    }
  };

  // Cargar stock de vacíos cuando cambia el almacén
  useEffect(() => {
    if (almacenId && tipo === 'ENTRADA') {
      loadStockVacios();
    }
  }, [almacenId]);

  const loadStockVacios = async () => {
    if (!almacenId) return;
    setLoadingStockVacios(true);
    try {
      const response = await inventoryService.getEmptyStock(almacenId);
      if (response.success && response.data) {
        const stockMap = { BALON_GAS: 0, BIDON_AGUA: 0 };
        response.data.forEach(item => {
          const key = item.container_type;
          stockMap[key] = (stockMap[key] || 0) + (item.empty_stock || 0);
        });
        setEmptyStockByType(stockMap);
      }
    } catch (err) {
      console.error('Error al cargar stock de vacios:', err);
    } finally {
      setLoadingStockVacios(false);
    }
  };

  const esProductoEnvase = (producto) => {
    return producto?.product_type === 'BALON_GAS' || producto?.product_type === 'BIDON_AGUA';
  };

  const productoSeleccionado = productos.find(p => p.id === parseInt(productoSeleccionadoId));
  const esEnvase = esProductoEnvase(productoSeleccionado);
  const permiteDecimales = productoSeleccionado?.unit_allows_decimals || false;
  // Saldo del tipo de producto seleccionado
  const tipoProductoSeleccionado = productoSeleccionado?.product_type;
  const containerKeyProducto = tipoProductoSeleccionado;
  const saldoActual = containerKeyProducto ? (saldos[containerKeyProducto]?.saldo_neto || 0) : 0;

  // Stock de vacios disponible segun el tipo de envase del producto seleccionado
  const stockVaciosDisponible = containerKeyProducto
    ? (emptyStockByType[containerKeyProducto] || 0)
    : 0;

  // Productos disponibles (excluir ya agregados)
  const productosDisponibles = productos.filter(
    p => !productosAgregados.some(item => item.product.id === p.id)
  );

  // Calcular diferencia y nuevo saldo para preview
  const diferencia = vaciosEntregados - llenosRecibidos;
  const saldoNuevoPreview = saldoActual + diferencia;

  const handleAgregarProducto = () => {
    if (!productoSeleccionadoId) return;
    const producto = productos.find(p => p.id === parseInt(productoSeleccionadoId));
    if (!producto) return;

    // Determinar el costo a usar (nuevo o actual)
    const costoUnitario = nuevoCosto !== '' ? parseFloat(nuevoCosto) : parseFloat(producto.cost || 0);
    const cantidadItem = esEnvase ? llenosRecibidos : parseFloat(cantidad) || 0;
    const subtotal = cantidadItem * costoUnitario;

    const nuevoItem = {
      product: producto,
      quantity_full: esEnvase ? llenosRecibidos : 0,
      empties_given: esEnvase ? vaciosEntregados : 0,
      quantity: !esEnvase ? (parseFloat(cantidad) || 0) : 0,
      diferencia: esEnvase ? diferencia : 0,
      new_cost: nuevoCosto !== '' ? parseFloat(nuevoCosto) : null,
      costo_unitario: costoUnitario,
      subtotal: subtotal
    };

    setProductosAgregados(prev => [...prev, nuevoItem]);

    // Limpiar
    setProductoSeleccionadoId('');
    setLlenosRecibidos(0);
    setVaciosEntregados(0);
    setCantidad('');
    setNuevoCosto('');
  };

  const handleEliminarProducto = (index) => {
    setProductosAgregados(prev => prev.filter((_, i) => i !== index));
  };

  const validarFormulario = () => {
    const errores = [];

    if (!almacenId) {
      errores.push('Debe seleccionar un almacén de destino');
    }

    if (tipo === 'ENTRADA' && !proveedorId) {
      errores.push('Debe seleccionar un proveedor');
    }

    if (productosAgregados.length === 0) {
      errores.push('Debe agregar al menos un producto');
    }

    // Validar que los productos tengan cantidades válidas
    productosAgregados.forEach((item, index) => {
      if (esProductoEnvase(item.product)) {
        if (item.quantity_full <= 0) {
          errores.push(`El producto "${item.product.name}" debe tener al menos 1 unidad llena`);
        }
      } else {
        if (item.quantity <= 0) {
          errores.push(`El producto "${item.product.name}" debe tener una cantidad mayor a 0`);
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
      quantity_full: item.quantity_full,
      quantity_empty: 0,
      quantity: item.quantity,
      empties_given: item.empties_given,
      new_cost: item.new_cost
    }));

    onSubmit({
      warehouse_id: parseInt(almacenId),
      supplier_id: proveedorId || null,
      reason,
      reference_document: referenceDocument,
      movement_type: tipo,
      items
    });
  };

  const getTipoProductoLabel = (tipo) => {
    return getContainerLabel(tipo);
  };

  // Formatear moneda
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calcular total general de la compra
  const totalCompra = productosAgregados.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  // Obtener clase y texto para cada tarjeta de saldo
  const getSaldoCardInfo = (tipoProducto) => {
    const saldo = saldos[tipoProducto]?.saldo_neto || 0;
    let cardClass = 'inventory-form__saldo-card';
    let valorText = 'Sin deuda';

    if (saldo > 0) {
      cardClass += ' inventory-form__saldo-card--positive';
      valorText = `Nos deben ${saldo}`;
    } else if (saldo < 0) {
      cardClass += ' inventory-form__saldo-card--negative';
      valorText = `Debemos ${Math.abs(saldo)}`;
    }

    return { cardClass, valorText };
  };

  return (
    <form onSubmit={handleSubmit} className="inventory-form inventory-form--simple">
      {/* Almacén de destino */}
      <div className="inventory-form__section">
        <label className="inventory-form__label">
          Almacén de destino *
        </label>
        {loadingAlmacenes ? (
          <p className="inventory-form__loading">Cargando almacenes...</p>
        ) : (
          <ComboBoxAlmacen
            almacenes={almacenes}
            value={almacenId ? parseInt(almacenId) : null}
            onChange={(id) => setAlmacenId(id ? id.toString() : '')}
            placeholder="Seleccionar almacén..."
            required
          />
        )}
      </div>

      {/* Proveedor */}
      {tipo === 'ENTRADA' && (
        <div className="inventory-form__section">
          <label className="inventory-form__label">Proveedor *</label>
          <select
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            className="inventory-form__select"
            disabled={loadingProveedores}
            required
          >
            <option value="">Seleccione un proveedor...</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.business_name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Saldos por tipo de producto */}
      {tipo === 'ENTRADA' && proveedorId && (
        <div className="inventory-form__saldos">
          <h4 className="inventory-form__saldos-title">Saldo de Vacios con este Proveedor</h4>
          {loadingSaldos ? (
            <p className="inventory-form__loading">Cargando saldos...</p>
          ) : (
            <div className="inventory-form__saldos-grid">
              <div className={getSaldoCardInfo('BALON_GAS').cardClass}>
                <span className="inventory-form__saldo-tipo">Balones Gas</span>
                <span className="inventory-form__saldo-valor">{getSaldoCardInfo('BALON_GAS').valorText}</span>
              </div>
              <div className={getSaldoCardInfo('BIDON_AGUA').cardClass}>
                <span className="inventory-form__saldo-tipo">Bidones Agua</span>
                <span className="inventory-form__saldo-valor">{getSaldoCardInfo('BIDON_AGUA').valorText}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Agregar producto */}
      {almacenId && (tipo !== 'ENTRADA' || proveedorId) && (
        <div className="inventory-form__add-section">
          <h4 className="inventory-form__section-title">Agregar Producto</h4>

          <div className="inventory-form__field">
            <label className="inventory-form__label">Producto</label>
            <ComboBoxProducto
              productos={productosDisponibles}
              value={productoSeleccionadoId ? parseInt(productoSeleccionadoId) : null}
              onChange={(id) => {
                setProductoSeleccionadoId(id ? id.toString() : '');
                setLlenosRecibidos(0);
                setVaciosEntregados(0);
                setCantidad('');
                setNuevoCosto('');
              }}
              placeholder="Buscar producto por nombre, código o marca..."
            />
          </div>

          {/* Costo del producto - Solo para ENTRADA */}
          {productoSeleccionadoId && tipo === 'ENTRADA' && productoSeleccionado && (
            <div className="inventory-form__cost-section">
              <div className="inventory-form__cost-current">
                <span className="inventory-form__cost-label">Costo actual:</span>
                <span className="inventory-form__cost-value">
                  S/ {parseFloat(productoSeleccionado.cost || 0).toFixed(2)}
                </span>
              </div>
              <div className="inventory-form__field">
                <label className="inventory-form__label">
                  Nuevo costo (opcional)
                  <span className="inventory-form__label-hint">Dejar vacío para mantener actual</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={nuevoCosto}
                  onChange={(e) => setNuevoCosto(e.target.value)}
                  className="inventory-form__input inventory-form__input--cost"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          {productoSeleccionadoId && esEnvase && (
            <div className="inventory-form__exchange-simple">
              <div className="inventory-form__exchange-row">
                <div className="inventory-form__field">
                  <label className="inventory-form__label">Llenos que recibimos</label>
                  <input
                    type="number"
                    min="0"
                    value={llenosRecibidos}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setLlenosRecibidos(val);
                      if (tipo === 'ENTRADA') {
                        setVaciosEntregados(Math.min(val, stockVaciosDisponible));
                      } else {
                        setVaciosEntregados(val);
                      }
                    }}
                    className="inventory-form__input inventory-form__input--llenos"
                    placeholder="0"
                  />
                </div>

                <div className="inventory-form__exchange-arrow">
                  <span>&#8644;</span>
                </div>

                <div className="inventory-form__field">
                  <label className="inventory-form__label">
                    Vacios que entregamos
                    {tipo === 'ENTRADA' && (
                      <span className="inventory-form__label-stock">
                        (Disponible: {loadingStockVacios ? '...' : stockVaciosDisponible})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={tipo === 'ENTRADA' ? stockVaciosDisponible : undefined}
                    value={vaciosEntregados}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      // Limitar al stock disponible en ENTRADA
                      if (tipo === 'ENTRADA' && val > stockVaciosDisponible) {
                        setVaciosEntregados(stockVaciosDisponible);
                      } else {
                        setVaciosEntregados(val);
                      }
                    }}
                    className="inventory-form__input inventory-form__input--vacios"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Mensaje informativo cuando llenos > vacíos disponibles */}
              {tipo === 'ENTRADA' && llenosRecibidos > 0 && llenosRecibidos > stockVaciosDisponible && (
                <div className="inventory-form__info-banner">
                  Se entregaran <strong>{Math.min(llenosRecibidos, stockVaciosDisponible)}</strong> vacios de <strong>{llenosRecibidos}</strong> llenos recibidos.
                  La diferencia ({llenosRecibidos - Math.min(llenosRecibidos, stockVaciosDisponible)}) se reflejara en el saldo con el proveedor.
                </div>
              )}

              {/* Preview del saldo resultante */}
              {llenosRecibidos > 0 && (
                <div className="inventory-form__preview">
                  <div className={`inventory-form__preview-result ${saldoNuevoPreview === 0 ? 'inventory-form__preview-result--neutral' : saldoNuevoPreview > 0 ? 'inventory-form__preview-result--positive' : 'inventory-form__preview-result--negative'}`}>
                    {saldoNuevoPreview === 0 ? (
                      <span>Sin deuda</span>
                    ) : saldoNuevoPreview > 0 ? (
                      <span>Nos deberan <strong>{saldoNuevoPreview}</strong> vacios</span>
                    ) : (
                      <span>Deberemos <strong>{Math.abs(saldoNuevoPreview)}</strong> vacios</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {productoSeleccionadoId && !esEnvase && (
            <div className="inventory-form__field">
              <label className="inventory-form__label">
                Cantidad
                {productoSeleccionado?.unit_abbreviation && (
                  <span className="inventory-form__label-hint">({productoSeleccionado.unit_abbreviation})</span>
                )}
              </label>
              <input
                type="number"
                min={permiteDecimales ? "0.01" : "1"}
                step={permiteDecimales ? "0.01" : "1"}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="inventory-form__input"
                placeholder={permiteDecimales ? "0.00" : "0"}
              />
            </div>
          )}

          {productoSeleccionadoId && (
            <button
              type="button"
              onClick={handleAgregarProducto}
              className="inventory-form__btn inventory-form__btn--add"
              disabled={esEnvase ? llenosRecibidos === 0 : !cantidad || parseFloat(cantidad) <= 0}
            >
              + Agregar
            </button>
          )}
        </div>
      )}

      {/* Lista de productos agregados */}
      {productosAgregados.length > 0 && (
        <div className="inventory-form__list">
          <h4 className="inventory-form__section-title">
            Productos ({productosAgregados.length})
          </h4>
          <div className="inventory-form__list-items">
            {productosAgregados.map((item, index) => (
              <div key={index} className="inventory-form__list-item">
                <div className="inventory-form__list-item-info">
                  <span className="inventory-form__list-item-name">{item.product.name}</span>
                  {esProductoEnvase(item.product) ? (
                    <span className="inventory-form__list-item-detail">
                      {item.quantity_full} llenos | {item.empties_given} vacios
                      {item.diferencia !== 0 && (
                        <span className={item.diferencia > 0 ? 'text-green' : 'text-red'}>
                          {' '}({item.diferencia > 0 ? '+' : ''}{item.diferencia})
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="inventory-form__list-item-detail">
                      {item.product.unit_allows_decimals ? parseFloat(item.quantity).toFixed(2) : item.quantity} {item.product.unit_abbreviation || 'unidades'}
                    </span>
                  )}
                  {tipo === 'ENTRADA' && (
                    <span className="inventory-form__list-item-cost">
                      {esProductoEnvase(item.product) ? item.quantity_full : item.quantity} x {formatCurrency(item.costo_unitario)}
                    </span>
                  )}
                </div>
                {tipo === 'ENTRADA' && (
                  <div className="inventory-form__list-item-subtotal">
                    {formatCurrency(item.subtotal)}
                  </div>
                )}
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

          {/* Total general de la compra */}
          {tipo === 'ENTRADA' && (
            <div className="inventory-form__total">
              <div className="inventory-form__total-row">
                <span className="inventory-form__total-label">TOTAL DE LA COMPRA:</span>
                <span className="inventory-form__total-value">{formatCurrency(totalCompra)}</span>
              </div>
            </div>
          )}
        </div>
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
            placeholder="Ej: Compra semanal"
          />
        </div>
        <div className="inventory-form__field">
          <label className="inventory-form__label">Documento (opcional)</label>
          <input
            type="text"
            value={referenceDocument}
            onChange={(e) => setReferenceDocument(e.target.value)}
            className="inventory-form__input"
            placeholder="Ej: Factura 001-123"
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="inventory-form__actions">
        <button type="button" onClick={onCancel} className="inventory-form__btn inventory-form__btn--cancel">
          Cancelar
        </button>
        <button
          type="submit"
          className="inventory-form__btn inventory-form__btn--submit"
        >
          Guardar
        </button>
      </div>

      <AlertComponent />
    </form>
  );
};
