// api/toggle-monitor.js
// Activa/desactiva monitoreo de un NRC para el usuario autenticado
import admin from 'firebase-admin';

function getAdmin() {
    if (admin.apps.length === 0) {
        const raw = process.env.FIREBASE_ADMIN_CREDENTIALS;
        if (!raw) throw new Error('FIREBASE_ADMIN_CREDENTIALS no configurada');
        let credentials;
        try {
            credentials = JSON.parse(raw);
        } catch {
            credentials = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
        }
        admin.initializeApp({
            credential: admin.credential.cert(credentials),
            projectId: process.env.FIREBASE_PROJECT_ID || credentials.project_id,
        });
    }
    return admin;
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders());
        return res.end();
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.writeHead(401, { ...corsHeaders(), 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Token de autenticación requerido' }));
        }

        const idToken = authHeader.split('Bearer ')[1];
        const admin = getAdmin();
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const db = admin.firestore();

        if (req.method === 'POST') {
            // Activar monitoreo
            const { nrc, materia, clave, profesor, cup, majrp, horarioLabel, registered, scheduleIds } = req.body || {};
            if (!nrc) {
                res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'NRC requerido' }));
            }

            const nrcKey = `${nrc}_${horarioLabel}`;
            const now = admin.firestore.FieldValue.serverTimestamp();

            // Normalizar scheduleIds: soportar tanto el nuevo array como el viejo scheduleId singular
            let finalScheduleIds = [];
            if (Array.isArray(scheduleIds) && scheduleIds.length > 0) {
                finalScheduleIds = scheduleIds.filter(Boolean);
            } else if (req.body.scheduleId) {
                finalScheduleIds = [req.body.scheduleId];
            }

            // 1. Guardar en monitored-courses del usuario
            const courseRef = db.doc(`users/${uid}/monitored-courses/${nrc}`);
            await courseRef.set({
                nrc: String(nrc),
                materia: materia || '',
                clave: clave || '',
                profesor: profesor || '',
                horarioLabel: horarioLabel || '',
                cup: cup || '',
                majrp: majrp || '',
                registered: !!registered,
                lastSeats: -1,
                lastSessions: '',
                scheduleIds: finalScheduleIds,
                scheduleId: finalScheduleIds.length > 0 ? finalScheduleIds[0] : null, // mantener compatibilidad
                createdAt: now,
                updatedAt: now,
            });

            // 2. Incrementar contador en cola global
            const queueRef = db.doc(`monitoring-queue/${nrcKey}`);
            await db.runTransaction(async (tx) => {
                const queueDoc = await tx.get(queueRef);
                if (queueDoc.exists) {
                    tx.update(queueRef, {
                        subscribers: admin.firestore.FieldValue.increment(1),
                        nextCheck: now, // programar revisión inmediata
                    });
                } else {
                    tx.set(queueRef, {
                        nrc: String(nrc),
                        ciclop: horarioLabel || '',
                        cup: cup || '',
                        majrp: majrp || '',
                        subscribers: 1,
                        lastSeats: -1,
                        lastData: '',
                        lastChecked: null,
                        nextCheck: now,
                    });
                }
            });

            res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, monitoring: true }));
        }

        if (req.method === 'DELETE') {
            // Desactivar monitoreo
            const { nrc, horarioLabel } = req.body || {};
            if (!nrc) {
                res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'NRC requerido' }));
            }

            // 1. Eliminar de monitored-courses
            const courseRef = db.doc(`users/${uid}/monitored-courses/${nrc}`);
            await courseRef.delete();

            // 2. Decrementar contador en cola global
            const nrcKey = `${nrc}_${horarioLabel}`;
            const queueRef = db.doc(`monitoring-queue/${nrcKey}`);
            await db.runTransaction(async (tx) => {
                const queueDoc = await tx.get(queueRef);
                if (queueDoc.exists) {
                    const newCount = (queueDoc.data().subscribers || 1) - 1;
                    if (newCount <= 0) {
                        tx.delete(queueRef);
                    } else {
                        tx.update(queueRef, { subscribers: newCount });
                    }
                }
            });

            res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, monitoring: false }));
        }

        res.writeHead(405, { ...corsHeaders(), 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Método no permitido' }));
    } catch (error) {
        console.error('[toggle-monitor] Error:', error.message);
        res.writeHead(500, { ...corsHeaders(), 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Error al cambiar monitoreo' }));
    }
}
