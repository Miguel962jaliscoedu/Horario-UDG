// src/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection.jsx';

export function HomePage() {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/planear');
    };

    return (
        <div className="home-page animate-fade-in" style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '2rem',
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3rem'
        }}>
            {/* Hero Section */}
            <div style={{ width: '100%' }} onClick={handleStart}>
                 {/* Reutilizamos el Hero, le puedes pasar props si quieres personalizarlo */}
                 <HeroSection />
            </div>

            {/* Sección Extra de "Features" (Opcional, para rellenar la Home) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>📅 Consulta en tiempo real</h3>
                    <p className="text-secondary">Accede a la oferta académica oficial de SIIAU actualizada al momento.</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>⚡ Detecta Cruces</h3>
                    <p className="text-secondary">Nuestro algoritmo te avisa automáticamente si dos materias se empalman.</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>☁️ Guarda en la Nube</h3>
                    <p className="text-secondary">Inicia sesión y lleva tu horario guardado a cualquier dispositivo.</p>
                </div>
            </div>

            <button className="primary-button" onClick={handleStart} style={{ maxWidth: '300px', padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Comenzar a Planear 🚀
            </button>
        </div>
    );
}