// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Footer } from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import { ToastContainer } from './components/Toast.jsx';
import { initFCM } from './services/notificationService.js';
import './App.css';

function App() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'light';
    });
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // Inicializar FCM al cargar la app (solo una vez)
    useEffect(() => {
        const hasMessagingSender = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
        if (hasMessagingSender && 'serviceWorker' in navigator) {
            initFCM().catch(() => {});
        }
    }, []);

    useEffect(() => {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        localStorage.setItem('app-theme', theme);
        
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    return (
        // AuthProvider ahora está DENTRO del RouterProvider (porque App es hijo del Router)
        // Esto permite que AuthContext pueda usar hooks de navegación si lo necesita.
        <AuthProvider>
            <div className="app-root">
                <a href="#main-content" className="skip-link">
                    Saltar al contenido principal
                </a>
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                
                <main className="app-main" id="main-content">
                    <Outlet context={{ theme }} />
                </main>
                
                <Footer />
            </div>
            <ToastContainer />
        </AuthProvider>
    );
}

export default App;