import { useState, useEffect } from 'react';
import { useCustomerApi } from '../../hooks/useApi/useCustomerApi';
import { useProductApi } from '../../hooks/useApi/useProductApi';

export const ModalPreciosEspeciales = ({ customer, isOpen, onClose }) => {
  const { getSpecialPrices, saveSpecialPrice, updateSpecialPrice, deleteSpecialPrice, loading } = useCustomerApi();
  const { fetchProducts } = useProductApi();
  const [prices, setPrices] = useState([]);
  const [products, setProducts] = useState([]);
  const [newPrice, setNewPrice] = useState({ product_id: '', price: '', special_points: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ price: '', special_points: '' });

  useEffect(() => {
    if (isOpen && customer) {
      loadData();
    }
  }, [isOpen, customer]);

  const loadData = async () => {
    try {
      const [pricesData, productsResponse] = await Promise.all([
        getSpecialPrices(customer.id),
        fetchProducts({ limit: 1000, status: 'active' })
      ]);
      setPrices(pricesData);
      setProducts(productsResponse.data || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  const handleAddPrice = async (e) => {
    e.preventDefault();

    if (!newPrice.product_id || newPrice.price === '' || newPrice.price === null) {
      alert('Seleccione un producto e ingrese el precio');
      return;
    }

    const priceNum = parseFloat(newPrice.price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      alert('Ingrese un precio valido (numero mayor o igual a 0)');
      return;
    }

    let specialPoints = null;
    if (newPrice.special_points !== '' && newPrice.special_points !== null) {
      specialPoints = parseFloat(newPrice.special_points);
      if (Number.isNaN(specialPoints) || specialPoints < 0) {
        alert('Ingrese puntos especiales validos (numero mayor o igual a 0)');
        return;
      }
    }

    setSaving(true);
    try {
      await saveSpecialPrice(customer.id, newPrice.product_id, priceNum, specialPoints);
      setNewPrice({ product_id: '', price: '', special_points: '' });
      loadData();
    } catch (err) {
      console.error('Error al guardar precio:', err);
      const detail = err?.data?.detail || err?.message || '';
      alert('Error al guardar el precio especial' + (detail ? ': ' + detail : ''));
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (price) => {
    setEditingId(price.id);
    setEditData({
      price: price.price.toString(),
      special_points: price.special_points !== null ? price.special_points.toString() : ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ price: '', special_points: '' });
  };

  const handleSaveEdit = async (priceId) => {
    if (editData.price === '' || editData.price === null) {
      alert('Ingrese un precio valido');
      return;
    }
    const priceNum = parseFloat(editData.price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      alert('Ingrese un precio valido (numero mayor o igual a 0)');
      return;
    }

    let specialPoints = null;
    if (editData.special_points !== '' && editData.special_points !== null) {
      specialPoints = parseFloat(editData.special_points);
      if (Number.isNaN(specialPoints) || specialPoints < 0) {
        alert('Ingrese puntos especiales validos (numero mayor o igual a 0)');
        return;
      }
    }

    setSaving(true);
    try {
      await updateSpecialPrice(customer.id, priceId, priceNum, specialPoints);
      setEditingId(null);
      setEditData({ price: '', special_points: '' });
      loadData();
    } catch (err) {
      console.error('Error al actualizar precio:', err);
      const detail = err?.data?.detail || err?.message || '';
      alert('Error al actualizar el precio especial' + (detail ? ': ' + detail : ''));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (priceId, productName) => {
    if (!confirm(`¿Está seguro de eliminar el precio especial de "${productName}"?`)) {
      return;
    }

    setSaving(true);
    try {
      await deleteSpecialPrice(customer.id, priceId);
      loadData();
    } catch (err) {
      console.error('Error al eliminar precio:', err);
      const detail = err?.data?.detail || err?.message || '';
      alert('Error al eliminar el precio especial' + (detail ? ': ' + detail : ''));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="customers-modal-overlay">
      <div className="customers-modal customers-modal--lg">
        <div className="customers-modal-header">
          <h2 className="customers-modal-title">
            <span className="customers-modal-title-icon">💰</span>
            Precios y Puntos Especiales de {customer?.full_name}
          </h2>
          <button onClick={onClose} className="customers-modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="customers-modal-body">
          <form onSubmit={handleAddPrice} className="customers-prices-form">
            <div className="customers-prices-form-row">
              <select
                value={newPrice.product_id}
                onChange={(e) => setNewPrice(prev => ({ ...prev, product_id: e.target.value }))}
                className="customers-form-select"
              >
                <option value="">Seleccionar producto</option>
                {products.map(product => {
                  const pts = parseFloat(product.puntos_cliente || 0);
                  const ptsDisplay = pts % 1 === 0 ? pts.toFixed(0) : pts.toFixed(2);
                  return (
                    <option key={product.id} value={product.id}>
                      {product.name} - S/{parseFloat(product.sale_price).toFixed(2)} ({ptsDisplay} pts)
                    </option>
                  );
                })}
              </select>

              <input
                type="number"
                value={newPrice.price}
                onChange={(e) => setNewPrice(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Precio especial"
                className="customers-form-input"
                step="0.01"
                min="0"
              />

              <input
                type="number"
                value={newPrice.special_points}
                onChange={(e) => setNewPrice(prev => ({ ...prev, special_points: e.target.value }))}
                placeholder="Puntos (vacio=default)"
                className="customers-form-input"
                step="0.01"
                min="0"
              />

              <button
                type="submit"
                className="customers-btn customers-btn--primary"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Agregar'}
              </button>
            </div>
          </form>

          {loading ? (
            <div className="customers-modal-loading">
              <div className="customers-spinner"></div>
              <span>Cargando precios...</span>
            </div>
          ) : prices.length === 0 ? (
            <div className="customers-modal-empty">
              <span className="customers-modal-empty-icon">💵</span>
              <p>No hay precios especiales configurados</p>
            </div>
          ) : (
            <div className="customers-modal-table-wrapper">
              <table className="customers-prices-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Marca</th>
                    <th>Precio Reg.</th>
                    <th>Precio Esp.</th>
                    <th>Desc.</th>
                    <th>Puntos Reg.</th>
                    <th>Puntos Esp.</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((price) => {
                    const discount = parseFloat(price.regular_price) - parseFloat(price.price);
                    const discountPercent = ((discount / parseFloat(price.regular_price)) * 100).toFixed(1);
                    const isEditing = editingId === price.id;
                    const regularPoints = parseFloat(price.regular_points || 0);
                    const specialPoints = price.special_points !== null ? parseFloat(price.special_points) : null;

                    return (
                      <tr key={price.id}>
                        <td>
                          <span className="customers-price-product">{price.product_name}</span>
                          <span className="customers-price-code">{price.product_code}</span>
                        </td>
                        <td>{price.brand_name || '-'}</td>
                        <td className="customers-price-regular">
                          S/{parseFloat(price.regular_price).toFixed(2)}
                        </td>
                        <td className="customers-price-special">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editData.price}
                              onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
                              className="customers-form-input customers-form-input--sm"
                              step="0.01"
                              min="0"
                              autoFocus
                            />
                          ) : (
                            <>S/{parseFloat(price.price).toFixed(2)}</>
                          )}
                        </td>
                        <td className="customers-price-discount">
                          {discount > 0 ? (
                            <span className="customers-discount-badge">
                              -{discountPercent}%
                            </span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="customers-points-regular">
                          {regularPoints % 1 === 0 ? regularPoints.toFixed(0) : regularPoints.toFixed(2)} pts
                        </td>
                        <td className="customers-points-special">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editData.special_points}
                              onChange={(e) => setEditData(prev => ({ ...prev, special_points: e.target.value }))}
                              className="customers-form-input customers-form-input--sm"
                              step="0.01"
                              min="0"
                              placeholder="Default"
                            />
                          ) : (
                            specialPoints !== null ? (
                              <span className="customers-special-points-badge">
                                {specialPoints % 1 === 0 ? specialPoints.toFixed(0) : specialPoints.toFixed(2)} pts
                              </span>
                            ) : (
                              <span className="customers-default-points">Default</span>
                            )
                          )}
                        </td>
                        <td className="customers-price-actions">
                          {isEditing ? (
                            <div className="customers-price-actions-group">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(price.id)}
                                className="customers-btn-icon customers-btn-icon--success"
                                title="Guardar"
                                disabled={saving}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="customers-btn-icon customers-btn-icon--secondary"
                                title="Cancelar"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="customers-price-actions-group">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(price)}
                                className="customers-btn-icon customers-btn-icon--edit"
                                title="Editar precio y puntos"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(price.id, price.product_name)}
                                className="customers-btn-icon customers-btn-icon--danger"
                                title="Eliminar"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="customers-modal-footer">
          <button onClick={onClose} className="customers-btn customers-btn--secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
