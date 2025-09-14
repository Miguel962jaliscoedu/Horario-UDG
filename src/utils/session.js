export function saveStateToSession(state) {
    try {
        const serializedState = JSON.stringify(state);
        sessionStorage.setItem('appState', serializedState);
    } catch (e) {
        console.warn("Could not save state to session storage", e);
    }
}

export function loadStateFromSession() {
    try {
        const serializedState = sessionStorage.getItem('appState');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (e) {
        console.warn("Could not load state from session storage", e);
        return undefined;
    }
}

// 1. Nueva función para limpiar la sesión.
export function clearSession() {
    try {
        sessionStorage.removeItem('appState');
    } catch (e) {
        console.warn("Could not clear session storage", e);
    }
}
