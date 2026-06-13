// src/components/NotificationBell.jsx
// Campana de notificaciones en la navbar con badge y dropdown
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { getUserSchedules } from '../services/storageService';
import './NotificationBell.css';

const NotificationBell = React.memo(() => {
    const { user } = useAuth();
    const { unreadCount, notifications, fetchNotifications, markAsRead, requestPermission, permission } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const bellRef = useRef(null);
    const navigate = useNavigate();

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                !bellRef.current?.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = useCallback(() => {
        if (!user) return;

        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(prev => !prev);
    }, [user, isOpen, fetchNotifications]);

    const handleNotificationClick = useCallback(async (notif) => {
        if (!notif.read) {
            await markAsRead(notif.id);
        }

        // Marcar como clicked
        setIsOpen(false);

        // Deep linking según tipo de notificación
        const nrc = notif.data?.nrc;
        const materia = notif.data?.materia;
        const profesor = notif.data?.profesor;
        let scheduleId = notif.data?.scheduleId;

        // Si no hay scheduleId pero tenemos nrc, buscar en horarios guardados
        if (!scheduleId && nrc && user) {
            try {
                const schedules = await getUserSchedules(user.uid);
                const match = schedules.find(s => s.selectedNRCs?.includes(Number(nrc)));
                if (match) {
                    scheduleId = match.id;
                }
            } catch (e) {
                console.warn('[NotificationBell] Error buscando horario para NRC:', e);
            }
        }

        switch (notif.type) {
            case 'seat_available':
                navigate(scheduleId ? `/mis-horarios?edit=${scheduleId}${nrc ? `&nrc=${nrc}` : ''}` : (nrc ? `/planear?nrc=${nrc}` : '/planear'));
                break;
            case 'schedule_change':
                navigate(scheduleId ? `/mis-horarios?edit=${scheduleId}${nrc ? `&nrc=${nrc}` : ''}` : (nrc ? `/mis-horarios?nrc=${nrc}` : '/mis-horarios'));
                break;
            case 'professor_change':
                navigate(profesor ? `/profesores?q=${encodeURIComponent(profesor)}` : '/profesores');
                break;
            case 'test_notification':
                navigate('/mis-notificaciones');
                break;
            case 'reminder':
                navigate('/dashboard');
                break;
            default:
                if (scheduleId) {
                    navigate(`/mis-horarios?edit=${scheduleId}`);
                } else if (nrc) {
                    navigate(`/planear?nrc=${nrc}`);
                } else {
                    navigate('/dashboard');
                }
        }
    }, [markAsRead, navigate, user]);

    const handleEnableNotifications = useCallback(async () => {
        await requestPermission();
    }, [requestPermission]);

    const formatTime = (timestamp) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Ahora';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'seat_available': return '🎓';
            case 'schedule_change': return '⚠️';
            case 'professor_change': return '👨‍🏫';
            default: return '🔔';
        }
    };

    if (!user) return null;

    return (
        <div className="notification-bell-wrapper">
            <button
                ref={bellRef}
                className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={toggleDropdown}
                aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
                title="Notificaciones"
            >
                <span className="bell-icon-emoji" aria-hidden="true">🔔</span>
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div ref={dropdownRef} className="notification-dropdown animate-fade-in">
                    <div className="notification-dropdown-header">
                        <h4>Notificaciones</h4>
                        <span className="notification-count">{notifications.length} total</span>
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="notification-empty">
                                <span className="notification-empty-icon">🔔</span>
                                <p>No hay notificaciones aún</p>
                                <p className="notification-empty-sub">
                                    Monitorea materias para recibir alertas de cupos disponibles.
                                </p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <button
                                    key={notif.id}
                                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <span className="notification-item-icon">
                                        {getTypeIcon(notif.type)}
                                    </span>
                                    <div className="notification-item-content">
                                        <strong className="notification-item-title">
                                            {notif.title}
                                        </strong>
                                        <p className="notification-item-body">{notif.body}</p>
                                        <span className="notification-item-time">
                                            {formatTime(notif.createdAt)}
                                        </span>
                                    </div>
                                    {!notif.read && <span className="notification-unread-dot" />}
                                </button>
                            ))
                        )}
                    </div>

                    {permission !== 'granted' && (
                        <div className="notification-permission-cta">
                            <p>¿Quieres recibir alertas push?</p>
                            <button onClick={handleEnableNotifications} className="btn-enable-notif">
                                Activar notificaciones
                            </button>
                        </div>
                    )}

                    <div className="notification-dropdown-footer">
                        <button
                            className="notification-view-all"
                            onClick={() => { setIsOpen(false); navigate('/mis-notificaciones'); }}
                        >
                            Ver todas las notificaciones &rarr;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

NotificationBell.displayName = 'NotificationBell';

export default NotificationBell;
