// src/hooks/usePlanner.js
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useBlocker, useOutletContext } from 'react-router-dom';

// Servicios
import { createSchedule, updateSchedule } from '../services/storageService.js';
import { fetchOfertaAcademica } from '../services/siiauApi.js';
import { saveStateToSession, loadStateFromSession } from '../utils/session.js';

// Helper local para agrupar por NRC con NORMALIZACIÓN para evitar falsos positivos
const groupSessionsByNRC = (classes) => {
    const map = new Map();
    const dayOrder = { 'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3, 'MIÉRCOLES': 3, 'JUEVES': 4, 'VIERNES': 5, 'SABADO': 6, 'SÁBADO': 6, 'DOMINGO': 7 };

    classes.forEach(c => {
        const nrc = String(c.nrc).trim();
        if (!map.has(nrc)) {
            map.set(nrc, {
                nrc,
                materia: (c.materia || c.nombre || '').trim().replace(/\s+/g, ' '),
                clave: (c.clave || '').trim(),
                profesor: (c.profesor || '').trim().replace(/\s+/g, ' '),
                disponibles: parseInt(c.disponibles) || 0,
                sesiones: []
            });
        }
        map.get(nrc).sesiones.push({
            dia: (c.dia || '').trim().toUpperCase(),
            hora_inicio: (c.hora_inicio || '').trim(),
            hora_fin: (c.hora_fin || '').trim(),
            edificio: (c.edificio || '').trim(),
            aula: (c.aula || '').trim()
        });
    });

    const result = Array.from(map.values());
    // Ordenar sesiones por día y hora para comparación estable por JSON.stringify
    result.forEach(item => {
        item.sesiones.sort((a, b) => {
            const d1 = dayOrder[a.dia] || 99;
            const d2 = dayOrder[b.dia] || 99;
            if (d1 !== d2) return d1 - d2;
            return a.hora_inicio.localeCompare(b.hora_inicio);
        });
    });

    return result;
};

export function usePlanner() {
    const { user } = useAuth();
    const { theme } = useOutletContext();
    
    // Estados UI
    const [saving, setSaving] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [conflicts, setConflicts] = useState([]);
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
    const pendingDataRef = useRef(null); // Para guardar los datos nuevos mientras se resuelve el conflicto
    const resultsRef = useRef(null);

    // --- 1. ESTADO INICIAL ---
    const initialState = loadStateFromSession() || {
        materias: [],
        selectedNRCs: [],
        consultaRealizada: false,
        formParams: { centro: '', carrera: '', calendario: '' },
        calendarioLabel: '',
        currentScheduleId: null,
        currentScheduleName: '',
        isViewMode: false
    };

    const [materias, setMaterias] = useState(initialState.materias);
    const [selectedNRCs, setSelectedNRCs] = useState(initialState.selectedNRCs);
    const [consultaRealizada, setConsultaRealizada] = useState(initialState.consultaRealizada);
    const [formParams, setFormParams] = useState(initialState.formParams);
    const [calendarioLabel, setCalendarioLabel] = useState(initialState.calendarioLabel);
    const [isViewMode, setIsViewMode] = useState(initialState.isViewMode);
    
    const [currentScheduleId, setCurrentScheduleId] = useState(initialState.currentScheduleId);
    const [currentScheduleName, setCurrentScheduleName] = useState(initialState.currentScheduleName);

    // --- 2. DETECCIÓN DE CAMBIOS (DIRTY STATE) ---
    const lastSavedSnapshot = useRef(JSON.stringify({
        selectedNRCs: initialState.selectedNRCs,
        id: initialState.currentScheduleId
    }));

    const isDirty = useMemo(() => {
        const currentSnapshot = JSON.stringify({
            selectedNRCs,
            id: currentScheduleId
        });
        if (!currentScheduleId && selectedNRCs.length > 0) return true;
        if (currentScheduleId && currentSnapshot !== lastSavedSnapshot.current) return true;
        return false;
    }, [selectedNRCs, currentScheduleId]);

    const isDirtyRef = useRef(isDirty);
    useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);

    // --- 3. EFECTOS ---
    useEffect(() => {
        const stateToSave = { 
            materias, selectedNRCs, consultaRealizada, formParams, calendarioLabel, theme,
            currentScheduleId, currentScheduleName, isViewMode 
        };
        saveStateToSession(stateToSave);
    }, [materias, selectedNRCs, consultaRealizada, formParams, calendarioLabel, theme, currentScheduleId, currentScheduleName, isViewMode]);

    useEffect(() => {
        return () => {
            if (!isDirtyRef.current) {
                sessionStorage.removeItem('plannerState');
            }
        };
    }, []);

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname
    );

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

    // --- 4. HANDLERS ---
    const handleSaveCloud = async () => {
        if (!user) return alert("Debes iniciar sesión para guardar.");
        
        const selectedClasses = materias.filter(m => selectedNRCs.includes(m.nrc));
        
        const scheduleData = { 
            materias: selectedClasses, 
            selectedNRCs, 
            formParams, 
            calendarioLabel 
        };
        
        setSaving(true);
        try {
            if (currentScheduleId) {
                try {
                    await updateSchedule(user.uid, currentScheduleId, scheduleData);
                    alert(`¡"${currentScheduleName}" actualizado correctamente!`);
                } catch (updateErr) {
                    // Verificamos si es un error de "not-found" (documento borrado en SIIAU o Firestore)
                    if (updateErr.code === 'not-found' || updateErr.message?.includes('not found')) {
                        const createNew = window.confirm("Este horario ya no existe en la nube (posiblemente fue eliminado). ¿Deseas guardarlo como un horario nuevo?");
                        if (createNew) {
                            setCurrentScheduleId(null);
                            setCurrentScheduleName('');
                            setSaving(false);
                            // Llamada recursiva para guardar como nuevo
                            return handleSaveCloud();
                        } else {
                            // Limpiar rastro de ID huérfano
                            setCurrentScheduleId(null);
                            setCurrentScheduleName('');
                            sessionStorage.removeItem('plannerState');
                        }
                    } else {
                        throw updateErr;
                    }
                }
            } else {
                const name = prompt("Nombre para tu nuevo horario:", "Mi Horario");
                if (!name) { setSaving(false); return; }
                const newId = await createSchedule(user.uid, scheduleData, name);
                setCurrentScheduleId(newId);
                setCurrentScheduleName(name);
                alert("¡Horario creado exitosamente!");
            }
            setTimeout(() => {
                 lastSavedSnapshot.current = JSON.stringify({ selectedNRCs, id: currentScheduleId }); 
            }, 0);
            if (blocker.state === "blocked") blocker.proceed();
        } catch (error) {
            console.error(error);
            alert("Error al guardar: " + (error.message || "Error desconocido"));
        } finally {
            setSaving(false);
        }
    };

    const handleDiscardNavigation = () => {
        if (blocker.state === "blocked") {
            sessionStorage.removeItem('plannerState'); 
            blocker.proceed();
        }
    };

    const handleCancelNavigation = () => {
        if (blocker.state === "blocked") blocker.reset();
    };

    const handleTriggerReset = () => {
        if (selectedNRCs.length === 0) {
            handleConfirmReset();
        } else {
            setIsResetModalOpen(true);
        }
    };

    const handleConfirmReset = () => {
        setMaterias([]);
        setSelectedNRCs([]);
        setConsultaRealizada(false);
        setCalendarioLabel('');
        setError(null);
        setCurrentScheduleId(null);
        setCurrentScheduleName('');
        setIsViewMode(false);
        setIsResetModalOpen(false);
        sessionStorage.removeItem('plannerState');
        lastSavedSnapshot.current = JSON.stringify({ selectedNRCs: [], id: null });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleConsulta = useCallback(async (params, calLabel) => {
        setFormParams(params);
        setCalendarioLabel(calLabel);
        setLoading(true);
        setError(null);
        
        try {
            const apiParams = { cup: params.centro, majrp: params.carrera, ciclop: params.calendario };
            const newData = await fetchOfertaAcademica(apiParams);
            if (!newData || newData.length === 0) throw new Error("Sin resultados.");

            // --- CONTROL DE INTEGRIDAD AVANZADO ---
            const oldGrouped = groupSessionsByNRC(materias.filter(m => selectedNRCs.includes(m.nrc)));
            const newGrouped = groupSessionsByNRC(newData);
            const foundConflicts = [];

            if (oldGrouped.length > 0) {
                oldGrouped.forEach(oldNRC => {
                    const freshNRC = newGrouped.find(c => c.nrc === oldNRC.nrc);
                    
                    if (freshNRC) {
                        const deltas = [];
                        if (freshNRC.profesor !== oldNRC.profesor) deltas.push('profesor');
                        if (freshNRC.disponibles !== oldNRC.disponibles) deltas.push('cupos');
                        if (JSON.stringify(freshNRC.sesiones) !== JSON.stringify(oldNRC.sesiones)) deltas.push('horario');

                        if (deltas.length > 0) {
                            foundConflicts.push({ 
                                nrc: oldNRC.nrc,
                                materia: oldNRC.materia,
                                old: oldNRC, 
                                fresh: freshNRC,
                                deltas 
                            });
                        }
                    } else {
                        foundConflicts.push({ 
                            nrc: oldNRC.nrc,
                            materia: oldNRC.materia,
                            old: oldNRC, 
                            fresh: null, 
                            removed: true 
                        });
                    }
                });
            }

            if (foundConflicts.length > 0) {
                setConflicts(foundConflicts);
                setIsConflictModalOpen(true);
                pendingDataRef.current = { newData, params, calLabel };
                setLoading(false);
                return;
            }

            // Si no hay conflictos, procedemos normalmente
            // MEJORA: Mantener en materias las que ya están seleccionadas (pool persistente)
            const otherSelected = materias.filter(m => selectedNRCs.includes(m.nrc) && !newData.some(n => n.nrc === m.nrc));
            setMaterias([...newData, ...otherSelected]);
            
            setConsultaRealizada(true);
            setCurrentScheduleId(prev => (params.centro === formParams.centro && params.carrera === formParams.carrera) ? prev : null);
            if (!currentScheduleId) setCurrentScheduleName('');
            setIsViewMode(false);
            if (window.innerWidth < 1024) setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

        } catch (err) {
            setError(err.message);
            setConsultaRealizada(false);
            setMaterias([]);
        } finally {
            setLoading(false);
        }
    }, [materias, selectedNRCs, formParams, currentScheduleId]);

    const resolveConflicts = (action) => {
        if (!pendingDataRef.current) return;
        const { newData } = pendingDataRef.current;

        // 1. Obtener todas las materias actualmente seleccionadas (formato plano original)
        const selectedFlat = materias.filter(m => selectedNRCs.includes(m.nrc));
        
        // 2. Identificar los NRCs en conflicto
        const conflictedNRCs = conflicts.map(c => String(c.nrc));

        if (action === 'sync') {
            // Acción: Sincronizar (Usar datos nuevos del SIIAU)
            const removedNRCs = conflicts.filter(c => c.removed).map(c => String(c.nrc));
            
            // Mantener seleccionados que no están en esta búsqueda y NO fueron marcados como borrados
            const syncFilteredSelected = selectedFlat.filter(oldCls => 
                !newData.some(newCls => String(newCls.nrc) === String(oldCls.nrc)) && 
                !removedNRCs.includes(String(oldCls.nrc))
            );
            
            // Si hubo materias borradas en SIIAU, las quitamos de la selección actual
            if (removedNRCs.length > 0) {
                setSelectedNRCs(prev => prev.filter(n => !removedNRCs.includes(String(n))));
            }

            setMaterias([...newData, ...syncFilteredSelected]);
            alert("Información sincronizada con el SIIAU.");
        } else {
            // Acción: Mantener (Usar datos viejos que teníamos guardados)
            const keptOldEntries = selectedFlat.filter(m => conflictedNRCs.includes(String(m.nrc)));
            
            // Del newData de la búsqueda, filtramos los NRCs que vamos a sobreescribir con los viejos
            const freshNonConflicted = newData.filter(c => !conflictedNRCs.includes(String(c.nrc)));
            
            // Mantener otras materias seleccionadas de búsquedas anteriores
            const otherSelected = selectedFlat.filter(oldCls => 
                !conflictedNRCs.includes(String(oldCls.nrc)) && 
                !newData.some(newCls => String(newCls.nrc) === String(oldCls.nrc))
            );

            setMaterias([...freshNonConflicted, ...keptOldEntries, ...otherSelected]);
            alert("Se han mantenido los datos previos.");
        }

        setConsultaRealizada(true);
        setIsViewMode(false);
        setIsConflictModalOpen(false);
        setConflicts([]);
        pendingDataRef.current = null;
    };

    const handleRemoveNrc = useCallback((nrcToRemove) => {
        setSelectedNRCs(prev => prev.filter(nrc => nrc !== nrcToRemove));
    }, []);

    const clasesSeleccionadas = useMemo(() => materias.filter(m => selectedNRCs.includes(m.nrc)), [materias, selectedNRCs]);

    return {
        user, theme, saving, isResetModalOpen, setIsResetModalOpen, loading, error, resultsRef,
        materias, selectedNRCs, setSelectedNRCs, consultaRealizada, formParams, calendarioLabel,
        currentScheduleId, setCurrentScheduleId, currentScheduleName, setCurrentScheduleName,
        isViewMode, setIsViewMode,
        conflicts, isConflictModalOpen, setIsConflictModalOpen, resolveConflicts,
        isDirty, blocker,
        handleSaveCloud, handleDiscardNavigation, handleCancelNavigation, handleTriggerReset, handleConfirmReset,
        handleConsulta, handleRemoveNrc, clasesSeleccionadas
    };
}
