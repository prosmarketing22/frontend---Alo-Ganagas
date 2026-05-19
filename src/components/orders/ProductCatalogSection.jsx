import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import './ProductCatalogSection.css';

const PRODUCT_TYPE_CONFIG = {
  BALON_GAS: {
    label: 'Balones de Gas',
    icon: '🔥',
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    showCapacity: true,
    showBalloonType: true,
    capacityUnit: 'kg'
  },
  BIDON_AGUA: {
    label: 'Bidones de Agua',
    icon: '💧',
    color: '#0ea5e9',
    bgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    showCapacity: true,
    capacityUnit: 'L'
  },
  ACCESORIO: {
    label: 'Accesorios',
    icon: '🔧',
    color: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
    showDescription: true
  },
  SERVICIO: {
    label: 'Servicios',
    icon: '🛠️',
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    showDescription: true
  },
  OTRO: {
    label: 'Otros Productos',
    icon: '📦',
    color: '#6b7280',
    bgGradient: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
  }
};

const BALLOON_TYPE_LABELS = {
  GLP: { label: 'GLP', color: '#f97316', description: 'Gas Licuado de Petróleo' },
  GNV: { label: 'GNV', color: '#22c55e', description: 'Gas Natural Vehicular' },
  INDUSTRIAL: { label: 'Industrial', color: '#6366f1', description: 'Uso Industrial' }
};

