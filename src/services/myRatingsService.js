import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const COLL_RATINGS = 'ratings';

/**
 * Obtiene todas las evaluaciones del usuario actual
 */
export const getMyRatings = async (userId) => {
    if (!userId) return [];
    
    try {
        const q = query(
            collection(db, COLL_RATINGS),
            where('userId', '==', userId)
        );
        
        const snapshot = await getDocs(q);
        const ratings = [];
        
        snapshot.forEach(doc => {
            ratings.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Ordenar por fecha más reciente
        ratings.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB - dateA;
        });
        
        return ratings;
    } catch (error) {
        console.error("Error obteniendo mis evaluaciones:", error);
        return [];
    }
};

/**
 * Obtiene una evaluación específica por ID
 */
export const getMyRatingById = async (ratingId) => {
    try {
        const { doc: docRef, getDoc } = await import('firebase/firestore');
        const docSnap = await getDoc(docRef(db, COLL_RATINGS, ratingId));
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error obteniendo evaluación:", error);
        return null;
    }
};

/**
 * Actualiza una evaluación existente
 */
export const updateMyRating = async (ratingId, userId, updatedData) => {
    if (!ratingId || !userId) return false;
    
    try {
        const { doc: docFn, getDoc, updateDoc } = await import('firebase/firestore');
        const docRef = docFn(db, COLL_RATINGS, ratingId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            console.error("Evaluación no encontrada");
            return false;
        }
        
        const ratingData = docSnap.data();
        
        // Verificar que el usuario es el autor
        if (ratingData.userId !== userId) {
            console.error("No tienes permiso para editar esta evaluación");
            return false;
        }
        
        await updateDoc(docRef, {
            ...updatedData,
            updatedAt: serverTimestamp()
        });
        
        return true;
    } catch (error) {
        console.error("Error actualizando evaluación:", error);
        return false;
    }
};

/**
 * Obtiene el conteo de evaluaciones del usuario
 */
export const getMyRatingsCount = async (userId) => {
    if (!userId) return 0;
    
    try {
        const q = query(
            collection(db, COLL_RATINGS),
            where('userId', '==', userId)
        );
        
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error("Error obteniendo conteo:", error);
        return 0;
    }
};

/**
 * Verifica si el usuario ya evaluó a un profesor específico
 */
export const hasUserRatedProfessor = async (userId, professorId) => {
    if (!userId || !professorId) return false;
    
    try {
        const q = query(
            collection(db, COLL_RATINGS),
            where('userId', '==', userId),
            where('professorId', '==', professorId)
        );
        
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error("Error verificando evaluación:", error);
        return false;
    }
};

/**
 * Obtiene la evaluación del usuario para un profesor específico
 */
export const getUserRatingForProfessor = async (userId, professorId) => {
    if (!userId || !professorId) return null;
    
    try {
        const q = query(
            collection(db, COLL_RATINGS),
            where('userId', '==', userId),
            where('professorId', '==', professorId)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) return null;
        
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error("Error obteniendo evaluación:", error);
        return null;
    }
};

/**
 * Obtiene todas las evaluaciones de un profesor específico (para mostrar en detalle)
 */
export const getRatingsForProfessor = async (professorId) => {
    if (!professorId) return [];
    
    try {
        const q = query(
            collection(db, COLL_RATINGS),
            where('professorId', '==', professorId)
        );
        
        const snapshot = await getDocs(q);
        const ratings = [];
        
        snapshot.forEach(doc => {
            ratings.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return ratings;
    } catch (error) {
        console.error("Error obteniendo evaluaciones del profesor:", error);
        return [];
    }
};
