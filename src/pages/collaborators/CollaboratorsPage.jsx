import { useState, useEffect } from 'react';
import { useCollaboratorApi } from '../../hooks/useApi/useCollaboratorApi';
import { Tabs } from '../../components/common/Tabs';
import { CollaboratorForm } from '../../components/collaborators/CollaboratorForm';
import { CollaboratorTable } from '../../components/collaborators/CollaboratorTable';
import { AttendanceTodayCards } from '../../components/attendances/AttendanceTodayCards';
import { AttendanceHistoryTree } from '../../components/attendances/AttendanceHistoryTree';
import { BirthdaysTab } from '../../components/collaborators/BirthdaysTab';
import '../../styles/components/collaborators.css';

export const CollaboratorsPage = () => {
  const {
    data: collaborators,
    loading: collaboratorsLoading,
    error: collaboratorsError,
    pagination,
    fetchCollaborators,
    createCollaborator,
    updateCollaborator,
    deleteCollaborator,
    getBirthdays
  } = useCollaboratorApi();

  const [activeTab, setActiveTab] = useState('collaborators');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async (params = {}) => {
    try {
      await fetchCollaborators({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });
    } catch (err) {
      console.error('Error al cargar colaboradores:', err);
    }
  };

  const handleOpenModal = () => {
    setSelectedCollaborator(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCollaborator(null);
  };

  const handleEdit = (collaborator) => {
    setSelectedCollaborator(collaborator);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedCollaborator) {
        await updateCollaborator(selectedCollaborator.id, formData);
      } else {
        await createCollaborator(formData);
      }
      handleCloseModal();
      loadCollaborators();
    } catch (err) {
      console.error('Error al guardar colaborador:', err);
      alert('Error al guardar el colaborador: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Esta seguro de eliminar este colaborador?')) {
      return;
    }

    try {
      await deleteCollaborator(id);
      loadCollaborators();
    } catch (err) {
      console.error('Error al eliminar colaborador:', err);
      alert('Error al eliminar el colaborador: ' + err.message);
    }
  };

  const tabs = [
    {
      id: 'collaborators',
      label: 'Colaboradores',
      icon: '👥',
      content: (
        <div className="tab-content">
          <div className="content-header">
            <h2 className="content-title">Gestion de Colaboradores</h2>
            <button onClick={handleOpenModal} className="btn btn--primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Colaborador
            </button>
          </div>

          {collaboratorsError && (
            <div className="alert alert--error">
              <span className="alert-icon">⚠️</span>
              <span className="alert-text">Error: {collaboratorsError}</span>
            </div>
          )}

          <CollaboratorTable
            data={collaborators}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={collaboratorsLoading}
          />

          {!collaboratorsLoading && collaborators.length > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Pagina {pagination.page} de {pagination.totalPages} ({pagination.total} colaboradores)
              </div>
              <div className="pagination-controls">
                <button
                  onClick={() => loadCollaborators({ page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="pagination-btn"
                >
                  Anterior
                </button>
                <button
                  onClick={() => loadCollaborators({ page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="pagination-btn"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'attendance-today',
      label: 'Asistencia Hoy',
      icon: '📋',
      content: (
        <div className="tab-content">
          <AttendanceTodayCards />
        </div>
      )
    },
    {
      id: 'attendance-history',
      label: 'Historial',
      icon: '📊',
      content: (
        <div className="tab-content">
          <AttendanceHistoryTree />
        </div>
      )
    },
    {
      id: 'birthdays',
      label: 'Cumpleaños',
      icon: '🎂',
      content: (
        <div className="tab-content">
          <div className="content-header">
            <h2 className="content-title">Cumpleaños del Mes</h2>
          </div>

          <BirthdaysTab
            getBirthdays={getBirthdays}
            loading={collaboratorsLoading}
          />
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-title-icon">👥</span>
          Colaboradores y Asistencias
        </h1>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedCollaborator ? 'Editar Colaborador' : 'Nuevo Colaborador'}
              </h2>
            </div>
            <div className="modal-body">
              <CollaboratorForm
                initialData={selectedCollaborator}
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
                loading={collaboratorsLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
