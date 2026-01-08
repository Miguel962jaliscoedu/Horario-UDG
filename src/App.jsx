// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom'; // <--- Outlet reemplaza a Routes
import { AuthProvider } from './context/AuthContext.jsx'; // <--- Lo movemos aquí adentro
import { Footer } from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import './App.css';

function App() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'light';
    });

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
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                
                <main>
                    {/* Outlet renderiza la página hija correspondiente (PlannerPage, HomePage, etc.).
                       Usamos 'context' para pasar el tema a los hijos.
                    */}
                    <Outlet context={{ theme }} />
                </main>
                
                <Footer />
            </div>
        </AuthProvider>
    );
}

export default App;