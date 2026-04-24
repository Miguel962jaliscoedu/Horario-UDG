// src/pages/PlannerPage.jsx
import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

// Hooks
import { usePlanner } from '../hooks/usePlanner';

// Componentes UI
import { ConsultaForm } from '../components/ConsultaForm.jsx';
import { SeleccionMaterias } from '../components/SeleccionMaterias.jsx';
import { GenerarHorario } from '../components/GenerarHorario.jsx';

import './PlannerPage.css';

export function PlannerPage() {
    const navigate = useNavigate();
    const {
        user, theme, saving, isResetModalOpen, setIsResetModalOpen, loading, error, resultsRef,
        materias, selectedNRCs, setSelectedNRCs, consultaRealizada, formParams, calendarioLabel,
        currentScheduleId, setCurrentScheduleId, currentScheduleName,
        isViewMode, setIsViewMode,
        conflicts, isConflictModalOpen, setIsConflictModalOpen, resolveConflicts,
        isDirty, blocker,
        handleSaveCloud, handleDiscardNavigation, handleCancelNavigation, handleTriggerReset, handleConfirmReset,
        handleConsulta, handleRemoveNrc, clasesSeleccionadas
    } = usePlanner();

    // --- RENDER ---
    return (
        <div className="planner-layout animate-fade-in">
            {user && (
                <div className="planner-header-bar">
                    <h2 className="planner-page-title">Planificador de Horarios</h2>
                    <button 
                        className="my-schedules-btn"
                        onClick={() => navigate('/mis-horarios')}
                    >
                        📂 Mis Horarios
                    </button>
                </div>
            )}
            
            {/* Sidebar */}
            <aside className="layout-sidebar">
                <div className="card sticky-card">
                    {isViewMode ? (
                        <div className="view-mode-panel">
                            <h2 className="panel-title">Modo Vista</h2>
                            <p className="view-mode-desc">Estás visualizando un horario guardado.</p>
                            <button
                                className="primary-button btn-edit-mode"
                                onClick={() => setIsViewMode(false)}
                            >
                                ✏️ Editar Horario
                            </button>
                            <button className="secondary-button btn-new-query mt-2" onClick={handleTriggerReset}>
                                🔄 Nueva Consulta
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="panel-title">Filtros de Búsqueda</h2>
                            <ConsultaForm onConsultar={handleConsulta} loading={loading} initialParams={formParams} />
                            {error && <div className="alert alert-error"><h4>Error</h4><p>{error}</p></div>}

                            {consultaRealizada && (
                                <button className="btn-new-query" onClick={handleTriggerReset} title="Reiniciar">
                                    <span>🔄</span> Iniciar Nueva Consulta
                                </button>
                            )}
                        </>
                    )}
                </div>
            </aside>

            {/* Content */}
            <section className="layout-content" ref={resultsRef}>
                {!consultaRealizada ? (
                    <div className="empty-state">
                        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <p className="empty-title">Planificador Académico</p>
                        <p className="empty-subtitle">Configura los filtros para armar tu horario.</p>
                        
                        {!user ? (
                            <p className="login-prompt">
                                <button className="login-link-btn" onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}>
                                    Inicia sesión
                                </button>{' '}
                                para guardar tus horarios.
                            </p>
                        ) : (
                            <button className="secondary-button mt-4" onClick={() => navigate('/mis-horarios')}>
                                📂 Ver Mis Horarios
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="content-stack">
                        {!isViewMode && (
                            <div className="card panel">
                                <div className="panel-header">
                                    <h2 className="panel-title">Oferta Académica</h2>
                                    <span className="section-tag">{materias.length} Resultados</span>
                                </div>
                                <SeleccionMaterias materias={materias} selectedNRCs={selectedNRCs} onSelectionChange={setSelectedNRCs} />
                            </div>
                        )}

                        {selectedNRCs.length > 0 && (
                            <div className="card panel animate-slide-up">
                                <div className="panel-header schedule-header">
                                    <div className="schedule-title-group">
                                        <h2 className="panel-title">Tu Horario</h2>
                                        {currentScheduleName && <span className="schedule-name-tag">{currentScheduleName}</span>}
                                        {isDirty && <span className="unsaved-badge" title="Cambios sin guardar">●</span>}
                                    </div>

                                    {user && (
                                        <div className="schedule-actions">
                                            {currentScheduleId && (
                                                <button
                                                    onClick={() => { setCurrentScheduleId(null); handleSaveCloud(); }}
                                                    className="secondary-button btn-small"
                                                    disabled={saving}
                                                >
                                                    Duplicar
                                                </button>
                                            )}
                                            <button
                                                onClick={handleSaveCloud}
                                                disabled={saving}
                                                className="primary-button btn-small"
                                            >
                                                {saving ? '...' : (currentScheduleId ? '💾 Actualizar' : '💾 Guardar')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <GenerarHorario
                                    clasesSeleccionadas={clasesSeleccionadas}
                                    calendarioLabel={calendarioLabel}
                                    theme={theme}
                                    onRemoveClase={handleRemoveNrc}
                                />
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Modal Reset */}
            {isResetModalOpen && createPortal(
                <div className="modal-overlay" onClick={() => setIsResetModalOpen(false)}>
                    <div className="modal-content animate-scale-up modal-reset" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">¿Iniciar nueva consulta?</h2>
                        {!user ? (
                            <>
                                <p className="modal-warning-text">⚠️ <strong>No has iniciado sesión.</strong></p>
                                <p>Si continúas, <strong>perderás el horario actual</strong>.</p>
                                <div className="modal-actions vertical">
                                    <button className="primary-button" onClick={() => setIsResetModalOpen(false)}>Cancelar</button>
                                    <button className="secondary-button btn-danger-solid" onClick={handleConfirmReset}>Descartar</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p>Se limpiará la búsqueda actual. Los cambios no guardados se perderán.</p>
                                <div className="modal-actions">
                                    <button className="secondary-button" onClick={() => setIsResetModalOpen(false)}>Cancelar</button>
                                    <button className="primary-button" onClick={handleConfirmReset}>Aceptar</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* Modal de Resolución de Conflictos */}
            {isConflictModalOpen && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content animate-scale-up modal-conflict-resolution">
                        <h2 className="modal-title">Sincronización de Datos</h2>
                        <p>Se detectaron cambios en la oferta académica del SIIAU para las materias de tu horario actual:</p>

                        <div className="conflicts-list">
                            {conflicts.map((conflict, idx) => (
                                <div key={idx} className={`conflict-item ${conflict.removed ? 'item-removed' : ''}`}>
                                    <div className="conflict-nrc-header">
                                        <span className="nrc-badge">{conflict.nrc}</span>
                                        <strong>{conflict.materia}</strong>
                                        {conflict.deltas && (
                                            <div className="delta-tags">
                                                {conflict.deltas.map(d => <span key={d} className={`delta-tag tag-${d}`}>{d === 'horario' ? 'horario/aula' : d}</span>)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="conflict-comparison">
                                        {/* LADO IZQUIERDO: ANTES */}
                                        <div className="comparison-side old">
                                            <span className="side-label">Dato Guardado:</span>
                                            <div className="side-info">
                                                <div className="info-row">
                                                    <span className="info-icon">👤</span> {conflict.old.profesor || 'Sin profesor'}
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-icon">👥</span> {conflict.old.disponibles} cupos
                                                </div>
                                                <div className="info-sessions-detailed">
                                                    {conflict.old.sesiones.map((s, i) => (
                                                        <div key={i} className="session-detail-card">
                                                            <div className="sd-time">📅 {s.dia} {s.hora_inicio}-{s.hora_fin}</div>
                                                            <div className="sd-location">📍 {s.edificio} - {s.aula}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="comparison-arrow">➡️</div>

                                        {/* LADO DERECHO: AHORA */}
                                        <div className="comparison-side fresh">
                                            <span className="side-label">Actual en SIIAU:</span>
                                            {conflict.removed ? (
                                                <div className="side-info info-removed">
                                                    <div className="removal-msg">ESTA MATERIA YA NO FIGURA EN LA OFERTA</div>
                                                </div>
                                            ) : (
                                                <div className="side-info">
                                                    <div className={`info-row ${conflict.deltas.includes('profesor') ? 'highlight-delta' : ''}`}>
                                                        <span className="info-icon">👤</span> {conflict.fresh.profesor || 'Sin profesor'}
                                                    </div>
                                                    <div className={`info-row ${conflict.deltas.includes('cupos') ? 'highlight-delta' : ''}`}>
                                                        <span className="info-icon">👥</span> {conflict.fresh.disponibles} cupos
                                                    </div>
                                                    <div className={`info-sessions-detailed ${conflict.deltas.includes('horario') ? 'highlight-delta' : ''}`}>
                                                        {conflict.fresh.sesiones.map((s, i) => (
                                                            <div key={i} className="session-detail-card">
                                                                <div className="sd-time">📅 {s.dia} {s.hora_inicio}-{s.hora_fin}</div>
                                                                <div className="sd-location">📍 {s.edificio} - {s.aula}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions vertical">
                            <button className="primary-button" onClick={() => resolveConflicts('sync')}>
                                Sincronizar con SIIAU (Recomendado)
                            </button>
                            <button className="secondary-button" onClick={() => resolveConflicts('keep')}>
                                Mantener mis datos actuales
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal Block Navigation */}
            {blocker.state === "blocked" && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content animate-scale-up modal-reset">
                        <h2 className="modal-title">¿Tienes cambios sin guardar?</h2>
                        <p>Estás intentando salir, pero tienes modificaciones sin guardar.</p>
                        <div className="modal-actions vertical">
                            <button className="primary-button" onClick={handleSaveCloud} disabled={saving}>
                                {saving ? 'Guardando...' : '💾 Guardar y Salir'}
                            </button>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', width: '100%' }}>
                                <button className="secondary-button" onClick={handleCancelNavigation} style={{ flex: 1 }}>Seguir Editando</button>
                                <button className="secondary-button btn-danger-solid" onClick={handleDiscardNavigation} style={{ flex: 1 }}>Descartar</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}