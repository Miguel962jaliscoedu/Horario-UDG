import React, { useState, useEffect } from 'react';

export function ConsultaForm({ onConsultar, loading, initialParams = {} }) {
    
    const [params, setParams] = useState({
        centro: '',
        carrera: '',
        calendario: initialParams.calendario || '',
    });

    const [centros, setCentros] = useState([]);
    const [calendarios, setCalendarios] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [loadingCarreras, setLoadingCarreras] = useState(false);
    
    const [optionsLoaded, setOptionsLoaded] = useState(false);

    // Efecto para cargar los ciclos y centros desde la API.
    useEffect(() => {
        fetch('/api/form-options')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Error en la respuesta del servidor: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                const ciclosApi = data.ciclop || [];
                const centrosApi = data.cup || [];

                setCalendarios(ciclosApi);
                setCentros(centrosApi);

                if (!initialParams.calendario && ciclosApi.length > 0) {
                    setParams(p => ({ ...p, calendario: ciclosApi[0].value }));
                }
            })
            .catch(error => {
                console.error('Error crítico al cargar opciones del formulario. Revisa el endpoint /api/form-options:', error);
                setCentros([]);
                setCalendarios([]);
            })
            .finally(() => {
                setOptionsLoaded(true);
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // Efecto para restaurar la selección del 'centro' guardado en caché.
    useEffect(() => {
        if (optionsLoaded && initialParams.centro) {
            setParams(p => ({ ...p, centro: initialParams.centro }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [optionsLoaded]);

    // Efecto para cargar las carreras cuando 'params.centro' cambia.
    useEffect(() => {
        if (params.centro) {
            setLoadingCarreras(true);
            setCarreras([]); 
            
            fetch(`/api/majors?cup=${params.centro}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Error HTTP: ${res.status} ${res.statusText}`);
                    }
                    return res.json();
                })
                .then(data => {
                    let fetchedCarreras = [];
                    // --- CAMBIO CLAVE: TRANSFORMAR EL OBJETO EN ARREGLO ---
                    // Se verifica si 'data' es un objeto, no nulo y no un arreglo.
                    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                        // Se convierte el objeto {key: value} en un arreglo [{id: key, name: value}]
                        fetchedCarreras = Object.entries(data).map(([id, name]) => ({
                            id: id,
                            name: name
                        }));
                    } else if (Array.isArray(data)) {
                        // Si la API alguna vez devuelve un arreglo, también funciona.
                        fetchedCarreras = data;
                    } else {
                        console.warn('La API /api/majors devolvió una respuesta con un formato inesperado.', data);
                    }
                    
                    setCarreras(fetchedCarreras);

                    if (initialParams.carrera && fetchedCarreras.some(c => c.id === initialParams.carrera)) {
                        setParams(p => ({ ...p, carrera: initialParams.carrera }));
                    }
                })
                .catch(error => {
                    console.error('Error al obtener las carreras:', error);
                    setCarreras([]);
                })
                .finally(() => {
                    setLoadingCarreras(false);
                });
        } else {
            setCarreras([]); 
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.centro]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setParams(prevParams => ({
            ...prevParams,
            [name]: value,
            ...(name === 'centro' && { carrera: '' })
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onConsultar(params);
    };

    return (
        <form onSubmit={handleSubmit} className="card consulta-form">
            <p>Selecciona los siguientes campos para buscar la oferta académica.</p>
            <div className="form-group">
                <label htmlFor="calendario">Ciclo Escolar:</label>
                <select
                    id="calendario"
                    name="calendario"
                    value={params.calendario}
                    onChange={handleChange}
                    required
                    disabled={!optionsLoaded}
                >
                    {(calendarios || []).map(ciclo => (
                        <option key={ciclo.value} value={ciclo.value}>{ciclo.description}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="centro">Centro Universitario:</label>
                <select
                    id="centro"
                    name="centro"
                    value={params.centro}
                    onChange={handleChange}
                    required
                    disabled={!optionsLoaded}
                >
                    <option value="">{optionsLoaded ? 'Selecciona un centro' : 'Cargando centros...'}</option>
                    {(centros || []).map(centro => (
                        <option key={centro.value} value={centro.value}>{centro.description}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="carrera">Programa Educativo (Carrera):</label>
                <select
                    id="carrera"
                    name="carrera"
                    value={params.carrera}
                    onChange={handleChange}
                    required
                    disabled={loadingCarreras || !params.centro}
                >
                    <option value="">{loadingCarreras ? 'Cargando...' : 'Selecciona una carrera'}</option>
                    {/* El resto del código funciona sin cambios gracias a la transformación de datos */}
                    {(carreras || []).map(carrera => (
                        <option key={carrera.id} value={carrera.id}>{carrera.name}</option>
                    ))}
                </select>
            </div>
            <button type="submit" className="primary-button" disabled={loading || !params.centro || !params.carrera}>
                {loading ? 'Consultando...' : 'Consultar Oferta'}
            </button>
        </form>
    );
}

