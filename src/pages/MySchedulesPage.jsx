// src/pages/MySchedulesPage.jsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserSchedules, deleteSchedule } from '../services/storageService';
import { saveStateToSession, clearSession } from '../utils/session';
import './MySchedulesPage.css';

export function MySchedulesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [expandedScheduleId, setExpandedScheduleId] = useState(null);

    useEffect(() => {
        if (user) loadSchedules();
    }, [user]);

    const loadSchedules = async () => {
        setLoading(true);
        const data = await getUserSchedules(user.uid);
        data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setSchedules(data);
        setLoading(false);
    };

    const handleCreateNew = () => {
        clearSession();
        navigate('/planear');
    };

    const handleLoadSchedule = (schedule) => {
        const stateToLoad = {
            materias: schedule.materias || [],
            selectedNRCs: schedule.selectedNRCs || [],
            formParams: schedule.formParams || {},
            calendarioLabel: schedule.calendarioLabel || '',
            consultaRealizada: true,
            currentScheduleId: schedule.id,
            currentScheduleName: schedule.name
        };
        saveStateToSession(stateToLoad);
        navigate('/planear');
    };

    const toggleExpand = (e, id) => {
        e.stopPropagation();
        setExpandedScheduleId(prev => prev === id ? null : id);
    };

    const openDeleteModal = (e, id) => {
        e.stopPropagation();
        setScheduleToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!scheduleToDelete) return;
        setIsDeleting(true);
        try {
            await deleteSchedule(user.uid, scheduleToDelete);
            await loadSchedules();
            setIsDeleteModalOpen(false);
            setScheduleToDelete(null);
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Hubo un error al eliminar el horario.");
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-MX', { 
            day: 'numeric', month: 'short', year: 'numeric' 
        }).format(date);
    };

    return (
        <div className="schedules-page animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Mis Horarios</h1>
                    <p className="page-subtitle">Gestiona y recupera tus planificaciones guardadas.</p>
                </div>
                <button onClick={handleCreateNew} className="primary-button btn-new">
                    <span>+</span> Nuevo Horario
                </button>
            </header>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Cargando tus horarios...</p>
                </div>
            ) : schedules.length === 0 ? (
                <div className="empty-state-schedules">
                    <div className="empty-icon">📅</div>
                    <h3>No tienes horarios guardados</h3>
                    <p>Crea tu primer horario y guárdalo en la nube para verlo aquí.</p>
                    <button onClick={handleCreateNew} className="secondary-button mt-4">
                        Comenzar ahora
                    </button>
                </div>
            ) : (
                <div className="schedules-grid">
                    {schedules.map(sch => {
                        const isExpanded = expandedScheduleId === sch.id;
                        
                        // 1. Obtener todas las filas de materias seleccionadas
                        const rawSubjects = (sch.materias || []).filter(m => 
                            (sch.selectedNRCs || []).includes(m.nrc)
                        );

                        // 2. FILTRAR DUPLICADOS por NRC para el conteo y visualización
                        const uniqueSubjects = rawSubjects.filter((obj, index, self) =>
                            index === self.findIndex((t) => (
                                t.nrc === obj.nrc
                            ))
                        );

                        return (
                            <div 
                                key={sch.id} 
                                className={`schedule-card ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => handleLoadSchedule(sch)}
                            >
                                <div className="card-top-bar"></div>
                                
                                <div className="card-content">
                                    <div className="card-header-row">
                                        <h3 className="schedule-name" title={sch.name}>{sch.name}</h3>
                                        <button 
                                            onClick={(e) => openDeleteModal(e, sch.id)} 
                                            className="btn-delete"
                                            title="Eliminar horario"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    <div className="schedule-meta">
                                        {sch.calendarioLabel && (
                                            <span className="meta-badge cycle-badge">
                                                {sch.calendarioLabel.split(' - ')[0]}
                                            </span>
                                        )}
                                        {/* Usamos el length de uniqueSubjects */}
                                        <span className="meta-badge subjects-badge">
                                            {uniqueSubjects.length} Materias
                                        </span>
                                    </div>

                                    {sch.formParams?.carrera && (
                                        <p className="career-text">
                                            {sch.formParams.carrera}
                                        </p>
                                    )}

                                    {/* --- LISTA DE MATERIAS (Únicas) --- */}
                                    <div className={`subjects-list-container ${isExpanded ? 'open' : ''}`}>
                                        <div className="subjects-divider"></div>
                                        <ul className="mini-subjects-list">
                                            {uniqueSubjects.map(subj => (
                                                <li key={subj.nrc} className="mini-subject-item">
                                                    <span className="mini-subject-nrc">{subj.nrc}</span>
                                                    <span className="mini-subject-name">{subj.materia}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="card-footer">
                                        <button 
                                            className="btn-toggle-details"
                                            onClick={(e) => toggleExpand(e, sch.id)}
                                        >
                                            {isExpanded ? 'Ocultar materias ▲' : 'Ver materias ▼'}
                                        </button>

                                        <span className="last-update">
                                            {formatDate(sch.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isDeleteModalOpen && createPortal(
                <div className="modal-overlay" onClick={() => !isDeleting && setIsDeleteModalOpen(false)}>
                    <div className="modal-content animate-scale-up modal-delete" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">¿Eliminar horario?</h2>
                        <p>
                            Estás a punto de eliminar este horario permanentemente. 
                            <strong> Esta acción no se puede deshacer.</strong>
                        </p>
                        
                        <div className="modal-actions">
                            <button 
                                className="secondary-button" 
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="primary-button btn-danger-solid" 
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}