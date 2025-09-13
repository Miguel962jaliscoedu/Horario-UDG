import React, { useState, useCallback } from 'react';
import { ConsultaForm } from './components/ConsultaForm.jsx';
import { SeleccionMaterias } from './components/SeleccionMaterias.jsx';
import { GenerarHorario } from './components/GenerarHorario.jsx';
import { fetchOfertaAcademica } from './services/siiauApi.js';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState('consulta');
    const [materias, setMaterias] = useState([]);
    const [selectedNRCs, setSelectedNRCs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [consultaRealizada, setConsultaRealizada] = useState(false);

    const handleConsulta = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        setMaterias([]);
        setConsultaRealizada(false);
        try {
            const data = await fetchOfertaAcademica(params);
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

    const clasesSeleccionadas = React.useMemo(() => {
        return materias.filter(materia => selectedNRCs.includes(materia.nrc));
    }, [materias, selectedNRCs]);

    return (
        <div className="container">
            <header className="app-header">
                <h1>📅 Planeador de Horarios UDG</h1>
                <p>Consulta la oferta académica y organiza tu semestre sin conflictos.</p>
            </header>

            <main>
                <nav className="tabs">
                    <button
                        className={`tab-button ${activeTab === 'consulta' ? 'active' : ''}`}
                        onClick={() => setActiveTab('consulta')}
                    >
                        1. Consulta
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'seleccion' ? 'active' : ''}`}
                        onClick={() => setActiveTab('seleccion')}
                        disabled={!consultaRealizada}
                    >
                        2. Selección
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'horario' ? 'active' : ''}`}
                        onClick={() => setActiveTab('horario')}
                        disabled={!consultaRealizada || selectedNRCs.length === 0}
                    >
                        3. Horario Final
                    </button>
                </nav>

                <div className="tab-content">
                    {error && <div className="card alert alert-error"><p>{error}</p></div>}

                    {activeTab === 'consulta' && (
                        <ConsultaForm onConsultar={handleConsulta} loading={loading} />
                    )}

                    {activeTab === 'seleccion' && consultaRealizada && (
                        <SeleccionMaterias
                            materias={materias}
                            selectedNRCs={selectedNRCs}
                            onSelectionChange={setSelectedNRCs}
                        />
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
