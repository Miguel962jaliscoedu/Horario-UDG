// src/utils/toast.js
// Sistema de notificaciones toast para reemplazar alert()
const TOAST_EVENT = 'app-toast';

/**
 * Muestra una notificación toast en la pantalla.
 * @param {string} message - Mensaje a mostrar
 * @param {'info'|'success'|'error'|'warning'} type - Tipo de toast
 * @param {number} duration - Duración en ms (0 = persistente)
 */
export function showToast(message, type = 'info', duration = 4000) {
    const event = new CustomEvent(TOAST_EVENT, {
        detail: { message, type, duration }
    });
    window.dispatchEvent(event);
}

export { TOAST_EVENT };
export default showToast;
