// src/pages/TermsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './TermsPage.css';

export function TermsPage() {
    return (
        <div className="legal-page animate-fade-in">
            <div className="legal-container">
                <header className="legal-header">
                    <h1>Términos y <span className="text-highlight">Condiciones</span></h1>
                    <p className="legal-subtitle">
                        Al utilizar Horario UDG, aceptas los siguientes términos y condiciones.
                    </p>
                    <p className="legal-date">Última actualización: 14 de junio de 2026</p>
                </header>

                <section className="legal-section">
                    <h2>1. Aceptación de Términos</h2>
                    <p>
                        Al acceder y utilizar Horario UDG, aceptas vincularte por 
                        estos Términos y Condiciones. Si no estás de acuerdo con 
                        alguna parte de estos términos, no utilices nuestra aplicación.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>2. Descripción del Servicio</h2>
                    <p>
                        Horario UDG es una herramienta web gratuita que permite a 
                        los estudiantes de la Universidad de Guadalajara:
                    </p>
                    <ul>
                        <li>Planificar y organizar sus horarios académicos</li>
                        <li>Consultar la oferta de cursos del SIIAU</li>
                        <li>Guardar múltiples horarios</li>
                        <li>Evaluar y calificar a profesores</li>
                        <li>Monitorear cupos disponibles en materias con demanda</li>
                        <li>Recibir notificaciones push sobre cupos, cambios de horario y cambios de profesor</li>
                        <li>Consultar calificaciones y opiniones de otros estudiantes</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>3. Naturaleza del Servicio</h2>
                    <div className="important-box">
                        <p>
                            <strong>IMPORTANTE:</strong> Horario UDG es una aplicación 
                            <strong> independiente</strong> desarrollada por estudiantes. 
                            <strong> NO</strong> somos parte oficial de la Universidad de Guadalajara, 
                            sus centros universitarios o el SIIAU.
                        </p>
                        <p>
                            Los datos de horarios y cursos se obtienen públicamente del 
                            sistema SIIAU, pero no garantizamos la exactitud o disponibilidad 
                            de los mismos.
                        </p>
                    </div>
                </section>

                <section className="legal-section">
                    <h2>4. Requisitos de Uso</h2>
                    <p>Para utilizar Horario UDG debes:</p>
                    <ul>
                        <li>Ser estudiante, académico o empleado de la UDG</li>
                        <li>Tener una cuenta de correo institucional (@alumnos.udg.mx o @academicos.udg.mx)</li>
                        <li>Ser mayor de edad o contar con autorización de tutores legales</li>
                        <li>Proporcionar información veraz y actualizada</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>5. Cuenta de Usuario</h2>
                    <p>
                        El acceso a ciertas funciones requiere una cuenta de usuario. 
                        Te comprometes a:
                    </p>
                    <ul>
                        <li>Mantener la confidencialidad de tu cuenta y contraseña</li>
                        <li>No compartir tu cuenta con terceros</li>
                        <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
                        <li>Ser responsable de todas las actividades bajo tu cuenta</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>6. Uso Aceptable</h2>
                    <p>Te comprometes a NO:</p>
                    <ul>
                        <li>Utilizar el servicio para fines ilegales o no autorizados</li>
                        <li>Intentar acceder a cuentas de otros usuarios</li>
                        <li>Realizar ataques de fuerza bruta o automatización excesiva</li>
                        <li>Publicar contenido falso, difamatorio o abusivo</li>
                        <li>Modificar, copiar o distribuir el código de la aplicación</li>
                        <li>Utilizar el servicio para obtener información personal de otros usuarios</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>7. Notificaciones y Monitoreo</h2>
                    <p>
                        La función de monitoreo de cupos te permite recibir notificaciones cuando 
                        se libere un lugar en una materia o cuando haya cambios en el horario o 
                        profesor asignado. Al activar el monitoreo de una materia:
                    </p>
                    <ul>
                        <li>Autorizas a Horario UDG a consultar periódicamente el estado de esa materia en el SIIAU</li>
                        <li>Aceptas recibir notificaciones push relacionadas únicamente con esa materia</li>
                        <li>Puedes desactivar el monitoreo en cualquier momento desde la aplicación</li>
                        <li>El monitoreo se realiza únicamente entre las 7:00 y 23:00 horas, hora del centro de México</li>
                    </ul>
                    <p>
                        Las notificaciones se entregan mediante <strong>Firebase Cloud Messaging (FCM)</strong> 
                        y pueden estar sujetas a retrasos dependiendo de tu conexión a internet y 
                        la configuración de tu dispositivo. No garantizamos la entrega inmediata 
                        de las notificaciones.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>7.1. Monitoreo Colaborativo (Ayuda a la Comunidad)</h2>
                    <p>
                        Para mejorar la detección de cambios en las materias sin depender únicamente 
                        de ejecuciones programadas limitadas, Horario UDG implementa un sistema de 
                        <strong> monitoreo colaborativo</strong>.
                    </p>
                    <p>
                        Cuando realizas una consulta de la oferta académica en el SIIAU a través de 
                        la aplicación, de forma automática y en segundo plano también se revisa el 
                        estado de otras materias que están siendo monitoreadas por otros usuarios. 
                        Esto permite que entre todos mantengamos el sistema de notificaciones más 
                        actualizado.
                    </p>
                    <p>
                        Es importante aclarar que:
                    </p>
                    <ul>
                        <li><strong>No se comparte</strong> tu información personal ni tus horarios guardados</li>
                        <li>Solo se verifica la disponibilidad de NRCs que <strong>ya están en monitoreo</strong> por otros usuarios</li>
                        <li>No se almacena ni registra qué consultaste ni cuándo</li>
                        <li>Tu consulta no se ralentiza — la verificación ocurre en segundo plano</li>
                        <li>Este comportamiento se puede <strong>desactivar</strong> en cualquier momento desde la configuración de notificaciones</li>
                    </ul>
                    <p>
                        Al usar la aplicación, aceptas participar en este monitoreo colaborativo. 
                        Puedes desactivarlo en cualquier momento desde la sección de Notificaciones.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>8. Evaluaciones y Comentarios de Profesores</h2>
                    <p>
                        Las evaluaciones y comentarios publicados por usuarios son 
                        opiniones personales y no representan la opinión de Horario UDG 
                        ni de la Universidad de Guadalajara.
                    </p>
                    <p>
                        Nos reservamos el derecho de eliminar evaluaciones que:
                    </p>
                    <ul>
                        <li>Contengan lenguaje ofensivo o discriminatorio</li>
                        <li>Sean falsas o difamatorias</li>
                        <li>Incluyan información personal identificable</li>
                        <li>Violen derechos de terceros</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>9. Limitación de Responsabilidad</h2>
                    <div className="disclaimer-box">
                        <p>
                            <strong>DESCARGO DE RESPONSABILIDAD:</strong> Horario UDG 
                            se proporciona "tal cual" y "según disponibilidad". No 
                            garantizamos que el servicio sea continuo, seguro o libre 
                            de errores.
                        </p>
                        <p>
                            No somos responsables por:
                        </p>
                        <ul>
                            <li>Pérdida de datos o horarios</li>
                            <li>Interrupciones del servicio</li>
                            <li>Decisiones académicas tomadas basándose en la información de la app</li>
                            <li>Cualquier daño directo o indirecto derivado del uso del servicio</li>
                        </ul>
                    </div>
                </section>

                <section className="legal-section">
                    <h2>10. Propiedad Intelectual</h2>
                    <p>
                        El código fuente, diseño, logos y contenido de Horario UDG 
                        son propiedad intelectual de sus desarrolladores. Puedes 
                        utilizar la aplicación personal y educativamente, pero no 
                        puedes:
                    </p>
                    <ul>
                        <li>Copiar, modificar o distribuir el código fuente</li>
                        <li>Utilizar nuestra marca sin autorización</li>
                        <li>Crear derivados de la aplicación</li>
                        <li>Comercializar el servicio</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>11. Modificaciones al Servicio</h2>
                    <p>
                        Nos reservamos el derecho de modificar, suspender o discontinuar 
                        cualquier aspecto del servicio en cualquier momento. También 
                        podemos actualizar estos términos periódicamente.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>12. Terminación</h2>
                    <p>
                        Podemos suspender o terminar tu cuenta si incumples estos 
                        términos o si detectamos uso fraudulento o abuso del servicio.
                    </p>
                    <p>
                        Puedes eliminar tu cuenta en cualquier momento desde la 
                        configuración de tu perfil.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>13. Ley Aplicable</h2>
                    <p>
                        Estos términos se rigen por las leyes de México. Cualquier 
                        disputa será resuelta en los tribunales de Guadalajara, Jalisco.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>14. Contacto</h2>
                    <p>
                        Si tienes preguntas sobre estos términos, contactanos a 
                        través de los canales disponibles en la aplicación.
                    </p>
                </section>

                <div className="legal-footer-nav">
                    <Link to="/privacidad" className="legal-link">
                        Ver Aviso de Privacidad →
                    </Link>
                    <Link to="/" className="legal-link">
                        ← Volver al Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}