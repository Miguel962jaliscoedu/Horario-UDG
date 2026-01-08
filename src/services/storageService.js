import { db } from "../firebase/config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy
} from "firebase/firestore";

// Referencia a la colección de horarios de un usuario específico
const getSchedulesRef = (userId) => collection(db, "users", userId, "schedules");

/**
 * Crea un NUEVO horario en la subcolección.
 */
export const createSchedule = async (userId, scheduleData, name) => {
  try {
    const docRef = await addDoc(getSchedulesRef(userId), {
      ...scheduleData,
      name: name || "Horario Sin Título",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id; // Retornamos el ID generado
  } catch (error) {
    console.error("Error creando horario:", error);
    throw error;
  }
};

/**
 * Actualiza un horario EXISTENTE (Sobreescribe).
 */
export const updateSchedule = async (userId, scheduleId, scheduleData) => {
  try {
    const docRef = doc(db, "users", userId, "schedules", scheduleId);
    await updateDoc(docRef, {
      ...scheduleData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error actualizando horario:", error);
    throw error;
  }
};

/**
 * Obtiene la lista de todos los horarios del usuario.
 */
export const getUserSchedules = async (userId) => {
  try {
    // Ordenados por fecha de actualización (más reciente primero)
    const q = query(getSchedulesRef(userId), orderBy("updatedAt", "desc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error obteniendo horarios:", error);
    return [];
  }
};

/**
 * Elimina un horario.
 */
export const deleteSchedule = async (userId, scheduleId) => {
  try {
    await deleteDoc(doc(db, "users", userId, "schedules", scheduleId));
    return true;
  } catch (error) {
    console.error("Error eliminando horario:", error);
    throw error;
  }
};