import { useState, useEffect } from 'react';

export const OsinergminModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    isPublished: false
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        order: initialData.order || 1,
        isPublished: initialData.isPublished || false
      });
      setFile(null);
    } else {
      setFormData({
        title: '',
        description: '',
        order: 1,
        isPublished: false
      });
      setFile(null);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrors(prev => ({ ...prev, file: 'Solo se permiten archivos PDF o imágenes (JPG, PNG, GIF, WEBP)' }));
        setFile(null);
        e.target.value = '';
        return;
      }
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setErrors(prev => ({ ...prev, file: 'El archivo no debe superar los 10 MB' }));
        setFile(null);
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: null }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    if (!initialData && !file) {
      newErrors.file = 'Debe seleccionar un archivo';
    }
    if (formData.order < 1) {
      newErrors.order = 'El orden debe ser mayor a 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('display_order', formData.order);
      submitData.append('is_published', formData.isPublished);
      if (file) {
        submitData.append('file', file);
      }

      // Debug logs
      console.log('=== FRONTEND SUBMIT ===');
      console.log('formData.isPublished:', formData.isPublished, 'type:', typeof formData.isPublished);
      console.log('FormData entries:');
      for (let [key, value] of submitData.entries()) {
        console.log(`  ${key}:`, value, 'type:', typeof value);
      }

      await onSubmit(submitData, initialData?.id);
      handleClose();
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message || 'Error al guardar el documento' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      order: 1,
      isPublished: false
    });
    setFile(null);
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="catalog-modal-overlay" onClick={handleClose}>
      <div className="catalog-modal" onClick={(e) => e.stopPropagation()}>
        <div className="catalog-modal-header">
          <h2 className="catalog-modal-title">
            {initialData ? 'Editar Documento' : 'Subir Documento'}
          </h2>
          <button className="catalog-modal-close" onClick={handleClose} disabled={isSubmitting}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="catalog-modal-body">
            {errors.submit && (
              <div className="catalog-error-message">{errors.submit}</div>
            )}

            <div className="catalog-form-group">
              <label className="catalog-form-label catalog-form-label-required">
                Título
              </label>
              <input
                type="text"
                name="title"
                className={`catalog-form-input ${errors.title ? 'error' : ''}`}
                value={formData.title}
                onChange={handleChange}
                placeholder="Título del documento"
                disabled={isSubmitting}
              />
              {errors.title && <span className="catalog-form-error">{errors.title}</span>}
            </div>

            <div className="catalog-form-group">
              <label className="catalog-form-label">
                Descripción
              </label>
              <textarea
                name="description"
                className="catalog-form-textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción opcional del documento"
                rows="3"
                disabled={isSubmitting}
              />
            </div>

            <div className="catalog-form-group">
              <label className="catalog-form-label catalog-form-label-required">
                Archivo {initialData && '(dejar vacío para mantener el actual)'}
              </label>
              <input
                type="file"
                className={`catalog-form-input ${errors.file ? 'error' : ''}`}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                disabled={isSubmitting}
              />
              {errors.file && <span className="catalog-form-error">{errors.file}</span>}
              <span className="catalog-form-hint">
                Formatos permitidos: PDF, JPG, PNG, GIF, WEBP (máx. 10 MB)
              </span>
              {initialData && initialData.fileName && (
                <span className="catalog-hint">
                  Archivo actual: {initialData.fileName}
                </span>
              )}
            </div>

            <div className="catalog-form-group">
              <label className="catalog-form-label catalog-form-label-required">
                Orden de visualización
              </label>
              <input
                type="number"
                name="order"
                className={`catalog-form-input ${errors.order ? 'error' : ''}`}
                value={formData.order}
                onChange={handleChange}
                min="1"
                disabled={isSubmitting}
              />
              {errors.order && <span className="catalog-form-error">{errors.order}</span>}
              <span className="catalog-form-hint">
                Los documentos se mostrarán ordenados de menor a mayor
              </span>
            </div>

            <div className="catalog-form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <span className="catalog-form-label" style={{ marginBottom: 0 }}>
                  Publicar inmediatamente
                </span>
              </label>
              <span className="catalog-form-hint">
                Si está marcado, el documento será visible para los clientes
              </span>
            </div>
          </div>

          <div className="catalog-modal-footer">
            <button
              type="button"
              className="catalog-btn catalog-btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="catalog-btn catalog-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Subir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
