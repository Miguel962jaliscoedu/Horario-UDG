import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ConsultaForm } from './components/ConsultaForm.jsx';
import { SeleccionMaterias } from './components/SeleccionMaterias.jsx';
import { GenerarHorario } from './components/GenerarHorario.jsx';
import { HeroSection } from './components/HeroSection.jsx';
import { Footer } from './components/Footer.jsx';
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
        calendarioLabel: '',
        theme: 'dark', // Guardar el tema en sesión
    };

    const [view, setView] = useState(initialState.consultaRealizada ? 'app' : 'hero');
    const [activeTab, setActiveTab] = useState(initialState.activeTab);
    const [materias, setMaterias] = useState(initialState.materias);
    const [selectedNRCs, setSelectedNRCs] = useState(initialState.selectedNRCs);
    const [consultaRealizada, setConsultaRealizada] = useState(initialState.consultaRealizada);
    const [formParams, setFormParams] = useState(initialState.formParams);
    const [calendarioLabel, setCalendarioLabel] = useState(initialState.calendarioLabel);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState(initialState.theme);

    // Efecto para aplicar la clase del tema al body y guardar en sesión
    useEffect(() => {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        
        const stateToSave = {
            activeTab, materias, selectedNRCs, consultaRealizada, formParams, calendarioLabel, theme
        };
        saveStateToSession(stateToSave);
    }, [theme, activeTab, materias, selectedNRCs, consultaRealizada, formParams, calendarioLabel]);


    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleStart = () => setView('app');

    const handleConsulta = useCallback(async (params, calendarioLabel) => {
        setFormParams(params);
        setCalendarioLabel(calendarioLabel);
        setLoading(true);
        setError(null);
        setMaterias([]);
        setConsultaRealizada(false);
        try {
            const apiParams = { cup: params.centro, majrp: params.carrera, ciclop: params.calendario };
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
        setView('app');
        setActiveTab('consulta');
        setMaterias([]);
        setSelectedNRCs([]);
        setConsultaRealizada(false);
        setFormParams({ centro: '', carrera: '', calendario: '' });
        setCalendarioLabel('');
        setError(null);
    };

    const clasesSeleccionadas = useMemo(() => materias.filter(m => selectedNRCs.includes(m.nrc)), [materias, selectedNRCs]);

    return (
        <div className="container">
            <header className="app-header">
                <div className="header-content">
                    <h1>📅 Planeador de Horarios UDG</h1>
                    <p>Consulta la oferta académica y organiza tu semestre sin conflictos.</p>
                </div>
                <div className="header-controls">
                    {view === 'app' && consultaRealizada && (
                        <button onClick={handleNewQuery} className="primary-button" style={{ marginTop: 0 }}>
                            Nueva Consulta
                        </button>
                    )}
                    <button onClick={toggleTheme} className="theme-toggle-button" aria-label="Cambiar tema">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </header>
            
            <main>
                {view === 'hero' ? (
                    <HeroSection onStart={handleStart} />
                ) : (
                    <>
                        <nav className="tabs">
                            <button className={`tab-button ${activeTab === 'consulta' ? 'active' : ''}`} onClick={() => setActiveTab('consulta')}>
                                1. Consulta
                            </button>
                            <button className={`tab-button ${activeTab === 'seleccion' ? 'active' : ''}`} onClick={() => setActiveTab('seleccion')} disabled={!consultaRealizada}>
                                2. Selección
                            </button>
                            <button className={`tab-button ${activeTab === 'horario' ? 'active' : ''}`} onClick={() => setActiveTab('horario')} disabled={!consultaRealizada || selectedNRCs.length === 0}>
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
                                <GenerarHorario 
                                    clasesSeleccionadas={clasesSeleccionadas}
                                    calendarioLabel={calendarioLabel}
                                    theme={theme}
                                />
                            )}
                        </div>
                    </>
                )}
            </main>
            
            <Footer />
        </div>
    );
}

export default App;

