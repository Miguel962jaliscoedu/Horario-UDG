// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="footer-container">
                
                {/* Columna 1: Información del Proyecto */}
                <div className="footer-section footer-about">
                    <h3>
                        <span>📅</span> Horario UDG
                    </h3>
                    <p>
                        Una herramienta independiente diseñada para facilitar la planificación académica de la comunidad universitaria.
                    </p>
                    <p className="footer-disclaimer">
                        No afiliada oficialmente a la Universidad de Guadalajara.
                    </p>
                </div>

                {/* Columna 2: Mapa del Sitio */}
                <div className="footer-section footer-sitemap">
                    <h4>Mapa del Sitio</h4>
                    <nav className="sitemap-nav">
                        <Link to="/">Inicio</Link>
                        <Link to="/planear">Planificador</Link>
                        <Link to="/profesores">Profesores</Link>
                        <Link to="/beneficios">Beneficios</Link>
                        <Link to="/mis-horarios">Mis Horarios</Link>
                        <Link to="/mis-evaluaciones">Mis Evaluaciones</Link>
                    </nav>
                </div>

                {/* Columna 3: Legal y Créditos */}
                <div className="footer-section footer-bottom">
                    <div className="footer-legal">
                        <Link to="/privacidad">Aviso de Privacidad</Link>
                        <Link to="/terminos">Términos y Condiciones</Link>
                    </div>
                    
                    <div className="footer-credits">
                        <div className="developer-tag">
                            Creado por{' '}
                            <a 
                                href="https://github.com/Miguel962jaliscoedu/Horario-UDG" 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                Miguel Cervantes
                            </a>
                        </div>
                        <div className="tech-stack">
                            <span>Desarrollado con React</span>
                            <span className="heart-icon">❤</span>
                            <span>&copy; {currentYear}</span>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
}