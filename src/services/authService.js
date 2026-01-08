// src/services/authService.js
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut as firebaseSignOut 
} from "firebase/auth";
import { auth } from "../firebase/config";

const provider = new GoogleAuthProvider();

// Forzamos que siempre pida seleccionar cuenta (útil si tienes varias sesiones)
provider.setCustomParameters({
    prompt: "select_account"
});

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // --- VALIDACIÓN DE DOMINIO UDG ---
        // Verificamos si el correo termina en @alumnos.udg.mx o @udg.mx (para profesores/admin)
        if (!user.email.endsWith('@alumnos.udg.mx') && !user.email.endsWith('@udg.mx')) {
            // Si no es válido, cerramos la sesión inmediatamente
            await firebaseSignOut(auth);
            throw new Error("ACCESO DENEGADO: Debes usar tu correo institucional (@alumnos.udg.mx).");
        }

        return user;
    } catch (error) {
        // Relanzamos el error para manejarlo en el componente visual (Navbar)
        console.error("Error en login:", error.message);
        throw error;
    }
};

export const logout = async () => {
    return await firebaseSignOut(auth);
};