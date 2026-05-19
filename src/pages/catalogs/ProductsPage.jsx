import { useState, useEffect } from 'react';
import { useProductApi } from '../../hooks/useApi/useProductApi';
import { useWarehouseApi } from '../../hooks/useApi/useWarehouseApi';
import { useAuth } from '../../features/auth/useAuth';
import { ProductTable } from '../../components/products/ProductTable';
import { ProductForm } from '../../components/products/ProductForm';
import { StockSummaryCards } from '../../components/products/StockSummaryCards';
import { StockByWarehouseModal } from '../../components/products/StockByWarehouseModal';
import { WarehouseStockCards } from '../../components/products/WarehouseStockCards';
import { WarehouseStockTable } from '../../components/products/WarehouseStockTable';
import '../../styles/components/products.css';

export const ProductsPage = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const isReadOnly = userRole === 'BASE';

  const {
    data,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getStockSummary
  } = useProductApi();

  const {
    data: warehouses,
    fetchWarehouses
  } = useWarehouseApi();

  const [viewMode, setViewMode] = useState('stock');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockSummary, setStockSummary] = useState(null);
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('global');
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    product_type: '',
    brand_id: '',
    warehouse_id: '',
    status: ''
  });

  useEffect(() => {
    loadProducts();
    loadStockSummary();
    fetchWarehouses({ status: 'active' });
  }, []);

  useEffect(() => {
    const currentFilters = {
      search: filters.search,
      product_type: filters.product_type,
      warehouse_id: filters.warehouse_id,
      status: filters.status
    };

    const timeoutId = setTimeout(() => {
      fetchProducts({
        page: 1,
        limit: pagination.limit,
        ...currentFilters
      });
      loadStockSummary(currentFilters);
    }, filters.search ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [filters.search, filters.product_type, filters.warehouse_id, filters.status]);

  const loadProducts = async (params = {}) => {
    try {
      await fetchProducts({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...params
      });
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  const loadStockSummary = async (filterParams = {}) => {
    try {
      const summary = await getStockSummary(filterParams);
      setStockSummary(summary);
    } catch (err) {
      console.error('Error al cargar resumen de stock:', err);
    }
  };

  const handleOpenModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      handleCloseModal();
      loadProducts();
      loadStockSummary();
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error al guardar producto:', err);
      alert('Error al guardar el producto: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Esta seguro de eliminar este producto?')) {
      return;
    }

    try {
      await deleteProduct(id);
      loadProducts();
      loadStockSummary();
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      alert('Error al eliminar el producto: ' + err.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePageChange = (newPage) => {
    loadProducts({ page: newPage });
  };

  const handleTypeFilter = (type) => {
    setFilters(prev => ({
      ...prev,
      product_type: type
    }));
  };

  const handleViewStock = (product) => {
    setStockModalProduct(product);
  };

  const handleCloseStockModal = () => {
    setStockModalProduct(null);
  };

  const handleSelectWarehouse = (warehouseId) => {
    setSelectedWarehouseId(warehouseId);
  };

  const getSelectedWarehouseName = () => {
    if (selectedWarehouseId === 'global') return 'Stock Global';
    const warehouse = warehouses.find(w => w.id === selectedWarehouseId);
    return warehouse?.name || '';
  };

  const productTypes = [
    { value: '', label: 'Todos los Productos', icon: '📦' },
    { value: 'BALON_GAS', label: 'Balones de Gas', icon: '🔵' },
    { value: 'BIDON_AGUA', label: 'Bidones de Agua', icon: '💧' },
    { value: 'ACCESORIO', label: 'Accesorios', icon: '🔧' }
  ];

  return (
    <div className="products-page">
      <div className="products-container">
        <div className="products-header">
          <h1 className="products-title">
            <span className="products-title-icon">📦</span>
            Gestion de Productos
            {isReadOnly && <span className="products-readonly-badge">Solo lectura</span>}
          </h1>
          <div className="products-header-actions">
            <div className="view-toggle">
              <button
                className={`view-toggle__btn ${viewMode === 'stock' ? 'view-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('stock')}
              >
                Stock por Almacen
              </button>
              <button
                className={`view-toggle__btn ${viewMode === 'catalog' ? 'view-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('catalog')}
              >
                Catalogo de Productos
              </button>
            </div>
            {!isReadOnly && (
              <button onClick={handleOpenModal} className="products-btn products-btn--primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nuevo Producto
              </button>
            )}
          </div>
        </div>

        {viewMode === 'stock' ? (
          <>
            <WarehouseStockCards
              warehouses={warehouses}
              selectedWarehouseId={selectedWarehouseId}
              onSelectWarehouse={handleSelectWarehouse}
              refreshKey={refreshKey}
            />

            <WarehouseStockTable
              warehouseId={selectedWarehouseId}
              warehouseName={getSelectedWarehouseName()}
              isGlobal={selectedWarehouseId === 'global'}
              refreshKey={refreshKey}
            />
          </>
        ) : (
          <>
            <StockSummaryCards summary={stockSummary} loading={loading} warehouseCount={warehouses.length} />

            <div className="products-filters">
              <div className="products-type-tabs">
                {productTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeFilter(type.value)}
                    className={`products-type-tab ${filters.product_type === type.value ? 'products-type-tab--active' : ''}`}
                  >
                    <span className="products-type-tab-icon">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="products-filter-form">
                <div className="products-filter-group">
                  <label className="products-filter-label">Buscar</label>
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="products-filter-input"
                    placeholder="Buscar por codigo o nombre..."
                  />
                </div>

                <div className="products-filter-group">
                  <label className="products-filter-label">Almacen</label>
                  <select
                    name="warehouse_id"
                    value={filters.warehouse_id}
                    onChange={handleFilterChange}
                    className="products-filter-select"
                  >
                    <option value="">Todos los almacenes</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="products-filter-group">
                  <label className="products-filter-label">Estado</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="products-filter-select"
                  >
                    <option value="">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="products-error">
                <span className="products-error-icon">⚠️</span>
                <span className="products-error-text">Error: {error}</span>
              </div>
            )}

            <ProductTable
              data={data}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewStock={handleViewStock}
              loading={loading}
              readOnly={isReadOnly}
            />

            {!loading && data.length > 0 && (
              <div className="products-pagination">
                <div className="products-pagination-info">
                  Pagina {pagination.page} de {pagination.totalPages} ({pagination.total} productos)
                </div>
                <div className="products-pagination-controls">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="products-pagination-btn"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="products-pagination-btn"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {isModalOpen && (
          <div className="products-modal-overlay">
            <div className="products-modal">
              <div className="products-modal-header">
                <h2 className="products-modal-title">
                  {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
              </div>
              <div className="products-modal-body">
                <ProductForm
                  initialData={selectedProduct}
                  onSubmit={handleSubmit}
                  onCancel={handleCloseModal}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        )}

        {stockModalProduct && (
          <StockByWarehouseModal
            product={stockModalProduct}
            onClose={handleCloseStockModal}
          />
        )}
      </div>
    </div>
  );
};
