// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

// 1. Creamos el contexto
const AuthContext = createContext();

// 2. Creamos un "Hook" personalizado para usar el contexto fácilmente
// Esto nos permitirá escribir `const { user } = useAuth()` en cualquier componente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

// 3. Creamos el Proveedor que envolverá tu app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esta función de Firebase "escucha" cambios en la sesión automáticamente
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpiamos la suscripción cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {/* Solo mostramos la app cuando ya sabemos si hay usuario o no */}
      {!loading && children}
    </AuthContext.Provider>
  );
};