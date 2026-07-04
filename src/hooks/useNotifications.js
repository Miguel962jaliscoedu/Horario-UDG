// src/hooks/useNotifications.js
// Hook de React para gestionar FCM y monitoreo de materias
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    initFCM,
    requestFCMPermission,
    registerFCMToken,
    onForegroundMessage,
    startMonitoring,
    stopMonitoring,
    getMonitoredCourses,
    getUserNotifications,
    markNotificationRead,
    deleteNotification,
    deleteAllNotifications,
} from '../services/notificationService';

/**
 * Hook unificado para sistema de notificaciones.
 * @returns {{
 *   fcmInitialized: boolean,
 *   permission: NotificationPermission | null,
 *   token: string | null,
 *   monitoredCourses: Array,
 *   notifications: Array,
 *   unreadCount: number,
 *   startMonitor: (nrcData: object) => Promise<boolean>,
 *   stopMonitor: (nrc: string, horarioLabel: string) => Promise<boolean>,
 *   isMonitoring: (nrc: string) => boolean,
 *   fetchNotifications: () => Promise<void>,
 *   markAsRead: (notifId: string) => Promise<void>,
 *   removeNotification: (notifId: string) => Promise<void>,
 *   clearAllNotifications: () => Promise<void>,
 *   requestPermission: () => Promise<boolean>,
 * }}
 */
export function useNotifications() {
    const { user } = useAuth();
    const [fcmInitialized, setFcmInitialized] = useState(false);
    const [permission, setPermission] = useState(null);
    const [token, setToken] = useState(null);
    const [monitoredCourses, setMonitoredCourses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const foregroundCleanupRef = useRef(null);

    // Calcular no leídas
    const unreadCount = notifications.filter(n => !n.read).length;

    // Inicializar FCM al montar si hay usuario
    useEffect(() => {
        if (!user) {
            setFcmInitialized(false);
            setToken(null);
            setPermission(null);
            return;
        }

        let mounted = true;

        const setup = async () => {
            const ok = await initFCM();
            if (!mounted) return;
            setFcmInitialized(ok);

            if (ok) {
                setPermission(Notification.permission);

                // Escuchar mensajes foreground
                foregroundCleanupRef.current = onForegroundMessage(() => {
                    // Recargar notificaciones cuando llegue una nueva
                    if (user) {
                        getUserNotifications(user.uid).then(list => {
                            if (mounted) setNotifications(list);
                        });
                    }
                });
            }
        };

        setup();

        return () => {
            mounted = false;
            foregroundCleanupRef.current?.();
        };
    }, [user]);

    // Cargar monitoreos y notificaciones cuando hay usuario
    useEffect(() => {
        if (!user) {
            setMonitoredCourses([]);
            setNotifications([]);
            return;
        }

        let mounted = true;

        const load = async () => {
            const [courses, notifs] = await Promise.all([
                getMonitoredCourses(user.uid),
                getUserNotifications(user.uid),
            ]);
            if (mounted) {
                setMonitoredCourses(courses);
                setNotifications(notifs);
            }
        };

        load();

        // Recargar periódicamente (cada 30s)
        const interval = setInterval(load, 30000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [user]);

    // Solicitar permiso y obtener token
    const requestPermission = useCallback(async () => {
        const fcmToken = await requestFCMPermission();
        if (fcmToken) {
            setToken(fcmToken);
            setPermission('granted');
            await registerFCMToken(fcmToken);
            return true;
        }
        setPermission(Notification.permission);
        return false;
    }, []);

    // Activar monitoreo de un NRC
    const startMonitor = useCallback(async (nrcData) => {
        try {
            await startMonitoring(nrcData);
            // Recargar monitoreos
            if (user) {
                const courses = await getMonitoredCourses(user.uid);
                setMonitoredCourses(courses);
            }
            return true;
        } catch {
            return false;
        }
    }, [user]);

    // Desactivar monitoreo
    const stopMonitor = useCallback(async (nrc, horarioLabel) => {
        try {
            await stopMonitoring(nrc, horarioLabel);
            if (user) {
                const courses = await getMonitoredCourses(user.uid);
                setMonitoredCourses(courses);
            }
            return true;
        } catch {
            return false;
        }
    }, [user]);

    // Verificar si un NRC está siendo monitoreado
    const isMonitoring = useCallback((nrc) => {
        return monitoredCourses.some(c => c.nrc === String(nrc));
    }, [monitoredCourses]);

    // Obtener datos de monitoreo de un NRC específico
    const getMonitorData = useCallback((nrc) => {
        return monitoredCourses.find(c => c.nrc === String(nrc)) || null;
    }, [monitoredCourses]);

    // Recargar notificaciones
    const fetchNotifications = useCallback(async () => {
        if (user) {
            const list = await getUserNotifications(user.uid);
            setNotifications(list);
        }
    }, [user]);

    // Marcar como leída
    const markAsRead = useCallback(async (notifId) => {
        if (user) {
            await markNotificationRead(user.uid, notifId);
            setNotifications(prev =>
                prev.map(n => n.id === notifId ? { ...n, read: true } : n)
            );
        }
    }, [user]);

    // Eliminar una notificación
    const removeNotification = useCallback(async (notifId) => {
        if (user) {
            await deleteNotification(user.uid, notifId);
            setNotifications(prev => prev.filter(n => n.id !== notifId));
        }
    }, [user]);

    // Eliminar TODAS las notificaciones
    const clearAllNotifications = useCallback(async () => {
        if (user) {
            await deleteAllNotifications(user.uid);
            setNotifications([]);
        }
    }, [user]);

    return {
        fcmInitialized,
        permission,
        token,
        monitoredCourses,
        notifications,
        unreadCount,
        startMonitor,
        stopMonitor,
        isMonitoring,
        getMonitorData,
        fetchNotifications,
        markAsRead,
        removeNotification,
        clearAllNotifications,
        requestPermission,
    };
}

export default useNotifications;
