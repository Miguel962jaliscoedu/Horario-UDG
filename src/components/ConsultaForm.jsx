// src/components/ConsultaForm.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import './ConsultaForm.css';

const NOMBRES_CENTROS = {
    '3': 'CUTLAJO - Centro Universitario de Tlajomulco',
    '4': 'CUGDL - Centro Universitario de Guadalajara',
    '5': 'CUTLAQUEPAQUE - Centro Universitario de Tlaquepaque',
    '6': 'CUCHAPALA - Centro Universitario de Chapala',
    'A': 'CUAAD - Centro Universitario de Arte, Arquitectura y Diseño',
    'B': 'CUCBA - Centro Universitario de Ciencias Biológicas y Agropecuarias',
    'C': 'CUCEA - Centro Universitario de Ciencias Económico Administrativas',
    'D': 'CUCEI - Centro Universitario de Ciencias Exactas e Ingenierías',
    'E': 'CUCS - Centro Universitario de Ciencias de la Salud',
    'F': 'CUCSH - Centro Universitario de Ciencias Sociales y Humanidades',
    'G': 'CUALTOS - Centro Universitario de los Altos',
    'H': 'CUCIENEGA - Centro Universitario de la Ciénega',
    'I': 'CUCOSTA - Centro Universitario de la Costa',
    'J': 'CUCSUR - Centro Universitario de la Costa Sur',
    'K': 'CUSUR - Centro Universitario del Sur',
    'M': 'CUVALLES - Centro Universitario de los Valles',
    'N': 'CUNORTE - Centro Universitario del Norte',
    'O': 'CUCEI - Sede Valles',
    'P': 'CUCSUR - Sede Valles',
    'Q': 'CUCEI - Sede Norte',
    'R': 'CUALTOS - Sede Norte',
    'S': 'CUCOSTA - Sede Norte',
    'T': 'CUTLAJO - Sede Tlajomulco',
    'U': 'CULAGOS - Centro Universitario de los Lagos',
    'V': 'CICLO DE VERANO',
    'W': 'CUCEA - Sede Valle',
    'X': 'SUV - Sistema de Universidad Virtual',
    'Y': 'ESCUELAS INCORPORADAS',
    'Z': 'CUTONALA - Centro Universitario de Tonalá'
};

