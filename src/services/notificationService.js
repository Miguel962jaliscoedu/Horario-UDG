// src/services/notificationService.js
// Servicio principal para Firebase Cloud Messaging (FCM)
// Gestiona permisos, tokens, registro backend y escucha de mensajes

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getApp } from "firebase/app";
import { auth, getDb } from "../firebase/config";

let _messaging = null;
let _unsubscribeOnMessage = null;
let _fcmInitialized = false;

/**
 * Inicializa FCM: crea instancia de messaging y configura el Service Worker.
 */
export async function initFCM() {
    if (_fcmInitialized) return true;

    try {
        const app = getApp();
        _messaging = getMessaging(app);

        // Registrar SW personalizado para notificaciones background
        try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            await navigator.serviceWorker.ready;
        } catch (swError) {
            console.warn('[FCM] SW no disponible — solo foreground:', swError.message);
        }

        _fcmInitialized = true;
        return true;
    } catch (error) {
        console.warn('[FCM] Error init:', error.message);
        return false;
    }
}

/**
 * Solicita permiso y obtiene token FCM.
 * @returns {Promise<string|null>}
 */
export async function requestFCMPermission() {
    if (!_messaging) {
        const ok = await initFCM();
        if (!ok) return null;
    }

    try {
        const swRegistration = await navigator.serviceWorker.ready;
        const currentToken = await getToken(_messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: swRegistration,
        });
        return currentToken || null;
    } catch (error) {
        if (error.code === 'messaging/permission-blocked') {
            console.warn('[FCM] Permiso denegado permanentemente');
        }
        return null;
    }
}

/**
 * Registra token FCM en backend serverless.
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export async function registerFCMToken(token) {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        const idToken = await user.getIdToken();
        const res = await fetch('/api/fcm-register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                token,
                userAgent: navigator.userAgent,
            }),
        });

        return res.ok;
    } catch (error) {
        console.error('[FCM] Error registrando token:', error.message);
        return false;
    }
}

/**
 * Escucha mensajes en foreground.
 * @param {(msg: {title:string,body:string,data:object}) => void} callback
 * @returns {() => void} cleanup
 */
export function onForegroundMessage(callback) {
    if (!_messaging) return () => {};

    if (_unsubscribeOnMessage) _unsubscribeOnMessage();

    _unsubscribeOnMessage = onMessage(_messaging, (payload) => {
        callback?.({
            title: payload.notification?.title || '',
            body: payload.notification?.body || '',
            data: payload.data || {},
        });
    });

    return () => {
        _unsubscribeOnMessage?.();
        _unsubscribeOnMessage = null;
    };
}

/**
 * Activa monitoreo de un NRC.
 */
export async function startMonitoring(nrcData) {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const idToken = await user.getIdToken();
    const res = await fetch('/api/toggle-monitor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(nrcData),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al activar monitoreo');
    }
    return true;
}

/**
 * Desactiva monitoreo de un NRC.
 */
export async function stopMonitoring(nrc, horarioLabel) {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const idToken = await user.getIdToken();
    const res = await fetch('/api/toggle-monitor', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ nrc, horarioLabel }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al desactivar monitoreo');
    }
    return true;
}

/**
 * Obtiene materias monitoreadas del usuario.
 */
export async function getMonitoredCourses(userId) {
    try {
        const db = await getDb();
        const { collection, getDocs } = await import("firebase/firestore");
        const snapshot = await getDocs(collection(db, "users", userId, "monitored-courses"));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
        return [];
    }
}

/**
 * Obtiene notificaciones del usuario.
 */
export async function getUserNotifications(userId, max = 20) {
    try {
        const db = await getDb();
        const { collection, query, orderBy, limit, getDocs } = await import("firebase/firestore");
        const q = query(
            collection(db, "users", userId, "notifications"),
            orderBy("createdAt", "desc"),
            limit(max)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
        return [];
    }
}

/**
 * Marca notificación como leída.
 */
export async function markNotificationRead(userId, notifId) {
    try {
        const db = await getDb();
        const { doc, updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "users", userId, "notifications", notifId), { read: true });
    } catch {
        // Ignorar error al marcar como leída
    }
}

/**
 * Guarda una preferencia de notificaciones (incluyendo queryConsent).
 * @param {string} userId - UID del usuario
 * @param {object} prefs - Preferencias parciales a guardar (ej. { queryConsent: true })
 */
export async function saveNotificationPref(userId, prefs) {
    try {
        const db = await getDb();
        const { doc, setDoc } = await import("firebase/firestore");
        const ref = doc(db, "users", userId, "notificationPrefs", "preferences");
        await setDoc(ref, prefs, { merge: true });
        return true;
    } catch (err) {
        console.error("[notificationService] Error guardando preferencia:", err);
        return false;
    }
}

/**
 * Obtiene las preferencias de notificaciones del usuario.
 * @param {string} userId
 * @returns {Promise<object>}
 */
export async function getNotificationPrefs(userId) {
    try {
        const db = await getDb();
        const { doc, getDoc } = await import("firebase/firestore");
        const ref = doc(db, "users", userId, "notificationPrefs", "preferences");
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : {};
    } catch {
        return {};
    }
}

export default {
    initFCM,
    requestFCMPermission,
    registerFCMToken,
    onForegroundMessage,
    startMonitoring,
    stopMonitoring,
    getMonitoredCourses,
    getUserNotifications,
    markNotificationRead,
};
