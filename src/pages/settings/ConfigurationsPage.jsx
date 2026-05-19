import { useEffect, useState } from 'react';
import { TablaConfiguraciones } from '../../components/configurations/TablaConfiguraciones';
import { ModalConfiguracion } from '../../components/configurations/ModalConfiguracion';
import { useConfigurationApi } from '../../hooks/useApi/useConfigurationApi';
import '../../styles/components/catalogs.css';

export const ConfigurationsPage = () => {
  const {
    data: configurations,
    loading,
    error,
    fetchConfigurations,
    updateConfiguration
  } = useConfigurationApi();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  const handleEdit = (config) => {
    setSelectedConfig(config);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      await updateConfiguration(selectedConfig.id, formData);
      alert('Configuración actualizada exitosamente');
      setIsModalOpen(false);
      setSelectedConfig(null);
    } catch (err) {
      alert('Error al guardar la configuración: ' + err.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedConfig(null);
  };

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div>
          <h1 className="catalog-title">Configuración del Sistema</h1>
          <p className="catalog-subtitle">
            Administra los parámetros globales de Mi GANAGAS
          </p>
        </div>
      </div>

      <div className="config-alert config-alert--info">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
        </svg>
        <div>
          <strong>Información:</strong> Estos valores configuran el sistema de puntos y bonificaciones de Mi GANAGAS.
          Modifica los montos según las necesidades del negocio.
        </div>
      </div>

      {error && (
        <div className="catalog-error-message">
          Error al cargar las configuraciones: {error}
        </div>
      )}

      {loading ? (
        <div className="catalog-loading">Cargando configuraciones...</div>
      ) : (
        <TablaConfiguraciones
          configurations={configurations}
          onEdit={handleEdit}
        />
      )}

      <ModalConfiguracion
        isOpen={isModalOpen}
        configuration={selectedConfig}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
