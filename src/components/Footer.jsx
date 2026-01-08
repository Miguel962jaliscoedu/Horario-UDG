// src/components/Footer.jsx
import React from 'react';
import './Footer.css'; // Importamos los estilos

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="footer-container">
                
                {/* Lado Izquierdo: Información del Proyecto */}
                <div className="footer-info">
                    <h3>
                        <span>📅</span> Horario UDG
                    </h3>
                    <p>
                        Una herramienta independiente diseñada para facilitar la planificación académica de la comunidad universitaria.
                        No afiliada oficialmente a la Universidad de Guadalajara.
                    </p>
                </div>

                {/* Lado Derecho: Créditos */}
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
        </footer>
    );
}