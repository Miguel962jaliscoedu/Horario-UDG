import React, { useState, useMemo, useEffect } from 'react';
import { detectarCruces, generarMensajeCruces } from '../services/scheduleUtils';

// --- Componente Modal Mejorado ---
const NrcSelectionModal = ({ materia, nrcsDisponibles, selectedNrc, onNrcChange, onClose }) => {
    
    // Agrupa las sesiones de clase por NRC
    const gruposNrc = useMemo(() => {
        const agrupados = new Map();
        nrcsDisponibles.forEach(clase => {
            if (!agrupados.has(clase.nrc)) {
                agrupados.set(clase.nrc, {
                    ...clase, // Copia la información común de la primera sesión
                    sesiones: []
                });
            }
            // Añade la información específica de la sesión
            agrupados.get(clase.nrc).sesiones.push({
                dia: clase.dia,
                hora_inicio: clase.hora_inicio,
                hora_fin: clase.hora_fin,
                edificio: clase.edificio,
                aula: clase.aula
            });
        });
        return Array.from(agrupados.values());
    }, [nrcsDisponibles]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>×</button>
                <h2>{materia.nombre}</h2>
                <p>Selecciona el grupo (NRC) que deseas cursar.</p>
                <div className="nrc-selection-container">
                    <div className="nrc-radio-group">
                        {gruposNrc.map(grupo => (
                            <label key={grupo.nrc} className="nrc-radio-label">
                                <input
                                    type="radio"
                                    name={`nrc-${materia.clave}`}
                                    value={grupo.nrc}
                                    checked={selectedNrc === grupo.nrc}
                                    onChange={() => onNrcChange(materia.clave, grupo.nrc)}
                                />
                                <div className="nrc-radio-content">
                                    <div className="nrc-main-info">
                                        <strong>NRC: {grupo.nrc} (Sección: {grupo.seccion})</strong>
                                        <span>Cupos: {grupo.disponibles}/{grupo.cupos}</span>
                                        <span>Créditos: {grupo.creditos}</span>
                                        <span>Profesor: {grupo.profesor}</span>
                                    </div>
                                    <div className="nrc-sesiones-list">
                                        {grupo.sesiones.map((sesion, index) => (
                                            <div key={index} className="nrc-sesion-item">
                                                {sesion.dia ? `${sesion.dia} de ${sesion.hora_inicio} a ${sesion.hora_fin} en ${sesion.edificio}-${sesion.aula}` : 'Horario no especificado'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


export function SeleccionMaterias({ materias, selectedNRCs, onSelectionChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [materiaEnModal, setMateriaEnModal] = useState(null);

    useEffect(() => {
        const selectedClaves = new Set(materias.filter(m => selectedNRCs.includes(m.nrc)).map(m => m.clave));
        const uniqueSubjects = [...new Map(materias.map(m => [m.clave, { clave: m.clave, nombre: m.materia }])).values()];
        const subjectsToDisplay = uniqueSubjects.filter(subject => selectedClaves.has(subject.clave));
        setSelectedSubjects(subjectsToDisplay);
    }, [selectedNRCs, materias]);

    const uniqueSubjects = useMemo(() => {
        const subjectMap = new Map();
        materias.forEach(materia => {
            if (!subjectMap.has(materia.clave)) {
                subjectMap.set(materia.clave, { clave: materia.clave, nombre: materia.materia });
            }
        });
        return Array.from(subjectMap.values());
    }, [materias]);

    const filteredSubjects = useMemo(() => {
        if (!searchTerm) return [];
        return uniqueSubjects.filter(
            subject =>
                subject.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !selectedSubjects.some(ss => ss.clave === subject.clave)
        );
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

    const mensajesCruces = useMemo(() => {
        const clasesSeleccionadas = materias.filter(m => selectedNRCs.includes(m.nrc));
        const crucesDetectados = detectarCruces(clasesSeleccionadas);
        return generarMensajeCruces(crucesDetectados);
    }, [materias, selectedNRCs]);

    const subjectCardsData = useMemo(() => {
        return selectedSubjects.map(subject => {
            const nrcsForSubject = materias.filter(m => m.clave === subject.clave);
            const uniqueSections = [...new Set(nrcsForSubject.map(nrc => nrc.seccion))];
            const currentSelectedNrc = nrcsForSubject.find(nrc => selectedNRCs.includes(nrc.nrc));
            return { ...subject, sections: uniqueSections, selectedNrc: currentSelectedNrc };
        });
    }, [selectedSubjects, materias, selectedNRCs]);


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

            <div className="step-container">
                <h2>Paso 1: Elige tus materias</h2>
                <p>Busca por nombre y añade las materias que quieres cursar.</p>
                <div className="subject-search-container">
                    <input type="text" className="search-input" placeholder="Buscar materia..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    {filteredSubjects.length > 0 && (
                        <div className="search-results">
                            {filteredSubjects.map(subject => (
                                <button key={subject.clave} className="result-item" onClick={() => handleAddSubject(subject)}>
                                    {subject.nombre}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {subjectCardsData.length > 0 && (
                <div className="step-container">
                    <h2>Materias Seleccionadas</h2>
                    <p>Haz clic en una materia para elegir o cambiar el grupo (NRC).</p>
                    <div className="subject-card-grid">
                        {subjectCardsData.map(subject => (
                            <div key={subject.clave} className="subject-card" onClick={() => setMateriaEnModal(subject)}>
                                <div className="subject-card-header">
                                    <h3>{subject.nombre}</h3>
                                    <button className="remove-tag-btn" onClick={(e) => { e.stopPropagation(); handleRemoveSubject(subject); }}>×</button>
                                </div>
                                <div className="subject-card-body">
                                    <span className="clave-tag">Clave: {subject.clave}</span>
                                    <div className="sections-container">
                                        <span>Secciones:</span>
                                        <div className="sections-list">
                                            {subject.sections.map(sec => <span key={sec} className="section-tag">{sec}</span>)}
                                        </div>
                                    </div>
                                </div>
                                <div className="subject-card-footer">
                                    {subject.selectedNrc ? (
                                        <span className="nrc-selected-tag">NRC: {subject.selectedNrc.nrc}</span>
                                    ) : (
                                        <span className="nrc-missing-tag">Selecciona un NRC</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {selectedNRCs.length > 1 && (
                <div className="step-container">
                     <h2>Paso 2: Verifica tu horario</h2>
                     <div className="cruces-container">
                        {mensajesCruces.length > 0 ? (
                            <div className="alert alert-error">
                                <h4>¡Atención! Se detectaron cruces de horario:</h4>
                                <ul>
                                    {mensajesCruces.map((mensaje, index) => <li key={index}>{mensaje}</li>)}
                                </ul>
                            </div>
                        ) : (
                            <div className="alert alert-success">
                                <p>¡Excelente! No se encontraron cruces de horario.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}