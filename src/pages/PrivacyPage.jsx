// src/pages/PrivacyPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPage.css';

export function PrivacyPage() {
    return (
        <div className="legal-page animate-fade-in">
            <div className="legal-container">
                <header className="legal-header">
                    <h1>Aviso de <span className="text-highlight">Privacidad</span></h1>
                    <p className="legal-subtitle">
                        En Horario UDG respecting your privacy and protecting your personal data.
                    </p>
                    <p className="legal-date">Última actualización: 23 de abril de 2026</p>
                </header>

                <section className="legal-section">
                    <h2>1. Identidad y Domicilio del Responsable</h2>
                    <p>
                        Horario UDG es una aplicación web desarrollada de manera independiente 
                        por estudiantes de la Universidad de Guadalajara. No estamos afiliados 
                        oficialmente a la Universidad de Guadalajara ni a sus entidades administrativas.
                    </p>
                    <p>
                        <strong>Domicilio:</strong> Guadalajara, Jalisco, México.<br />
                        <strong>Contacto:</strong> A través de la seccion de feedback y soporte de la aplicación.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>2. Datos Personales que Recopilamos</h2>
                    <p>Recopilamos los siguientes datos personales:</p>
                    <ul>
                        <li>
                            <strong>Datos de autenticación:</strong> Nombre, correo electrónico 
                            y fotografía de perfil proporcionados por Google OAuth cuando inicias 
                            sesión con tu cuenta institucional (@academicos.udg.mx o @alumnos.udg.mx).
                        </li>
                        <li>
                            <strong>Horarios guardados:</strong> Materias, NRC, profesor, días y 
                            horarios quedecides guardar en tu cuenta.
                        </li>
                        <li>
                            <strong>Evaluaciones de profesores:</strong> Calificaciones, comentarios 
                            y etiquetas que proporcionas sobre profesores.
                        </li>
                        <li>
                            <strong>Datos de navegación:</strong> Información técnica anónima 
                            como dirección IP, tipo de navegador y páginas visitadas.
                        </li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>3. Finalidad del Tratamiento de Datos</h2>
                    <p>Tus datos personales son utilizados para:</p>
                    <ul>
                        <li>Autenticarte en la aplicación mediante tu cuenta de Google</li>
                        <li>Guardar y gestionar tus horarios personales</li>
                        <li>Permitirte evaluar y calificar profesores</li>
                        <li>Mostrarte tus horarios guardados en diferentes dispositivos</li>
                        <li>Mejorar la experiencia de usuario</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>4. Base Legal para el Tratamiento</h2>
                    <p>
                        El tratamiento de tus datos personales se fundamenta en tu 
                        <strong> consentimiento</strong> explícito al crear una cuenta y 
                        utilizar nuestros servicios. Puedes revocar tu consentimiento en 
                        cualquier momento eliminando tu cuenta.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>5. Compartición de Datos</h2>
                    <p>Tus datos <strong>NO</strong> son:</p>
                    <ul className="negative-list">
                        <li>Vendidos a terceros</li>
                        <li>Compartidos con la Universidad de Guadalajara</li>
                        <li>Utilizados para fines publicitarios</li>
                        <li>Transferidos a servidores fuera de tu región</li>
                    </ul>
                    <p>
                        Utilizamos <strong>Firebase</strong> (Google) como proveedor de 
                        infraestructura para almacenar tus datos de manera segura.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>6. Seguridad de los Datos</h2>
                    <p>Implementamos medidas de seguridad técnicas y organizativas:</p>
                    <ul>
                        <li>Cifrado en tránsito mediante HTTPS/TLS</li>
                        <li>Autenticación segura mediante OAuth 2.0</li>
                        <li>Acceso restringido a tus datos personales</li>
                        <li>Respaldo regular de la base de datos</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>7. Retención de Datos</h2>
                    <p>
                        Tus datos se conservarán mientras mantengas una cuenta activa 
                        en la aplicación. Puedes solicitar la eliminación completa de 
                        tus datos en cualquier momento.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>8. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</h2>
                    <p>Tienes derecho a:</p>
                    <ul>
                        <li><strong>Acceso:</strong> Consultar los datos personales que tenemos</li>
                        <li><strong>Rectificación:</strong> Corregir datos incorrectos</li>
                        <li><strong>Cancelación:</strong> Solicitar la eliminación de tus datos</li>
                        <li><strong>Oposición:</strong> Objetar el tratamiento de tus datos</li>
                    </ul>
                    <p>
                        Para ejercer estos derechos, contactanos a través de la aplicación.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>9. Cookies y Tecnologías Similares</h2>
                    <p>
                        Utilizamos cookies técnicas necesarias para el funcionamiento 
                        de la aplicación. No utilizamos cookies de seguimiento o 
                        publicidad de terceros.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>10. Menores de Edad</h2>
                    <p>
                        Nuestra aplicación está diseñada para estudiantes universitarios. 
                        Si eres menor de edad, asegúrate de tener permiso de tus padres 
                        o tutores antes de utilizar la aplicación.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>11. Cambios al Aviso de Privacidad</h2>
                    <p>
                        Este aviso de privacidad puede ser actualizado periódicamente. 
                        Te notificaremos cualquier cambio significativo a través de 
                        la aplicación.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>12. Contacto</h2>
                    <p>
                        Si tienes preguntas sobre este aviso de privacidad o deseas 
                        ejercer tus derechos, puedes contactarnos a través de los 
                        canales disponibles en la aplicación.
                    </p>
                </section>

                <div className="legal-footer-nav">
                    <Link to="/terminos" className="legal-link">
                        Ver Términos y Condiciones →
                    </Link>
                    <Link to="/" className="legal-link">
                        ← Volver al Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}