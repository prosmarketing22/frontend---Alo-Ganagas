import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useRepartidorApi } from '../../hooks/useApi/useRepartidorApi';
import './RepartidorPage.css';

export const RepartidorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { summary, loading, fetchSummary } = useRepartidorApi();
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadSummary();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadSummary = async () => {
    try {
      await fetchSummary();
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const handleTaskChange = (taskId) => {
    setSelectedTask(taskId);
    if (taskId === 'entregas') {
      navigate('/repartidor/entregas');
    } else if (taskId === 'cobros') {
      navigate('/repartidor/cobros');
    } else if (taskId === 'mantenimiento') {
      navigate('/repartidor/mantenimiento');
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="repartidor-page">
        <div className="repartidor-page__container">
          <div className="repartidor-page__loading">
            <div className="repartidor-page__spinner"></div>
            <p className="repartidor-page__loading-text">Cargando tu panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="repartidor-page">
      <div className="repartidor-page__container">
        {/* Header */}
        <header className="repartidor-page__header">
          <div className="repartidor-page__header-content">
            <div>
              <p className="repartidor-page__greeting">{getGreeting()}</p>
              <h1 className="repartidor-page__title">
                <span className="repartidor-page__title-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                {user?.full_name?.split(' ')[0] || 'Repartidor'}
              </h1>
              <p className="repartidor-page__subtitle">Panel de control - Gestiona tus tareas del dia</p>
            </div>
            <div className="repartidor-page__time">
              <span className="repartidor-page__time-dot"></span>
              En linea - {formatTime()}
            </div>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card summary-card--blue">
            <div className="summary-card__header">
              <div className="summary-card__icon summary-card__icon--blue">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="summary-card__value">{summary?.pending_deliveries || 0}</span>
            </div>
            <p className="summary-card__label">Entregas Pendientes</p>
          </div>

          <div className="summary-card summary-card--green">
            <div className="summary-card__header">
              <div className="summary-card__icon summary-card__icon--green">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="summary-card__value">{summary?.pending_loans || 0}</span>
            </div>
            <p className="summary-card__label">Cobros del Dia</p>
          </div>

          <div className="summary-card summary-card--orange">
            <div className="summary-card__header">
              <div className="summary-card__icon summary-card__icon--orange">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="summary-card__value">{summary?.scheduled_maintenance || 0}</span>
            </div>
            <p className="summary-card__label">Mantenimientos</p>
          </div>

          <div className="summary-card summary-card--purple">
            <div className="summary-card__header">
              <div className="summary-card__icon summary-card__icon--purple">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="summary-card__value">{summary?.completed_today || 0}</span>
            </div>
            <p className="summary-card__label">Completadas Hoy</p>
          </div>
        </div>

        {/* Task Selector */}
        <div className="task-selector">
          <h2 className="task-selector__title">
            <span className="task-selector__title-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            Selecciona tu tarea
          </h2>
          <div className="task-selector__grid">
            <button
              onClick={() => handleTaskChange('entregas')}
              className={`task-selector__btn task-selector__btn--blue ${selectedTask === 'entregas' ? 'task-selector__btn--active' : ''}`}
            >
              <div className="task-selector__btn-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <div className="task-selector__btn-content">
                <p className="task-selector__btn-label">Entregas</p>
                <p className="task-selector__btn-desc">Pedidos por entregar</p>
              </div>
              <span className="task-selector__btn-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>

            <button
              onClick={() => handleTaskChange('cobros')}
              className={`task-selector__btn task-selector__btn--green ${selectedTask === 'cobros' ? 'task-selector__btn--active' : ''}`}
            >
              <div className="task-selector__btn-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="task-selector__btn-content">
                <p className="task-selector__btn-label">Cobros</p>
                <p className="task-selector__btn-desc">Recoleccion de envases</p>
              </div>
              <span className="task-selector__btn-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>

            <button
              onClick={() => handleTaskChange('mantenimiento')}
              className={`task-selector__btn task-selector__btn--orange ${selectedTask === 'mantenimiento' ? 'task-selector__btn--active' : ''}`}
            >
              <div className="task-selector__btn-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="task-selector__btn-content">
                <p className="task-selector__btn-label">Mantenimiento</p>
                <p className="task-selector__btn-desc">Servicios programados</p>
              </div>
              <span className="task-selector__btn-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="repartidor-page__empty">
          <div className="repartidor-page__empty-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 className="repartidor-page__empty-title">Selecciona una tarea</h2>
          <p className="repartidor-page__empty-text">
            Elige una de las opciones de arriba para comenzar con tus actividades del dia
          </p>
        </div>
      </div>
    </div>
  );
};
