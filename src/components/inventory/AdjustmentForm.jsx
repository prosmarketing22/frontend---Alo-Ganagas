import { useState, useEffect } from 'react';
import { useProductApi } from '../../hooks/useApi/useProductApi';
import { useInventoryApi } from '../../hooks/useApi/useInventoryApi';
import { inventoryService } from '../../services/inventoryService';
import { API_URL } from '../../config/api.config';
import { ComboBoxAlmacen } from '../common/ComboBoxAlmacen';
import { useAlertToast } from '../common/AlertToast';

export const AdjustmentForm = ({ onSubmit, onCancel }) => {
  const [warehouseId, setWarehouseId] = useState('');
  const [almacenes, setAlmacenes] = useState([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [reason, setReason] = useState('');
  const [referenceDocument, setReferenceDocument] = useState('');

  const [ajusteMode, setAjusteMode] = useState('individual'); // 'individual' | 'envases'
  const [balonesData, setBalonesData] = useState({ normal: [], premium: [] });
  const [bidonesData, setBidonesData] = useState([]);
  const [balonesAjustes, setBalonesAjustes] = useState({});
  const [loadingEnvases, setLoadingEnvases] = useState(false);

  const [emptyStockByType, setEmptyStockByType] = useState({});
  const [emptyAjustes, setEmptyAjustes] = useState({});

  const [productosAgregados, setProductosAgregados] = useState([]);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState('');
  const [nuevoStockLlenos, setNuevoStockLlenos] = useState(0);
  const [nuevaCantidad, setNuevaCantidad] = useState(0);

  const [stockActual, setStockActual] = useState({ available_stock: 0 });
  const [loadingStock, setLoadingStock] = useState(false);

  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { data: productos, fetchProducts } = useProductApi();
  const { previewAdjustment } = useInventoryApi();
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

      const almacenPrincipal = almacenesActivos.find(a => a.is_main);
      if (almacenPrincipal) {
        setWarehouseId(almacenPrincipal.id.toString());
      } else if (almacenesActivos.length > 0) {
        setWarehouseId(almacenesActivos[0].id.toString());
      }
    } catch (err) {
      console.error('Error al cargar almacenes:', err);
    } finally {
      setLoadingAlmacenes(false);
    }
  };

  const loadStockByWarehouse = async (productId, warehouseIdParam) => {
    if (!productId || !warehouseIdParam) return { available_stock: 0 };

    try {
      const response = await fetch(
        `${API_URL}/product-warehouse-stock/product/${productId}/warehouse/${warehouseIdParam}`,
        { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } }
      );

      if (!response.ok) {
        const productResponse = await fetch(
          `${API_URL}/products/${productId}`,
          { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } }
        );
        if (productResponse.ok) {
          const productData = await productResponse.json();
          if (productData.data) {
            return {
              available_stock: parseFloat(productData.data.available_stock) || 0
            };
          }
        }
        return { available_stock: 0 };
      }

      const data = await response.json();
      if (data.success && data.data) {
        return {
          available_stock: parseFloat(data.data.available_stock) || 0
        };
      }
      return { available_stock: 0 };
    } catch (err) {
      console.error('Error al cargar stock:', err);
      return { available_stock: 0 };
    }
  };

  const loadEnvasesData = async () => {
    if (!warehouseId) return;

    setLoadingEnvases(true);
    try {
      const balonesGas = productos.filter(p => p.product_type === 'BALON_GAS');
      const normales = balonesGas.filter(p => p.balloon_type === 'NORMAL');
      const premium = balonesGas.filter(p => p.balloon_type === 'PREMIUM');
      const bidones = productos.filter(p => p.product_type === 'BIDON_AGUA');

      const [normalesConStock, premiumConStock, bidonesConStock] = await Promise.all([
        Promise.all(
          normales.map(async (producto) => {
            const stock = await loadStockByWarehouse(producto.id, warehouseId);
            return { ...producto, stock };
          })
        ),
        Promise.all(
          premium.map(async (producto) => {
            const stock = await loadStockByWarehouse(producto.id, warehouseId);
            return { ...producto, stock };
          })
        ),
        Promise.all(
          bidones.map(async (producto) => {
            const stock = await loadStockByWarehouse(producto.id, warehouseId);
            return { ...producto, stock };
          })
        )
      ]);

      setBalonesData({ normal: normalesConStock, premium: premiumConStock });
      setBidonesData(bidonesConStock);

      const ajustesIniciales = {};
      [...normalesConStock, ...premiumConStock, ...bidonesConStock].forEach(producto => {
        ajustesIniciales[producto.id] = {
          new_full: parseFloat(producto.stock.available_stock) || 0
        };
      });
      setBalonesAjustes(ajustesIniciales);

      try {
        const emptyResponse = await inventoryService.getEmptyStock(parseInt(warehouseId));
        const emptyData = emptyResponse.data || [];

        const emptyByType = {};
        const emptyAjustesInit = {};

        emptyData.forEach(item => {
          const key = item.container_type;
          const qty = parseInt(item.empty_stock) || 0;
          emptyByType[key] = (emptyByType[key] || 0) + qty;
          emptyAjustesInit[key] = (emptyAjustesInit[key] || 0) + qty;
        });

        if (!emptyByType['BALON_GAS']) {
          emptyByType['BALON_GAS'] = 0;
          emptyAjustesInit['BALON_GAS'] = 0;
        }
        if (!emptyByType['BIDON_AGUA']) {
          emptyByType['BIDON_AGUA'] = 0;
          emptyAjustesInit['BIDON_AGUA'] = 0;
        }

        setEmptyStockByType(emptyByType);
        setEmptyAjustes(emptyAjustesInit);
      } catch (err) {
        console.error('Error al cargar stock de vacios:', err);
        setEmptyStockByType({});
        setEmptyAjustes({});
      }
    } catch (err) {
      console.error('Error al cargar envases:', err);
    } finally {
      setLoadingEnvases(false);
    }
  };

  useEffect(() => {
    if (ajusteMode === 'envases' && warehouseId && productos.length > 0) {
      loadEnvasesData();
    }
  }, [ajusteMode, warehouseId, productos]);

  useEffect(() => {
    if (productoSeleccionadoId && warehouseId) {
      loadStockForSelectedProduct();
    }
  }, [productoSeleccionadoId, warehouseId]);

  const loadStockForSelectedProduct = async () => {
    if (!productoSeleccionadoId || !warehouseId) return;

    setLoadingStock(true);
    try {
      const stock = await loadStockByWarehouse(productoSeleccionadoId, warehouseId);
      setStockActual(stock || { available_stock: 0 });
      setNuevoStockLlenos(parseFloat(stock?.available_stock) || 0);
      setNuevaCantidad(parseFloat(stock?.available_stock) || 0);
    } finally {
      setLoadingStock(false);
    }
  };

  const esProductoEnvase = (producto) => {
    return producto?.product_type === 'BALON_GAS' || producto?.product_type === 'BIDON_AGUA';
  };

  const productoSeleccionado = productos.find(p => p.id === parseInt(productoSeleccionadoId));
  const esEnvase = esProductoEnvase(productoSeleccionado);

  const productosDisponibles = productos.filter(
    p => !productosAgregados.some(item => item.product.id === p.id)
  );

  const calcularDiferencia = (actual, nuevo) => {
    return nuevo - actual;
  };

  const handleAgregarProducto = () => {
    if (!productoSeleccionadoId) return;
    const producto = productos.find(p => p.id === parseInt(productoSeleccionadoId));
    if (!producto) return;

    const diffLlenos = esEnvase ? calcularDiferencia(stockActual.available_stock, nuevoStockLlenos) : 0;
    const diffCantidad = !esEnvase ? calcularDiferencia(stockActual.available_stock, nuevaCantidad) : 0;

    if (esEnvase && diffLlenos === 0) {
      alert('No hay cambios en el stock');
      return;
    }

    if (!esEnvase && diffCantidad === 0) {
      alert('No hay cambios en el stock');
      return;
    }

    const nuevoItem = {
      product: producto,
      current_full: stockActual.available_stock,
      new_full: esEnvase ? nuevoStockLlenos : nuevaCantidad,
      diff_full: esEnvase ? diffLlenos : diffCantidad
    };

    setProductosAgregados(prev => [...prev, nuevoItem]);
    setProductoSeleccionadoId('');
    setNuevoStockLlenos(0);
    setNuevaCantidad(0);
    setStockActual({ available_stock: 0 });
  };

  const handleEliminarProducto = (index) => {
    setProductosAgregados(prev => prev.filter((_, i) => i !== index));
  };

  const handleBalonAjusteChange = (productId, field, value) => {
    setBalonesAjustes(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: parseInt(value) || 0
      }
    }));
  };

  const handleEmptyAjusteChange = (key, value) => {
    setEmptyAjustes(prev => ({
      ...prev,
      [key]: parseInt(value) || 0
    }));
  };

  const getEnvasesConCambios = () => {
    const allEnvases = [...balonesData.normal, ...balonesData.premium, ...bidonesData];
    return allEnvases.filter(producto => {
      const ajuste = balonesAjustes[producto.id];
      if (!ajuste) return false;
      const stockLlenos = parseFloat(producto.stock?.available_stock) || 0;
      const newFull = parseFloat(ajuste.new_full) || 0;
      return (newFull - stockLlenos) !== 0;
    }).map(producto => {
      const ajuste = balonesAjustes[producto.id];
      const stockLlenos = parseFloat(producto.stock?.available_stock) || 0;
      const newFull = parseFloat(ajuste.new_full) || 0;
      return {
        product: producto,
        current_full: stockLlenos,
        new_full: newFull,
        diff_full: newFull - stockLlenos
      };
    });
  };

  const getEmptyConCambios = () => {
    const cambios = [];
    Object.keys(emptyStockByType).forEach(key => {
      const actual = emptyStockByType[key] || 0;
      const nuevo = emptyAjustes[key] || 0;
      if (nuevo !== actual) {
        cambios.push({ key, actual, nuevo, diff: nuevo - actual });
      }
    });
    return cambios;
  };

  const handleVerPreview = async () => {
    const itemsParaPreview = ajusteMode === 'envases' ? getEnvasesConCambios() : productosAgregados;

    if (itemsParaPreview.length === 0 && (ajusteMode !== 'envases' || getEmptyConCambios().length === 0)) {
      alert('No hay cambios para previsualizar');
      return;
    }

    if (itemsParaPreview.length === 0) {
      alert('Solo hay cambios en vacios. Los vacios se ajustan directamente al aplicar.');
      return;
    }

    setLoadingPreview(true);
    try {
      const items = itemsParaPreview.map(item => ({
        product_id: item.product.id,
        quantity_full: item.new_full
      }));

      const preview = await previewAdjustment({
        warehouse_id: parseInt(warehouseId),
        items
      });

      setPreviewData(preview);
      setShowPreview(true);
    } catch (err) {
      console.error('Error al obtener preview:', err);
      alert('Error al obtener preview: ' + err.message);
    } finally {
      setLoadingPreview(false);
    }
  };

  const validarFormulario = () => {
    const errores = [];

    if (!warehouseId) {
      errores.push('Debe seleccionar un almacen');
    }

    if (!reason || reason.trim() === '') {
      errores.push('Debe ingresar el motivo del ajuste');
    }

    if (ajusteMode === 'envases') {
      const itemsLlenos = getEnvasesConCambios();
      const itemsVacios = getEmptyConCambios();

      if (itemsLlenos.length === 0 && itemsVacios.length === 0) {
        errores.push('No hay cambios en los envases para aplicar. Modifique al menos un conteo');
      }

      itemsLlenos.forEach((item) => {
        if (item.new_full < 0) {
          errores.push(`El producto "${item.product.name}" no puede tener cantidad negativa`);
        }
      });

      itemsVacios.forEach((item) => {
        if (item.nuevo < 0) {
          errores.push(`Los vacios "${getEmptyLabel(item.key)}" no pueden tener cantidad negativa`);
        }
      });
    } else {
      if (productosAgregados.length === 0) {
        errores.push('Debe agregar al menos un producto para ajustar');
      }

      productosAgregados.forEach((item) => {
        if (item.new_full < 0) {
          errores.push(`El producto "${item.product.name}" no puede tener cantidad negativa`);
        }
      });
    }

    return errores;
  };

  const getEmptyLabel = (key) => {
    const labels = {
      'BALON_GAS': 'Balones Vacios',
      'BIDON_AGUA': 'Bidones Vacios'
    };
    return labels[key] || key;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errores = validarFormulario();

    if (errores.length > 0) {
      showAlert({ errors: errores, type: 'error' });
      return;
    }

    if (ajusteMode === 'envases') {
      const emptyCambios = getEmptyConCambios();

      if (emptyCambios.length > 0) {
        try {
          for (const cambio of emptyCambios) {
            const diff = cambio.diff;
            const absQty = Math.abs(diff);
            const operation = diff > 0 ? 'increment' : 'decrement';

            const container_type = cambio.key;

            await inventoryService.adjustEmptyStock({
              container_type,
              warehouse_id: parseInt(warehouseId),
              quantity: absQty,
              operation,
              reason
            });
          }
        } catch (err) {
          console.error('Error al ajustar vacios:', err);
          showAlert({ errors: ['Error al ajustar envases vacios: ' + err.message], type: 'error' });
          return;
        }
      }

      const itemsLlenos = getEnvasesConCambios();
      const items = itemsLlenos.map(item => ({
        product_id: item.product.id,
        quantity_full: item.new_full
      }));

      onSubmit({
        warehouse_id: parseInt(warehouseId),
        reason,
        reference_document: referenceDocument,
        movement_type: 'AJUSTE',
        items
      });
    } else {
      const items = productosAgregados.map(item => ({
        product_id: item.product.id,
        quantity_full: item.new_full
      }));

      onSubmit({
        warehouse_id: parseInt(warehouseId),
        reason,
        reference_document: referenceDocument,
        movement_type: 'AJUSTE',
        items
      });
    }
  };

  const getDiffClass = (diff) => {
    if (diff > 0) return 'text-green';
    if (diff < 0) return 'text-red';
    return '';
  };

  const getDiffText = (diff) => {
    if (diff > 0) return `+${diff}`;
    return diff.toString();
  };

  const getTotalesPorTipo = (tipo) => {
    let envases;
    if (tipo === 'normal') {
      envases = balonesData.normal;
    } else if (tipo === 'premium') {
      envases = balonesData.premium;
    } else {
      envases = bidonesData;
    }

    let totalSistemaLlenos = 0;
    let totalConteoLlenos = 0;

    envases.forEach(producto => {
      const stockLlenos = parseFloat(producto.stock?.available_stock) || 0;
      totalSistemaLlenos += stockLlenos;
      const ajuste = balonesAjustes[producto.id];
      if (ajuste) {
        totalConteoLlenos += parseFloat(ajuste.new_full) || 0;
      } else {
        totalConteoLlenos += stockLlenos;
      }
    });

    return {
      sistemaLlenos: totalSistemaLlenos,
      conteoLlenos: totalConteoLlenos,
      diffLlenos: totalConteoLlenos - totalSistemaLlenos
    };
  };

  const renderEnvasesSection = (tipo, titulo, envases, emptyKey) => {
    const totales = getTotalesPorTipo(tipo);

    if (envases.length === 0) return null;

    const sistemaVacios = emptyKey ? (emptyStockByType[emptyKey] || 0) : 0;
    const conteoVacios = emptyKey ? (emptyAjustes[emptyKey] ?? sistemaVacios) : 0;
    const diffVacios = emptyKey ? (conteoVacios - sistemaVacios) : 0;

    return (
      <div className="inventory-form__balones-section">
        <h5 className="inventory-form__balones-title">
          {titulo}
          {envases.length > 0 && (
            <span className="inventory-form__balones-count">({envases.length} productos)</span>
          )}
        </h5>

        {envases.length > 0 && (
          <div className="inventory-form__balones-grid">
            <div className="inventory-form__balones-header">
              <div className="inventory-form__balones-col inventory-form__balones-col--name">Producto</div>
              <div className="inventory-form__balones-col inventory-form__balones-col--center">Sistema Llenos</div>
              <div className="inventory-form__balones-col inventory-form__balones-col--center">Conteo Llenos</div>
            </div>

            {envases.map(producto => {
              const stockLlenos = parseFloat(producto.stock?.available_stock) || 0;
              const ajuste = balonesAjustes[producto.id] || { new_full: stockLlenos };
              const currentFull = parseFloat(ajuste.new_full) || 0;
              const diffFull = currentFull - stockLlenos;

              return (
                <div key={producto.id} className="inventory-form__balones-row">
                  <div className="inventory-form__balones-col inventory-form__balones-col--name">
                    <span className="inventory-form__balones-product-name">{producto.name}</span>
                  </div>
                  <div className="inventory-form__balones-col inventory-form__balones-col--center">
                    <span className="inventory-form__balones-system-value">
                      {stockLlenos}
                    </span>
                  </div>
                  <div className="inventory-form__balones-col inventory-form__balones-col--center">
                    <div className="inventory-form__balones-input-wrapper">
                      <input
                        type="number"
                        min="0"
                        value={currentFull}
                        onChange={(e) => handleBalonAjusteChange(producto.id, 'new_full', e.target.value)}
                        className="inventory-form__input inventory-form__input--small"
                      />
                      {diffFull !== 0 && (
                        <span className={`inventory-form__balones-diff ${getDiffClass(diffFull)}`}>
                          {getDiffText(diffFull)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="inventory-form__balones-row inventory-form__balones-row--totals">
              <div className="inventory-form__balones-col inventory-form__balones-col--name">
                <strong>TOTALES</strong>
              </div>
              <div className="inventory-form__balones-col inventory-form__balones-col--center">
                <strong>{totales.sistemaLlenos}</strong>
              </div>
              <div className="inventory-form__balones-col inventory-form__balones-col--center">
                <strong>{totales.conteoLlenos}</strong>
                {totales.diffLlenos !== 0 && (
                  <span className={`inventory-form__balones-diff ${getDiffClass(totales.diffLlenos)}`}>
                    {getDiffText(totales.diffLlenos)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {emptyKey && (
          <div className="inventory-form__empty-row">
            <div className="inventory-form__empty-row-label">
              {getEmptyLabel(emptyKey)}
            </div>
            <div className="inventory-form__empty-row-values">
              <span className="inventory-form__empty-row-system">
                Sistema: <strong>{sistemaVacios}</strong>
              </span>
              <span className="inventory-form__empty-row-input">
                Conteo:
                <input
                  type="number"
                  min="0"
                  value={conteoVacios}
                  onChange={(e) => handleEmptyAjusteChange(emptyKey, e.target.value)}
                  className="inventory-form__input inventory-form__input--small"
                />
                {diffVacios !== 0 && (
                  <span className={`inventory-form__balones-diff ${getDiffClass(diffVacios)}`}>
                    {getDiffText(diffVacios)}
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const envasesConCambios = ajusteMode === 'envases' ? getEnvasesConCambios() : [];
  const emptyConCambios = ajusteMode === 'envases' ? getEmptyConCambios() : [];
  const hayProductosAgregados = ajusteMode === 'envases'
    ? (envasesConCambios.length > 0 || emptyConCambios.length > 0)
    : productosAgregados.length > 0;

  return (
    <form onSubmit={handleSubmit} className="inventory-form inventory-form--simple">
      <div className="inventory-form__adjustment-header">
        <h4 className="inventory-form__section-title">Ajuste de Inventario</h4>
        <p className="inventory-form__description">
          Corrija las cantidades del inventario cuando el conteo fisico no coincide con el sistema.
        </p>
      </div>

      <div className="inventory-form__mode-selector">
        <button
          type="button"
          className={`inventory-form__mode-btn ${ajusteMode === 'individual' ? 'inventory-form__mode-btn--active' : ''}`}
          onClick={() => {
            setAjusteMode('individual');
            setBalonesAjustes({});
            setBalonesData({ normal: [], premium: [] });
            setBidonesData([]);
            setEmptyStockByType({});
            setEmptyAjustes({});
          }}
        >
          Ajuste Individual
        </button>
        <button
          type="button"
          className={`inventory-form__mode-btn ${ajusteMode === 'envases' ? 'inventory-form__mode-btn--active' : ''}`}
          onClick={() => {
            setAjusteMode('envases');
            setProductosAgregados([]);
            setProductoSeleccionadoId('');
            setBalonesAjustes({});
            setBalonesData({ normal: [], premium: [] });
            setBidonesData([]);
            setEmptyStockByType({});
            setEmptyAjustes({});
          }}
        >
          Ajuste de Envases
        </button>
      </div>

      <div className="inventory-form__section">
        <label className="inventory-form__label">
          Almacen a Ajustar *
        </label>
        {loadingAlmacenes ? (
          <p className="inventory-form__loading">Cargando almacenes...</p>
        ) : (
          <ComboBoxAlmacen
            almacenes={almacenes}
            value={warehouseId ? parseInt(warehouseId) : null}
            onChange={(id) => {
              setWarehouseId(id ? id.toString() : '');
              setProductosAgregados([]);
              setProductoSeleccionadoId('');
              setBalonesAjustes({});
              setBalonesData({ normal: [], premium: [] });
              setBidonesData([]);
              setEmptyStockByType({});
              setEmptyAjustes({});
            }}
            placeholder="Seleccionar almacen..."
            required
          />
        )}
      </div>

      {ajusteMode === 'envases' && warehouseId && (
        <div className="inventory-form__balones-container">
          {loadingEnvases ? (
            <p className="inventory-form__loading">Cargando envases...</p>
          ) : (
            <>
              {renderEnvasesSection('normal', 'Balones Normal', balonesData.normal, null)}
              {renderEnvasesSection('premium', 'Balones Premium', balonesData.premium, null)}

              {(balonesData.normal.length > 0 || balonesData.premium.length > 0) && (() => {
                const sistemaVacios = emptyStockByType['BALON_GAS'] || 0;
                const conteoVacios = emptyAjustes['BALON_GAS'] ?? sistemaVacios;
                const diffVacios = conteoVacios - sistemaVacios;
                return (
                  <div className="inventory-form__balones-section">
                    <div className="inventory-form__empty-row">
                      <div className="inventory-form__empty-row-label">
                        Balones Vacios
                      </div>
                      <div className="inventory-form__empty-row-values">
                        <span className="inventory-form__empty-row-system">
                          Sistema: <strong>{sistemaVacios}</strong>
                        </span>
                        <span className="inventory-form__empty-row-input">
                          Conteo:
                          <input
                            type="number"
                            min="0"
                            value={conteoVacios}
                            onChange={(e) => handleEmptyAjusteChange('BALON_GAS', e.target.value)}
                            className="inventory-form__input inventory-form__input--small"
                          />
                          {diffVacios !== 0 && (
                            <span className={`inventory-form__balones-diff ${getDiffClass(diffVacios)}`}>
                              {getDiffText(diffVacios)}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {renderEnvasesSection('bidones', 'Bidones de Agua', bidonesData, 'BIDON_AGUA')}

              {balonesData.normal.length === 0 && balonesData.premium.length === 0 && bidonesData.length === 0 && (
                <p className="inventory-form__empty">No hay envases registrados en el sistema.</p>
              )}

              {(envasesConCambios.length > 0 || emptyConCambios.length > 0) && (
                <div className="inventory-form__balones-summary">
                  <h5 className="inventory-form__section-title">
                    Resumen de Cambios
                  </h5>
                  <div className="inventory-form__list-items">
                    {envasesConCambios.map((item, index) => (
                      <div key={`lleno-${index}`} className="inventory-form__list-item inventory-form__list-item--adjustment">
                        <div className="inventory-form__list-item-info">
                          <span className="inventory-form__list-item-name">
                            {item.product.name}
                          </span>
                          <span className="inventory-form__list-item-detail">
                            Llenos: {item.current_full} → {item.new_full}
                            <span className={getDiffClass(item.diff_full)}>
                              {' '}({getDiffText(item.diff_full)})
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                    {emptyConCambios.map((item, index) => (
                      <div key={`vacio-${index}`} className="inventory-form__list-item inventory-form__list-item--adjustment">
                        <div className="inventory-form__list-item-info">
                          <span className="inventory-form__list-item-name">
                            {getEmptyLabel(item.key)}
                          </span>
                          <span className="inventory-form__list-item-detail">
                            {item.actual} → {item.nuevo}
                            <span className={getDiffClass(item.diff)}>
                              {' '}({getDiffText(item.diff)})
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {ajusteMode === 'individual' && warehouseId && (
        <div className="inventory-form__add-section">
          <h4 className="inventory-form__section-title">Agregar Producto a Ajustar</h4>

          <div className="inventory-form__field">
            <label className="inventory-form__label">Producto</label>
            <select
              value={productoSeleccionadoId}
              onChange={(e) => setProductoSeleccionadoId(e.target.value)}
              className="inventory-form__select"
            >
              <option value="">Seleccionar producto...</option>
              {productosDisponibles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.balloon_type ? `(${p.balloon_type})` : ''}
                </option>
              ))}
            </select>
          </div>

          {productoSeleccionadoId && !loadingStock && (
            <div className="inventory-form__adjustment-section">
              {esEnvase ? (
                <div className="inventory-form__adjustment-grid">
                  <div className="inventory-form__adjustment-row inventory-form__adjustment-row--header">
                    <div className="inventory-form__adjustment-col"></div>
                    <div className="inventory-form__adjustment-col inventory-form__adjustment-col--center">
                      <span className="inventory-form__col-title">Sistema</span>
                    </div>
                    <div className="inventory-form__adjustment-col inventory-form__adjustment-col--center">
                      <span className="inventory-form__col-title">Conteo Real</span>
                    </div>
                    <div className="inventory-form__adjustment-col inventory-form__adjustment-col--center">
                      <span className="inventory-form__col-title">Diferencia</span>
                    </div>
                  </div>

                  <div className="inventory-form__adjustment-row">
                    <div className="inventory-form__adjustment-col">
                      <span className="inventory-form__row-label">Llenos</span>
                    </div>
                    <div className="inventory-form__adjustment-col inventory-form__adjustment-col--center">
                      <span className="inventory-form__stock-badge-value inventory-form__stock-badge-value--system">
                        {stockActual.available_stock}
                      </span>
                    </div>
                    <div className="inventory-form__adjustment-col">
                      <input
                        type="number"
                        min="0"
                        value={nuevoStockLlenos}
                        onChange={(e) => setNuevoStockLlenos(parseFloat(e.target.value) || 0)}
                        className="inventory-form__input inventory-form__input--table"
                      />
                    </div>
                    <div className="inventory-form__adjustment-col inventory-form__adjustment-col--center">
                      <span className={`inventory-form__diff-badge ${getDiffClass(calcularDiferencia(stockActual.available_stock, nuevoStockLlenos))}`}>
                        {getDiffText(calcularDiferencia(stockActual.available_stock, nuevoStockLlenos))}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="inventory-form__adjustment-simple">
                  <div className="inventory-form__adjustment-simple-row">
                    <div className="inventory-form__adjustment-simple-item">
                      <span className="inventory-form__simple-label">Stock en Sistema</span>
                      <span className="inventory-form__simple-value">{stockActual.available_stock}</span>
                    </div>
                    <div className="inventory-form__adjustment-simple-item">
                      <span className="inventory-form__simple-label">Conteo Real</span>
                      <input
                        type="number"
                        min="0"
                        value={nuevaCantidad}
                        onChange={(e) => setNuevaCantidad(parseFloat(e.target.value) || 0)}
                        className="inventory-form__input inventory-form__input--table"
                      />
                    </div>
                    <div className="inventory-form__adjustment-simple-item">
                      <span className="inventory-form__simple-label">Diferencia</span>
                      <span className={`inventory-form__diff-badge ${getDiffClass(calcularDiferencia(stockActual.available_stock, nuevaCantidad))}`}>
                        {getDiffText(calcularDiferencia(stockActual.available_stock, nuevaCantidad))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAgregarProducto}
                className="inventory-form__btn inventory-form__btn--add"
                disabled={
                  esEnvase
                    ? calcularDiferencia(stockActual.available_stock, nuevoStockLlenos) === 0
                    : calcularDiferencia(stockActual.available_stock, nuevaCantidad) === 0
                }
              >
                + Agregar Ajuste
              </button>
            </div>
          )}

          {productoSeleccionadoId && loadingStock && (
            <p className="inventory-form__loading">Cargando stock actual...</p>
          )}
        </div>
      )}

      {ajusteMode === 'individual' && productosAgregados.length > 0 && (
        <div className="inventory-form__list">
          <h4 className="inventory-form__section-title">
            Productos a Ajustar ({productosAgregados.length})
          </h4>
          <div className="inventory-form__list-items">
            {productosAgregados.map((item, index) => (
              <div key={index} className="inventory-form__list-item inventory-form__list-item--adjustment">
                <div className="inventory-form__list-item-info">
                  <span className="inventory-form__list-item-name">{item.product.name}</span>
                  <span className="inventory-form__list-item-detail">
                    {item.current_full} → {item.new_full}
                    <span className={getDiffClass(item.diff_full)}>
                      {' '}({getDiffText(item.diff_full)})
                    </span>
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

      {hayProductosAgregados && ajusteMode !== 'envases' && (
        <div className="inventory-form__preview-btn-container">
          <button
            type="button"
            onClick={handleVerPreview}
            className="inventory-form__btn inventory-form__btn--preview"
            disabled={loadingPreview}
          >
            {loadingPreview ? 'Cargando...' : 'Ver Resumen de Cambios'}
          </button>
        </div>
      )}

      <div className="inventory-form__extra">
        <div className="inventory-form__field">
          <label className="inventory-form__label">Motivo del Ajuste *</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="inventory-form__input"
            placeholder="Ej: Conteo fisico mensual, confusion entre tipos..."
            required
          />
        </div>
        <div className="inventory-form__field">
          <label className="inventory-form__label">Documento de Referencia (opcional)</label>
          <input
            type="text"
            value={referenceDocument}
            onChange={(e) => setReferenceDocument(e.target.value)}
            className="inventory-form__input"
            placeholder="Ej: INV-2026-01"
          />
        </div>
      </div>

      {showPreview && previewData && (
        <div className="inventory-form__preview-modal">
          <div className="inventory-form__preview-content">
            <h4 className="inventory-form__preview-title">Resumen de Ajustes</h4>
            <p className="inventory-form__preview-summary">
              {previewData.summary?.total_products || 0} productos |{' '}
              {previewData.summary?.products_with_differences || 0} con diferencias
            </p>
            <div className="inventory-form__preview-table">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Actual</th>
                    <th>Nuevo</th>
                    <th>Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.adjustments?.map((adj, idx) => (
                    <tr key={idx}>
                      <td>{adj.product_name}</td>
                      <td>{adj.balloon_type || '-'}</td>
                      <td>{adj.current_full}</td>
                      <td>{adj.new_full}</td>
                      <td>
                        <span className={getDiffClass(adj.diff_full)}>
                          {getDiffText(adj.diff_full)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="inventory-form__btn inventory-form__btn--close-preview"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="inventory-form__actions">
        <button type="button" onClick={onCancel} className="inventory-form__btn inventory-form__btn--cancel">
          Cancelar
        </button>
        <button
          type="submit"
          className="inventory-form__btn inventory-form__btn--submit"
        >
          Aplicar Ajustes
        </button>
      </div>

      <AlertComponent />
    </form>
  );
};
