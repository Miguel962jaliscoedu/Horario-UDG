import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ConsultaForm } from './components/ConsultaForm.jsx';
import { SeleccionMaterias } from './components/SeleccionMaterias.jsx';
import { GenerarHorario } from './components/GenerarHorario.jsx';
import { fetchOfertaAcademica } from './services/siiauApi.js';
import { saveStateToSession, loadStateFromSession, clearSession } from './utils/session.js';
import './App.css';

function App() {
    
    const initialState = loadStateFromSession() || {
        activeTab: 'consulta',
        materias: [],
        selectedNRCs: [],
        consultaRealizada: false,
        formParams: { centro: '', carrera: '', calendario: '' },
    };

    const [activeTab, setActiveTab] = useState(initialState.activeTab);
    const [materias, setMaterias] = useState(initialState.materias);
    const [selectedNRCs, setSelectedNRCs] = useState(initialState.selectedNRCs);
    const [consultaRealizada, setConsultaRealizada] = useState(initialState.consultaRealizada);
    const [formParams, setFormParams] = useState(initialState.formParams);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const stateToSave = {
            activeTab,
            materias,
            selectedNRCs,
            consultaRealizada,
            formParams,
        };
        saveStateToSession(stateToSave);
    }, [activeTab, materias, selectedNRCs, consultaRealizada, formParams]);

    const handleConsulta = useCallback(async (params) => {
        setFormParams(params);
        setLoading(true);
        setError(null);
        setMaterias([]);
        setConsultaRealizada(false);
        try {
            const apiParams = {
                cup: params.centro,
                majrp: params.carrera,
                ciclop: params.calendario
            };

            const data = await fetchOfertaAcademica(apiParams);
            
            if (!data || data.length === 0) {
                throw new Error("La consulta no devolvió resultados. Verifica los parámetros seleccionados.");
            }
            setMaterias(data);
            setConsultaRealizada(true);
            setActiveTab('seleccion');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleNewQuery = () => {
        clearSession();
        setActiveTab('consulta');
        setMaterias([]);
        setSelectedNRCs([]);
        setConsultaRealizada(false);
        setFormParams({ centro: '', carrera: '', calendario: '' });
        setError(null);
    };

    const clasesSeleccionadas = useMemo(() => {
        return materias.filter(materia => selectedNRCs.includes(materia.nrc));
    }, [materias, selectedNRCs]);

    return (
        <div className="container">
            <header className="app-header">
                {/* Se añade el div 'header-content' para que coincida con el nuevo CSS */}
                <div className="header-content">
                    <h1>📅 Planeador de Horarios UDG</h1>
                    <p>Consulta la oferta académica y organiza tu semestre sin conflictos.</p>
                </div>
                {consultaRealizada && (
                    <button onClick={handleNewQuery} className="primary-button" style={{ marginTop: 0 }}>
                        Nueva Consulta
                    </button>
                )}
            </header>
            <main>
                <nav className="tabs">
                    <button className={`tab-button ${activeTab === 'consulta' ? 'active' : ''}`} onClick={() => setActiveTab('consulta')} >
                        1. Consulta
                    </button>
                    <button className={`tab-button ${activeTab === 'seleccion' ? 'active' : ''}`} onClick={() => setActiveTab('seleccion')} disabled={!consultaRealizada} >
                        2. Selección
                    </button>
                    <button className={`tab-button ${activeTab === 'horario' ? 'active' : ''}`} onClick={() => setActiveTab('horario')} disabled={!consultaRealizada || selectedNRCs.length === 0} >
                        3. Horario Final
                    </button>
                </nav>
                <div className="tab-content">
                    {error && <div className="card alert alert-error"><p>{error}</p></div>}
                    {activeTab === 'consulta' && (
                        <ConsultaForm onConsultar={handleConsulta} loading={loading} initialParams={formParams} />
                    )}
                    {activeTab === 'seleccion' && consultaRealizada && (
                        <SeleccionMaterias materias={materias} selectedNRCs={selectedNRCs} onSelectionChange={setSelectedNRCs} />
                    )}
                    {activeTab === 'horario' && consultaRealizada && (
                        <GenerarHorario clasesSeleccionadas={clasesSeleccionadas} />
                    )}
                </div>
            </main>
             <footer className="app-footer">
                <p>Desarrollado con React y Vercel. Una herramienta no oficial para la comunidad UDG.</p>
            </footer>
        </div>
    );
}

export default App;

