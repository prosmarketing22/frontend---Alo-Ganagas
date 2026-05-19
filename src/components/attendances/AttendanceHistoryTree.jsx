import { useState, useEffect, useRef } from 'react';
import { useAttendanceApi } from '../../hooks/useApi/useAttendanceApi';
import { useCollaboratorApi } from '../../hooks/useApi/useCollaboratorApi';
import { ATTENDANCE_TYPES } from '../../utils/constants';
import '../../styles/components/attendances.css';

export const AttendanceHistoryTree = () => {
  const { getHistorySummary, getYearsTree, getMonthsByYear, getDaysByYearMonth, getByDate, loading } = useAttendanceApi();
  const { fetchCollaborators } = useCollaboratorApi();

  const [collaborators, setCollaborators] = useState([]);
  const [yearsData, setYearsData] = useState([]);
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedDays, setExpandedDays] = useState({});
  const [monthsData, setMonthsData] = useState({});
  const [daysData, setDaysData] = useState({});
  const [dayAttendances, setDayAttendances] = useState({});
  const [stats, setStats] = useState({
    total_registros: 0,
    presentes: 0,
    ausentes: 0,
    tardanzas: 0,
    salidas_tempranas: 0,
    dias_cerrados: 0
  });

  const [filters, setFilters] = useState({
    collaborator_id: '',
    status: ''
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    handleRefresh();
  }, [filters.collaborator_id, filters.status]);

  const loadInitialData = async () => {
    try {
      const [collabResponse, statsResponse, yearsResponse] = await Promise.all([
        fetchCollaborators(),
        getHistorySummary({}),
        getYearsTree()
      ]);

      setCollaborators(collabResponse?.data || []);
      setStats(statsResponse || stats);
      setYearsData(yearsResponse || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getFilterParams = () => {
    const params = {};
    if (filters.collaborator_id) params.collaborator_id = filters.collaborator_id;
    if (filters.status) params.status = filters.status;
    return params;
  };

  const handleRefresh = async () => {
    try {
      const params = getFilterParams();

      const [statsResponse, yearsResponse] = await Promise.all([
        getHistorySummary(params),
        getYearsTree(params)
      ]);

      setStats(statsResponse || stats);
      setYearsData(yearsResponse || []);
      setExpandedYears({});
      setExpandedMonths({});
      setExpandedDays({});
      setMonthsData({});
      setDaysData({});
      setDayAttendances({});
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const toggleYear = async (year) => {
    const isExpanded = expandedYears[year];
    setExpandedYears(prev => ({
      ...prev,
      [year]: !isExpanded
    }));

    if (!isExpanded && !monthsData[year]) {
      try {
        const params = getFilterParams();
        const response = await getMonthsByYear(year, params);
        setMonthsData(prev => ({
          ...prev,
          [year]: response?.months || []
        }));
      } catch (error) {
        console.error('Error loading months:', error);
      }
    }
  };

  const toggleMonth = async (year, month) => {
    const key = `${year}-${month}`;
    const isExpanded = expandedMonths[key];
    setExpandedMonths(prev => ({
      ...prev,
      [key]: !isExpanded
    }));

    if (!isExpanded && !daysData[key]) {
      try {
        const params = getFilterParams();
        const response = await getDaysByYearMonth(year, month, params);
        setDaysData(prev => ({
          ...prev,
          [key]: response?.days || []
        }));
      } catch (error) {
        console.error('Error loading days:', error);
      }
    }
  };

  const toggleDay = async (date) => {
    const isExpanded = expandedDays[date];
    setExpandedDays(prev => ({
      ...prev,
      [date]: !isExpanded
    }));

    if (!isExpanded && !dayAttendances[date]) {
      try {
        const params = getFilterParams();
        const response = await getByDate(date, params);
        setDayAttendances(prev => ({
          ...prev,
          [date]: response?.attendances || []
        }));
      } catch (error) {
        console.error('Error loading day attendances:', error);
      }
    }
  };

  const getStatusStyle = (type) => {
    const typeConfig = Object.values(ATTENDANCE_TYPES).find(t => t.value === type);
    if (typeConfig) {
      return {
        backgroundColor: typeConfig.bgColor,
        color: typeConfig.color
      };
    }
    return {};
  };

  const getStatusLabel = (type) => {
    const typeConfig = Object.values(ATTENDANCE_TYPES).find(t => t.value === type);
    return typeConfig ? `${typeConfig.icon} ${typeConfig.label}` : type;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatDayNumber = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.getDate().toString().padStart(2, '0');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  const getMonthName = (monthIndex) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthIndex - 1] || '';
  };

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    return days[date.getDay()];
  };

  return (
    <div className="attendance-history-container">
      <div className="attendance-history-header">
        <div className="attendance-history-header-text">
          <h2 className="attendance-history-title">Historial de Asistencia</h2>
          <p className="attendance-history-subtitle">
            Registro historico de asistencias cerradas organizado por ano, mes y dia
          </p>
        </div>

        <div className="attendance-history-filters">
          <div className="attendance-filter-group">
            <label className="attendance-filter-label">Colaborador</label>
            <select
              className="attendance-filter-select"
              value={filters.collaborator_id}
              onChange={(e) => handleFilterChange('collaborator_id', e.target.value)}
            >
              <option value="">Todos los colaboradores</option>
              {collaborators.map(collab => (
                <option key={collab.id} value={collab.id}>
                  {collab.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="attendance-filter-group">
            <label className="attendance-filter-label">Estado</label>
            <select
              className="attendance-filter-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos los estados</option>
              {Object.values(ATTENDANCE_TYPES).map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="attendance-stats-grid">
        <div className="attendance-stat-card attendance-stat-card--purple">
          <div className="attendance-stat-icon">📅</div>
          <div className="attendance-stat-content">
            <p className="attendance-stat-label">Dias Cerrados</p>
            <p className="attendance-stat-value">{stats.dias_cerrados || 0}</p>
          </div>
        </div>

        <div className="attendance-stat-card attendance-stat-card--blue">
          <div className="attendance-stat-icon">📊</div>
          <div className="attendance-stat-content">
            <p className="attendance-stat-label">Total Registros</p>
            <p className="attendance-stat-value">{stats.total_registros || 0}</p>
          </div>
        </div>

        <div className="attendance-stat-card attendance-stat-card--green">
          <div className="attendance-stat-icon">✓</div>
          <div className="attendance-stat-content">
            <p className="attendance-stat-label">Presentes</p>
            <p className="attendance-stat-value">{stats.presentes || 0}</p>
          </div>
        </div>

        <div className="attendance-stat-card attendance-stat-card--red">
          <div className="attendance-stat-icon">✗</div>
          <div className="attendance-stat-content">
            <p className="attendance-stat-label">Ausentes</p>
            <p className="attendance-stat-value">{stats.ausentes || 0}</p>
          </div>
        </div>

        <div className="attendance-stat-card attendance-stat-card--yellow">
          <div className="attendance-stat-icon">⏰</div>
          <div className="attendance-stat-content">
            <p className="attendance-stat-label">Tardanzas</p>
            <p className="attendance-stat-value">{stats.tardanzas || 0}</p>
          </div>
        </div>
      </div>

      <div className="attendance-tree-container">
        {loading && yearsData.length === 0 ? (
          <div className="attendance-loading">
            <div className="attendance-spinner"></div>
            <p>Cargando historial...</p>
          </div>
        ) : yearsData.length === 0 ? (
          <div className="attendance-empty-state">
            <div className="attendance-empty-icon">📭</div>
            <p className="attendance-empty-text">No hay registros de asistencia cerrados</p>
            <p className="attendance-empty-subtext">Las asistencias apareceran aqui despues de cerrar el dia</p>
          </div>
        ) : (
          yearsData.map(yearItem => {
            const isYearExpanded = expandedYears[yearItem.year];
            const yearMonths = monthsData[yearItem.year] || [];

            return (
              <div key={yearItem.year} className="attendance-year-item">
                <div
                  className="attendance-year-header"
                  onClick={() => toggleYear(yearItem.year)}
                >
                  <span className={`attendance-year-chevron ${isYearExpanded ? 'expanded' : ''}`}>
                    ▶
                  </span>
                  <span className="attendance-year-icon">📅</span>
                  <h3 className="attendance-year-title">Ano {yearItem.year}</h3>
                  <span className="attendance-year-count">
                    {yearItem.days_count} {yearItem.days_count === 1 ? 'dia' : 'dias'} cerrados
                  </span>
                </div>

                {isYearExpanded && (
                  <div className="attendance-months-container">
                    {yearMonths.length === 0 ? (
                      <div className="attendance-loading-inline">
                        <div className="attendance-spinner-small"></div>
                        <span>Cargando meses...</span>
                      </div>
                    ) : (
                      yearMonths.map(monthItem => {
                        const monthKey = `${yearItem.year}-${monthItem.month}`;
                        const isMonthExpanded = expandedMonths[monthKey];
                        const monthDays = daysData[monthKey] || [];

                        return (
                          <div key={monthItem.month} className="attendance-month-item">
                            <div
                              className="attendance-month-header"
                              onClick={() => toggleMonth(yearItem.year, monthItem.month)}
                            >
                              <span className={`attendance-month-chevron ${isMonthExpanded ? 'expanded' : ''}`}>
                                ▶
                              </span>
                              <span className="attendance-month-title">
                                {getMonthName(monthItem.month)}
                              </span>
                              <span className="attendance-month-count">
                                {monthItem.days_count} {monthItem.days_count === 1 ? 'dia' : 'dias'}
                              </span>
                            </div>

                            {isMonthExpanded && (
                              <div className="attendance-days-container">
                                {monthDays.length === 0 ? (
                                  <div className="attendance-loading-inline">
                                    <div className="attendance-spinner-small"></div>
                                    <span>Cargando dias...</span>
                                  </div>
                                ) : (
                                  monthDays.map((dayItem) => {
                                    const dateStr = dayItem.attendance_date.split('T')[0];
                                    const isDayExpanded = expandedDays[dateStr];
                                    const attendances = dayAttendances[dateStr] || [];

                                    return (
                                      <div key={dateStr} className="attendance-day-item">
                                        <div
                                          className="attendance-day-header"
                                          onClick={() => toggleDay(dateStr)}
                                        >
                                          <span className={`attendance-day-chevron ${isDayExpanded ? 'expanded' : ''}`}>
                                            ▶
                                          </span>
                                          <span className="attendance-day-number">
                                            {formatDayNumber(dateStr)}
                                          </span>
                                          <span className="attendance-day-weekday">
                                            {getDayOfWeek(dateStr)}
                                          </span>
                                          <div className="attendance-day-summary">
                                            <span className="attendance-day-stat attendance-day-stat--present">
                                              ✓ {dayItem.presentes || 0}
                                            </span>
                                            <span className="attendance-day-stat attendance-day-stat--absent">
                                              ✗ {dayItem.ausentes || 0}
                                            </span>
                                            <span className="attendance-day-stat attendance-day-stat--late">
                                              ⏰ {dayItem.tardanzas || 0}
                                            </span>
                                          </div>
                                          <span className="attendance-day-total">
                                            {dayItem.total_colaboradores} colaboradores
                                          </span>
                                        </div>

                                        {isDayExpanded && (
                                          <div className="attendance-records-list">
                                            {attendances.length === 0 ? (
                                              <div className="attendance-loading-inline">
                                                <div className="attendance-spinner-small"></div>
                                                <span>Cargando asistencias...</span>
                                              </div>
                                            ) : (
                                              attendances.map((record) => (
                                                <div key={record.id} className="attendance-record-item">
                                                  <span className="attendance-record-name">
                                                    {record.full_name}
                                                  </span>
                                                  <span className="attendance-record-role">
                                                    {record.role_name}
                                                  </span>
                                                  <span
                                                    className="attendance-record-status"
                                                    style={getStatusStyle(record.attendance_type)}
                                                  >
                                                    {getStatusLabel(record.attendance_type)}
                                                  </span>
                                                  <span className="attendance-record-time">
                                                    {formatTime(record.check_in_time)} - {formatTime(record.check_out_time)}
                                                  </span>
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
