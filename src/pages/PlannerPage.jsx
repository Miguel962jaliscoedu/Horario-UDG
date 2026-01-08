// src/pages/PlannerPage.jsx
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useBlocker, useOutletContext } from 'react-router-dom';

// Servicios
import { createSchedule, updateSchedule } from '../services/storageService.js';
import { fetchOfertaAcademica } from '../services/siiauApi.js';
import { saveStateToSession, loadStateFromSession } from '../utils/session.js';

// Componentes UI
import { ConsultaForm } from '../components/ConsultaForm.jsx';
import { SeleccionMaterias } from '../components/SeleccionMaterias.jsx';
import { GenerarHorario } from '../components/GenerarHorario.jsx';

import './PlannerPage.css'; 

export function PlannerPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { theme } = useOutletContext(); 
    
    // Estados UI
    const [saving, setSaving] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const resultsRef = useRef(null);

    // --- 1. ESTADO INICIAL ---
    // Solo carga datos si existen en sessionStorage (viniendo de "Mis Horarios").
    // Si no hay sesión, inicia VACÍO (evita carga automática de la nube).
    const initialState = loadStateFromSession() || {
        materias: [],
        selectedNRCs: [],
        consultaRealizada: false,
        formParams: { centro: '', carrera: '', calendario: '' },
        calendarioLabel: '',
        currentScheduleId: null,
        currentScheduleName: ''
    };

    const [materias, setMaterias] = useState(initialState.materias);
    const [selectedNRCs, setSelectedNRCs] = useState(initialState.selectedNRCs);
    const [consultaRealizada, setConsultaRealizada] = useState(initialState.consultaRealizada);
    const [formParams, setFormParams] = useState(initialState.formParams);
    const [calendarioLabel, setCalendarioLabel] = useState(initialState.calendarioLabel);
    
    const [currentScheduleId, setCurrentScheduleId] = useState(initialState.currentScheduleId);
    const [currentScheduleName, setCurrentScheduleName] = useState(initialState.currentScheduleName);

    // --- 2. DETECCIÓN DE CAMBIOS (DIRTY STATE) ---
    
    // Snapshot: Guarda el estado "limpio" inicial
    const lastSavedSnapshot = useRef(JSON.stringify({
        selectedNRCs: initialState.selectedNRCs,
        id: initialState.currentScheduleId
    }));

    const isDirty = useMemo(() => {
        const currentSnapshot = JSON.stringify({
            selectedNRCs,
            id: currentScheduleId
        });

        // Si es nuevo y tiene materias, está sucio
        if (!currentScheduleId && selectedNRCs.length > 0) return true;
        // Si es existente y cambió respecto al snapshot, está sucio
        if (currentScheduleId && currentSnapshot !== lastSavedSnapshot.current) return true;

        return false;
    }, [selectedNRCs, currentScheduleId]);

    // Ref para el cleanup (necesario para acceder al valor dentro de return de useEffect)
    const isDirtyRef = useRef(isDirty);
    useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);

    // --- 3. EFECTOS ---

    // Guardado automático en SessionStorage (solo para persistencia al recargar F5)
    useEffect(() => {
        const stateToSave = { 
            materias, selectedNRCs, consultaRealizada, formParams, calendarioLabel, theme,
            currentScheduleId, currentScheduleName 
        };
        saveStateToSession(stateToSave);
    }, [materias, selectedNRCs, consultaRealizada, formParams, calendarioLabel, theme, currentScheduleId, currentScheduleName]);

    // Limpieza al desmontar: Si salimos "limpios", borramos la sesión para no dejar basura
    useEffect(() => {
        return () => {
            if (!isDirtyRef.current) {
                sessionStorage.removeItem('plannerState');
            }
        };
    }, []);

    // Bloqueo de navegación (React Router)
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname
    );

    // Bloqueo de navegador (Cerrar pestaña)
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; 
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // --- 4. HANDLERS DE ACCIÓN ---

    // GUARDAR EN NUBE
    const handleSaveCloud = async () => {
        if (!user) return alert("Debes iniciar sesión para guardar.");
        
        const scheduleData = { materias, selectedNRCs, formParams, calendarioLabel };
        setSaving(true);
        
        try {
            if (currentScheduleId) {
                await updateSchedule(user.uid, currentScheduleId, scheduleData);
                alert(`¡"${currentScheduleName}" actualizado correctamente!`);
            } else {
                const name = prompt("Nombre para tu nuevo horario:", "Mi Horario");
                if (!name) { setSaving(false); return; }
                const newId = await createSchedule(user.uid, scheduleData, name);
                setCurrentScheduleId(newId);
                setCurrentScheduleName(name);
                alert("¡Horario creado exitosamente!");
            }

            // ACTUALIZAR SNAPSHOT: Ahora el estado actual es el "limpio"
            setTimeout(() => {
                 lastSavedSnapshot.current = JSON.stringify({ 
                     selectedNRCs, 
                     id: currentScheduleId 
                 }); 
            }, 0);

            if (blocker.state === "blocked") blocker.proceed();

        } catch (error) {
            console.error(error);
            alert("Error al guardar.");
        } finally {
            setSaving(false);
        }
    };

    // DESCARTAR AL NAVEGAR (Modal de Bloqueo)
    const handleDiscardNavigation = () => {
        if (blocker.state === "blocked") {
            // AQUÍ LIMPIAMOS MEMORIA EXPLÍCITAMENTE
            sessionStorage.removeItem('plannerState'); 
            blocker.proceed();
        }
    };

    const handleCancelNavigation = () => {
        if (blocker.state === "blocked") blocker.reset();
    };

    // DESCARTAR Y REINICIAR (Modal Interno "Nueva Consulta")
    const handleTriggerReset = () => {
        if (selectedNRCs.length === 0) {
            handleConfirmReset();
        } else {
            setIsResetModalOpen(true);
        }
    };

    const handleConfirmReset = () => {
        // 1. Limpiar estados
        setMaterias([]);
        setSelectedNRCs([]);
        setConsultaRealizada(false);
        setCalendarioLabel('');
        setError(null);
        setCurrentScheduleId(null);
        setCurrentScheduleName('');
        setIsResetModalOpen(false);
        
        // 2. Limpiar Memoria
        sessionStorage.removeItem('plannerState');

        // 3. ACTUALIZAR SNAPSHOT: El estado "vacío" es ahora el estado base
        // Esto evita que el sistema piense que "vacío" es un cambio sin guardar respecto a lo anterior
        lastSavedSnapshot.current = JSON.stringify({ selectedNRCs: [], id: null });
        
        // 4. Scroll arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleConsulta = useCallback(async (params, calLabel) => {
        setFormParams(params);
        setCalendarioLabel(calLabel);
        setLoading(true);
        setError(null);
        setMaterias([]);
        setConsultaRealizada(false);
        setCurrentScheduleId(null);
        setCurrentScheduleName('');

        // Al consultar, reseteamos el snapshot a "vacío" para empezar tracking nuevo
        lastSavedSnapshot.current = JSON.stringify({ selectedNRCs: [], id: null });

        try {
            const apiParams = { cup: params.centro, majrp: params.carrera, ciclop: params.calendario };
            const data = await fetchOfertaAcademica(apiParams);
            if (!data || data.length === 0) throw new Error("Sin resultados.");
            setMaterias(data);
            setConsultaRealizada(true);
            if (window.innerWidth < 1024) setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRemoveNrc = useCallback((nrcToRemove) => {
        setSelectedNRCs(prev => prev.filter(nrc => nrc !== nrcToRemove));
    }, []);

    const clasesSeleccionadas = useMemo(() => materias.filter(m => selectedNRCs.includes(m.nrc)), [materias, selectedNRCs]);

    // --- RENDER ---
    return (
        <div className="planner-layout animate-fade-in">
            {/* Sidebar */}
            <aside className="layout-sidebar">
                <div className="card sticky-card">
                    <h2 className="panel-title">Filtros de Búsqueda</h2>
                    <ConsultaForm onConsultar={handleConsulta} loading={loading} initialParams={formParams} />
                    {error && <div className="alert alert-error"><h4>Error</h4><p>{error}</p></div>}
                    
                    {consultaRealizada && (
                        <button className="btn-new-query" onClick={handleTriggerReset} title="Reiniciar">
                            <span>🔄</span> Iniciar Nueva Consulta
                        </button>
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
                    </div>
                ) : (
                    <div className="content-stack">
                        <div className="card panel">
                            <div className="panel-header">
                                <h2 className="panel-title">Oferta Académica</h2>
                                <span className="section-tag">{materias.length} Resultados</span>
                            </div>
                            <SeleccionMaterias materias={materias} selectedNRCs={selectedNRCs} onSelectionChange={setSelectedNRCs} />
                        </div>

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
                            <div style={{display:'flex', gap:'10px', marginTop:'10px', width:'100%'}}>
                                <button className="secondary-button" onClick={handleCancelNavigation} style={{flex:1}}>Seguir Editando</button>
                                <button className="secondary-button btn-danger-solid" onClick={handleDiscardNavigation} style={{flex:1}}>Descartar</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}