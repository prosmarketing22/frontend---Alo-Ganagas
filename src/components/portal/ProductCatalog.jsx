import { BASE_URL } from '../../config/api.config';
import './ProductCatalog.css';

export const ProductCatalog = ({ products, onAddToCart }) => {
  const getProductImage = (imagePath) => {
    if (imagePath) {
      return `${BASE_URL}/uploads/${imagePath}`;
    }
    return null;
  };

  return (
    <div className="product-catalog">
      {products.map((product) => (
        <div
          key={product.id}
          className={`product-catalog__item ${product.has_special_price ? 'product-catalog__item--special' : ''}`}
        >
          {product.has_special_price && (
            <div className="product-catalog__special-badge">
              Precio Especial
            </div>
          )}
          <div className="product-catalog__image-container">
            {product.image_path ? (
              <img
                src={getProductImage(product.image_path)}
                alt={product.name}
                className="product-catalog__image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="product-catalog__image-placeholder"
              style={{ display: product.image_path ? 'none' : 'flex' }}
            >
              <span className="product-catalog__image-icon">
                {product.product_type === 'BALON_GAS' ? '🔥' :
                 product.product_type === 'BIDON_AGUA' ? '💧' : '🔧'}
              </span>
            </div>
          </div>
          <div className="product-catalog__header">
            <h3 className="product-catalog__name">{product.name}</h3>
            <span className="product-catalog__brand">{product.brand}</span>
          </div>
          <div className="product-catalog__price-container">
            <div className="product-catalog__price">
              S/. {Number(product.regular_price).toFixed(2)}
            </div>
            {product.has_special_price && (
              <div className="product-catalog__special-hint">
                Tu precio en carrito: S/. {Number(product.price).toFixed(2)}
              </div>
            )}
          </div>
          <button
            className="product-catalog__button"
            onClick={() => onAddToCart(product)}
          >
            Agregar
          </button>
        </div>
      ))}
    </div>
  );
};
