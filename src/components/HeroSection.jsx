import React from 'react';

/**
 * Componente HeroSection para la página de bienvenida a pantalla completa.
 * @param {object} props - Propiedades del componente.
 * @param {function} props.onStart - Función que se ejecuta al hacer clic en el botón.
 */
export function HeroSection({ onStart }) {
    
    // Estilos para la imagen de fondo. Se aplica un degradado oscuro
    // para asegurar que el texto blanco sea legible.
    const heroStyles = {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://placehold.co/1920x1080/646cff/FFFFFF?text=Universidad+de+Guadalajara')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FFFFFF',
    };

    return (
        <div className="hero-section" style={heroStyles}>
            <div className="hero-content">
                <h1>Organiza tu Semestre sin estrés</h1>
                <p>
                    Encuentra la oferta académica más reciente, elige tus materias y visualiza
                    tu horario ideal en segundos. ¡Comienza a planear tu semestre perfecto ahora!
                </p>
                <button onClick={onStart} className="primary-button cta-button">
                    ✨ Crear mi Horario
                </button>
            </div>
        </div>
    );
}

