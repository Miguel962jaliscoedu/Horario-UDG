import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { clearSession } from '../utils/session';
import { getUserSchedules } from '../services/storageService';
import { getMyRatings } from '../services/myRatingsService';
import { getMonitoredCourses, getUserNotifications, stopMonitoring } from '../services/notificationService';
import { showToast } from '../utils/toast';
import './DashboardPage.css';

export function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { permission, requestPermission } = useNotifications();

    const [schedules, setSchedules] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [monitoredCourses, setMonitoredCourses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        loadDashboardData();
    }, [user, navigate]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [schedulesData, ratingsData, monitoredData, notificationsData] = await Promise.all([
                getUserSchedules(user.uid),
                getMyRatings(user.uid),
                getMonitoredCourses(user.uid).catch(() => []),
                getUserNotifications(user.uid).catch(() => []),
            ]);
            setSchedules(schedulesData);
            setRatings(ratingsData);
            setMonitoredCourses(monitoredData);
            setNotifications(notificationsData);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewSchedule = () => {
        clearSession();
        navigate('/planear');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    };

    const formatRatingDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    };

    const formatProfName = (profId) => profId.replace(/_/g, ' ');

    const getUniqueSubjectsCount = (schedule) => {
        const rawSubjects = (schedule.materias || []).filter(m =>
            (schedule.selectedNRCs || []).includes(m.nrc)
        );
        return rawSubjects.filter((obj, index, self) =>
            index === self.findIndex((t) => t.nrc === obj.nrc)
        ).length;
    };

    const stats = [
        {
            icon: '📅', label: 'Horarios', value: schedules.length,
            color: 'var(--primary-color)', bg: 'var(--primary-color-light)',
            link: '/mis-horarios',
        },
        {
            icon: '⭐', label: 'Evaluaciones', value: ratings.length,
            color: 'var(--star-active-color)', bg: 'var(--tag-yellow-bg)',
            link: '/mis-evaluaciones',
        },
        {
            icon: '🔔', label: 'Notificaciones', value: unreadCount,
            color: 'var(--primary-color)', bg: 'var(--primary-color-light)',
            link: '/mis-notificaciones',
        },
        {
            icon: '📡', label: 'Monitoreo', value: monitoredCourses.length,
            color: 'var(--success-color)', bg: 'var(--tag-green-bg)',
            link: '/mis-notificaciones',
        },
    ];

    const recentSchedules = schedules.slice(0, 3);
    const recentRatings = ratings.slice(0, 3);
    const recentMonitored = monitoredCourses.slice(0, 5);

    if (loading) {
        return (
            <div className="animate-fade-in dashboard-container">
                <div className="dashboard-loading">
                    <div className="spinner"></div>
                    <p>Cargando tu dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in dashboard-container">
            {/* === WELCOME BANNER === */}
            <header className="welcome-banner">
                <div className="welcome-avatar">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="" className="avatar-img" />
                    ) : (
                        <span className="avatar-fallback">
                            {user?.displayName?.charAt(0) || 'U'}
                        </span>
                    )}
                </div>
                <div className="welcome-text">
                    <h1>¡Qué gusto verte, {user?.displayName?.split(' ')[0]}! 👋</h1>
                    <p>Resumen de tu actividad en Horario UDG</p>
                </div>
                <button onClick={handleNewSchedule} className="welcome-cta">
                    ✨ Nuevo Horario
                </button>
            </header>

            {/* === STATS ROW === */}
            <div className="stats-row">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="stat-card stat-card-clickable"
                        style={{
                            '--stat-color': stat.color,
                            '--stat-bg': stat.bg,
                        }}
                        onClick={() => navigate(stat.link)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && navigate(stat.link)}
                    >
                        <span className="stat-icon">{stat.icon}</span>
                        <div className="stat-info">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* === QUICK ACTIONS === */}
            <div className="quick-actions">
                <span className="quick-actions-label">Acceso rápido:</span>
                <div className="quick-actions-buttons">
                    <button onClick={handleNewSchedule} className="quick-btn">
                        ✨ Nuevo Horario
                    </button>
                    <Link to="/mis-horarios" className="quick-btn">
                        📅 Mis Horarios
                    </Link>
                    <Link to="/mis-evaluaciones" className="quick-btn">
                        ⭐ Mis Evaluaciones
                    </Link>
                    <Link to="/profesores" className="quick-btn">
                        👨‍🏫 Profesores
                    </Link>
                    <Link to="/mis-notificaciones" className="quick-btn">
                        🔔 Notificaciones
                    </Link>
                </div>
            </div>

            {/* === NOTIFICATION MANAGEMENT === */}
            <section className="dashboard-section notif-manage-section">
                <div className="section-header clickable-header" onClick={() => navigate('/mis-notificaciones')}>
                    <h2>🔔 Gestión de Notificaciones</h2>
                    <Link to="/mis-notificaciones" className="section-link" onClick={e => e.stopPropagation()}>
                        Ir &rarr;
                    </Link>
                </div>
                <div className="notif-manage-body">
                    <div className="notif-manage-status">
                        <span className={`notif-permission-dot ${permission || 'default'}`}></span>
                        <div className="notif-manage-status-text">
                            <strong>Permiso de notificaciones</strong>
                            <span className="notif-manage-status-label">
                                {permission === 'granted'
                                    ? '✅ Notificaciones push activadas — recibirás alertas de cupos y cambios'
                                    : permission === 'denied'
                                        ? '❌ Permiso denegado — cámbialo desde la configuración del navegador'
                                        : '🔕 No activadas — actívalas para recibir alertas de cupos'}
                            </span>
                        </div>
                    </div>
                    <div className="notif-manage-actions">
                        {permission !== 'granted' && (
                            <button onClick={requestPermission} className="notif-manage-btn" type="button">
                                🔔 Activar notificaciones
                            </button>
                        )}
                        <Link to="/mis-notificaciones" className="notif-manage-btn secondary">
                            Ver notificaciones
                        </Link>
                    </div>
                </div>
                {(monitoredCourses.length > 0) && (
                    <div className="notif-manage-monitored">
                        <div className="notif-manage-monitored-header">
                            <span className="notif-manage-monitored-title">📡 Resumen de monitoreo</span>
                            <span className="notif-manage-monitored-count">{monitoredCourses.length} materia{monitoredCourses.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="notif-manage-monitored-list">
                            {monitoredCourses.slice(0, 4).map((mc) => (
                                <div key={mc.nrc} className="notif-manage-monitored-item">
                                    <span className="monitor-status-dot"></span>
                                    <span className="notif-manage-monitored-name">{mc.materia || 'Sin nombre'}</span>
                                    <span className="monitor-nrc">NRC {mc.nrc}</span>
                                    <button
                                        className="notif-manage-monitored-remove"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                                await stopMonitoring(mc.nrc, mc.horarioLabel);
                                                const updated = await getMonitoredCourses(user.uid);
                                                setMonitoredCourses(updated);
                                                showToast(`Monitoreo de ${mc.materia || mc.nrc} detenido`, 'info');
                                            } catch { showToast('Error al detener monitoreo', 'error'); }
                                        }}
                                        title="Detener monitoreo"
                                        type="button"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        {monitoredCourses.length > 4 && (
                            <Link to="/mis-notificaciones" className="notif-manage-monitored-more">
                                + {monitoredCourses.length - 4} más &rarr;
                            </Link>
                        )}
                    </div>
                )}
                {monitoredCourses.length === 0 && (
                    <div className="notif-manage-empty">
                        <span>📡 Aún no monitoreas materias — monitorea desde el planificador</span>
                        <Link to="/planear" className="notif-manage-btn secondary small">Ir al planificador</Link>
                    </div>
                )}
            </section>

            {/* === MAIN CONTENT: TWO COLUMNS === */}
            <div className="dashboard-main">
                {/* === RECENT SCHEDULES === */}
                <section className="dashboard-section">
                    <div className="section-header clickable-header" onClick={() => schedules.length > 0 && navigate('/mis-horarios')}>
                        <h2>📅 Horarios Recientes</h2>
                        {schedules.length > 0 && (
                            <Link to="/mis-horarios" className="section-link" onClick={e => e.stopPropagation()}>
                                Ver todos &rarr;
                            </Link>
                        )}
                    </div>

                    {schedules.length === 0 ? (
                        <div className="section-empty">
                            <span className="empty-icon">📅</span>
                            <p>Aún no tienes horarios guardados</p>
                            <button onClick={handleNewSchedule} className="empty-cta">
                                Crear mi primer horario
                            </button>
                        </div>
                    ) : (
                        <div className="section-list">
                            {recentSchedules.map((sch) => {
                                const count = getUniqueSubjectsCount(sch);
                                return (
                                    <div
                                        key={sch.id}
                                        className="list-item clickable"
                                        onClick={() => navigate(`/mis-horarios?edit=${sch.id}`)}
                                    >
                                        <div className="list-item-bar"></div>
                                        <div className="list-item-content">
                                            <div className="list-item-top">
                                                <span className="list-item-name">{sch.name || 'Sin título'}</span>
                                                <span className="list-item-time">{formatDate(sch.updatedAt)}</span>
                                            </div>
                                            <div className="list-item-meta">
                                                {sch.formParams?.carrera && (
                                                    <span className="list-item-tag">{sch.formParams.carrera}</span>
                                                )}
                                                <span className="list-item-count">{count} materias</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* === RECENT RATINGS === */}
                <section className="dashboard-section">
                    <div className="section-header clickable-header" onClick={() => ratings.length > 0 && navigate('/mis-evaluaciones')}>
                        <h2>⭐ Evaluaciones Recientes</h2>
                        {ratings.length > 0 && (
                            <Link to="/mis-evaluaciones" className="section-link" onClick={e => e.stopPropagation()}>
                                Ver todas &rarr;
                            </Link>
                        )}
                    </div>

                    {ratings.length === 0 ? (
                        <div className="section-empty">
                            <span className="empty-icon">⭐</span>
                            <p>Aún no has evaluado profesores</p>
                            <Link to="/profesores" className="empty-cta-link">
                                Evaluar profesores
                            </Link>
                        </div>
                    ) : (
                        <div className="section-list">
                            {recentRatings.map((r) => (
                                <div
                                    key={r.id}
                                    className="list-item clickable"
                                    onClick={() => navigate('/mis-evaluaciones')}
                                >
                                    <div className="list-item-bar rating-bar"></div>
                                    <div className="list-item-content">
                                        <div className="list-item-top">
                                            <span className="list-item-name">{formatProfName(r.professorId)}</span>
                                            <span
                                                className="rating-score"
                                                style={{
                                                    '--score-color':
                                                        r.stars >= 7
                                                            ? 'var(--success-color)'
                                                            : r.stars >= 4
                                                              ? 'var(--warning-color)'
                                                              : 'var(--error-color)',
                                                }}
                                            >
                                                ★ {r.stars}/10
                                            </span>
                                        </div>
                                        <div className="list-item-meta">
                                            <span className="list-item-time">
                                                {formatRatingDate(r.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* === MONITORED COURSES === */}
                <section className="dashboard-section monitored-section">
                    <div className="section-header clickable-header" onClick={() => monitoredCourses.length > 0 && navigate('/mis-notificaciones')}>
                        <h2>📡 Materias Monitoreadas</h2>
                        {monitoredCourses.length > 0 && (
                            <Link to="/mis-notificaciones" className="section-link" onClick={e => e.stopPropagation()}>
                                Ver todas &rarr;
                            </Link>
                        )}
                    </div>

                    {monitoredCourses.length === 0 ? (
                        <div className="section-empty">
                            <span className="empty-icon">📡</span>
                            <p>Aún no monitoreas ninguna materia</p>
                            <Link to="/planear" className="empty-cta-link">
                                Ir al planificador
                            </Link>
                        </div>
                    ) : (
                        <div className="section-list monitored-list">
                            {recentMonitored.map((mc) => (
                                <div
                                    key={mc.id || mc.nrc}
                                    className="list-item clickable"
                                    onClick={() => navigate('/mis-notificaciones')}
                                >
                                    <div className="list-item-bar monitor-bar"></div>
                                    <div className="list-item-content">
                                        <div className="list-item-top">
                                            <span className="list-item-name">{mc.materia || 'Sin nombre'}</span>
                                            <span className="monitor-nrc">NRC {mc.nrc}</span>
                                        </div>
                                        <div className="list-item-meta">
                                            {mc.profesor && (
                                                <span className="list-item-tag">{mc.profesor}</span>
                                            )}
                                            {mc.horarioLabel && (
                                                <span className="list-item-tag">{mc.horarioLabel}</span>
                                            )}
                                            <span className="monitor-status-dot"></span>
                                            <span className="monitor-status-text">Monitoreando</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
        </div>
    );
}