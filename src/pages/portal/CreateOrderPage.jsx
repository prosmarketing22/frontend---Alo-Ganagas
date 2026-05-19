import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalApi } from '../../hooks/useApi/usePortalApi';
import { ProductCatalog } from '../../components/portal/ProductCatalog';
import { ShoppingCart } from '../../components/portal/ShoppingCart';
import './CreateOrderPage.css';

const PAYMENT_METHOD_LABELS = {
  'EFECTIVO': 'Efectivo',
  'YAPE': 'Yape',
  'PLIN': 'Plin',
  'TRANSFERENCIA': 'Transferencia Bancaria',
  'VALE_FISE': 'Vale FISE'
};

export const CreateOrderPage = () => {
  const navigate = useNavigate();
  const { getSummary, getAvailableProducts, getPaymentMethods, createOrder, loading } = usePortalApi();
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDistrict, setDeliveryDistrict] = useState('');
  const [deliveryReference, setDeliveryReference] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [useGanagas, setUseGanagas] = useState(false);
  const [ganagasBalance, setGanagasBalance] = useState(0);
  const [canUseGanagas, setCanUseGanagas] = useState(false);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar resumen del cliente, productos y métodos de pago en paralelo
      const [summary, availableProducts, activePaymentMethods] = await Promise.all([
        getSummary(),
        getAvailableProducts(),
        getPaymentMethods()
      ]);

      // Establecer datos del cliente
      setGanagasBalance(summary.ganagas_balance || 0);
      setCanUseGanagas(summary.can_use_ganagas || false);
      setDeliveryAddress(summary.address || '');
      setDeliveryDistrict(summary.district || '');
      setDeliveryReference(summary.reference || '');

      // Establecer productos disponibles
      setProducts(availableProducts || []);

      // Establecer métodos de pago activos
      const methods = activePaymentMethods || [];
      setPaymentMethods(methods);
      // Establecer el primer método como predeterminado
      if (methods.length > 0 && !paymentMethod) {
        setPaymentMethod(methods[0].method_type);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    const allowsDecimals = product.unit_allows_decimals || false;
    const step = allowsDecimals ? 0.1 : 1;
    if (existingItem) {
      // El cliente puede pedir cualquier cantidad - el stock se valida al momento de la entrega
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: Math.round((item.quantity + step) * 100) / 100 }
          : item
      ));
    } else {
      const containerPrice = product.container_price ? parseFloat(product.container_price) : 0;
      setCartItems([...cartItems, {
        ...product,
        quantity: allowsDecimals ? 0.1 : 1,
        includes_container: false,
        container_price: containerPrice
      }]);
    }
  };

  const handleToggleContainer = (productId) => {
    setCartItems(cartItems.map(item =>
      item.id === productId
        ? { ...item, includes_container: !item.includes_container }
        : item
    ));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const rounded = Math.round(newQuantity * 100) / 100;
    if (rounded < 0.01) return;
    // El cliente puede pedir cualquier cantidad - el stock se valida al momento de la entrega
    setCartItems(cartItems.map(item =>
      item.id === productId ? { ...item, quantity: rounded } : item
    ));
  };

  const handleRemoveItem = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const productTotal = item.price * item.quantity;
      const containerTotal = item.includes_container && item.container_price > 0
        ? item.container_price * item.quantity
        : 0;
      return sum + productTotal + containerTotal;
    }, 0);
  };

  const calculateContainerTotal = () => {
    return cartItems.reduce((sum, item) => {
      if (item.includes_container && item.container_price > 0) {
        return sum + (item.container_price * item.quantity);
      }
      return sum;
    }, 0);
  };

  const calculateProductTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      alert('El carrito esta vacio');
      return;
    }

    if (!deliveryAddress.trim()) {
      alert('Por favor ingresa una direccion de entrega');
      return;
    }

    const total = calculateTotal();
    const ganagasToUse = useGanagas ? Math.min(ganagasBalance, total) : 0;

    if (useGanagas && ganagasBalance < total) {
      const confirmPartial = window.confirm(
        `Tu saldo GANAGAS (S/ ${ganagasBalance.toFixed(2)}) no cubre el total. ` +
        `Se usara todo tu saldo y el resto (S/ ${(total - ganagasBalance).toFixed(2)}) ` +
        `lo pagaras con ${paymentMethod}. ¿Deseas continuar?`
      );
      if (!confirmPartial) return;
    }

    setSubmitting(true);

    try {
      // Construir dirección completa incluyendo distrito
      const fullAddress = deliveryDistrict
        ? `${deliveryAddress.trim()}, ${deliveryDistrict.trim()}`
        : deliveryAddress.trim();

      // Transformar items del carrito al formato esperado por el backend
      const orderData = {
        products: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          is_exchange: item.includes_container ? false : (item.is_exchangeable || false),
          includes_container: item.includes_container || false,
          notes: null
        })),
        delivery_address: fullAddress,
        delivery_reference: deliveryReference || null,
        payment_method: paymentMethod,
        use_ganagas: useGanagas,
        ganagas_amount: ganagasToUse,
        notes: notes || null
      };

      await createOrder(orderData);
      alert('Pedido creado exitosamente. Pronto nos contactaremos contigo.');
      navigate('/portal/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al crear el pedido: ' + (error.message || 'Intenta nuevamente'));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="create-order-page">
        <div className="create-order-page__loading">
          <div className="create-order-page__spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  const total = calculateTotal();
  const ganagasToUse = useGanagas ? Math.min(ganagasBalance, total) : 0;
  const finalTotal = total - ganagasToUse;

  return (
    <div className="create-order-page">
      <div className="create-order-page__header">
        <h1 className="create-order-page__title">Hacer un Pedido</h1>
        <button
          className="create-order-page__back"
          onClick={() => navigate('/portal')}
        >
          Volver
        </button>
      </div>

      <div className="create-order-page__content">
        <div className="create-order-page__products">
          <h2 className="create-order-page__section-title">Productos Disponibles</h2>
          {products.length === 0 ? (
            <div className="create-order-page__no-products">
              No hay productos disponibles en este momento
            </div>
          ) : (
            <ProductCatalog
              products={products}
              onAddToCart={handleAddToCart}
            />
          )}
        </div>

        <div className="create-order-page__sidebar">
          <ShoppingCart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onToggleContainer={handleToggleContainer}
          />

          {cartItems.length > 0 && (
            <div className="create-order-page__checkout">
              <h3 className="create-order-page__checkout-title">Datos de Entrega</h3>

              <div className="create-order-page__field">
                <label className="create-order-page__label">Direccion de Entrega *</label>
                <textarea
                  className="create-order-page__textarea"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Ingresa tu direccion completa"
                  rows="2"
                />
              </div>

              <div className="create-order-page__row">
                <div className="create-order-page__field create-order-page__field--half">
                  <label className="create-order-page__label">Distrito</label>
                  <input
                    type="text"
                    className="create-order-page__input"
                    value={deliveryDistrict}
                    onChange={(e) => setDeliveryDistrict(e.target.value)}
                    placeholder="Ej: Huamanga"
                  />
                </div>

                <div className="create-order-page__field create-order-page__field--half">
                  <label className="create-order-page__label">Referencia</label>
                  <input
                    type="text"
                    className="create-order-page__input"
                    value={deliveryReference}
                    onChange={(e) => setDeliveryReference(e.target.value)}
                    placeholder="Ej: Frente al parque"
                  />
                </div>
              </div>

              <div className="create-order-page__field">
                <label className="create-order-page__label">Metodo de Pago</label>
                <select
                  className="create-order-page__select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {paymentMethods.map((method, index) => (
                    <option key={method.id || index} value={method.method_type}>
                      {PAYMENT_METHOD_LABELS[method.method_type] || method.method_type}
                    </option>
                  ))}
                </select>
              </div>

              {ganagasBalance > 0 && canUseGanagas && (
                <div className="create-order-page__ganagas">
                  <label className="create-order-page__checkbox-label">
                    <input
                      type="checkbox"
                      checked={useGanagas}
                      onChange={(e) => setUseGanagas(e.target.checked)}
                    />
                    <span>Usar mi saldo GANAGAS</span>
                  </label>
                  <div className="create-order-page__ganagas-balance">
                    Saldo disponible: S/ {ganagasBalance.toFixed(2)}
                  </div>
                </div>
              )}

              <div className="create-order-page__field">
                <label className="create-order-page__label">Notas adicionales (opcional)</label>
                <textarea
                  className="create-order-page__textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instrucciones especiales, horario preferido, etc."
                  rows="2"
                />
              </div>

              <div className="create-order-page__summary">
                <div className="create-order-page__summary-row">
                  <span>Productos:</span>
                  <span>S/ {calculateProductTotal().toFixed(2)}</span>
                </div>
                {calculateContainerTotal() > 0 && (
                  <div className="create-order-page__summary-row create-order-page__summary-row--container">
                    <span>Envases:</span>
                    <span>S/ {calculateContainerTotal().toFixed(2)}</span>
                  </div>
                )}
                <div className="create-order-page__summary-row">
                  <span>Subtotal:</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
                {useGanagas && ganagasToUse > 0 && (
                  <div className="create-order-page__summary-row create-order-page__summary-row--discount">
                    <span>Saldo GANAGAS:</span>
                    <span>- S/ {ganagasToUse.toFixed(2)}</span>
                  </div>
                )}
                <div className="create-order-page__summary-row create-order-page__summary-row--total">
                  <span>Total a pagar:</span>
                  <span className="create-order-page__summary-total">
                    S/ {finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className="create-order-page__submit"
                onClick={handleSubmit}
                disabled={submitting || loading}
              >
                {submitting ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
