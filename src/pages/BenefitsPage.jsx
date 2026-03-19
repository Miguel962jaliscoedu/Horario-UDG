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
            description: 'Software líder en diseño CAD 2D y 3D para ingeniería y arquitectura.',
            details: (
                <div className="details-inner">
                    <div className="detail-col">
                        <h4>📋 Requisitos</h4>
                        <p>Alumno activo, académico o administrativo.</p>
                        <h4>⏰ Duración</h4>
                        <p>1 año (renovable anualmente).</p>
                    </div>
                    <div className="detail-col">
                        <h4>📁 Guías y Soporte</h4>
                        <div className="link-group">
                            <a href="https://beneficios.diferente.page/guias/guia_instalar_autocad.pdf" target="_blank" rel="noreferrer" className="inline-link text-small">📄 Guía Instalación</a>
                            <a href="https://beneficios.diferente.page/guias/guia_renovar_licencia_autocad.pdf" target="_blank" rel="noreferrer" className="inline-link text-small">🔄 Guía Renovación</a>
                            <p className="note">Soporte: soporte@cucei.udg.mx</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'SolidWorks',
            name: 'SolidWorks™',
            area: 'CUCEI',
            type: 'Licencia Institucional',
            description: 'Software CAD profesional para modelado mecánico 3D.',
            details: (
                <div className="details-inner">
                    <div className="detail-col">
                        <h4>⚙️ Descripción</h4>
                        <p>Licencia para hasta 10,000 máquinas. Modelado mecánico 2D/3D.</p>
                        <h4>💻 Requisitos</h4>
                        <p>Windows 10/11 (64 bits), 2GB VRAM mín.</p>
                    </div>
                    <div className="detail-col">
                        <h4>📍 Activación</h4>
                        <p className="warning-text">⚠️ Debes asistir a la CTA (Ubicada entre ALFA y BETA) con tu equipo personal para la activación.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'MATLAB',
            name: 'MATLAB',
            area: 'Pregrado y Posgrado',
            type: 'Portal MathWorks',
            description: 'Computación numérica y análisis de datos avanzado.',
            details: (
                <div className="details-inner">
                    <div className="detail-col">
                        <h4>📊 Beneficios</h4>
                        <p>Instalación ilimitada y acceso a TODOS los toolboxes oficiales.</p>
                    </div>
                    <div className="detail-col">
                        <h4>📥 Acceso</h4>
                        <a href="https://la.mathworks.com/academia/tah-portal/universidad-de-guadalajara-31544721.html" target="_blank" rel="noreferrer" className="download-btn">
                            🔗 Portal MathWorks UDG
                        </a>
                    </div>
                </div>
            )
        },
        {
            id: 'Unity',
            name: 'Unity Pro',
            area: 'Desarrollo de Software',
            type: 'Plan Estudiante',
            description: 'Motor líder para videojuegos y apps interactivas.',
            details: (
                <div className="details-inner">
                    <div className="detail-col">
                        <h4>🎨 Creatividad</h4>
                        <p>Acceso a Unity Pro, herramientas de colaboración y assets educativos.</p>
                    </div>
                    <div className="detail-col">
                        <h4>🚀 Activación</h4>
                        <a href="https://unity.com/es/products/unity-student" target="_blank" rel="noreferrer" className="download-btn">
                            🔗 Registro Unity Student
                        </a>
                    </div>
                </div>
            )
        },
        {
            id: 'JetBrains',
            name: 'JetBrains Suite',
            area: 'Todas las carreras',
            type: 'Licencia Educativa',
            description: 'Todos los IDEs de JetBrains: IntelliJ, PyCharm, WebStorm y más.',
            details: (
                <div className="details-inner">
                    <div className="detail-col">
                        <h4>💻 IDEs Incluidos</h4>
                        <p>IntelliJ IDEA Ultimate, PyCharm, WebStorm, PhpStorm, CLion, DataGrip, Rider.</p>
                    </div>
                    <div className="detail-col">
                        <h4>🎓 Verificación</h4>
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
            area: 'Análisis de Datos',
            type: 'Licencia Estudiante',
            description: 'Visualización interactiva de datos y Business Intelligence.',
            details: (
                <div className="details-inner">
                    <div className="detail-col">
                        <h4>📈 Características</h4>
                        <p>Dashboards profesionales, búsqueda AI y conexión a múltiples bases de datos.</p>
                    </div>
                    <div className="detail-col">
                        <h4>📥 Solicitud</h4>
                        <a href="https://www.tableau.com/academic/students" target="_blank" rel="noreferrer" className="download-btn">
                            🔗 Tableau academic portal
                        </a>
                    </div>
                </div>
            )
        }
    ];

    const extraBenefits = [
        {
            id: 'figma',
            title: 'Figma Professional',
            desc: 'Herramienta líder en diseño UI/UX y prototipado.',
            icon: '🎨',
            color: '#F24E1E',
            benefits: ['Proyectos ilimitados', 'Colaboración en tiempo real'],
            link: 'https://www.figma.com/education/'
        },
        {
            id: 'perplexity',
            title: 'Perplexity Pro',
            desc: 'Investigación AI avanzada con GPT-4 y Claude.',
            icon: '🔍',
            color: '#12B3B3',
            benefits: ['1 Año Gratis (Valor $200 USD)', 'Búsqueda AI ilimitada'],
            link: 'https://www.perplexity.ai/pro?referral_code=STUDENT2024'
        },
        {
            id: 'cursor',
            title: 'Cursor AI Editor',
            desc: 'El editor de código del futuro potenciado por IA.',
            icon: '💻',
            color: '#00D1FF',
            benefits: ['Asistente de código avanzado', 'Gratis con correo .edu'],
            link: 'https://cursor.sh/pricing'
        },
        {
            id: 'azure',
            title: 'Microsoft Azure',
            desc: 'Computación en la nube para tus proyectos.',
            icon: '☁️',
            color: '#0078D4',
            benefits: ['$100 USD en créditos', 'Sin requerir tarjeta de crédito'],
            link: 'https://azure.microsoft.com/es-mx/free/students/'
        },
        {
            id: 'apple',
            title: 'Apple Education',
            desc: 'Precios especiales en Mac e iPad.',
            icon: '🍎',
            color: '#555555',
            benefits: ['Descuentos de hasta $3,000 MXN', 'AirPods incluidos (Temp. Limitada)'],
            link: 'https://www.apple.com/mx-edu/store'
        },
        {
            id: 'github',
            title: 'GitHub Student Pack',
            desc: 'El pack definitivo para desarrolladores.',
            icon: '🐙',
            color: '#181717',
            benefits: ['GitHub Pro Gratis', 'Valor de +$200k USD en tools'],
            link: 'https://education.github.com/pack'
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
                            <span className="new-price">$249 MXN/mes</span>
                        </div>
                        <p className="text-center">Todo Creative Cloud (20+ apps). Precio especial 1er año.</p>
                        <p className="expiry-text">Términos: Compromiso anual requerido.</p>
                        <a href="https://www.adobe.com/mx/creativecloud/buy/students.html" target="_blank" rel="noreferrer" className="action-btn urgent-btn">
                            Obtener Descuento
                        </a>
                    </div>

                    <div className="benefit-card special-offer">
                        <div className="badge-corner blue">Registro 2026</div>
                        <div className="card-top center-logo">
                            <span className="emoji-logo">🎮</span>
                        </div>
                        <h3 className="text-center">Unity Pro Studen</h3>
                        <div className="price-box">
                            <span className="new-price">GRATIS PARA TI</span>
                        </div>
                        <p className="text-center">Licencia Pro, assets premium y formación oficial incluida.</p>
                        <p className="expiry-text">Vence: 31 Diciembre 2026</p>
                        <a href="https://unity.com/es/products/unity-student" target="_blank" rel="noreferrer" className="action-btn secondary-btn-live">Activar Mi Plan</a>
                    </div>

                    <div className="benefit-card special-offer">
                        <div className="badge-corner orange">Fines de Ciclo</div>
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
                                                <td colSpan="4">
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
                                    <td colSpan="4" className="no-results">
                                        No se encontraron resultados para "{searchTerm}" 😢
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SECCIÓN 4: EXTRAS (REDISEÑADA) */}
            <section id="beneficios-adicionales" className="section-container">
                <div className="section-header">
                    <h2>🌟 Otros Beneficios de Clase Mundial</h2>
                    <p>Potencia tus habilidades con estas herramientas líderes del sector.</p>
                </div>
                
                <div className="premium-extras-grid">
                    {extraBenefits.map(benefit => (
                        <a 
                            key={benefit.id} 
                            href={benefit.link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="premium-benefit-card"
                            style={{ '--accent-color': benefit.color }}
                        >
                            <div className="p-card-header">
                                <span className="p-card-icon">{benefit.icon}</span>
                                <h4>{benefit.title}</h4>
                            </div>
                            <p>{benefit.desc}</p>
                            <ul className="p-benefit-list">
                                {benefit.benefits.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                            <div className="p-card-footer">
                                <span>Ver beneficio</span>
                                <span className="arrow">↗</span>
                            </div>
                        </a>
                    ))}
                </div>
                
                {/* BANNER SPOTIFY/AMAZON COMPACTO */}
                <div className="compact-benefits-row">
                    <a href="https://www.spotify.com/mx/student/" target="_blank" rel="noreferrer" className="compact-benefit-item spotify">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="Spotify" />
                        <span>Spotify Premium Student - <strong>50% OFF</strong></span>
                    </a>
                    <a href="https://www.amazon.com.mx/amazonprime" target="_blank" rel="noreferrer" className="compact-benefit-item amazon">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/d/de/Amazon_icon.png" alt="Amazon" />
                        <span>Amazon Prime - <strong>3 Meses Gratis</strong></span>
                    </a>
                </div>
            </section>

            {/* SECCIÓN 5: PREGUNTAS FRECUENTES */}
            <section className="section-container faq-section">
                <div className="section-header">
                    <h2>❓ Dudas Frecuentes</h2>
                </div>
                <div className="faq-grid">
                    <div className="faq-item">
                        <h4>¿Cómo obtengo mi correo institucional?</h4>
                        <p>Puedes solicitarlo o recuperarlo en el portal del SIIAU o contactando a la CTA de tu centro universitario.</p>
                    </div>
                    <div className="faq-item">
                        <h4>¿Cuánto duran estas licencias?</h4>
                        <p>La mayoría son anuales renovables. Se requiere verificar tu estatus de alumno activo cada año.</p>
                    </div>
                    <div className="faq-item">
                        <h4>¿Tengo soporte técnico?</h4>
                        <p>La UDG ofrece soporte base, pero para problemas específicos de software se recomienda contactar al proveedor (Autodesk, MathWorks, etc.).</p>
                    </div>
                </div>
            </section>

            {/* SECCIÓN DE CRÉDITOS */}
            <section className="credits-container">
                <div className="credits-card">
                    <div className="credits-info">
                        <h3>ℹ️ Información del Proyecto</h3>
                        <p>
                            Esta sección es una guía centralizada basada en el proyecto comunitario 
                            <strong> "Software UDG"</strong>.
                        </p>
                        <div className="update-status">
                            <span className="dot"></span> 
                            📅 Actualizado: Marzo 2026
                        </div>
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