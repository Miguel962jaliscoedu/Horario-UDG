// src/components/SeleccionMaterias.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { detectarCruces, generarMensajeCruces } from '../services/scheduleUtils';
import './SeleccionMaterias.css';

const NrcSelectionModal = ({ materia, nrcsDisponibles, selectedNrc, onNrcChange, onClose }) => {
    const gruposNrc = useMemo(() => {
        const agrupados = new Map();
        nrcsDisponibles.forEach(clase => {
            if (!agrupados.has(clase.nrc)) {
                agrupados.set(clase.nrc, { ...clase, sesiones: [] });
            }
            agrupados.get(clase.nrc).sesiones.push({
                dia: clase.dia, hora_inicio: clase.hora_inicio, hora_fin: clase.hora_fin,
                edificio: clase.edificio, aula: clase.aula
            });
        });
        return Array.from(agrupados.values());
    }, [nrcsDisponibles]);

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{materia.nombre}</h2>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>Clave: {materia.clave}</span>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="nrc-selection-container">
                    <div className="nrc-radio-group">
                        {gruposNrc.map(grupo => (
                            <label key={grupo.nrc} className={`nrc-radio-label ${selectedNrc === grupo.nrc ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name={`nrc-${materia.clave}`}
                                    value={grupo.nrc}
                                    checked={selectedNrc === grupo.nrc}
                                    onChange={() => onNrcChange(materia.clave, grupo.nrc)}
                                />
                                <div className="nrc-radio-content">
                                    <div className="nrc-header-info">
                                        <span className="nrc-badge">{grupo.nrc}</span>
                                        <span className={`cupos-badge ${grupo.disponibles > 0 ? 'available' : 'full'}`}>
                                            {grupo.disponibles} lug.
                                        </span>
                                    </div>
                                    <div className="nrc-profesor">{grupo.profesor || 'Sin profesor asignado'}</div>
                                    <div className="nrc-sesiones-compact">
                                        {grupo.sesiones.map((sesion, idx) => (
                                            <div key={idx} className="sesion-row">
                                                <strong>{sesion.dia ? sesion.dia.substring(0,3) : 'N/A'}</strong> 
                                                {sesion.hora_inicio}-{sesion.hora_fin} 
                                                <small>({sesion.edificio}-{sesion.aula})</small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export function SeleccionMaterias({ materias, selectedNRCs, onSelectionChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [materiaEnModal, setMateriaEnModal] = useState(null);

    const { mensajesCruces, nrcsConConflicto } = useMemo(() => {
        const clasesSeleccionadas = materias.filter(m => selectedNRCs.includes(m.nrc));
        const paresDeCruces = detectarCruces(clasesSeleccionadas);
        const mensajes = generarMensajeCruces(paresDeCruces);
        
        const conflictos = new Set();
        paresDeCruces.forEach(([c1, c2]) => {
            conflictos.add(c1.nrc);
            conflictos.add(c2.nrc);
        });

        return { mensajesCruces: mensajes, nrcsConConflicto: conflictos };
    }, [selectedNRCs, materias]);

    useEffect(() => {
        const selectedClaves = new Set(materias.filter(m => selectedNRCs.includes(m.nrc)).map(m => m.clave));
        const uniqueSubjects = [...new Map(materias.map(m => [m.clave, { clave: m.clave, nombre: m.materia }])).values()];
        const subjectsToDisplay = uniqueSubjects.filter(subject => selectedClaves.has(subject.clave));
        setSelectedSubjects(subjectsToDisplay);
    }, [selectedNRCs, materias]);

    const uniqueSubjects = useMemo(() => {
        const subjectMap = new Map();
        materias.forEach(m => {
            if (!subjectMap.has(m.clave)) subjectMap.set(m.clave, { clave: m.clave, nombre: m.materia });
        });
        return Array.from(subjectMap.values());
    }, [materias]);

    const filteredSubjects = useMemo(() => {
        if (!searchTerm) return [];
        const term = searchTerm.toLowerCase();
        return uniqueSubjects.filter(
            s => s.nombre.toLowerCase().includes(term) && !selectedSubjects.some(ss => ss.clave === s.clave)
        ).slice(0, 6);
    }, [searchTerm, uniqueSubjects, selectedSubjects]);

    const handleAddSubject = (subject) => {
        setSelectedSubjects(prev => [...prev, subject]);
        setSearchTerm('');
        setMateriaEnModal(subject);
    };

    const handleRemoveSubject = (subjectToRemove) => {
        setSelectedSubjects(prev => prev.filter(s => s.clave !== subjectToRemove.clave));
        const nrcsToRemove = materias.filter(m => m.clave === subjectToRemove.clave).map(m => m.nrc);
        onSelectionChange(prevNRCs => prevNRCs.filter(nrc => !nrcsToRemove.includes(nrc)));
    };

    const handleNrcChange = (subjectClave, newNrc) => {
        const subjectNrcs = materias.filter(m => m.clave === subjectClave).map(m => m.nrc);
        const otherSelectedNrcs = selectedNRCs.filter(nrc => !subjectNrcs.includes(nrc));
        onSelectionChange([...otherSelectedNrcs, newNrc]);
        setMateriaEnModal(null); 
    };

    const subjectCardsData = useMemo(() => {
        return selectedSubjects.map(subject => {
            const nrcsForSubject = materias.filter(m => m.clave === subject.clave);
            const uniqueSections = [...new Set(nrcsForSubject.map(nrc => nrc.seccion))];
            const currentSelectedNrcObj = nrcsForSubject.find(nrc => selectedNRCs.includes(nrc.nrc));
            const hasConflict = currentSelectedNrcObj && nrcsConConflicto.has(currentSelectedNrcObj.nrc);

            return { 
                ...subject, 
                totalSections: uniqueSections.length, 
                selectedNrc: currentSelectedNrcObj,
                hasConflict
            };
        });
    }, [selectedSubjects, materias, selectedNRCs, nrcsConConflicto]);

    return (
        <div className="seleccion-materias">
            {materiaEnModal && (
                <NrcSelectionModal
                    materia={materiaEnModal}
                    nrcsDisponibles={materias.filter(m => m.clave === materiaEnModal.clave)}
                    selectedNrc={selectedNRCs.find(nrc => materias.some(m => m.nrc === nrc && m.clave === materiaEnModal.clave))}
                    onNrcChange={handleNrcChange}
                    onClose={() => setMateriaEnModal(null)}
                />
            )}

            <div className="search-section">
                <div className="search-bar-wrapper">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        className="search-input-compact" 
                        placeholder="Buscar materia..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                    {filteredSubjects.length > 0 && (
                        <div className="search-results-dropdown">
                            {filteredSubjects.map(subject => (
                                <button key={subject.clave} className="search-result-row" onClick={() => handleAddSubject(subject)}>
                                    <span className="result-name">{subject.nombre}</span>
                                    <span className="result-clave">{subject.clave}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {mensajesCruces.length > 0 && (
                <div className="conflict-alert-banner">
                    <h4>⚠️ Atención: Cruce de horarios detectado</h4>
                    <ul>
                        {mensajesCruces.map((msg, i) => <li key={i}>{msg}</li>)}
                    </ul>
                </div>
            )}

            {subjectCardsData.length > 0 ? (
                <div className="compact-grid">
                    {subjectCardsData.map(subject => (
                        <div 
                            key={subject.clave} 
                            className={`mini-card ${subject.hasConflict ? 'card-conflict' : ''} ${!subject.selectedNrc ? 'card-warning' : ''}`}
                            onClick={() => setMateriaEnModal(subject)}
                        >
                            <div className="mini-card-header">
                                <span className="mini-card-clave">{subject.clave}</span>
                                <button 
                                    className="mini-remove-btn" 
                                    onClick={(e) => { e.stopPropagation(); handleRemoveSubject(subject); }}
                                >&times;</button>
                            </div>
                            
                            <div className="mini-card-body">
                                <h4 className="mini-card-title">{subject.nombre}</h4>
                                <div className="mini-card-meta">
                                    {subject.selectedNrc ? (
                                        <span className={`nrc-tag ${subject.hasConflict ? 'bg-red' : 'bg-blue'}`}>
                                            NRC: {subject.selectedNrc.nrc}
                                        </span>
                                    ) : (
                                        <span className="nrc-tag bg-yellow">Seleccionar NRC</span>
                                    )}
                                    <span className="sections-count">{subject.totalSections} opc.</span>
                                </div>
                            </div>
                            
                            {subject.hasConflict && (
                                <div className="conflict-strip">Choque de Horario</div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state-compact">
                    <p>No has agregado materias aún.</p>
                </div>
            )}
        </div>
    );
}