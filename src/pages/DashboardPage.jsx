import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clearSession } from '../utils/session';
import './DashboardPage.css';

export function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleNewSchedule = () => {
        clearSession();
        navigate('/planear');
    };

    return (
        <div className="main-layout animate-fade-in dashboard-container">
            
            <div className="dashboard-grid">
                
                {/* === HEADER DE BIENVENIDA === */}
                <div 
                    className="card col-span-full" 
                    style={{ background: 'var(--bg-tertiary-color)', borderLeft: '5px solid var(--primary-color)' }}
                >
                    <h1 className="text-2xl font-bold">¡Qué gusto verte, {user?.displayName?.split(' ')[0]}! 👋</h1>
                    <p className="text-[var(--text-secondary-color)] mt-1">
                        Aquí tienes todo listo para armar tu horario perfecto. ¿Por dónde empezamos hoy?
                    </p>
                </div>

                {/* === WIDGET 1: Mis Horarios === */}
                <Link to="/mis-horarios" className="card hover:shadow-lg transition-all dashboard-card no-underline-card">
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h3 className="font-bold text-lg text-[var(--text-color)]">📅 Mis Horarios</h3>
                            <span style={{ fontSize: '1.5rem' }}>📂</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary-color)] mb-4">
                            Consulta, edita o elimina los horarios que has guardado anteriormente.
                        </p>
                    </div>
                    <div className="secondary-button" style={{ display: 'block', textAlign: 'center', marginTop: 'auto', pointerEvents: 'none' }}>
                        Ver mis horarios →
                    </div>
                </Link>

                {/* === WIDGET 2: Nuevo Plan === */}
                <div 
                    onClick={handleNewSchedule} 
                    className="card hover:shadow-lg transition-all dashboard-card cursor-pointer"
                >
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h3 className="font-bold text-lg text-[var(--text-color)]">✨ Nuevo Plan</h3>
                            <span style={{ fontSize: '1.5rem' }}>🚀</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary-color)] mb-4">
                            Inicia una búsqueda desde cero para crear un nuevo horario ideal.
                        </p>
                    </div>
                    <button className="primary-button" style={{ width: '100%', marginTop: 'auto', pointerEvents: 'none' }}>
                        Crear Nuevo Horario
                    </button>
                </div>

                {/* === WIDGET 3: Evaluación de Profesores (PRÓXIMAMENTE) === */}
                {/* Mantenemos el estilo "dashed" y opacidad para indicar que no está activo aún */}
                <div className="card dashboard-card" style={{ opacity: 0.75, border: '2px dashed var(--border-color)', background: 'transparent' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h3 className="font-bold text-lg text-[var(--text-secondary-color)]">⭐ Evaluar Profesores</h3>
                            <span style={{ fontSize: '1.5rem', filter: 'grayscale(1)' }}>🔜</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary-color)]">
                            Pronto podrás calificar a tus docentes y consultar opiniones de la comunidad antes de agendar.
                        </p>
                    </div>
                    {/* Botón simulado desactivado */}
                    <div className="secondary-button" style={{ 
                        display: 'block', 
                        textAlign: 'center', 
                        marginTop: 'auto', 
                        opacity: 0.5, 
                        cursor: 'not-allowed',
                        background: 'transparent',
                        border: '1px solid var(--border-color)'
                    }}>
                        En construcción...
                    </div>
                </div>

            </div>
        </div>
    );
}