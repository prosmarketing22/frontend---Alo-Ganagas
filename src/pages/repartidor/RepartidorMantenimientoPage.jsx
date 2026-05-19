import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepartidorApi } from '../../hooks/useApi/useRepartidorApi';
import './RepartidorMantenimientoPage.css';

export const RepartidorMantenimientoPage = () => {
  const navigate = useNavigate();
  const {
    mySchedules,
    availableSchedules,
    loading,
    fetchMySchedules,
    fetchAvailableSchedules,
    selfAssignSchedule,
    startService,
    completeService
  } = useRepartidorApi();
  const [filter, setFilter] = useState('all');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableExpanded, setAvailableExpanded] = useState(true);
  const [assigningScheduleId, setAssigningScheduleId] = useState(null);

  // Estado del formulario de completación
  const [serviceForm, setServiceForm] = useState({
    result: 'OK',
    findings: '',
    actions_taken: '',
    recommendations: '',
    follow_up_required: false,
    follow_up_notes: '',
    next_maintenance_date: ''
  });

  useEffect(() => {
    loadSchedules();
    loadAvailableSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      await fetchMySchedules(); // Sin filtro de fecha
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const loadAvailableSchedules = async () => {
    try {
      await fetchAvailableSchedules();
    } catch (error) {
      console.error('Error loading available schedules:', error);
    }
  };

  const handleSelfAssign = async (scheduleId) => {
    setAssigningScheduleId(scheduleId);
    try {
      const result = await selfAssignSchedule(scheduleId);
      if (result.success) {
        alert('Mantenimiento asignado correctamente.');
        await loadAvailableSchedules();
        await loadSchedules();
      }
    } catch (error) {
      console.error('Error assigning schedule:', error);
      alert('Error al asignar mantenimiento: ' + error.message);
    } finally {
      setAssigningScheduleId(null);
    }
  };

  const handleStartService = async (scheduleId) => {
    if (!window.confirm('¿Confirmas que has llegado al domicilio del cliente?')) return;

    try {
      await startService(scheduleId);
      await loadSchedules();
      alert('Cliente notificado exitosamente');
    } catch (error) {
      console.error('Error starting service:', error);
      alert('Error al notificar llegada: ' + error.message);
    }
  };

  const handleOpenCompleteModal = (schedule) => {
    setSelectedSchedule(schedule);
    setServiceForm({
      result: 'OK',
      findings: '',
      actions_taken: '',
      recommendations: '',
      follow_up_required: false,
      follow_up_notes: '',
      next_maintenance_date: ''
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setServiceForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    if (!selectedSchedule || isSubmitting) return;

    // Validación básica
    if (!serviceForm.actions_taken.trim()) {
      alert('Por favor describe las acciones realizadas');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeService(selectedSchedule.id, {
        scheduleId: selectedSchedule.id,
        result: serviceForm.result,
        findings: serviceForm.findings,
        actions_taken: serviceForm.actions_taken,
        recommendations: serviceForm.recommendations,
        follow_up_required: serviceForm.follow_up_required,
        follow_up_notes: serviceForm.follow_up_notes,
        next_maintenance_date: serviceForm.next_maintenance_date || null
      });

      await loadSchedules();
      alert('Mantenimiento completado exitosamente');
      setIsModalOpen(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error('Error completing service:', error);
      alert('Error al completar servicio: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSchedules = filter === 'all'
    ? mySchedules
    : mySchedules.filter((s) => s.schedule_status === filter);

  const getTypeIcon = (type) => {
    const normalizedType = type?.toLowerCase() || '';
    if (normalizedType.includes('preventivo')) {
      return (
        <div className="maintenance-card__type-icon maintenance-card__type-icon--preventivo">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    } else if (normalizedType.includes('correctivo')) {
      return (
        <div className="maintenance-card__type-icon maintenance-card__type-icon--correctivo">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="maintenance-card__type-icon maintenance-card__type-icon--inspeccion">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      );
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PROGRAMADA': { class: 'pendiente', label: 'Programado', icon: 'clock' },
      'PENDIENTE': { class: 'pendiente', label: 'Pendiente', icon: 'clock' },
      'EN_PROCESO': { class: 'proceso', label: 'En Proceso', icon: 'play' },
      'COMPLETADA': { class: 'completado', label: 'Completado', icon: 'check' },
      'COMPLETADO': { class: 'completado', label: 'Completado', icon: 'check' },
      'CANCELADA': { class: 'cancelado', label: 'Cancelado', icon: 'x' },
      'CANCELADO': { class: 'cancelado', label: 'Cancelado', icon: 'x' }
    };
    const config = statusConfig[status] || statusConfig['PENDIENTE'];

    return (
      <span className={`maintenance-card__status-badge maintenance-card__status-badge--${config.class}`}>
        {config.icon === 'clock' && (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {config.icon === 'play' && (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
        )}
        {config.icon === 'check' && (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {config.icon === 'x' && (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {config.label}
      </span>
    );
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const isPending = (status) => ['PROGRAMADA', 'PENDIENTE'].includes(status);
  const isInProgress = (status) => status === 'EN_PROCESO';
  const isCompleted = (status) => ['COMPLETADA', 'COMPLETADO'].includes(status);
  const isCancelled = (status) => ['CANCELADA', 'CANCELADO'].includes(status);

  if (loading) {
    return (
      <div className="mantenimiento-page">
        <div className="mantenimiento-page__container">
          <div className="mantenimiento-page__loading">
            <div className="mantenimiento-page__spinner"></div>
            <p className="mantenimiento-page__loading-text">Cargando mantenimientos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mantenimiento-page">
      <div className="mantenimiento-page__container">
        {/* Header */}
        <header className="mantenimiento-page__header">
          <button
            onClick={() => navigate('/repartidor')}
            className="mantenimiento-page__back-btn"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al panel
          </button>

          <div className="mantenimiento-page__title-section">
            <div className="mantenimiento-page__title-row">
              <div className="mantenimiento-page__title-content">
                <div className="mantenimiento-page__title-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="mantenimiento-page__title">Mantenimientos</h1>
                  <p className="mantenimiento-page__subtitle">Gestiona tus servicios programados</p>
                </div>
              </div>
              <div className="mantenimiento-page__stats-badge">
                <span className="mantenimiento-page__stats-value">{filteredSchedules.length}</span>
                <span className="mantenimiento-page__stats-label">servicios</span>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="mantenimiento-page__filters">
          <div className="mantenimiento-page__status-filters">
            <button
              onClick={() => setFilter('all')}
              className={`mantenimiento-page__filter-btn mantenimiento-page__filter-btn--all ${filter === 'all' ? 'mantenimiento-page__filter-btn--active' : ''}`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Todos
            </button>
            <button
              onClick={() => setFilter('PROGRAMADA')}
              className={`mantenimiento-page__filter-btn mantenimiento-page__filter-btn--pendiente ${filter === 'PROGRAMADA' ? 'mantenimiento-page__filter-btn--active' : ''}`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Programados
            </button>
            <button
              onClick={() => setFilter('EN_PROCESO')}
              className={`mantenimiento-page__filter-btn mantenimiento-page__filter-btn--proceso ${filter === 'EN_PROCESO' ? 'mantenimiento-page__filter-btn--active' : ''}`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              En Proceso
            </button>
            <button
              onClick={() => setFilter('COMPLETADA')}
              className={`mantenimiento-page__filter-btn mantenimiento-page__filter-btn--completado ${filter === 'COMPLETADA' ? 'mantenimiento-page__filter-btn--active' : ''}`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Completados
            </button>
          </div>
        </div>

        {/* Available Schedules Section */}
        {availableSchedules.length > 0 && (
          <div className="mantenimiento-page__available-section">
            <button
              className="mantenimiento-page__available-header"
              onClick={() => setAvailableExpanded(!availableExpanded)}
            >
              <div className="mantenimiento-page__available-header-content">
                <div className="mantenimiento-page__available-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="mantenimiento-page__available-title">Mantenimientos Disponibles</h3>
                  <p className="mantenimiento-page__available-subtitle">
                    {availableSchedules.length} mantenimiento{availableSchedules.length !== 1 ? 's' : ''} sin asignar
                  </p>
                </div>
              </div>
              <div className="mantenimiento-page__available-toggle">
                <span className="mantenimiento-page__available-badge">{availableSchedules.length}</span>
                <svg
                  className={`mantenimiento-page__available-chevron ${availableExpanded ? 'mantenimiento-page__available-chevron--expanded' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {availableExpanded && (
              <div className="mantenimiento-page__available-list">
                {availableSchedules.map((schedule) => (
                  <div key={schedule.id} className="available-schedule-card">
                    <div className="available-schedule-card__header">
                      <div className="available-schedule-card__type-info">
                        {getTypeIcon(schedule.service_type)}
                        <div>
                          <p className="available-schedule-card__type-name">
                            {schedule.service_type || 'Mantenimiento General'}
                          </p>
                          <p className="available-schedule-card__customer-name">
                            {schedule.customer_name || 'Cliente'}
                          </p>
                        </div>
                      </div>
                      <div className="available-schedule-card__pending-badge">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pendiente
                      </div>
                    </div>

                    <div className="available-schedule-card__details">
                      {(schedule.scheduled_time_from || schedule.scheduled_time_to) && (
                        <div className="available-schedule-card__detail">
                          <span className="available-schedule-card__detail-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          <span className="available-schedule-card__detail-text">
                            {formatTime(schedule.scheduled_time_from)}
                            {schedule.scheduled_time_to && ` - ${formatTime(schedule.scheduled_time_to)}`}
                          </span>
                        </div>
                      )}
                      {schedule.address && (
                        <div className="available-schedule-card__detail">
                          <span className="available-schedule-card__detail-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </span>
                          <span className="available-schedule-card__detail-text">
                            {schedule.address}
                          </span>
                        </div>
                      )}
                      {schedule.customer_phone && (
                        <div className="available-schedule-card__detail">
                          <span className="available-schedule-card__detail-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </span>
                          <span className="available-schedule-card__detail-text">
                            {schedule.customer_phone}
                          </span>
                        </div>
                      )}
                    </div>

                    {schedule.request_description && (
                      <div className="available-schedule-card__description">
                        <p className="available-schedule-card__description-text">{schedule.request_description}</p>
                      </div>
                    )}

                    <button
                      onClick={() => handleSelfAssign(schedule.id)}
                      disabled={assigningScheduleId === schedule.id}
                      className="available-schedule-card__assign-btn"
                    >
                      {assigningScheduleId === schedule.id ? (
                        <>
                          <span className="available-schedule-card__spinner"></span>
                          Asignando...
                        </>
                      ) : (
                        <>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Tomar este mantenimiento
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {filteredSchedules.length === 0 ? (
          <div className="mantenimiento-page__empty">
            <div className="mantenimiento-page__empty-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="mantenimiento-page__empty-title">No tienes mantenimientos asignados</h2>
            <p className="mantenimiento-page__empty-text">
              {filter === 'all'
                ? 'Toma un mantenimiento disponible de la sección superior'
                : `No hay servicios con estado: ${filter.replace('_', ' ')}`}
            </p>
          </div>
        ) : (
          <>
            <div className="mantenimiento-page__results-info">
              <span className="mantenimiento-page__results-count">
                {filteredSchedules.length} servicio{filteredSchedules.length !== 1 ? 's' : ''} encontrado{filteredSchedules.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="mantenimiento-page__cards">
              {filteredSchedules.map((schedule) => (
                <div key={schedule.id} className="maintenance-card">
                  <div className="maintenance-card__header">
                    <div className="maintenance-card__type-info">
                      {getTypeIcon(schedule.service_type)}
                      <div>
                        <p className="maintenance-card__type-name">
                          {schedule.service_type || 'Mantenimiento General'}
                        </p>
                        <p className="maintenance-card__customer-name">
                          {schedule.customer_name || 'Cliente'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(schedule.schedule_status)}
                  </div>

                  <div className="maintenance-card__details">
                    {(schedule.scheduled_time_from || schedule.scheduled_time_to) && (
                      <div className="maintenance-card__detail">
                        <span className="maintenance-card__detail-icon">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <span className="maintenance-card__detail-text">
                          {formatTime(schedule.scheduled_time_from)}
                          {schedule.scheduled_time_to && ` - ${formatTime(schedule.scheduled_time_to)}`}
                        </span>
                      </div>
                    )}
                    {schedule.address && (
                      <div className="maintenance-card__detail">
                        <span className="maintenance-card__detail-icon">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </span>
                        <span className="maintenance-card__detail-text">
                          {schedule.address}
                        </span>
                      </div>
                    )}
                    {schedule.reference && (
                      <div className="maintenance-card__detail">
                        <span className="maintenance-card__detail-icon">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <span className="maintenance-card__detail-text">
                          Ref: {schedule.reference}
                        </span>
                      </div>
                    )}
                    {schedule.customer_phone && (
                      <div className="maintenance-card__detail">
                        <span className="maintenance-card__detail-icon">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </span>
                        <a href={`tel:${schedule.customer_phone}`} className="maintenance-card__detail-text maintenance-card__phone-link">
                          {schedule.customer_phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {schedule.request_description && (
                    <div className="maintenance-card__description">
                      <p className="maintenance-card__description-title">Descripcion del servicio</p>
                      <p className="maintenance-card__description-text">{schedule.request_description}</p>
                    </div>
                  )}

                  {schedule.schedule_notes && (
                    <div className="maintenance-card__notes">
                      <p className="maintenance-card__notes-title">Notas</p>
                      <p className="maintenance-card__notes-text">{schedule.schedule_notes}</p>
                    </div>
                  )}

                  {!isCompleted(schedule.schedule_status) && !isCancelled(schedule.schedule_status) && (
                    <div className="maintenance-card__actions">
                      {isPending(schedule.schedule_status) && (
                        <button
                          onClick={() => handleStartService(schedule.id)}
                          className="maintenance-card__action-btn maintenance-card__action-btn--start"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: '18px', height: '18px', marginLeft: '-4px'}}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          Llegue - Notificar
                        </button>
                      )}
                      {isInProgress(schedule.schedule_status) && (
                        <button
                          onClick={() => handleOpenCompleteModal(schedule)}
                          className="maintenance-card__action-btn maintenance-card__action-btn--complete"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Completar Servicio
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de Completar Servicio */}
      {isModalOpen && selectedSchedule && (
        <div className="service-modal__overlay" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div className="service-modal service-modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="service-modal__header">
              <h2 className="service-modal__title">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Completar Mantenimiento
              </h2>
              <button
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="service-modal__close-btn"
                disabled={isSubmitting}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitService} className="service-modal__body">
              {/* Info del cliente */}
              <div className="service-modal__customer-info">
                <p className="service-modal__customer-name">
                  {selectedSchedule.customer_name || 'Cliente'}
                </p>
                <p className="service-modal__customer-detail">
                  {selectedSchedule.address || 'Sin direccion'}
                </p>
                <div className="service-modal__service-type">
                  <p className="service-modal__service-type-label">Tipo de servicio</p>
                  <p className="service-modal__service-type-value">
                    {selectedSchedule.service_type || 'Mantenimiento General'}
                  </p>
                </div>
              </div>

              {/* Resultado del servicio */}
              <div className="service-modal__section">
                <label className="service-modal__label">
                  Resultado del servicio <span className="service-modal__label-required">*</span>
                </label>
                <div className="service-modal__radio-group">
                  <label className={`service-modal__radio-option ${serviceForm.result === 'OK' ? 'service-modal__radio-option--selected' : ''}`}>
                    <input
                      type="radio"
                      name="result"
                      value="OK"
                      checked={serviceForm.result === 'OK'}
                      onChange={(e) => handleFormChange('result', e.target.value)}
                    />
                    <span className="service-modal__radio-icon service-modal__radio-icon--ok">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>Todo OK</span>
                  </label>
                  <label className={`service-modal__radio-option ${serviceForm.result === 'CON_DEFECTO' ? 'service-modal__radio-option--selected' : ''}`}>
                    <input
                      type="radio"
                      name="result"
                      value="CON_DEFECTO"
                      checked={serviceForm.result === 'CON_DEFECTO'}
                      onChange={(e) => handleFormChange('result', e.target.value)}
                    />
                    <span className="service-modal__radio-icon service-modal__radio-icon--warning">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </span>
                    <span>Con defectos</span>
                  </label>
                  <label className={`service-modal__radio-option ${serviceForm.result === 'INOPERATIVO' ? 'service-modal__radio-option--selected' : ''}`}>
                    <input
                      type="radio"
                      name="result"
                      value="INOPERATIVO"
                      checked={serviceForm.result === 'INOPERATIVO'}
                      onChange={(e) => handleFormChange('result', e.target.value)}
                    />
                    <span className="service-modal__radio-icon service-modal__radio-icon--error">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                    <span>Inoperativo</span>
                  </label>
                </div>
              </div>

              {/* Acciones realizadas */}
              <div className="service-modal__section">
                <label className="service-modal__label">
                  Acciones realizadas <span className="service-modal__label-required">*</span>
                </label>
                <textarea
                  value={serviceForm.actions_taken}
                  onChange={(e) => handleFormChange('actions_taken', e.target.value)}
                  placeholder="Describe el trabajo realizado..."
                  className="service-modal__textarea"
                  rows={3}
                  required
                />
              </div>

              {/* Hallazgos */}
              <div className="service-modal__section">
                <label className="service-modal__label">Hallazgos encontrados</label>
                <textarea
                  value={serviceForm.findings}
                  onChange={(e) => handleFormChange('findings', e.target.value)}
                  placeholder="Problemas o situaciones encontradas..."
                  className="service-modal__textarea"
                  rows={2}
                />
              </div>

              {/* Recomendaciones */}
              <div className="service-modal__section">
                <label className="service-modal__label">Recomendaciones</label>
                <textarea
                  value={serviceForm.recommendations}
                  onChange={(e) => handleFormChange('recommendations', e.target.value)}
                  placeholder="Sugerencias para el cliente..."
                  className="service-modal__textarea"
                  rows={2}
                />
              </div>

              {/* Seguimiento */}
              <div className="service-modal__section">
                <label className="service-modal__checkbox-label">
                  <input
                    type="checkbox"
                    checked={serviceForm.follow_up_required}
                    onChange={(e) => handleFormChange('follow_up_required', e.target.checked)}
                  />
                  <span>Requiere seguimiento</span>
                </label>
                {serviceForm.follow_up_required && (
                  <textarea
                    value={serviceForm.follow_up_notes}
                    onChange={(e) => handleFormChange('follow_up_notes', e.target.value)}
                    placeholder="Notas para el seguimiento..."
                    className="service-modal__textarea service-modal__textarea--small"
                    rows={2}
                  />
                )}
              </div>

              {/* Próxima fecha de servicio */}
              <div className="service-modal__section">
                <label className="service-modal__label">Proxima fecha de mantenimiento</label>
                <input
                  type="date"
                  value={serviceForm.next_maintenance_date}
                  onChange={(e) => handleFormChange('next_maintenance_date', e.target.value)}
                  className="service-modal__input"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="service-modal__input-hint">
                  Opcional. Programa el proximo mantenimiento si aplica.
                </p>
              </div>

              {/* Botones */}
              <div className="service-modal__actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="service-modal__cancel-btn"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="service-modal__submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="service-modal__spinner"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Completar Mantenimiento
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
