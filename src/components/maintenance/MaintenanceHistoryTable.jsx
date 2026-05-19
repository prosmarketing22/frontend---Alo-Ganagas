import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import '../../styles/components/maintenance.css';

export const MaintenanceHistoryTable = ({ services = [], loading, totalCount = 0 }) => {
  const [expandedId, setExpandedId] = useState(null);

  const formatDate = (date) => {
    try {
      return format(new Date(date), "dd MMM yyyy", { locale: es });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (date) => {
    try {
      return format(new Date(date), "dd MMM yyyy, HH:mm", { locale: es });
    } catch {
      return '-';
    }
  };

  const formatRelative = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
    } catch {
      return '';
    }
  };

  const getResultBadge = (result) => {
    const results = {
      OK: { bg: '#d1fae5', color: '#059669', text: 'OK' },
      PENDIENTE: { bg: '#fef3c7', color: '#d97706', text: 'Pendiente' },
      CON_DEFECTO: { bg: '#fef3c7', color: '#d97706', text: 'Con Defectos' },
      INOPERATIVO: { bg: '#fee2e2', color: '#dc2626', text: 'Inoperativo' },
      NOK: { bg: '#fee2e2', color: '#dc2626', text: 'No OK' }
    };
    const style = results[result] || { bg: '#e5e7eb', color: '#6b7280', text: result || '-' };
    return (
      <span className="maintenance-badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {result === 'OK' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )}
        {(result === 'CON_DEFECTO' || result === 'PENDIENTE') && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
        {(result === 'INOPERATIVO' || result === 'NOK') && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        )}
        {style.text}
      </span>
    );
  };

  const getServiceTypeBadge = (type) => {
    const types = {
      preventivo: { bg: '#d1fae5', color: '#059669', text: 'Preventivo' },
      correctivo: { bg: '#fee2e2', color: '#dc2626', text: 'Correctivo' },
      urgente: { bg: '#fef3c7', color: '#d97706', text: 'Urgente' },
      general: { bg: '#dbeafe', color: '#2563eb', text: 'General' }
    };
    const style = types[type?.toLowerCase()] || { bg: '#e5e7eb', color: '#6b7280', text: type || 'General' };
    return (
      <span className="maintenance-type-badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {style.text}
      </span>
    );
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="maintenance-table-container">
        <div className="maintenance-table-loading">
          <div className="maintenance-loading-spinner"></div>
          <span className="maintenance-loading-text">Cargando historial de servicios...</span>
        </div>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="maintenance-table-container">
        <div className="maintenance-table-empty">
          <div className="maintenance-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              <path d="M9 14l2 2 4-4" />
            </svg>
          </div>
          <p className="maintenance-empty-title">No hay servicios registrados</p>
          <p className="maintenance-empty-text">
            Aun no se han completado servicios de mantenimiento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-table-container">
      <div className="maintenance-table-header">
        <div className="maintenance-table-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          Historial de Servicios Realizados
          <span className="maintenance-table-count">{totalCount}</span>
        </div>
      </div>

      <div className="maintenance-table-wrapper">
        <table className="maintenance-table">
          <thead>
            <tr>
              <th style={{width: '36px'}}></th>
              <th>N° Servicio</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Tecnico</th>
              <th>Resultado</th>
              <th>Duracion</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <>
                <tr
                  key={service.id}
                  onClick={() => toggleExpand(service.id)}
                  style={{ cursor: 'pointer' }}
                  className={expandedId === service.id ? 'mht-row--expanded' : ''}
                >
                  <td>
                    <span className={`mht-expand-icon ${expandedId === service.id ? 'mht-expand-icon--open' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </td>
                  <td>
                    <span className="maintenance-request-number">
                      {service.service_number || '-'}
                    </span>
                  </td>
                  <td>
                    <div className="maintenance-customer">
                      <span className="maintenance-customer-name">
                        {service.customer_name}{service.customer_address ? ` (${service.customer_address}${service.customer_district ? `, ${service.customer_district}` : ''})` : ''}
                      </span>
                      <span className="maintenance-customer-phone">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {service.customer_phone || '-'}
                      </span>
                    </div>
                  </td>
                  <td>{getServiceTypeBadge(service.service_type)}</td>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--color-neutral-700)' }}>
                      {service.technician_name || '-'}
                    </span>
                  </td>
                  <td>{getResultBadge(service.result)}</td>
                  <td>
                    <span style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--font-size-sm)' }}>
                      {formatDuration(service.duration_minutes)}
                    </span>
                  </td>
                  <td>
                    {service.completion_datetime ? (
                      <div className="maintenance-date">
                        <span className="maintenance-date-main">{formatDate(service.completion_datetime)}</span>
                        <span className="maintenance-date-relative">{formatRelative(service.completion_datetime)}</span>
                      </div>
                    ) : service.arrival_datetime ? (
                      <div className="maintenance-date">
                        <span className="maintenance-date-main">{formatDate(service.arrival_datetime)}</span>
                        <span className="maintenance-date-relative" style={{ color: '#d97706' }}>En proceso</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-neutral-400)' }}>-</span>
                    )}
                  </td>
                </tr>

                {expandedId === service.id && (
                  <tr key={`${service.id}-detail`} className="mht-detail-row">
                    <td colSpan={8} style={{ padding: 0 }}>
                      <div className="mht-detail">
                        {/* Tiempos */}
                        <div className="mht-detail__section">
                          <h4 className="mht-detail__section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Tiempos del Servicio
                          </h4>
                          <div className="mht-detail__grid">
                            <div className="mht-detail__item">
                              <span className="mht-detail__label">Llegada</span>
                              <span className="mht-detail__value">{service.arrival_datetime ? formatDateTime(service.arrival_datetime) : '-'}</span>
                            </div>
                            <div className="mht-detail__item">
                              <span className="mht-detail__label">Salida</span>
                              <span className="mht-detail__value">{service.departure_datetime ? formatDateTime(service.departure_datetime) : '-'}</span>
                            </div>
                            <div className="mht-detail__item">
                              <span className="mht-detail__label">Completado</span>
                              <span className="mht-detail__value">{service.completion_datetime ? formatDateTime(service.completion_datetime) : '-'}</span>
                            </div>
                            <div className="mht-detail__item">
                              <span className="mht-detail__label">Duracion</span>
                              <span className="mht-detail__value">{formatDuration(service.duration_minutes)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Trabajo realizado */}
                        <div className="mht-detail__section">
                          <h4 className="mht-detail__section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                            Detalle del Servicio
                          </h4>
                          <div className="mht-detail__texts">
                            {service.work_description && (
                              <div className="mht-detail__text-block">
                                <span className="mht-detail__text-label">Descripcion del trabajo</span>
                                <p className="mht-detail__text-content">{service.work_description}</p>
                              </div>
                            )}
                            {service.findings && (
                              <div className="mht-detail__text-block">
                                <span className="mht-detail__text-label">Hallazgos</span>
                                <p className="mht-detail__text-content">{service.findings}</p>
                              </div>
                            )}
                            {service.actions_taken && (
                              <div className="mht-detail__text-block">
                                <span className="mht-detail__text-label">Acciones realizadas</span>
                                <p className="mht-detail__text-content">{service.actions_taken}</p>
                              </div>
                            )}
                            {service.recommendations && (
                              <div className="mht-detail__text-block">
                                <span className="mht-detail__text-label">Recomendaciones</span>
                                <p className="mht-detail__text-content">{service.recommendations}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Equipos y partes */}
                        {(service.equipment_checked?.length > 0 || service.parts_replaced?.length > 0) && (
                          <div className="mht-detail__section">
                            <h4 className="mht-detail__section-title">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                              </svg>
                              Equipos y Partes
                            </h4>
                            <div className="mht-detail__grid">
                              {service.equipment_checked?.length > 0 && (
                                <div className="mht-detail__item mht-detail__item--full">
                                  <span className="mht-detail__label">Equipos revisados</span>
                                  <div className="mht-detail__tags">
                                    {(typeof service.equipment_checked === 'string'
                                      ? JSON.parse(service.equipment_checked)
                                      : service.equipment_checked
                                    ).map((item, i) => (
                                      <span key={i} className="mht-detail__tag">{typeof item === 'string' ? item : item.name || JSON.stringify(item)}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {service.parts_replaced?.length > 0 && (
                                <div className="mht-detail__item mht-detail__item--full">
                                  <span className="mht-detail__label">Partes reemplazadas</span>
                                  <div className="mht-detail__tags">
                                    {(typeof service.parts_replaced === 'string'
                                      ? JSON.parse(service.parts_replaced)
                                      : service.parts_replaced
                                    ).map((item, i) => (
                                      <span key={i} className="mht-detail__tag mht-detail__tag--warning">{typeof item === 'string' ? item : item.name || JSON.stringify(item)}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Costos y seguimiento */}
                        <div className="mht-detail__section">
                          <h4 className="mht-detail__section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                              <line x1="12" y1="1" x2="12" y2="23" />
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            Costos y Seguimiento
                          </h4>
                          <div className="mht-detail__grid">
                            <div className="mht-detail__item">
                              <span className="mht-detail__label">Mano de obra</span>
                              <span className="mht-detail__value">S/ {parseFloat(service.labor_cost || 0).toFixed(2)}</span>
                            </div>
                            <div className="mht-detail__item">
                              <span className="mht-detail__label">Partes</span>
                              <span className="mht-detail__value">S/ {parseFloat(service.parts_cost || 0).toFixed(2)}</span>
                            </div>
                            <div className="mht-detail__item">
                              <span className="mht-detail__label">Total</span>
                              <span className="mht-detail__value" style={{ fontWeight: 700, color: 'var(--color-neutral-800)' }}>
                                S/ {parseFloat(service.total_cost || 0).toFixed(2)}
                              </span>
                            </div>
                            {service.is_warranty && (
                              <div className="mht-detail__item">
                                <span className="mht-detail__label">Garantia</span>
                                <span className="maintenance-badge" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                                  En garantia
                                </span>
                              </div>
                            )}
                            <div className="mht-detail__item">
                              <span className="mht-detail__label">Seguimiento</span>
                              {service.follow_up_required ? (
                                <span className="maintenance-badge" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                  </svg>
                                  Requiere seguimiento
                                </span>
                              ) : (
                                <span style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>No requerido</span>
                              )}
                            </div>
                            {service.follow_up_notes && (
                              <div className="mht-detail__item mht-detail__item--full">
                                <span className="mht-detail__label">Notas de seguimiento</span>
                                <span className="mht-detail__value">{service.follow_up_notes}</span>
                              </div>
                            )}
                            {service.next_maintenance_date && (
                              <div className="mht-detail__item">
                                <span className="mht-detail__label">Proximo mantenimiento</span>
                                <span className="mht-detail__value" style={{ color: '#2563eb', fontWeight: 600 }}>
                                  {formatDate(service.next_maintenance_date)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .mht-row--expanded {
          background: rgba(30, 140, 255, 0.04) !important;
        }

        .mht-expand-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          color: var(--color-neutral-400);
          transition: all 0.2s ease;
        }

        .mht-expand-icon--open {
          transform: rotate(90deg);
          color: var(--color-primary);
        }

        .mht-detail-row td {
          background: #f8fafc;
        }

        .mht-detail {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-top: 1px solid var(--color-neutral-200);
          border-bottom: 2px solid var(--color-primary);
          animation: mhtSlideDown 0.25s ease-out;
        }

        @keyframes mhtSlideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 1000px; }
        }

        .mht-detail__section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mht-detail__section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-neutral-700);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--color-neutral-200);
        }

        .mht-detail__section-title svg {
          color: var(--color-primary);
        }

        .mht-detail__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .mht-detail__item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid var(--color-neutral-200);
        }

        .mht-detail__item--full {
          grid-column: 1 / -1;
        }

        .mht-detail__label {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-neutral-500);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .mht-detail__value {
          font-size: 14px;
          color: var(--color-neutral-700);
          line-height: 1.4;
        }

        .mht-detail__texts {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mht-detail__text-block {
          padding: 12px 14px;
          background: white;
          border-radius: 8px;
          border: 1px solid var(--color-neutral-200);
          border-left: 3px solid var(--color-primary);
        }

        .mht-detail__text-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-neutral-500);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 6px;
        }

        .mht-detail__text-content {
          margin: 0;
          font-size: 14px;
          color: var(--color-neutral-700);
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .mht-detail__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .mht-detail__tag {
          display: inline-flex;
          padding: 4px 10px;
          background: #dbeafe;
          color: #2563eb;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .mht-detail__tag--warning {
          background: #fef3c7;
          color: #d97706;
        }

        @media (max-width: 768px) {
          .mht-detail__grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .mht-detail {
            padding: 16px;
          }

          .mht-detail__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