export function ConsultaForm({ onConsultar, loading, initialParams = {} }) {
    
    const [params, setParams] = useState({
        centro: '',
        carrera: '',
        calendario: initialParams.calendario || '',
    });

    // Estados de datos
    const [centros, setCentros] = useState([]);
    const [allCalendarios, setAllCalendarios] = useState([]); 
    const [carreras, setCarreras] = useState([]);
    const [loadingCarreras, setLoadingCarreras] = useState(false);
    const [optionsLoaded, setOptionsLoaded] = useState(false);
    const [showAllCycles, setShowAllCycles] = useState(false);

    // Estados para autocomplete
    const [busquedaCarrera, setBusquedaCarrera] = useState('');
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const wrapperRef = useRef(null); 

    const ciclosVisibles = useMemo(() => {
        if (!allCalendarios.length) return [];
        const currentYear = new Date().getFullYear();
        const relevantYears = [currentYear, currentYear - 1]; 

        const formatLabel = (ciclo) => {
            const year = ciclo.value.substring(0, 4);
            const sub = ciclo.value.substring(4);
            let label = ciclo.description;
            if (sub === '10') label = `${year}-A`;
            else if (sub === '20') label = `${year}-B`;
            const isPriority = (sub === '10' || sub === '20');
            return { ...ciclo, label, isPriority };
        };

        const formattedCycles = allCalendarios.map(formatLabel);
        if (showAllCycles) return formattedCycles;

        return formattedCycles.filter(c => {
            const year = parseInt(c.value.substring(0, 4));
            return relevantYears.includes(year) && c.isPriority;
        }).sort((a, b) => b.value.localeCompare(a.value));
    }, [allCalendarios, showAllCycles]);

    const centrosFormateados = useMemo(() => {
        return centros.map(centro => ({
            value: centro.value,
            label: NOMBRES_CENTROS[centro.value] || `${centro.value} - ${centro.description}`
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [centros]);

    const carrerasFiltradas = useMemo(() => {
        if (!busquedaCarrera) return carreras;
        const term = busquedaCarrera.toLowerCase();
        return carreras.filter(c => 
            c.name.toLowerCase().includes(term) || c.id.toLowerCase().includes(term)
        );
    }, [carreras, busquedaCarrera]);


    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setMostrarSugerencias(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);


    useEffect(() => {
        fetch('/api/form-options')
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                setAllCalendarios(data.ciclop || []);
                setCentros(data.cup || []);
                if (!initialParams.calendario && data.ciclop?.length > 0) {
                    setParams(p => ({ ...p, calendario: data.ciclop[0].value }));
                }
            })
            .catch(err => console.error(err))
            .finally(() => setOptionsLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
        if (optionsLoaded && initialParams.centro) {
            setParams(p => ({ ...p, centro: initialParams.centro }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [optionsLoaded]);

    useEffect(() => {
        if (params.centro) {
            setLoadingCarreras(true);
            setCarreras([]); 
            setBusquedaCarrera(''); 
            
            fetch(`/api/majors?cup=${params.centro}`)
                .then(res => res.ok ? res.json() : Promise.reject(res))
                .then(data => {
                    let fetchedCarreras = [];
                    if (typeof data === 'object' && !Array.isArray(data)) {
                        fetchedCarreras = Object.entries(data).map(([id, name]) => ({ id, name }));
                    } else if (Array.isArray(data)) {
                        fetchedCarreras = data;
                    }
                    fetchedCarreras.sort((a, b) => `${a.id} - ${a.name}`.localeCompare(`${b.id} - ${b.name}`));
                    setCarreras(fetchedCarreras);

                    if (initialParams.carrera) {
                        const found = fetchedCarreras.find(c => c.id === initialParams.carrera);
                        if (found) {
                            setParams(p => ({ ...p, carrera: found.id }));
                            setBusquedaCarrera(`${found.id} - ${found.name}`);
                        }
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingCarreras(false));
        } else {
            setCarreras([]);
            setBusquedaCarrera('');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.centro]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'calendario' && value === 'ver_mas') {
            setShowAllCycles(true);
            return;
        }
        setParams(prev => ({ ...prev, [name]: value }));
    };

    const handleCarreraSearch = (e) => {
        setBusquedaCarrera(e.target.value);
        setMostrarSugerencias(true);
        if (e.target.value === '') {
            setParams(prev => ({ ...prev, carrera: '' }));
        }
    };

    const seleccionarCarrera = (carrera) => {
        setParams(prev => ({ ...prev, carrera: carrera.id }));
        setBusquedaCarrera(`${carrera.id} - ${carrera.name}`);
        setMostrarSugerencias(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const calendarioSeleccionado = allCalendarios.find(c => c.value === params.calendario);
        let labelBonito = '';
        if (calendarioSeleccionado) {
            const year = calendarioSeleccionado.value.substring(0,4);
            const sub = calendarioSeleccionado.value.substring(4);
            if(sub === '10') labelBonito = `${year}-A`;
            else if(sub === '20') labelBonito = `${year}-B`;
            else labelBonito = calendarioSeleccionado.description; 
        }
        onConsultar(params, labelBonito);
    };

    return (
        <form onSubmit={handleSubmit} className="consulta-form">
            <p>Configura los filtros para buscar materias.</p>
            
            <div className="form-group">
                <label htmlFor="calendario">Ciclo Escolar</label>
                <select
                    id="calendario"
                    name="calendario"
                    value={params.calendario}
                    onChange={handleChange}
                    required
                    disabled={!optionsLoaded}
                >
                    {ciclosVisibles.map(ciclo => (
                        <option key={ciclo.value} value={ciclo.value}>
                            {ciclo.label}
                        </option>
                    ))}
                    {!showAllCycles && (
                        <option value="ver_mas" style={{ fontStyle: 'italic', color: '#666' }}>
                            ⬇ Ver ciclos anteriores...
                        </option>
                    )}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="centro">Centro Universitario</label>
                <select
                    id="centro"
                    name="centro"
                    value={params.centro}
                    onChange={handleChange}
                    required
                    disabled={!optionsLoaded}
                >
                    <option value="">Selecciona...</option>
                    {centrosFormateados.map(centro => (
                        <option key={centro.value} value={centro.value}>
                            {centro.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
                <label htmlFor="carrera">Carrera</label>
                <input
                    type="text"
                    id="carrera-search"
                    className="autocomplete-input"
                    placeholder={loadingCarreras ? "Cargando carreras..." : (!params.centro ? "Selecciona un centro primero" : "Escribe para buscar...")}
                    value={busquedaCarrera}
                    onChange={handleCarreraSearch}
                    
                    // --- MODIFICACIÓN AQUÍ: Selección automática ---
                    onFocus={(e) => { 
                        if(params.centro && !loadingCarreras) setMostrarSugerencias(true);
                        e.target.select(); // Selecciona todo el texto al recibir foco
                    }}
                    
                    disabled={loadingCarreras || !params.centro}
                    autoComplete="off"
                />
                
                {mostrarSugerencias && carrerasFiltradas.length > 0 && (
                    <ul className="suggestions-list animate-fade-in">
                        {carrerasFiltradas.map(carrera => (
                            <li 
                                key={carrera.id} 
                                onClick={() => seleccionarCarrera(carrera)}
                            >
                                <span className="suggestion-id">{carrera.id}</span>
                                <span className="suggestion-name">{carrera.name}</span>
                            </li>
                        ))}
                    </ul>
                )}
                
                {mostrarSugerencias && carrerasFiltradas.length === 0 && busquedaCarrera && (
                    <div className="suggestions-list no-results">
                        No se encontraron carreras.
                    </div>
                )}
            </div>

            <div className="form-submit-container">
                <button type="submit" className="primary-button" disabled={loading || !params.centro || !params.carrera}>
                    {loading ? 'Buscando...' : 'Buscar Oferta'}
                </button>
            </div>
        </form>
    );
}