export const ProductCatalogSection = ({
  products,
  specialPrices = [],
  onAddProduct,
  selectedCustomer
}) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollState, setScrollState] = useState({ left: false, right: true });
  const categoriesRef = useRef(null);

  const updateScrollState = useCallback(() => {
    const container = categoriesRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setScrollState({
      left: scrollLeft > 5,
      right: scrollLeft < scrollWidth - clientWidth - 5
    });
  }, []);

  useEffect(() => {
    const container = categoriesRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);

    return () => {
      container.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollCategories = (direction) => {
    const container = categoriesRef.current;
    if (!container) return;
    const scrollAmount = 150;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const getApplicablePrice = (product) => {
    const specialPrice = specialPrices.find(sp => sp.product_id === product.id);
    if (specialPrice && specialPrice.status === 'active') {
      return {
        price: parseFloat(specialPrice.price),
        isSpecial: true,
        regularPrice: parseFloat(product.sale_price)
      };
    }
    return {
      price: parseFloat(product.sale_price),
      isSpecial: false,
      regularPrice: parseFloat(product.sale_price)
    };
  };

  const isOutOfStock = (product) => {
    return !product.available_stock || product.available_stock <= 0;
  };

  const groupedProducts = useMemo(() => {
    const groups = {};

    // Incluir TODOS los productos, no solo los con stock
    products.forEach(product => {
      const type = product.product_type || 'OTRO';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(product);
    });

    // Ordenar: primero los con stock, luego sin stock
    Object.keys(groups).forEach(type => {
      groups[type].sort((a, b) => {
        // Primero por disponibilidad de stock
        const aOutOfStock = isOutOfStock(a);
        const bOutOfStock = isOutOfStock(b);
        if (aOutOfStock !== bOutOfStock) {
          return aOutOfStock ? 1 : -1; // Sin stock al final
        }
        // Luego por marca/nombre
        if (a.brand_name && b.brand_name) {
          return a.brand_name.localeCompare(b.brand_name);
        }
        return a.name.localeCompare(b.name);
      });
    });

    return groups;
  }, [products]);

  // Para el contador y categorías, usar todos los productos
  const availableProducts = products;

  const filteredProducts = useMemo(() => {
    let filtered = availableProducts;

    if (activeCategory !== 'ALL') {
      filtered = filtered.filter(p => (p.product_type || 'OTRO') === activeCategory);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.code?.toLowerCase().includes(search) ||
        p.brand_name?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [availableProducts, activeCategory, searchTerm]);

  const categories = useMemo(() => {
    const cats = Object.keys(groupedProducts).map(type => ({
      id: type,
      ...PRODUCT_TYPE_CONFIG[type] || PRODUCT_TYPE_CONFIG.OTRO,
      count: groupedProducts[type].length
    }));

    return [
      { id: 'ALL', label: 'Todos', icon: '🏪', count: availableProducts.length, color: '#3b82f6' },
      ...cats
    ];
  }, [groupedProducts, availableProducts]);

  const renderProductCard = (product) => {
    const priceInfo = getApplicablePrice(product);
    const typeConfig = PRODUCT_TYPE_CONFIG[product.product_type] || PRODUCT_TYPE_CONFIG.OTRO;
    const balloonConfig = product.balloon_type ? BALLOON_TYPE_LABELS[product.balloon_type] : null;
    const outOfStock = isOutOfStock(product);

    const handleClick = () => {
      if (!outOfStock) {
        onAddProduct(product);
      }
    };

    return (
      <div
        key={product.id}
        className={`pcs-product-card ${priceInfo.isSpecial ? 'pcs-product-card--special' : ''} ${outOfStock ? 'pcs-product-card--out-of-stock' : ''}`}
        onClick={handleClick}
        style={{ '--accent-color': typeConfig.color, cursor: outOfStock ? 'not-allowed' : 'pointer' }}
      >
        {outOfStock && (
          <div className="pcs-product-card__out-of-stock-overlay">
            <span className="pcs-product-card__out-of-stock-badge">SIN STOCK</span>
          </div>
        )}
        <div className="pcs-product-card__header">
          <div className="pcs-product-card__badges">
            {product.brand_name && (
              <span className="pcs-product-card__brand">
                {product.brand_name}
              </span>
            )}
            {balloonConfig && (
              <span
                className="pcs-product-card__balloon-type"
                style={{ backgroundColor: balloonConfig.color }}
                title={balloonConfig.description}
              >
                {balloonConfig.label}
              </span>
            )}
            {priceInfo.isSpecial && !outOfStock && (
              <span className="pcs-product-card__special-badge">
                ★ Precio Especial
              </span>
            )}
          </div>
          <span className="pcs-product-card__code">{product.code}</span>
        </div>

        <div className="pcs-product-card__body">
          <h4 className="pcs-product-card__name">{product.name}</h4>

          <div className="pcs-product-card__details">
            {typeConfig.showCapacity && product.capacity && (
              <div className="pcs-product-card__detail">
                <span className="pcs-product-card__detail-icon">⚖️</span>
                <span className="pcs-product-card__detail-value">
                  {product.capacity} {typeConfig.capacityUnit}
                </span>
              </div>
            )}
            {typeConfig.showDescription && product.description && (
              <p className="pcs-product-card__description">
                {product.description.substring(0, 60)}
                {product.description.length > 60 ? '...' : ''}
              </p>
            )}
            {(product.is_exchangeable || ['BALON_GAS', 'BIDON_AGUA'].includes(product.product_type)) && (
              <div className="pcs-product-card__detail pcs-product-card__detail--exchange">
                <span className="pcs-product-card__detail-icon">🔄</span>
                <span className="pcs-product-card__detail-value">Intercambiable</span>
              </div>
            )}
          </div>
        </div>

        <div className="pcs-product-card__footer">
          <div className="pcs-product-card__pricing">
            {priceInfo.isSpecial ? (
              <>
                <span className="pcs-product-card__price pcs-product-card__price--special">
                  S/ {priceInfo.price.toFixed(2)}
                </span>
                <span className="pcs-product-card__price pcs-product-card__price--original">
                  S/ {priceInfo.regularPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="pcs-product-card__price">
                S/ {priceInfo.price.toFixed(2)}
              </span>
            )}
          </div>
          <div className="pcs-product-card__stock">
            <span className={`pcs-product-card__stock-indicator ${
              product.available_stock <= 5 ? 'pcs-product-card__stock-indicator--low' : ''
            }`}>
              {product.available_stock}
            </span>
            <span className="pcs-product-card__stock-label">en stock</span>
          </div>
        </div>

        <div className="pcs-product-card__add-overlay">
          <span className="pcs-product-card__add-icon">+</span>
          <span className="pcs-product-card__add-text">Agregar</span>
        </div>
      </div>
    );
  };

  return (
    <div className="pcs-container">
      <div className="pcs-header">
        <div className="pcs-search">
          <span className="pcs-search__icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar producto, código o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pcs-search__input"
          />
          {searchTerm && (
            <button
              className="pcs-search__clear"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className={`pcs-categories-wrapper ${scrollState.left ? 'pcs-categories-wrapper--scroll-left' : ''} ${scrollState.right ? 'pcs-categories-wrapper--scroll-right' : ''}`}>
        {scrollState.left && (
          <button
            className="pcs-categories-arrow pcs-categories-arrow--left"
            onClick={() => scrollCategories('left')}
            aria-label="Scroll izquierda"
          >
            ‹
          </button>
        )}
        <div className="pcs-categories" ref={categoriesRef}>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`pcs-category ${activeCategory === cat.id ? 'pcs-category--active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                '--cat-color': cat.color,
                '--cat-bg': cat.bgGradient || `linear-gradient(135deg, ${cat.color}10 0%, ${cat.color}20 100%)`
              }}
            >
              <span className="pcs-category__icon">{cat.icon}</span>
              <span className="pcs-category__label">{cat.label}</span>
              <span className="pcs-category__count">{cat.count}</span>
            </button>
          ))}
        </div>
        {scrollState.right && (
          <button
            className="pcs-categories-arrow pcs-categories-arrow--right"
            onClick={() => scrollCategories('right')}
            aria-label="Scroll derecha"
          >
            ›
          </button>
        )}
      </div>

      <div className="pcs-products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => renderProductCard(product))
        ) : (
          <div className="pcs-empty">
            <span className="pcs-empty__icon">📭</span>
            <p className="pcs-empty__text">
              {searchTerm
                ? 'No se encontraron productos con ese criterio'
                : 'No hay productos disponibles en esta categoría'
              }
            </p>
          </div>
        )}
      </div>

      {selectedCustomer && specialPrices.length > 0 && (
        <div className="pcs-special-notice">
          <span className="pcs-special-notice__icon">⭐</span>
          <span className="pcs-special-notice__text">
            {selectedCustomer.full_name} tiene {specialPrices.filter(sp => sp.status === 'active').length} precio(s) especial(es) configurado(s)
          </span>
        </div>
      )}
    </div>
  );
};
