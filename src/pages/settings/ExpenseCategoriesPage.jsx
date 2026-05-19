import { useState, useEffect } from 'react';
import { useExpenseCategoryApi } from '../../hooks/useApi/useExpenseCategoryApi';
import './ExpenseCategoriesPage.css';

export const ExpenseCategoriesPage = () => {
  const {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    removeCategory
  } = useExpenseCategoryApi();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories(true); // Incluir inactivas
  }, []);

  const handleNewCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', is_active: true });
    setFormError('');
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active
    });
    setFormError('');
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', is_active: true });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('El nombre es requerido');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      handleCancelForm();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Esta seguro de eliminar la categoria "${category.name}"?`)) {
      return;
    }

    try {
      await removeCategory(category.id);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await updateCategory(category.id, { is_active: !category.is_active });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="expense-categories-page">
      <div className="expense-categories-page__header">
        <div>
          <h1>Categorias de Gastos</h1>
          <p>Configure las categorias disponibles para que los repartidores registren sus gastos.</p>
        </div>
        <button
          className="expense-categories-page__btn-new"
          onClick={handleNewCategory}
        >
          + Nueva Categoria
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="expense-categories-page__form-container">
          <form onSubmit={handleSubmit} className="expense-categories-page__form">
            <h3>{editingCategory ? 'Editar Categoria' : 'Nueva Categoria'}</h3>

            {formError && (
              <div className="expense-categories-page__form-error">{formError}</div>
            )}

            <div className="expense-categories-page__field">
              <label>Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Combustible, Viaticos, etc."
                required
              />
            </div>

            <div className="expense-categories-page__field">
              <label>Descripcion</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripcion opcional"
              />
            </div>

            <div className="expense-categories-page__field expense-categories-page__field--checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                Categoria activa
              </label>
            </div>

            <div className="expense-categories-page__form-actions">
              <button
                type="button"
                onClick={handleCancelForm}
                className="expense-categories-page__btn expense-categories-page__btn--cancel"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="expense-categories-page__btn expense-categories-page__btn--save"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="expense-categories-page__list">
        {loading ? (
          <div className="expense-categories-page__loading">Cargando...</div>
        ) : categories.length === 0 ? (
          <div className="expense-categories-page__empty">
            No hay categorias configuradas. Cree la primera.
          </div>
        ) : (
          <table className="expense-categories-page__table">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Nombre</th>
                <th>Descripcion</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr
                  key={category.id}
                  className={!category.is_active ? 'expense-categories-page__row--inactive' : ''}
                >
                  <td>{index + 1}</td>
                  <td><strong>{category.name}</strong></td>
                  <td>{category.description || '-'}</td>
                  <td>
                    <span
                      className={`expense-categories-page__status ${
                        category.is_active
                          ? 'expense-categories-page__status--active'
                          : 'expense-categories-page__status--inactive'
                      }`}
                    >
                      {category.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <div className="expense-categories-page__actions">
                      <button
                        className="expense-categories-page__btn-action"
                        onClick={() => handleEditCategory(category)}
                        title="Editar"
                      >
                        Editar
                      </button>
                      <button
                        className="expense-categories-page__btn-action expense-categories-page__btn-action--toggle"
                        onClick={() => handleToggleActive(category)}
                        title={category.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {category.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        className="expense-categories-page__btn-action expense-categories-page__btn-action--delete"
                        onClick={() => handleDelete(category)}
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExpenseCategoriesPage;
