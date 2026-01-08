// src/components/HeroSection.jsx
import React from 'react';
import './HeroSection.css'; // Importa los estilos nuevos

export function HeroSection() {
    return (
        <div className="hero-banner">
            <div className="hero-content">
                <h1>Organiza tu Semestre</h1>
                <p>
                    Consulta la oferta académica oficial, visualiza cruces de horario 
                    y descarga tu planeación en PDF o imagen. 
                    Sin estrés, rápido y fácil.
                </p>
            </div>
        </div>
    );
}