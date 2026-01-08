// src/pages/BenefitsPage.jsx
import React, { useState, useMemo } from 'react';
import './BenefitsPage.css';

export function BenefitsPage() {
    const [expandedRow, setExpandedRow] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleDetails = (id) => {
        setExpandedRow(prev => prev === id ? null : id);
    };

    // Datos del software
    const specializedSoftware = [
        {
            id: 'AutoCAD',
            name: 'AutoCAD™ / Revit',
            area: 'CUCEI, CUAAD',
            type: 'Licencia Educativa',
            details: (
                <div className="details-inner">
                    <div className="detail-col">
                        <h4>📋 Requisitos</h4>
                        <p>Alumno activo, académico o administrativo.</p>
                        <h4>⏰ Duración</h4>
                        <p>1 año (renovable anualmente).</p>
                    </div>
                    <div className="detail-col">
                        <h4>📁 Documentación</h4>
                        <p className="note">Para soporte: soporte@cucei.udg.mx</p>
                    </div>
                </div>
            )
        },
        {
            id: 'SolidWorks',
            name: 'SolidWorks™',
            area: 'CUCEI',
            type: 'Licencia Institucional',
            details: (
                <div className="details-inner">
                    <div className="detail-col">
                        <h4>⚙️ Descripción</h4>
                        <p>Software CAD 3D. Licencia para hasta 10,000 máquinas.</p>
                    </div>
                    <div className="detail-col">
                        <h4>📍 Activación</h4>
                        <p className="warning-text">⚠️ Requiere activación presencial en la CTA (Módulos Alfa/Beta).</p>
                    </div>
                </div>
            )
        },
        {
            id: 'MATLAB',
            name: 'MATLAB',
            area: 'CUCEI, CUCSH',
            type: 'Portal MathWorks',
            details: (
                <div className="details-inner">
                    <div className="detail-col">
                        <h4>📊 Incluye</h4>
                        <p>Todos los toolboxes. Disponible para Pregrado y Posgrado.</p>
                    </div>
                    <div className="detail-col">
                        <h4>📥 Acceso</h4>
                        <a href="https://la.mathworks.com/academia/tah-portal/universidad-de-guadalajara-31544721.html" target="_blank" rel="noreferrer" className="download-btn">
                            🔗 Ir al Portal MathWorks
                        </a>
                    </div>
                </div>
            )
        },
        {
            id: 'StatGraphics',
            name: 'StatGraphics',
            area: 'CUCEI, CUCEA',
            type: 'Licencia Académica',
            details: (
                <div className="details-inner">
                    <div className="detail-col">
                        <h4>📈 Uso</h4>
                        <p>Análisis estadístico avanzado y ciencia de datos.</p>
                    </div>
                    <div className="detail-col">
                        <h4>⚠️ Nota</h4>
                        <p>Se recomienda instalar la versión de 32 bits.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'JetBrains',
            name: 'JetBrains Suite',
            area: 'Todas las carreras',
            type: 'Licencia Educativa',
            details: (
                <div className="details-inner">
                    <div className="detail-col">
                        <h4>💻 Herramientas</h4>
                        <p>IntelliJ IDEA, PyCharm, WebStorm, PHPStorm, etc.</p>
                    </div>
                    <div className="detail-col">
                        <h4>🎓 Validación</h4>
                        <a href="https://www.jetbrains.com/student/" target="_blank" rel="noreferrer" className="download-btn">
                            🔗 Solicitar con correo @alumnos
                        </a>
                    </div>
                </div>
            )
        },
        {
            id: 'Tableau',
            name: 'Tableau Desktop',
            area: 'CUCEA, CUCEI',
            type: 'Licencia Estudiante',
            details: (
                <div className="details-inner">
                    <div className="detail-col">
                        <h4>📊 Descripción</h4>
                        <p>Líder mundial en visualización de datos y Business Intelligence.</p>
                    </div>
                    <div className="detail-col">
                        <h4>📥 Descarga</h4>
                        <a href="https://www.tableau.com/academic/students" target="_blank" rel="noreferrer" className="download-btn">
                            🔗 Tableau for Students
                        </a>
                    </div>
                </div>
            )
        }
    ];

    const filteredSoftware = useMemo(() => {
        if (!searchTerm) return specializedSoftware;
        const lowerTerm = searchTerm.toLowerCase();
        return specializedSoftware.filter(sw => 
            sw.name.toLowerCase().includes(lowerTerm) || 
            sw.area.toLowerCase().includes(lowerTerm)
        );
    }, [searchTerm]);

    return (
        <div className="benefits-page animate-fade-in">
            
            {/* HERO SECTION CORREGIDO */}
            <header className="benefits-hero">
                <div className="hero-content">
                    <span className="hero-badge">🎓 Comunidad Estudiantil</span>
                    <h1>Software y Beneficios <span className="text-highlight">UDG</span></h1>
                    <p className="hero-subtitle">
                        Tu guía centralizada para acceder a licencias profesionales gratuitas y descuentos exclusivos con tu código de estudiante.
                    </p>
                </div>
            </header>

            {/* SECCIÓN 1: PRODUCTIVIDAD */}
            <section id="productividad" className="section-container">
                <div className="section-header">
                    <h2>💻 Productividad Esencial</h2>
                    <p>Herramientas base para tu día a día académico.</p>
                </div>
                
                <div className="cards-grid">
                    <div className="benefit-card office-card">
                        <div className="card-top">
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" 
                                alt="Office 365" 
                                className="brand-logo" 
                            />
                            <h3>Office 365</h3>
                        </div>
                        <p>Word, Excel, PowerPoint, Teams y 1TB en OneDrive.</p>
                        <ul className="check-list">
                            <li>Instálalo hasta en 5 dispositivos</li>
                            <li>Cuenta institucional oficial</li>
                        </ul>
                        <a href="https://portal.office.com/" target="_blank" rel="noreferrer" className="action-btn">
                            Iniciar Sesión
                        </a>
                    </div>

                    <div className="benefit-card google-card">
                        <div className="card-top">
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                                alt="Google" 
                                className="brand-logo" 
                            />
                            <h3>Google Workspace</h3>
                        </div>
                        <p>Gmail institucional, Drive ilimitado (según convenio), Classroom y Meet.</p>
                        <ul className="check-list">
                            <li>Correo @alumnos.udg.mx</li>
                            <li>Colaboración en tiempo real</li>
                        </ul>
                        <a href="http://gmail.com/" target="_blank" rel="noreferrer" className="action-btn">
                            Ir a Gmail
                        </a>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 2: TIEMPO LIMITADO */}
            <section id="tiempo-limitado" className="section-container highlight-section">
                <div className="limit-banner">
                    <span className="timer-emoji">⏰</span>
                    <div>
                        <h2>Ofertas por Tiempo Limitado</h2>
                        <p>¡Aprovéchalas antes de que expiren!</p>
                    </div>
                </div>

                <div className="cards-grid">
                    <div className="benefit-card special-offer urgent">
                        <div className="badge-corner">¡-63% OFF!</div>
                        <div className="card-top center-logo">
                            <img 
                                src="https://www.adobe.com/federal/assets/svgs/adobe-logo.svg" 
                                alt="Adobe CC" 
                                className="brand-logo large" 
                            />
                        </div>
                        <h3 className="text-center">Adobe Creative Cloud</h3>
                        <div className="price-box">
                            <span className="old-price">$949</span>
                            <span className="new-price">$349 MXN/mes</span>
                        </div>
                        <p className="text-center">Photoshop, Illustrator, Premiere Pro, After Effects.</p>
                        <p className="expiry-text">Vence: 30 Septiembre 2025</p>
                        <a href="https://www.adobe.com/mx/creativecloud/buy/students.html" target="_blank" rel="noreferrer" className="action-btn urgent-btn">
                            Obtener Descuento
                        </a>
                    </div>

                    <div className="benefit-card special-offer">
                        <div className="badge-corner blue">Vacaciones</div>
                        <div className="card-top center-logo">
                            <span className="emoji-logo">🚌</span>
                        </div>
                        <h3 className="text-center">Descuentos Viajes</h3>
                        <div className="price-box">
                            <span className="new-price">50% Descuento</span>
                        </div>
                        <p className="text-center">En autobuses (ETN, ADO, Primera Plus) y trenes.</p>
                        <p className="expiry-text">Válido en periodos vacacionales oficiales SEP/UDG.</p>
                        <button className="action-btn secondary-btn" disabled>Solo en Taquilla con Credencial</button>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 3: SOFTWARE ESPECIALIZADO */}
            <section id="especializado" className="section-container">
                <div className="section-header">
                    <h2>🛠️ Software Especializado</h2>
                    <p>Busca herramientas específicas por carrera o nombre.</p>
                </div>

                <div className="search-bar-container">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Buscar software (ej. AutoCAD, CUCEI, Matemáticas)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="software-search-input"
                    />
                </div>

                <div className="table-responsive-wrapper">
                    <table className="software-table">
                        <thead>
                            <tr>
                                <th>Software</th>
                                <th>Área / CU</th>
                                <th>Tipo</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSoftware.length > 0 ? (
                                filteredSoftware.map((sw) => (
                                    <React.Fragment key={sw.id}>
                                        <tr 
                                            className={`main-row ${expandedRow === sw.id ? 'expanded' : ''}`} 
                                            onClick={() => toggleDetails(sw.id)}
                                        >
                                            <td data-label="Software"><strong>{sw.name}</strong></td>
                                            <td data-label="Área">{sw.area}</td>
                                            <td data-label="Tipo"><span className="license-tag">{sw.type}</span></td>
                                            <td data-label="Acción">
                                                <button className="expand-toggle">
                                                    {expandedRow === sw.id ? 'Cerrar ▲' : 'Detalles ▼'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRow === sw.id && (
                                            <tr className="details-row-container">
                                                <td colspan="4">
                                                    <div className="details-content animate-slide-down">
                                                        {sw.details}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colspan="4" className="no-results">
                                        No se encontraron resultados para "{searchTerm}" 😢
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SECCIÓN 4: EXTRAS */}
            <section id="beneficios-adicionales" className="section-container">
                <div className="section-header">
                    <h2>🌟 Más Beneficios Estudiantiles</h2>
                </div>
                <div className="mini-cards-grid">
                    <a href="https://education.github.com/pack" target="_blank" rel="noreferrer" className="mini-card">
                        <img src="https://cdn.simpleicons.org/github/181717" alt="GitHub" className="mini-brand-logo dark-invert" />
                        <div>
                            <h4>GitHub Pack</h4>
                            <small>Pro + Copilot Gratis</small>
                        </div>
                    </a>
                    <a href="https://www.spotify.com/mx/student/" target="_blank" rel="noreferrer" className="mini-card">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="Spotify" className="mini-brand-logo" />
                        <div>
                            <h4>Spotify</h4>
                            <small>50% Descuento</small>
                        </div>
                    </a>
                    <a href="https://www.notion.so/product/notion-for-education" target="_blank" rel="noreferrer" className="mini-card">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="mini-brand-logo" />
                        <div>
                            <h4>Notion Plus</h4>
                            <small>Gratis Ilimitado</small>
                        </div>
                    </a>
                    <a href="https://www.amazon.com.mx/amazonprime" target="_blank" rel="noreferrer" className="mini-card">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/d/de/Amazon_icon.png" alt="Amazon" className="mini-brand-logo" />
                        <div>
                            <h4>Amazon Prime</h4>
                            <small>3 Meses Gratis</small>
                        </div>
                    </a>
                </div>
            </section>

            {/* SECCIÓN DE CRÉDITOS */}
            <section className="credits-container">
                <div className="credits-card">
                    <div className="credits-info">
                        <h3>ℹ️ Información del Proyecto</h3>
                        <p>
                            Esta sección es una adaptación integrada del proyecto comunitario original 
                            <strong> "Software UDG"</strong>.
                        </p>
                        <p className="update-badge">
                            📅 Actualizado: Septiembre 2025
                        </p>
                    </div>
                    <div className="credits-action">
                        <a href="https://beneficios.diferente.page/" target="_blank" rel="noreferrer" className="original-link-btn">
                            Visitar Sitio Original ↗
                        </a>
                    </div>
                </div>
                <p className="legal-text">
                    Las marcas y logotipos mostrados pertenecen a sus respectivos dueños. 
                    Este sitio no tiene afiliación directa con los proveedores de software.
                </p>
            </section>
        </div>
    );
}