import { useState, useEffect } from 'react';
import { useBrandApi } from '../../hooks/useApi/useBrandApi';
import { useWarehouseApi } from '../../hooks/useApi/useWarehouseApi';
import { useMeasurementUnitApi } from '../../hooks/useApi/useMeasurementUnitApi';
import { BASE_URL } from '../../config/api.config';

export const ProductForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const { data: brands, fetchBrands } = useBrandApi();
  const { data: warehouses, fetchWarehouses } = useWarehouseApi();
  const { listUnits } = useMeasurementUnitApi();

  const [measurementUnits, setMeasurementUnits] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    product_type: 'BALON_GAS',
    brand_id: '',
    sale_price: '',
    cost: '',
    container_price: '',
    puntos_cliente: '',
    balloon_type: '',
    capacity: '',
    is_exchangeable: false,
    available_stock: '',
    minimum_stock: '',
    warehouse_id: '',
    unit_id: '',
    status: 'active'
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Funcion para generar codigo automatico
  const generateProductCode = (productType, brandId) => {
    if (!productType || !brandId) return '';

    // Prefijo segun tipo de producto
    const typePrefix = {
      BALON_GAS: 'BAL',
      BIDON_AGUA: 'BID',
      ACCESORIO: 'ACC'
    };

    // Obtener nombre de la marca seleccionada
    const selectedBrand = brands.find(b => b.id === parseInt(brandId));
    if (!selectedBrand) return '';

    // Generar prefijo de marca (primeras 3 letras en mayuscula)
    const brandPrefix = selectedBrand.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 3);

    // Generar timestamp unico (ultimos 6 digitos del timestamp)
    const timestamp = Date.now().toString().slice(-6);

    return `${typePrefix[productType] || 'PRD'}-${brandPrefix}-${timestamp}`;
  };

  // Cargar almacenes y unidades de medida al montar
  useEffect(() => {
    fetchWarehouses();
    const loadUnits = async () => {
      try {
        const units = await listUnits();
        setMeasurementUnits(units);
      } catch (error) {
        console.error('Error cargando unidades de medida:', error);
      }
    };
    loadUnits();
  }, []);

  // Cargar marcas filtradas por tipo de producto
  useEffect(() => {
    if (formData.product_type) {
      fetchBrands({ product_type: formData.product_type, status: 'active' });
    }
  }, [formData.product_type]);

  // Autogenerar codigo cuando se selecciona marca (solo para nuevos productos)
  useEffect(() => {
    if (!initialData && formData.product_type && formData.brand_id && brands.length > 0) {
      const newCode = generateProductCode(formData.product_type, formData.brand_id);
      if (newCode) {
        setFormData(prev => ({ ...prev, code: newCode }));
      }
    }
  }, [formData.brand_id, brands]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        description: initialData.description || '',
        product_type: initialData.product_type || 'BALON_GAS',
        brand_id: initialData.brand_id || '',
        sale_price: initialData.sale_price || '',
        cost: initialData.cost || '',
        container_price: initialData.container_price || '',
        puntos_cliente: initialData.puntos_cliente || '',
        balloon_type: initialData.balloon_type || '',
        capacity: initialData.capacity || '',
        is_exchangeable: initialData.is_exchangeable || false,
        available_stock: initialData.available_stock || '',
        minimum_stock: initialData.minimum_stock || '',
        warehouse_id: initialData.warehouse_id || '',
        unit_id: initialData.unit_id || '',
        status: initialData.status || 'active'
      });
      if (initialData.image_path) {
        setImagePreview(`${BASE_URL}/uploads/${initialData.image_path}`);
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
    }
  }, [initialData]);

  // Handler para seleccionar imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Solo se permiten imágenes (JPG, PNG, GIF, WEBP)' }));
        return;
      }
      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'La imagen no debe superar los 5 MB' }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: null }));
      }
    }
  };

  // Limpiar imagen
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Si cambia el tipo de producto, limpiar la marca seleccionada
    if (name === 'product_type') {
      setFormData(prev => ({
        ...prev,
        product_type: value,
        brand_id: '' // Limpiar marca al cambiar tipo
      }));
      if (errors.brand_id) {
        setErrors(prev => ({ ...prev, brand_id: null }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El codigo es obligatorio';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.product_type) {
      newErrors.product_type = 'El tipo de producto es obligatorio';
    }

    if (!formData.brand_id) {
      newErrors.brand_id = 'La marca es obligatoria';
    }

    if (!formData.sale_price || Number(formData.sale_price) <= 0) {
      newErrors.sale_price = 'El precio de venta debe ser mayor a 0';
    }

    if (formData.product_type === 'BALON_GAS' && !formData.balloon_type) {
      newErrors.balloon_type = 'El tipo de balon es obligatorio';
    }

    if ((formData.product_type === 'BALON_GAS' || formData.product_type === 'BIDON_AGUA') && !formData.capacity) {
      newErrors.capacity = 'La capacidad es obligatoria';
    }

    if (formData.product_type === 'ACCESORIO' && !formData.unit_id) {
      newErrors.unit_id = 'La unidad de medida es obligatoria para accesorios';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Si hay imagen, usar FormData
    if (imageFile) {
      const submitFormData = new FormData();
      submitFormData.append('code', formData.code.trim());
      submitFormData.append('name', formData.name.trim());
      submitFormData.append('description', formData.description.trim());
      submitFormData.append('product_type', formData.product_type);
      submitFormData.append('brand_id', formData.brand_id);
      submitFormData.append('sale_price', formData.sale_price);
      submitFormData.append('cost', formData.cost || 0);
      submitFormData.append('puntos_cliente', formData.puntos_cliente || 0);
      submitFormData.append('minimum_stock', formData.minimum_stock || 5);
      submitFormData.append('status', formData.status);
      submitFormData.append('image', imageFile);

      if (formData.product_type === 'BALON_GAS') {
        submitFormData.append('balloon_type', formData.balloon_type);
        submitFormData.append('capacity', formData.capacity);
        submitFormData.append('is_exchangeable', formData.is_exchangeable);
        submitFormData.append('container_price', formData.container_price || 0);
        submitFormData.append('available_stock', formData.available_stock || 0);

      }

      if (formData.product_type === 'BIDON_AGUA') {
        submitFormData.append('capacity', formData.capacity);
        submitFormData.append('is_exchangeable', formData.is_exchangeable);
        submitFormData.append('container_price', formData.container_price || 0);
        submitFormData.append('available_stock', formData.available_stock || 0);

      }

      if (formData.product_type === 'ACCESORIO') {
        submitFormData.append('available_stock', formData.available_stock || 0);
        if (formData.unit_id) {
          submitFormData.append('unit_id', formData.unit_id);
        }
      }

      if (formData.warehouse_id) {
        submitFormData.append('warehouse_id', formData.warehouse_id);
      }

      onSubmit(submitFormData);
      return;
    }

    // Sin imagen, usar JSON normal
    const dataToSubmit = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      product_type: formData.product_type,
      brand_id: Number(formData.brand_id),
      sale_price: Number(formData.sale_price),
      cost: formData.cost ? Number(formData.cost) : 0,
      puntos_cliente: formData.puntos_cliente ? Number(formData.puntos_cliente) : 0,
      minimum_stock: formData.minimum_stock ? Number(formData.minimum_stock) : 5,
      status: formData.status
    };

    if (formData.product_type === 'BALON_GAS') {
      dataToSubmit.balloon_type = formData.balloon_type;
      dataToSubmit.capacity = Number(formData.capacity);
      dataToSubmit.is_exchangeable = formData.is_exchangeable;
      dataToSubmit.container_price = formData.container_price ? Number(formData.container_price) : 0;
      dataToSubmit.available_stock = formData.available_stock ? Number(formData.available_stock) : 0;

    }

    if (formData.product_type === 'BIDON_AGUA') {
      dataToSubmit.capacity = Number(formData.capacity);
      dataToSubmit.is_exchangeable = formData.is_exchangeable;
      dataToSubmit.container_price = formData.container_price ? Number(formData.container_price) : 0;
      dataToSubmit.available_stock = formData.available_stock ? Number(formData.available_stock) : 0;

    }

    if (formData.product_type === 'ACCESORIO') {
      dataToSubmit.available_stock = formData.available_stock ? Number(formData.available_stock) : 0;
      if (formData.unit_id) {
        dataToSubmit.unit_id = Number(formData.unit_id);
      }
    }

    if (formData.warehouse_id) {
      dataToSubmit.warehouse_id = Number(formData.warehouse_id);
    }

    onSubmit(dataToSubmit);
  };

  const isBalon = formData.product_type === 'BALON_GAS';
  const isBidon = formData.product_type === 'BIDON_AGUA';
  const isAccesorio = formData.product_type === 'ACCESORIO';
  const needsCapacity = isBalon || isBidon;
  const needsStockLlenosVacios = isBalon || isBidon;

  return (
    <form onSubmit={handleSubmit} className="products-form">
      {/* Informacion basica */}
      <div className="products-form-grid">
        <div className="products-form-group">
          <label className="products-form-label">
            Codigo <span className="products-form-required">*</span>
            {!initialData && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)', marginLeft: '8px' }}>(Autogenerado)</span>}
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className={`products-form-input ${errors.code ? 'products-form-input--error' : ''}`}
            placeholder={!initialData ? "Se genera al seleccionar marca" : "Codigo del producto"}
            readOnly={!initialData}
            style={!initialData ? { backgroundColor: 'var(--color-neutral-200)', cursor: 'not-allowed' } : {}}
          />
          {errors.code && <span className="products-form-error">{errors.code}</span>}
        </div>

        <div className="products-form-group">
          <label className="products-form-label">
            Nombre <span className="products-form-required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`products-form-input ${errors.name ? 'products-form-input--error' : ''}`}
            placeholder="Ej: Balon de Gas 10kg"
          />
          {errors.name && <span className="products-form-error">{errors.name}</span>}
        </div>
      </div>

      <div className="products-form-group products-form-group--full">
        <label className="products-form-label">Descripcion</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="products-form-textarea"
          placeholder="Descripcion del producto"
        />
      </div>

      {/* Imagen del producto */}
      <div className="products-form-section">
        <h4 className="products-form-section-title">Imagen del Producto</h4>
        <div className="products-form-group">
          {imagePreview ? (
            <div className="products-image-preview">
              <img
                src={imagePreview}
                alt="Vista previa"
                className="products-image-preview__img"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="products-image-preview__remove"
                title="Eliminar imagen"
              >
                &times;
              </button>
            </div>
          ) : (
            <label className="products-image-upload">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="products-image-upload__input"
              />
              <div className="products-image-upload__placeholder">
                <span className="products-image-upload__icon">+</span>
                <span className="products-image-upload__text">Seleccionar imagen</span>
                <span className="products-image-upload__hint">JPG, PNG, GIF, WEBP (max 5MB)</span>
              </div>
            </label>
          )}
          {errors.image && <span className="products-form-error">{errors.image}</span>}
        </div>
      </div>

      {/* Tipo y Marca */}
      <div className="products-form-grid">
        <div className="products-form-group">
          <label className="products-form-label">
            Tipo de Producto <span className="products-form-required">*</span>
          </label>
          <select
            name="product_type"
            value={formData.product_type}
            onChange={handleChange}
            className={`products-form-select ${errors.product_type ? 'products-form-select--error' : ''}`}
          >
            <option value="BALON_GAS">Balon de Gas</option>
            <option value="BIDON_AGUA">Bidon de Agua</option>
            <option value="ACCESORIO">Accesorio</option>
          </select>
          {errors.product_type && <span className="products-form-error">{errors.product_type}</span>}
        </div>

        <div className="products-form-group">
          <label className="products-form-label">
            Marca <span className="products-form-required">*</span>
          </label>
          <select
            name="brand_id"
            value={formData.brand_id}
            onChange={handleChange}
            className={`products-form-select ${errors.brand_id ? 'products-form-select--error' : ''}`}
          >
            <option value="">
              {brands.length === 0
                ? 'No hay marcas para este tipo'
                : 'Seleccione una marca'}
            </option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          {errors.brand_id && <span className="products-form-error">{errors.brand_id}</span>}
          {brands.length === 0 && (
            <span className="products-form-error">
              Debe registrar marcas para este tipo de producto
            </span>
          )}
        </div>
      </div>

      {/* Campos especificos para Balon de Gas */}
      {isBalon && (
        <div className="products-form-section">
          <h4 className="products-form-section-title">Especificaciones del Balon</h4>
          <div className="products-form-grid">
            <div className="products-form-group">
              <label className="products-form-label">
                Tipo de Balon <span className="products-form-required">*</span>
              </label>
              <select
                name="balloon_type"
                value={formData.balloon_type}
                onChange={handleChange}
                className={`products-form-select ${errors.balloon_type ? 'products-form-select--error' : ''}`}
              >
                <option value="">Seleccione tipo</option>
                <option value="NORMAL">Normal</option>
                <option value="PREMIUM">Premium</option>
              </select>
              {errors.balloon_type && <span className="products-form-error">{errors.balloon_type}</span>}
            </div>

            <div className="products-form-group">
              <label className="products-form-label">
                Capacidad (kg) <span className="products-form-required">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                step="0.01"
                className={`products-form-input ${errors.capacity ? 'products-form-input--error' : ''}`}
                placeholder="Ej: 10"
              />
              {errors.capacity && <span className="products-form-error">{errors.capacity}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Campos especificos para Bidon de Agua */}
      {isBidon && (
        <div className="products-form-section">
          <h4 className="products-form-section-title">Especificaciones del Bidon</h4>
          <div className="products-form-group">
            <label className="products-form-label">
              Capacidad (litros) <span className="products-form-required">*</span>
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              step="0.01"
              className={`products-form-input ${errors.capacity ? 'products-form-input--error' : ''}`}
              placeholder="Ej: 20"
            />
            {errors.capacity && <span className="products-form-error">{errors.capacity}</span>}
          </div>
        </div>
      )}

      {/* Precios */}
      <div className="products-form-section">
        <h4 className="products-form-section-title">Precios</h4>
        <div className="products-form-grid">
          <div className="products-form-group">
            <label className="products-form-label">
              Precio de Venta (S/) <span className="products-form-required">*</span>
            </label>
            <input
              type="number"
              name="sale_price"
              value={formData.sale_price}
              onChange={handleChange}
              step="0.01"
              className={`products-form-input ${errors.sale_price ? 'products-form-input--error' : ''}`}
              placeholder="0.00"
            />
            {errors.sale_price && <span className="products-form-error">{errors.sale_price}</span>}
          </div>

          <div className="products-form-group">
            <label className="products-form-label">Costo (S/)</label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              step="0.01"
              className="products-form-input"
              placeholder="0.00"
            />
          </div>

          {(isBalon || isBidon) && (
            <div className="products-form-group">
              <label className="products-form-label">Precio Envase Vacio (S/)</label>
              <input
                type="number"
                name="container_price"
                value={formData.container_price}
                onChange={handleChange}
                step="0.01"
                className="products-form-input"
                placeholder="0.00"
              />
              <span className="products-form-hint">Precio cuando el cliente no tiene envase para intercambiar</span>
            </div>
          )}

          <div className="products-form-group">
            <label className="products-form-label">Puntos Mi GANAGAS</label>
            <input
              type="number"
              name="puntos_cliente"
              value={formData.puntos_cliente}
              onChange={handleChange}
              step="0.01"
              className="products-form-input"
              placeholder="0.00"
            />
            <span className="products-form-hint">Soles que gana el cliente por esta compra</span>
          </div>
        </div>
      </div>

      {/* Stock para Balones y Bidones */}
      {needsStockLlenosVacios && (
        <div className="products-form-section">
          <h4 className="products-form-section-title">Stock</h4>

          <div className="products-form-checkbox">
            <input
              type="checkbox"
              name="is_exchangeable"
              id="is_exchangeable"
              checked={formData.is_exchangeable}
              onChange={handleChange}
            />
            <label htmlFor="is_exchangeable" className="products-form-checkbox-label">
              Es Intercambiable
            </label>
          </div>

          <div className="products-form-grid" style={{ marginTop: 'var(--spacing-md)' }}>
            <div className="products-form-group">
              <label className="products-form-label">Stock Llenos</label>
              <input
                type="number"
                name="available_stock"
                value={formData.available_stock}
                onChange={handleChange}
                className="products-form-input"
                placeholder="0"
              />
            </div>

          </div>
        </div>
      )}

      {/* Configuracion de Accesorios */}
      {isAccesorio && (
        <div className="products-form-section">
          <h4 className="products-form-section-title">Especificaciones del Accesorio</h4>
          <div className="products-form-grid">
            <div className="products-form-group">
              <label className="products-form-label">
                Unidad de Medida <span className="products-form-required">*</span>
              </label>
              <select
                name="unit_id"
                value={formData.unit_id}
                onChange={handleChange}
                className={`products-form-select ${errors.unit_id ? 'products-form-select--error' : ''}`}
              >
                <option value="">Seleccione una unidad</option>
                {measurementUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.abbreviation})
                  </option>
                ))}
              </select>
              {errors.unit_id && <span className="products-form-error">{errors.unit_id}</span>}
              <span className="products-form-hint">
                Ej: Metros para mangueras, Unidad para valvulas
              </span>
            </div>

            <div className="products-form-group">
              <label className="products-form-label">Stock Disponible</label>
              <input
                type="number"
                step="any"
                name="available_stock"
                value={formData.available_stock}
                onChange={handleChange}
                className="products-form-input"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Configuracion adicional */}
      <div className="products-form-section">
        <h4 className="products-form-section-title">Configuracion</h4>
        <div className="products-form-grid">
          <div className="products-form-group">
            <label className="products-form-label">Stock Minimo</label>
            <input
              type="number"
              step="any"
              name="minimum_stock"
              value={formData.minimum_stock}
              onChange={handleChange}
              className="products-form-input"
              placeholder="5"
            />
          </div>

          <div className="products-form-group">
            <label className="products-form-label">Almacen</label>
            <select
              name="warehouse_id"
              value={formData.warehouse_id}
              onChange={handleChange}
              className="products-form-select"
            >
              <option value="">Seleccione un almacen</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="products-form-group" style={{ marginTop: 'var(--spacing-md)' }}>
          <label className="products-form-label">Estado</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="products-form-select"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Acciones del formulario */}
      <div className="products-form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="products-btn products-btn--secondary"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="products-btn products-btn--primary"
          disabled={loading}
        >
          {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
        </button>
      </div>
    </form>
  );
};
