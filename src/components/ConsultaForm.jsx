import React, { useState, useEffect, useCallback } from 'react';
import { fetchFormOptions, fetchMajors } from '../services/siiauApi.js';

export const ConsultaForm = ({ onConsultar, loading }) => {
    const [formData, setFormData] = useState({ ciclop: '', cup: '', majrp: '' });
    const [options, setOptions] = useState({ cycles: [], centers: [], majors: {} });
    const [optionsLoading, setOptionsLoading] = useState({ initial: true, majors: false });
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadInitialOptions = async () => {
            try {
                setError(null);
                const formOptions = await fetchFormOptions();
                const cycles = formOptions.ciclop || [];
                const centers = formOptions.cup || [];
                setOptions(prev => ({ ...prev, cycles, centers }));

                if (cycles.length > 0) {
                    setFormData(prev => ({ ...prev, ciclop: cycles[0].value }));
                }
                if (centers.length > 0) {
                    setFormData(prev => ({ ...prev, cup: centers[0].value }));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setOptionsLoading(prev => ({ ...prev, initial: false }));
            }
        };
        loadInitialOptions();
    }, []);

    const loadMajors = useCallback(async () => {
        if (!formData.cup) return;

        setOptionsLoading(prev => ({ ...prev, majors: true }));
        setFormData(prev => ({ ...prev, majrp: '' })); // Reset selection
        try {
            setError(null);
            const majorsData = await fetchMajors(formData.cup);
            setOptions(prev => ({ ...prev, majors: majorsData || {} }));
            const firstMajorKey = Object.keys(majorsData)[0] || '';
            setFormData(prev => ({ ...prev, majrp: firstMajorKey }));
        } catch (err) {
            setError(err.message);
            setOptions(prev => ({ ...prev, majors: {} }));
        } finally {
            setOptionsLoading(prev => ({ ...prev, majors: false }));
        }
    }, [formData.cup]);

    useEffect(() => {
        loadMajors();
    }, [loadMajors]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.ciclop || !formData.cup || !formData.majrp) {
            setError("Por favor, completa todas las selecciones.");
            return;
        }
        setError(null);
        onConsultar(formData);
    };

    if (optionsLoading.initial) {
        return <p>Cargando opciones de consulta...</p>;
    }

    return (
        <div className="card">
            <form onSubmit={handleSubmit} className="consulta-form">
                <div className="form-group">
                    <label htmlFor="ciclop">Ciclo Escolar:</label>
                    <select id="ciclop" name="ciclop" value={formData.ciclop} onChange={handleChange} required>
                        {options.cycles.map(cycle => (
                            <option key={cycle.value} value={cycle.value}>
                                {cycle.description} ({cycle.value})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="cup">Centro Universitario:</label>
                    <select id="cup" name="cup" value={formData.cup} onChange={handleChange} required>
                        {options.centers.map(center => (
                            <option key={center.value} value={center.value}>
                                {center.description} ({center.value})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="majrp">Carrera:</label>
                    <select id="majrp" name="majrp" value={formData.majrp} onChange={handleChange} disabled={optionsLoading.majors} required>
                        <option value="" disabled>
                            {optionsLoading.majors ? 'Cargando...' : 'Selecciona una carrera'}
                        </option>
                        {Object.entries(options.majors).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value} ({key})
                            </option>
                        ))}
                    </select>
                </div>
                
                {error && <p className="error-message-form">{error}</p>}
                
                <button type="submit" className="primary-button" disabled={loading || optionsLoading.majors}>
                    {loading ? 'Consultando...' : 'Consultar Oferta'}
                </button>
            </form>
        </div>
    );
};

