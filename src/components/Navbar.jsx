// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import { GoogleAuthBtn } from './GoogleAuthBtn'; 
import udgLogo from '/udgleonline.svg';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme, showNewQuery, onNewQuery }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Estado para el menú móvil
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  // Cerrar menú al hacer clic en un enlace
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    closeMenu(); // Asegurar que se cierre el menú
    try { 
        await logout(); 
    } catch (error) { 
        console.error("Error al cerrar sesión:", error); 
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* --- SECCIÓN IZQUIERDA: LOGO --- */}
        <div className="navbar-left">
            {/* Botón Hamburguesa (Solo visible en móvil) */}
            <button 
                className={`hamburger-btn ${isMenuOpen ? 'open' : ''}`} 
                onClick={toggleMenu}
                aria-label="Abrir menú"
            >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>

            <Link to="/" className="navbar-logo" onClick={closeMenu}>
                <img src={udgLogo} alt="Logo UDG" className="logo-img" />
                <div className="logo-text">
                    <h1>Planeador <span className="text-highlight">UDG</span></h1>
                </div>
            </Link>
        </div>

        {/* --- SECCIÓN CENTRAL: ENLACES (Collapsible en móvil) --- */}
        {/* Overlay oscuro para cerrar menú al hacer click fuera */}
        <div className={`nav-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}></div>

        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
            {/* Header del menú móvil (opcional, para mostrar usuario o cerrar) */}
            <div className="mobile-menu-header">
                <span className="mobile-menu-title">Menú</span>
                <button className="close-menu-btn" onClick={closeMenu}>✕</button>
            </div>

            <Link 
                to="/planear" 
                className={`nav-link ${location.pathname === '/planear' ? 'active' : ''}`}
                onClick={closeMenu}
            >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Planificador</span>
            </Link>

            <Link 
                to="/beneficios" 
                className={`nav-link special-link ${location.pathname === '/beneficios' ? 'active' : ''}`}
                title="Ver beneficios para estudiantes"
                onClick={closeMenu}
            >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <span>Beneficios</span>
            </Link>

            {user && (
                <Link 
                    to="/mis-horarios" 
                    className={`nav-link ${location.pathname === '/mis-horarios' ? 'active' : ''}`}
                    onClick={closeMenu}
                >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                    <span>Mis Horarios</span>
                </Link>
            )}
        </div>

        {/* --- SECCIÓN DERECHA: ACCIONES (Siempre visibles) --- */}
        <div className="navbar-actions">
            
            {showNewQuery && (
                <button onClick={onNewQuery} className="btn-new-query" title="Nueva Consulta">
                    <span className="plus-icon">+</span> 
                    {/* El texto se oculta en CSS móvil */}
                    <span className="btn-text">Nueva</span> 
                </button>
            )}

            <button onClick={toggleTheme} className="btn-theme-toggle" title="Cambiar Tema">
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div className="divider"></div>

            {user ? (
                <div className="user-profile">
                    {/* En móvil solo mostramos el avatar para ahorrar espacio */}
                    <Link to="/dashboard" className="profile-link" title="Ir al Dashboard" onClick={closeMenu}>
                        <div className="user-info desktop-only">
                            <p className="user-name">{user.displayName?.split(' ')[0]}</p>
                        </div>
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Perfil" className="user-avatar" />
                        ) : (
                            <div className="user-avatar-placeholder">{user.displayName?.charAt(0)}</div>
                        )}
                    </Link>
                    <button onClick={handleLogout} className="btn-logout" title="Cerrar Sesión">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                    <GoogleAuthBtn />
                </div>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;