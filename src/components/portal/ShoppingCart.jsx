import { useState, useEffect } from 'react';
import './ShoppingCart.css';

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

export const ShoppingCart = ({ items, onUpdateQuantity, onRemoveItem, onToggleContainer }) => {
  const productTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const containerTotal = items.reduce((sum, item) => {
    if (item.includes_container && item.container_price > 0) {
      return sum + (item.container_price * item.quantity);
    }
    return sum;
  }, 0);
  const total = productTotal + containerTotal;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calcular el ahorro total por precios preferenciales
  const totalSavings = items.reduce((sum, item) => {
    if (item.has_special_price && item.regular_price > item.price) {
      return sum + ((item.regular_price - item.price) * item.quantity);
    }
    return sum;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="shopping-cart shopping-cart--empty">
        <svg className="shopping-cart__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="shopping-cart__empty-text">Carrito vacío</span>
      </div>
    );
  }

  return (
    <div className="shopping-cart">
      <div className="shopping-cart__header">
        <div className="shopping-cart__header-left">
          <svg className="shopping-cart__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="shopping-cart__title">Carrito</span>
        </div>
        <span className="shopping-cart__badge">{items.length}</span>
      </div>

      <div className="shopping-cart__items">
        {items.map((item) => {
          const itemTotal = (item.price * item.quantity) + (item.includes_container && item.container_price > 0 ? item.container_price * item.quantity : 0);
          const canHaveContainer = item.is_exchangeable && item.container_price > 0;

          return (
            <div key={item.id} className={`shopping-cart__item ${item.has_special_price ? 'shopping-cart__item--special' : ''} ${item.includes_container ? 'shopping-cart__item--with-container' : ''}`}>
              <div className="shopping-cart__item-left">
                <span className="shopping-cart__item-name">{item.name}</span>
                <div className="shopping-cart__item-prices">
                  {item.has_special_price ? (
                    <>
                      <span className="shopping-cart__item-unit shopping-cart__item-unit--regular">
                        S/ {Number(item.regular_price).toFixed(2)}
                      </span>
                      <span className="shopping-cart__item-unit shopping-cart__item-unit--special">
                        S/ {Number(item.price).toFixed(2)} c/u
                      </span>
                    </>
                  ) : (
                    <span className="shopping-cart__item-unit">S/ {Number(item.price).toFixed(2)} c/u</span>
                  )}
                </div>
                {canHaveContainer && onToggleContainer && (
                  <div className="shopping-cart__container-option">
                    <label className="shopping-cart__container-toggle">
                      <input
                        type="checkbox"
                        checked={item.includes_container || false}
                        onChange={() => onToggleContainer(item.id)}
                      />
                      <span className="shopping-cart__container-slider"></span>
                      <span className="shopping-cart__container-text">
                        {item.includes_container ? 'Con envase nuevo' : 'Solo recarga'}
                      </span>
                    </label>
                    {item.includes_container && (
                      <span className="shopping-cart__container-price">
                        +S/ {Number(item.container_price).toFixed(2)} por envase
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="shopping-cart__item-right">
                <div className="shopping-cart__qty-controls">
                  {(() => {
                    const step = item.unit_allows_decimals ? 0.1 : 1;
                    const minQty = item.unit_allows_decimals ? 0.01 : 1;
                    return (
                      <>
                        <button
                          className="shopping-cart__qty-btn"
                          onClick={() => onUpdateQuantity(item.id, Math.round((item.quantity - step) * 100) / 100)}
                          disabled={item.quantity <= minQty}
                        >
                          −
                        </button>
                        {item.unit_allows_decimals ? (
                          <DecimalInput
                            className="shopping-cart__qty-input"
                            value={item.quantity}
                            min="0.01"
                            step="0.01"
                            onChange={(val) => onUpdateQuantity(item.id, val)}
                          />
                        ) : (
                          <span className="shopping-cart__qty">{item.quantity}</span>
                        )}
                        <button
                          className="shopping-cart__qty-btn"
                          onClick={() => onUpdateQuantity(item.id, Math.round((item.quantity + step) * 100) / 100)}
                          disabled={item.stock && item.quantity >= item.stock}
                          title={item.stock && item.quantity >= item.stock ? `Stock máximo: ${item.stock}` : ''}
                        >
                          +
                        </button>
                      </>
                    );
                  })()}
                </div>
                {item.unit_abbreviation && (
                  <span className="shopping-cart__unit-label">{item.unit_abbreviation}</span>
                )}
                {item.stock && item.quantity >= item.stock && (
                  <span className="shopping-cart__stock-warning">Máx. stock</span>
                )}

                <div className="shopping-cart__item-totals">
                  {item.has_special_price && (
                    <span className="shopping-cart__item-total shopping-cart__item-total--regular">
                      S/ {(item.regular_price * item.quantity).toFixed(2)}
                    </span>
                  )}
                  <span className={`shopping-cart__item-total ${item.has_special_price ? 'shopping-cart__item-total--special' : ''} ${item.includes_container ? 'shopping-cart__item-total--with-container' : ''}`}>
                    S/ {itemTotal.toFixed(2)}
                  </span>
                  {item.includes_container && item.container_price > 0 && (
                    <span className="shopping-cart__item-container-note">
                      (incluye envase)
                    </span>
                  )}
                </div>

                <button
                  className="shopping-cart__remove"
                  onClick={() => onRemoveItem(item.id)}
                  title="Eliminar"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="shopping-cart__footer">
        {totalSavings > 0 && (
          <div className="shopping-cart__savings">
            <span className="shopping-cart__savings-label">Ahorro por precio especial:</span>
            <span className="shopping-cart__savings-amount">- S/ {totalSavings.toFixed(2)}</span>
          </div>
        )}
        {containerTotal > 0 && (
          <div className="shopping-cart__container-summary">
            <div className="shopping-cart__container-row">
              <span className="shopping-cart__container-label">Productos:</span>
              <span className="shopping-cart__container-amount">S/ {productTotal.toFixed(2)}</span>
            </div>
            <div className="shopping-cart__container-row">
              <span className="shopping-cart__container-label">Envases:</span>
              <span className="shopping-cart__container-amount shopping-cart__container-amount--highlight">S/ {containerTotal.toFixed(2)}</span>
            </div>
          </div>
        )}
        <div className="shopping-cart__total-row">
          <span className="shopping-cart__total-label">Total</span>
          <span className="shopping-cart__total-amount">S/ {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
