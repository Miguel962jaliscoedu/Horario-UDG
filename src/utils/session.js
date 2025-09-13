// Clave para guardar los datos en sessionStorage
const SESSION_KEY = 'horarioAppState';

/**
 * Guarda el estado actual de la aplicación en sessionStorage.
 * @param {object} state - El objeto de estado a guardar.
 */
export const saveStateToSession = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem(SESSION_KEY, serializedState);
  } catch (error) {
    console.error("No se pudo guardar el estado en la sesión:", error);
  }
};

/**
 * Carga el estado de la aplicación desde sessionStorage.
 * @returns {object | null} El estado guardado o null si no hay nada.
 */
export const loadStateFromSession = () => {
  try {
    const serializedState = sessionStorage.getItem(SESSION_KEY);
    if (serializedState === null) {
      return undefined; // No hay estado guardado
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("No se pudo cargar el estado de la sesión:", error);
    return undefined;
  }
};

/**
 * Limpia el estado guardado de la aplicación de sessionStorage.
 */
export const clearSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("No se pudo limpiar el estado de la sesión:", error);
  }
};

