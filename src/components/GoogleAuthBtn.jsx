// src/components/GoogleAuthBtn.jsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebase/config'; // Asegúrate de importar tu 'auth' de firebase

export const GoogleAuthBtn = ({ onSuccess, onError }) => {

  const handleSuccess = async (credentialResponse) => {
    try {
      // 1. Obtenemos el ID Token que nos da la librería visual
      const { credential } = credentialResponse;

      // 2. Creamos una credencial de Firebase con ese token
      const firebaseCredential = GoogleAuthProvider.credential(credential);

      // 3. Iniciamos sesión en Firebase (esto actualiza el AuthContext automáticamente)
      await signInWithCredential(auth, firebaseCredential);
      
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Error al conectar con Firebase:", error);
      if (onError) onError(error);
    }
  };

  return (
    <div className="google-btn-wrapper">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.log('Login Failed');
          if (onError) onError();
        }}
        useOneTap={true} // <--- Activa la ventana flotante automática "One Tap"
        auto_select={false}
        
        // --- LA PARTE MÁGICA PARA TU SITIO ---
        // Esto fuerza a que Google solo sugiera/acepte cuentas de este dominio.
        // Si el usuario tiene su Gmail personal, Google le pedirá usar la otra cuenta.
        hosted_domain="alumnos.udg.mx" 
        
        theme="outline"
        size="large"
        shape="pill"
      />
    </div>
  );
};