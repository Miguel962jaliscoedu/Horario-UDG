// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeroSection } from '../components/HeroSection.jsx';
import './HomePage.css';

export function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [feedbackType, setFeedbackType] = useState('sugerencia');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackEmail, setFeedbackEmail] = useState('');
    const [feedbackStatus, setFeedbackStatus] = useState(null);

    useEffect(() => {
        if (user?.email) {
            setFeedbackEmail(user.email);
        }
    }, [user]);

    const handleStart = () => {
        navigate('/planear');
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        
        if (!feedbackMessage.trim()) {
            setFeedbackStatus({ type: 'error', message: 'Por favor escribe un mensaje' });
            return;
        }

        setFeedbackStatus({ type: 'loading', message: 'Enviando...' });

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: feedbackType,
                    message: feedbackMessage,
                    email: feedbackEmail,
                    timestamp: new Date().toISOString()
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setFeedbackStatus({ type: 'success', message: '¡Gracias! Tu retroalimentación ha sido enviada.' });
                setFeedbackMessage('');
                setFeedbackEmail('');
            } else {
                throw new Error(data.error || 'Error sending feedback');
            }
        } catch (error) {
            console.error('Feedback error:', error);
            setFeedbackStatus({ type: 'error', message: error.message || 'Error al enviar. Intenta de nuevo más tarde.' });
        }
    };

    return (
        <div className="home-page animate-fade-in">
            <div className="home-container">
                {/* Hero Section */}
                <div className="home-hero-section">
                    <HeroSection />
                </div>

                {/* Features Section */}
                <div className="features-grid">
                    <div className="card feature-card">
                        <h3>📅 Consulta en tiempo real</h3>
                        <p className="text-secondary">Accede a la oferta académica oficial de SIIAU actualizada al momento.</p>
                    </div>
                    <div className="card feature-card">
                        <h3>⚡ Detecta Cruces</h3>
                        <p className="text-secondary">Nuestro algoritmo te avisa automáticamente si dos materias se empalman.</p>
                    </div>
                    <div className="card feature-card">
                        <h3>☁️ Guarda en la Nube</h3>
                        <p className="text-secondary">Inicia sesión y lleva tu horario guardado a cualquier dispositivo.</p>
                    </div>
                    <div className="card feature-card eval-feature-card">
                        <h3>⭐ Evalúa Profesores</h3>
                        <p className="text-secondary">Comparte tu experiencia y ayuda a otros. Consulta ratings de MisProfesores.com.</p>
                        <button className="feature-card-btn" onClick={() => navigate('/profesores')}>
                            Ver Profesores →
                        </button>
                    </div>
                </div>

                <div className="home-cta">
                    <button className="primary-button" onClick={handleStart}>
                        Comenzar a Planear 🚀
                    </button>
                </div>

                {/* Feedback Section */}
                <section className="home-section">
                    <div className="section-header">
                        <h2>💬 Retroalimentación y Soporte</h2>
                        <p>Tu opinión nos ayuda a mejorar</p>
                    </div>
                    <div className="feedback-container">
                        <form className="feedback-form" onSubmit={handleSubmitFeedback}>
                            <div className="feedback-type-selector">
                                <button
                                    type="button"
                                    className={`type-btn ${feedbackType === 'sugerencia' ? 'active' : ''}`}
                                    onClick={() => setFeedbackType('sugerencia')}
                                >
                                    💡 Sugerencia
                                </button>
                                <button
                                    type="button"
                                    className={`type-btn ${feedbackType === 'reporte' ? 'active' : ''}`}
                                    onClick={() => setFeedbackType('reporte')}
                                >
                                    🐛 Reportar Error
                                </button>
                                <button
                                    type="button"
                                    className={`type-btn ${feedbackType === 'ayuda' ? 'active' : ''}`}
                                    onClick={() => setFeedbackType('ayuda')}
                                >
                                    ❓ Ayuda
                                </button>
                            </div>

                            <div className="form-group">
                                <label>Mensaje</label>
                                <textarea
                                    value={feedbackMessage}
                                    onChange={(e) => setFeedbackMessage(e.target.value)}
                                    placeholder={
                                        feedbackType === 'sugerencia' ? '¿Qué mejorarías de la aplicación?' :
                                        feedbackType === 'reporte' ? 'Describe el error que encontraste' :
                                        '¿En qué podemos ayudarte?'
                                    }
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Correo (opcional, para responderte)</label>
                                <input
                                    type="email"
                                    value={feedbackEmail}
                                    onChange={(e) => setFeedbackEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                />
                            </div>

                            {feedbackStatus && (
                                <div className={`feedback-status ${feedbackStatus.type}`}>
                                    {feedbackStatus.message}
                                </div>
                            )}

                            <button type="submit" className="primary-button" disabled={feedbackStatus?.type === 'loading'}>
                                {feedbackStatus?.type === 'loading' ? 'Enviando...' : 'Enviar Retroalimentación'}
                            </button>
                        </form>

                        <div className="support-info">
                            <h4>Otros canales de soporte</h4>
                            <p>También puedes contactarnos por:</p>
                            <ul className="support-channels">
                                <li>
                                    <span className="channel-icon">🐙</span>
                                    <a href="https://github.com/Miguel962jaliscoedu/Horario-UDG/issues" target="_blank" rel="noreferrer">
                                        GitHub Issues
                                    </a>
                                </li>
                                <li>
                                    <span className="channel-icon">📧</span>
                                    <span>miguel.cervantes3687@alumnos.udg.mx</span>
                                </li>
                            </ul>
                            <div className="support-note">
                                <p>Nota: Horario UDG es un proyecto independiente. No estamos afiliados a la Universidad de Guadalajara.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}