import { useState, useEffect, useMemo } from 'react';
import { useCustomerApi } from '../../hooks/useApi/useCustomerApi';
import { useProductApi } from '../../hooks/useApi/useProductApi';
import { warehouseService } from '../../services/warehouseService';
import { ModalAlerta } from '../common/ModalAlerta';
import './OrderFormV2.css';

const MIN_GANAGAS_AMOUNT = 5;

const DecimalInput = ({ value, onChange, className, min, step }) => {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  return (
    <input
      type="number"
      className={className}
      value={localValue}
      min={min}
      step={step}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        const val = parseFloat(localValue);
        if (!isNaN(val) && val > 0) {
          onChange(Math.round(val * 100) / 100);
        } else {
          setLocalValue(value.toString());
        }
      }}
    />
  );
};

export const OrderFormV2 = ({ onSubmit, onCancel, loading = false }) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    customer_id: '',
    delivery_address: '',
    delivery_reference: '',
    discount: 0,
    use_ganagas_balance: false,
    ganagas_amount: 0,
    notes: ''
  });

  // Estados de UI
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [specialPrices, setSpecialPrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Estados de secciones expandidas
  const [expandedSections, setExpandedSections] = useState({
    customer: true,
    products: false,
    payment: false
  });

  // Estados de almacén
  const [warehouses, setWarehouses] = useState([]);
  const [selectedMainWarehouse, setSelectedMainWarehouse] = useState(null);
  const [productWarehouseOverrides, setProductWarehouseOverrides] = useState({});
  const [stockAvailability, setStockAvailability] = useState(null);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  const { data: customers, getCustomerList, getSpecialPrices } = useCustomerApi();
  const { data: products, fetchProducts } = useProductApi();

  // Cargar datos iniciales
  useEffect(() => {
    getCustomerList();
    fetchProducts({ status: 'active', limit: 1000 });
    loadWarehouses();
  }, []);

  // Verificar stock cuando cambia el carrito o almacén
  useEffect(() => {
    if (cartItems.length > 0 && selectedMainWarehouse) {
      checkStockAvailability();
    }
  }, [cartItems, selectedMainWarehouse]);

  const loadWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const response = await warehouseService.getAll({ status: 'active', limit: 100 });
      if (response?.success) {
        const warehouseList = response.data || [];
        setWarehouses(warehouseList);
        const mainWarehouse = warehouseList.find(w => w.is_main);
        if (mainWarehouse) {
          setSelectedMainWarehouse(mainWarehouse.id);
        } else if (warehouseList.length > 0) {
          setSelectedMainWarehouse(warehouseList[0].id);
        }
      }
    } catch (err) {
      console.error('Error cargando almacenes:', err);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const checkStockAvailability = async () => {
    if (cartItems.length === 0) return;
    try {
      const productsToCheck = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));
      const response = await warehouseService.getStockAvailability(productsToCheck);
      if (response?.success) {
        setStockAvailability(response.data);
      }
    } catch (err) {
      console.error('Error verificando stock:', err);
    }
  };

  // Filtrar clientes
  const filteredCustomers = useMemo(() => {
    if (!searchCustomer) return customers.slice(0, 8);
    const search = searchCustomer.toLowerCase().trim();
    return customers.filter(c =>
      c.full_name?.toLowerCase().includes(search) ||
      c.phone?.includes(search) ||
      c.dni?.toLowerCase().includes(search) ||
      c.address?.toLowerCase().includes(search)
    ).slice(0, 8);
  }, [customers, searchCustomer]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let filtered = products;
    if (searchProduct) {
      const search = searchProduct.toLowerCase().trim();
      filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search) ||
        p.code?.toLowerCase().includes(search) ||
        p.brand_name?.toLowerCase().includes(search)
      );
    }
    return filtered.slice(0, 12);
  }, [products, searchProduct]);

  // Productos agrupados por tipo
  const groupedProducts = useMemo(() => {
    const groups = {};
    filteredProducts.forEach(product => {
      const type = product.product_type || 'OTROS';
      if (!groups[type]) groups[type] = [];
      groups[type].push(product);
    });
    return groups;
  }, [filteredProducts]);

  // Calcular totales
  const totals = useMemo(() => {
    const productSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const containerSubtotal = cartItems.reduce((sum, item) => {
      if (item.includes_container && item.container_price > 0) {
        return sum + (item.container_price * item.quantity);
      }
      return sum;
    }, 0);
    const subtotal = productSubtotal + containerSubtotal;
    const discount = parseFloat(formData.discount) || 0;
    const ganagasUsed = formData.use_ganagas_balance ? Math.min(
      parseFloat(formData.ganagas_amount) || 0,
      parseFloat(selectedCustomer?.ganagas_balance) || 0,
      subtotal - discount
    ) : 0;
    const total = Math.max(0, subtotal - discount - ganagasUsed);

    return { productSubtotal, containerSubtotal, subtotal, discount, ganagasUsed, total };
  }, [cartItems, formData.discount, formData.use_ganagas_balance, formData.ganagas_amount, selectedCustomer]);

  // Productos sin stock en almacén principal
  const productsWithStockIssues = useMemo(() => {
    if (!stockAvailability || !selectedMainWarehouse) return [];
    const mainWarehouseData = stockAvailability.warehouses?.find(w => w.id === selectedMainWarehouse);
    if (!mainWarehouseData) return [];
    return mainWarehouseData.products_with_insufficient_stock || [];
  }, [stockAvailability, selectedMainWarehouse]);

  // Obtener almacenes alternativos para un producto
  const getAlternativeWarehouses = (productId, requiredQuantity) => {
    if (!stockAvailability) return [];
    return stockAvailability.warehouses?.filter(w => {
      if (w.id === selectedMainWarehouse) return false;
      const productAvail = w.products_availability?.find(p => p.product_id === productId);
      return productAvail?.has_sufficient_stock;
    }) || [];
  };

  // Toggle sección - solo una puede estar expandida
  const toggleSection = (section) => {
    setExpandedSections(prev => {
      const isCurrentlyExpanded = prev[section];
      // Colapsar todas y expandir solo la clickeada (si estaba colapsada)
      return {
        customer: section === 'customer' && !isCurrentlyExpanded,
        products: section === 'products' && !isCurrentlyExpanded,
        payment: section === 'payment' && !isCurrentlyExpanded
      };
    });
  };

  // Seleccionar cliente
  const handleCustomerSelect = async (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customer_id: customer.id,
      delivery_address: customer.address || '',
      delivery_reference: customer.reference || ''
    }));
    setSearchCustomer('');
    setExpandedSections({ customer: false, products: true, payment: false });

    setLoadingPrices(true);
    try {
      const prices = await getSpecialPrices(customer.id);
      setSpecialPrices(prices || []);
    } catch (error) {
      setSpecialPrices([]);
    } finally {
      setLoadingPrices(false);
    }
  };

  // Obtener precio aplicable
  const getApplicablePrice = (product) => {
    const specialPrice = specialPrices.find(sp => sp.product_id === product.id);
    if (specialPrice && specialPrice.status === 'active') {
      return { price: parseFloat(specialPrice.price), isSpecial: true, regularPrice: parseFloat(product.sale_price) };
    }
    return { price: parseFloat(product.sale_price), isSpecial: false, regularPrice: parseFloat(product.sale_price) };
  };

  // Agregar producto
  const handleAddProduct = (product) => {
    const existing = cartItems.find(item => item.product_id === product.id);
    const allowsDecimals = product.unit_allows_decimals || false;
    const step = allowsDecimals ? 0.1 : 1;
    if (existing) {
      setCartItems(prev => prev.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: Math.round((item.quantity + step) * 100) / 100 }
          : item
      ));
    } else {
      const priceInfo = getApplicablePrice(product);
      const isExchangeable = product.is_exchangeable || ['BALON_GAS', 'BIDON_AGUA'].includes(product.product_type);
      setCartItems(prev => [...prev, {
        product_id: product.id,
        name: product.name,
        code: product.code,
        price: priceInfo.price,
        regularPrice: priceInfo.regularPrice,
        isSpecialPrice: priceInfo.isSpecial,
        quantity: allowsDecimals ? 0.1 : 1,
        is_exchange: isExchangeable,
        includes_container: false,
        container_price: product.container_price ? parseFloat(product.container_price) : 0,
        available_stock: product.available_stock || 0,
        brand_name: product.brand_name || null,
        product_type: product.product_type || null,
        balloon_type: product.balloon_type || null,
        capacity: product.capacity || null,
        is_exchangeable: isExchangeable,
        unit_allows_decimals: allowsDecimals,
        unit_abbreviation: product.unit_abbreviation || null
      }]);
    }
  };

  // Actualizar cantidad
  const handleUpdateQuantity = (productId, quantity) => {
    const rounded = Math.round(quantity * 100) / 100;
    if (rounded <= 0) {
      handleRemoveProduct(productId);
      return;
    }
    setCartItems(prev => prev.map(item =>
      item.product_id === productId ? { ...item, quantity: rounded } : item
    ));
  };

  // Eliminar producto
  const handleRemoveProduct = (productId) => {
    setCartItems(prev => prev.filter(item => item.product_id !== productId));
    setProductWarehouseOverrides(prev => {
      const newOverrides = { ...prev };
      delete newOverrides[productId];
      return newOverrides;
    });
  };

  // Toggle intercambio
  const handleToggleExchange = (productId) => {
    setCartItems(prev => prev.map(item =>
      item.product_id === productId
        ? { ...item, is_exchange: !item.is_exchange, includes_container: !item.is_exchange ? false : item.includes_container }
        : item
    ));
  };

  // Toggle envase
  const handleToggleContainer = (productId) => {
    setCartItems(prev => prev.map(item =>
      item.product_id === productId
        ? { ...item, includes_container: !item.includes_container, is_exchange: !item.includes_container ? false : item.is_exchange }
        : item
    ));
  };

  // Cambiar almacén de producto específico
  const handleProductWarehouseChange = (productId, warehouseId) => {
    if (warehouseId) {
      setProductWarehouseOverrides(prev => ({ ...prev, [productId]: parseInt(warehouseId) }));
    } else {
      setProductWarehouseOverrides(prev => {
        const newOverrides = { ...prev };
        delete newOverrides[productId];
        return newOverrides;
      });
    }
  };

  // Obtener nombre de almacén
  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse?.name || 'Desconocido';
  };

  // Verificar si producto tiene problema de stock
  const hasStockIssue = (productId) => {
    return productsWithStockIssues.some(p => p.product_id === productId);
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCustomer) {
      setAlertModal({ isOpen: true, title: 'Cliente requerido', message: 'Selecciona un cliente para continuar.', type: 'warning' });
      return;
    }

    if (cartItems.length === 0) {
      setAlertModal({ isOpen: true, title: 'Carrito vacío', message: 'Agrega al menos un producto.', type: 'warning' });
      return;
    }

    if (formData.use_ganagas_balance && (parseFloat(formData.ganagas_amount) || 0) < MIN_GANAGAS_AMOUNT) {
      setAlertModal({ isOpen: true, title: 'Monto mínimo GANAGAS', message: `El monto mínimo es S/ ${MIN_GANAGAS_AMOUNT.toFixed(2)}`, type: 'warning' });
      return;
    }

    const details = cartItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      is_exchange: item.is_exchange,
      includes_container: item.includes_container,
      warehouse_id: productWarehouseOverrides[item.product_id] || selectedMainWarehouse
    }));

    onSubmit({ ...formData, details });
  };

  const allStockOk = productsWithStockIssues.length === 0 && cartItems.length > 0;

  return (
    <div className="order-v2">
      <div className="order-v2__header">
        <h2 className="order-v2__title">Nuevo Pedido</h2>
        <button type="button" onClick={onCancel} className="order-v2__close" disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="order-v2__form">
        <div className="order-v2__sections">

          {/* SECCIÓN CLIENTE */}
          <div className={`order-v2__section ${expandedSections.customer ? 'order-v2__section--expanded' : ''} ${selectedCustomer ? 'order-v2__section--completed' : ''}`}>
            <button type="button" className="order-v2__section-header" onClick={() => toggleSection('customer')}>
              <div className="order-v2__section-info">
                <span className="order-v2__section-icon">{selectedCustomer ? '✓' : '1'}</span>
                <span className="order-v2__section-title">Cliente</span>
                {selectedCustomer && !expandedSections.customer && (
                  <span className="order-v2__section-summary">{selectedCustomer.full_name}</span>
                )}
              </div>
              <span className="order-v2__section-toggle">{expandedSections.customer ? '▼' : '▶'}</span>
            </button>

            {expandedSections.customer && (
              <div className="order-v2__section-content">
                {selectedCustomer ? (
                  <div className="order-v2__customer-selected">
                    <div className="order-v2__customer-card">
                      <div className="order-v2__customer-avatar">
                        {selectedCustomer.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="order-v2__customer-details">
                        <strong>{selectedCustomer.full_name}</strong>
                        <span>📱 {selectedCustomer.phone}</span>
                        {selectedCustomer.dni && <span>🪪 {selectedCustomer.dni}</span>}
                        {selectedCustomer.ganagas_balance > 0 && (
                          <span className="order-v2__ganagas-badge">💰 S/ {parseFloat(selectedCustomer.ganagas_balance).toFixed(2)}</span>
                        )}
                      </div>
                      <button type="button" className="order-v2__btn-change" onClick={() => {
                        setSelectedCustomer(null);
                        setSpecialPrices([]);
                        setCartItems([]);
                        setExpandedSections({ customer: true, products: false, payment: false });
                      }}>
                        Cambiar
                      </button>
                    </div>
                    <div className="order-v2__address-fields">
                      <div className="order-v2__field">
                        <label>📍 Dirección de entrega</label>
                        <input
                          type="text"
                          value={formData.delivery_address}
                          onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                          placeholder="Dirección de entrega"
                          required
                        />
                      </div>
                      <div className="order-v2__field">
                        <label>🏠 Referencia</label>
                        <input
                          type="text"
                          value={formData.delivery_reference}
                          onChange={(e) => setFormData(prev => ({ ...prev, delivery_reference: e.target.value }))}
                          placeholder="Referencia (opcional)"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="order-v2__customer-search">
                    <input
                      type="text"
                      placeholder="🔍 Buscar por nombre, DNI, teléfono..."
                      value={searchCustomer}
                      onChange={(e) => setSearchCustomer(e.target.value)}
                      className="order-v2__search-input"
                      autoFocus
                    />
                    <div className="order-v2__customer-list">
                      {filteredCustomers.map(customer => (
                        <div key={customer.id} className="order-v2__customer-item" onClick={() => handleCustomerSelect(customer)}>
                          <div className="order-v2__customer-avatar">{customer.full_name?.charAt(0).toUpperCase()}</div>
                          <div className="order-v2__customer-info">
                            <strong>{customer.full_name}</strong>
                            <span>{customer.phone} {customer.dni && `• ${customer.dni}`}</span>
                            {customer.address && <span className="order-v2__customer-address">📍 {customer.address}</span>}
                          </div>
                          {customer.ganagas_balance > 0 && (
                            <span className="order-v2__ganagas-mini">S/{parseFloat(customer.ganagas_balance).toFixed(0)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECCIÓN PRODUCTOS Y ALMACÉN */}
          <div className={`order-v2__section ${expandedSections.products ? 'order-v2__section--expanded' : ''} ${cartItems.length > 0 ? 'order-v2__section--completed' : ''}`}>
            <button type="button" className="order-v2__section-header" onClick={() => selectedCustomer && toggleSection('products')} disabled={!selectedCustomer}>
              <div className="order-v2__section-info">
                <span className="order-v2__section-icon">{cartItems.length > 0 ? '✓' : '2'}</span>
                <span className="order-v2__section-title">Productos y Almacén</span>
                {cartItems.length > 0 && !expandedSections.products && (
                  <span className="order-v2__section-summary">{cartItems.length} productos • {getWarehouseName(selectedMainWarehouse)}</span>
                )}
              </div>
              <span className="order-v2__section-toggle">{expandedSections.products ? '▼' : '▶'}</span>
            </button>

            {expandedSections.products && selectedCustomer && (
              <div className="order-v2__section-content">
                {/* Selector de almacén */}
                <div className="order-v2__warehouse-selector">
                  <label>🏭 Almacén de salida:</label>
                  <select
                    value={selectedMainWarehouse || ''}
                    onChange={(e) => {
                      setSelectedMainWarehouse(parseInt(e.target.value));
                      setProductWarehouseOverrides({});
                    }}
                    disabled={loadingWarehouses}
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} {w.is_main ? '(Principal)' : ''}</option>
                    ))}
                  </select>
                  {allStockOk && cartItems.length > 0 && (
                    <span className="order-v2__stock-ok">✓ Stock disponible</span>
                  )}
                </div>

                {/* Catálogo de productos */}
                <div className="order-v2__catalog">
                  <input
                    type="text"
                    placeholder="🔍 Buscar producto..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="order-v2__search-input"
                  />
                  <div className="order-v2__products-grid">
                    {Object.entries(groupedProducts).map(([type, prods]) => (
                      <div key={type} className="order-v2__product-group">
                        <span className="order-v2__product-group-title">{type.replace('_', ' ')}</span>
                        <div className="order-v2__product-items">
                          {prods.map(product => {
                            const priceInfo = getApplicablePrice(product);
                            const inCart = cartItems.find(item => item.product_id === product.id);
                            return (
                              <div
                                key={product.id}
                                className={`order-v2__product-card ${inCart ? 'order-v2__product-card--in-cart' : ''}`}
                                onClick={() => handleAddProduct(product)}
                              >
                                {priceInfo.isSpecial && <span className="order-v2__special-badge">★</span>}
                                <span className="order-v2__product-name">{product.name}</span>
                                <span className="order-v2__product-price">S/ {priceInfo.price.toFixed(2)}</span>
                                {inCart && <span className="order-v2__in-cart-badge">{inCart.quantity}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carrito */}
                {cartItems.length > 0 && (
                  <div className="order-v2__cart">
                    <div className="order-v2__cart-header">
                      <span>🛒 Carrito</span>
                      <span className="order-v2__cart-count">{cartItems.length} productos</span>
                    </div>
                    <div className="order-v2__cart-items">
                      {cartItems.map(item => {
                        const stockIssue = hasStockIssue(item.product_id);
                        const alternativeWarehouses = stockIssue ? getAlternativeWarehouses(item.product_id, item.quantity) : [];
                        const currentOverride = productWarehouseOverrides[item.product_id];

                        return (
                          <div key={item.product_id} className={`order-v2__cart-item ${stockIssue && !currentOverride ? 'order-v2__cart-item--warning' : ''}`}>
                            <div className="order-v2__cart-item-main">
                              <div className="order-v2__cart-item-info">
                                <strong>{item.name}</strong>
                                <span className="order-v2__cart-item-price">S/ {item.price.toFixed(2)} c/u</span>
                              </div>
                              <div className="order-v2__cart-item-controls">
                                {(() => {
                                  const step = item.unit_allows_decimals ? 0.1 : 1;
                                  return (
                                    <>
                                      <button type="button" onClick={() => handleUpdateQuantity(item.product_id, item.quantity - step)}>−</button>
                                      {item.unit_allows_decimals ? (
                                        <DecimalInput
                                          className="order-v2__cart-qty-input"
                                          value={item.quantity}
                                          min="0.01"
                                          step="0.01"
                                          onChange={(val) => handleUpdateQuantity(item.product_id, val)}
                                        />
                                      ) : (
                                        <span>{item.quantity}</span>
                                      )}
                                      <button type="button" onClick={() => handleUpdateQuantity(item.product_id, item.quantity + step)}>+</button>
                                    </>
                                  );
                                })()}
                              </div>
                              {item.unit_abbreviation && (
                                <span className="order-v2__cart-item-unit">{item.unit_abbreviation}</span>
                              )}
                              <span className="order-v2__cart-item-subtotal">S/ {(item.price * item.quantity).toFixed(2)}</span>
                              <button type="button" className="order-v2__cart-item-remove" onClick={() => handleRemoveProduct(item.product_id)}>✕</button>
                            </div>

                            {/* Opciones de intercambio */}
                            {item.is_exchangeable && (
                              <div className="order-v2__cart-item-options">
                                <label className="order-v2__toggle">
                                  <input type="checkbox" checked={item.is_exchange} onChange={() => handleToggleExchange(item.product_id)} disabled={item.includes_container} />
                                  <span>🔄 Intercambio</span>
                                </label>
                                {item.container_price > 0 && (
                                  <label className="order-v2__toggle">
                                    <input type="checkbox" checked={item.includes_container} onChange={() => handleToggleContainer(item.product_id)} />
                                    <span>📦 + Envase (S/{item.container_price.toFixed(2)})</span>
                                  </label>
                                )}
                              </div>
                            )}

                            {/* Alerta de stock */}
                            {stockIssue && (
                              <div className="order-v2__cart-item-stock-alert">
                                <span>⚠️ Sin stock en {getWarehouseName(selectedMainWarehouse)}</span>
                                {alternativeWarehouses.length > 0 ? (
                                  <select
                                    value={currentOverride || ''}
                                    onChange={(e) => handleProductWarehouseChange(item.product_id, e.target.value)}
                                  >
                                    <option value="">Seleccionar almacén...</option>
                                    {alternativeWarehouses.map(w => (
                                      <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="order-v2__no-stock">Sin stock disponible</span>
                                )}
                              </div>
                            )}

                            {/* Badge de almacén alternativo */}
                            {currentOverride && (
                              <div className="order-v2__cart-item-warehouse">
                                <span>📍 {getWarehouseName(currentOverride)}</span>
                                <button type="button" onClick={() => handleProductWarehouseChange(item.product_id, null)}>✕</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {cartItems.length > 0 && (
                  <button type="button" className="order-v2__btn-next" onClick={() => setExpandedSections({ customer: false, products: false, payment: true })}>
                    Continuar →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SECCIÓN DESCUENTOS Y NOTAS */}
          <div className={`order-v2__section ${expandedSections.payment ? 'order-v2__section--expanded' : ''}`}>
            <button type="button" className="order-v2__section-header" onClick={() => cartItems.length > 0 && toggleSection('payment')} disabled={cartItems.length === 0}>
              <div className="order-v2__section-info">
                <span className="order-v2__section-icon">3</span>
                <span className="order-v2__section-title">Descuentos y Notas</span>
              </div>
              <span className="order-v2__section-toggle">{expandedSections.payment ? '▼' : '▶'}</span>
            </button>

            {expandedSections.payment && cartItems.length > 0 && (
              <div className="order-v2__section-content">
                <div className="order-v2__discounts">
                  <div className="order-v2__field">
                    <label>💸 Descuento (S/)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>

                  {selectedCustomer && parseFloat(selectedCustomer.ganagas_balance) >= MIN_GANAGAS_AMOUNT && (
                    <div className="order-v2__ganagas-section">
                      <label className="order-v2__toggle order-v2__toggle--ganagas">
                        <input
                          type="checkbox"
                          checked={formData.use_ganagas_balance}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            use_ganagas_balance: e.target.checked,
                            ganagas_amount: e.target.checked ? selectedCustomer.ganagas_balance : 0
                          }))}
                        />
                        <span>💰 Usar saldo GANAGAS (S/ {parseFloat(selectedCustomer.ganagas_balance).toFixed(2)})</span>
                      </label>
                      {formData.use_ganagas_balance && (
                        <input
                          type="number"
                          min={MIN_GANAGAS_AMOUNT}
                          max={selectedCustomer.ganagas_balance}
                          step="0.01"
                          value={formData.ganagas_amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, ganagas_amount: e.target.value }))}
                          placeholder={`Mín. S/${MIN_GANAGAS_AMOUNT}`}
                        />
                      )}
                    </div>
                  )}

                  <div className="order-v2__field">
                    <label>📝 Observaciones</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notas adicionales..."
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER CON RESUMEN Y BOTÓN */}
        <div className="order-v2__footer">
          <div className="order-v2__summary">
            <div className="order-v2__summary-row">
              <span>Subtotal</span>
              <span>S/ {totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="order-v2__summary-row order-v2__summary-row--discount">
                <span>Descuento</span>
                <span>- S/ {totals.discount.toFixed(2)}</span>
              </div>
            )}
            {totals.ganagasUsed > 0 && (
              <div className="order-v2__summary-row order-v2__summary-row--ganagas">
                <span>GANAGAS</span>
                <span>- S/ {totals.ganagasUsed.toFixed(2)}</span>
              </div>
            )}
            <div className="order-v2__summary-row order-v2__summary-row--total">
              <span>TOTAL</span>
              <span>S/ {totals.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="order-v2__btn-submit"
            disabled={loading || !selectedCustomer || cartItems.length === 0}
          >
            {loading ? 'Creando...' : '✓ Crear Pedido'}
          </button>
        </div>
      </form>

      <ModalAlerta
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        buttonText="Entendido"
      />
    </div>
  );
};

export default OrderFormV2;
