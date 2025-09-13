import React, { useState, useMemo } from 'react';

// --- Lógica de Detección de Cruces (Helper Function) ---
const detectarCruces = (clases) => {
    const crucesPorDia = {};
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    dias.forEach(dia => {
        const clasesDelDia = clases.filter(c => c.dia === dia && c.hora_inicio && c.hora_fin);
        if (clasesDelDia.length < 2) return;

        clasesDelDia.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

        for (let i = 0; i < clasesDelDia.length; i++) {
            for (let j = i + 1; j < clasesDelDia.length; j++) {
                const c1 = clasesDelDia[i];
                const c2 = clasesDelDia[j];
                // Comprueba si hay superposición de horarios
                if (c1.hora_inicio < c2.hora_fin && c2.hora_inicio < c1.hora_fin) {
                    if (!crucesPorDia[dia]) crucesPorDia[dia] = [];
                    crucesPorDia[dia].push([c1, c2]);
                }
            }
        }
    });
    return crucesPorDia;
};


// --- Componente Principal ---
export const SeleccionMaterias = ({ materias, selectedNRCs, onSelectionChange }) => {
    // Estado para el buscador y las materias que el usuario elige
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    // Memoización para optimizar el rendimiento
    const { uniqueSubjects, nrcsBySubject } = useMemo(() => {
        const subjectSet = new Set();
        const nrcsBySubject = {};

        materias.forEach(materia => {
            subjectSet.add(materia.materia);
            if (!nrcsBySubject[materia.materia]) {
                nrcsBySubject[materia.materia] = [];
            }
            if (!nrcsBySubject[materia.materia].some(m => m.nrc === materia.nrc)) {
                const horarios = materias
                    .filter(s => s.nrc === materia.nrc && s.dia)
                    .map(s => `${s.dia.substring(0,3)} ${s.hora_inicio}-${s.hora_fin}`)
                    .join(' / ');
                nrcsBySubject[materia.materia].push({ ...materia, horarios });
            }
        });
        return { 
            uniqueSubjects: Array.from(subjectSet).sort(),
            nrcsBySubject
        };
    }, [materias]);

    // Filtrar materias según la búsqueda del usuario
    const filteredSubjects = useMemo(() => {
        if (!searchTerm) return [];
        return uniqueSubjects.filter(subject =>
            subject.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedSubjects.includes(subject)
        );
    }, [uniqueSubjects, searchTerm, selectedSubjects]);

    // Lógica para detectar cruces en tiempo real
    const crucesDetectados = useMemo(() => {
        const clases = materias.filter(m => selectedNRCs.includes(m.nrc));
        return detectarCruces(clases);
    }, [materias, selectedNRCs]);
    
    // --- Manejadores de Eventos ---

    const handleAddSubject = (subjectName) => {
        if (!selectedSubjects.includes(subjectName)) {
            setSelectedSubjects([...selectedSubjects, subjectName].sort());
        }
        setSearchTerm('');
    };

    const handleRemoveSubject = (subjectName) => {
        setSelectedSubjects(selectedSubjects.filter(s => s !== subjectName));
        const nrcsToRemove = (nrcsBySubject[subjectName] || []).map(m => m.nrc);
        onSelectionChange(selectedNRCs.filter(nrc => !nrcsToRemove.includes(nrc)));
    };

    const handleNrcChange = (subjectName, newNrc) => {
        const nrcsForThisSubject = (nrcsBySubject[subjectName] || []).map(m => m.nrc);
        const otherNrcs = selectedNRCs.filter(nrc => !nrcsForThisSubject.includes(nrc));
        onSelectionChange([...otherNrcs, newNrc]);
    };

    return (
        <div className="seleccion-materias card">
            {/* --- PASO 1: SELECCIÓN DE MATERIAS --- */}
            <div className="step-container">
                <h2>Paso 1: Elige tus materias</h2>
                <p>Busca y añade las materias que planeas cursar este semestre.</p>
                <div className="subject-search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar materia por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {filteredSubjects.length > 0 && (
                        <div className="search-results">
                            {filteredSubjects.map(subject => (
                                <button key={subject} className="result-item" onClick={() => handleAddSubject(subject)}>
                                    {subject}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {selectedSubjects.length > 0 && (
                     <div className="selected-subjects-container">
                        {selectedSubjects.map(subject => (
                            <div key={subject} className="subject-tag">
                                <span>{subject}</span>
                                <button className="remove-tag-btn" onClick={() => handleRemoveSubject(subject)}>×</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- PASO 2: SELECCIÓN DE GRUPOS (NRC) --- */}
            {selectedSubjects.length > 0 && (
                <div className="step-container">
                    <h2>Paso 2: Elige un grupo para cada materia</h2>
                    <p>Selecciona una de las opciones de horario disponibles para cada una de tus materias.</p>
                    <div className="nrc-selection-container">
                        {selectedSubjects.map(subjectName => (
                            <div key={subjectName} className="subject-nrc-group">
                                <h3>{subjectName}</h3>
                                <div className="nrc-radio-group">
                                    {(nrcsBySubject[subjectName] || []).map(materia => (
                                        <label key={materia.nrc} className="nrc-radio-label">
                                            <input
                                                type="radio"
                                                name={subjectName}
                                                value={materia.nrc}
                                                checked={selectedNRCs.includes(materia.nrc)}
                                                onChange={() => handleNrcChange(subjectName, materia.nrc)}
                                            />
                                            <div className="nrc-radio-content">
                                                <strong>NRC: {materia.nrc}</strong>
                                                <span>{materia.profesor}</span>
                                                <small>{materia.horarios || "Sin horario definido"}</small>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- DETECCIÓN DE CRUCES --- */}
             {selectedNRCs.length > 0 && (
                 <div className="cruces-container">
                    <h3>Detección de Conflictos</h3>
                    {Object.keys(crucesDetectados).length > 0 ? (
                        <div className="alert alert-error">
                            <h4>🚨 ¡Conflicto de horario detectado!</h4>
                            {Object.entries(crucesDetectados).map(([dia, pares]) => (
                                <div key={dia}>
                                    <strong>{dia}:</strong>
                                    <ul>
                                        {pares.map((par, index) => (
                                            <li key={index}>
                                                <strong>{par[0].materia} ({par[0].nrc})</strong> choca con <strong>{par[1].materia} ({par[1].nrc})</strong>.
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="alert alert-success">
                            <p>✅ ¡Excelente! No se encontraron conflictos de horario.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

