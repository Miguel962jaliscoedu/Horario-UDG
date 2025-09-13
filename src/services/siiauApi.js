import axios from 'axios';

/**
 * Maneja los errores de Axios de forma consistente para toda la aplicación.
 * @param {Error} error - El objeto de error de Axios.
 * @param {string} defaultMessage - Mensaje por defecto si no se encuentra uno específico del backend.
 * @throws {Error} Lanza un nuevo error con un mensaje limpio para que la UI lo capture.
 */
const handleError = (error, defaultMessage) => {
    // Loguea el error detallado para la consola del desarrollador
    console.error(`Error en la llamada a la API: ${error.message}`, error.response || error);
    
    // Extrae el mensaje de error específico de la función serverless, si está disponible
    const errorMessage = error.response?.data?.error || defaultMessage;
    
    // Lanza un nuevo error que el componente de React (en un bloque catch) puede usar
    throw new Error(errorMessage);
};

/**
 * Obtiene las opciones iniciales del formulario (ciclos y centros).
 * Esta función llama a la función serverless definida en /api/form-options.js
 * @returns {Promise<object>} Una promesa que resuelve a un objeto con los ciclos y centros.
 * Ejemplo: { ciclop: [...], cup: [...] }
 */
export const fetchFormOptions = async () => {
    try {
        // Vercel redirigirá esta petición GET a /api/form-options.js
        const response = await axios.get(`/api/form-options`);
        return response.data;
    } catch (error) {
        handleError(error, 'No se pudieron cargar las opciones iniciales del formulario.');
    }
};

/**
 * Obtiene la lista de carreras para un centro universitario específico.
 * Esta función llama a la función serverless definida en /api/majors.js
 * @param {string} cupValue - El valor del centro universitario (ej. 'H').
 * @returns {Promise<object>} Una promesa que resuelve a un objeto con las carreras.
 * Ejemplo: { "INCO": "INGENIERIA EN COMPUTACION", ... }
 */
export const fetchMajors = async (cupValue) => {
    if (!cupValue) {
        return {}; // Evita una llamada innecesaria si no hay un centro seleccionado
    }
    try {
        // Vercel redirigirá esta petición GET a /api/majors.js, pasando 'cup' como query param.
        const response = await axios.get(`/api/majors`, {
            params: { cup: cupValue }
        });
        return response.data;
    } catch (error) {
        handleError(error, 'No se pudieron cargar las carreras para el centro seleccionado.');
    }
};

/**
 * Realiza la consulta principal de la oferta académica.
 * Esta función llama a la función serverless definida en /api/consultar-oferta.js
 * @param {object} params - Los parámetros del formulario (ciclop, cup, majrp).
 * @returns {Promise<Array>} Una promesa que resuelve a un arreglo de materias.
 */
export const fetchOfertaAcademica = async (params) => {
    try {
        // Vercel redirigirá esta petición POST a /api/consultar-oferta.js, pasando 'params' como el body.
        const response = await axios.post(`/api/consultar-oferta`, params);
        return response.data;
    } catch (error) {
        handleError(error, 'La consulta de oferta académica falló. Revisa los filtros o intenta de nuevo.');
    }
};
