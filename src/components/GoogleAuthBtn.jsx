// src/components/GoogleAuthBtn.jsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebase/config';

export const GoogleAuthBtn = ({ onSuccess, onError }) => {

  const handleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const firebaseCredential = GoogleAuthProvider.credential(credential);
      await signInWithCredential(auth, firebaseCredential);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al conectar con Firebase:", error);
      if (onError) onError(error);
    }
  };

  const hostedDomain = import.meta.env.VITE_GOOGLE_HOSTED_DOMAIN || '';

  return (
    <div className="google-btn-wrapper">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.log('Login Failed');
          if (onError) onError();
        }}
        useOneTap={false}
        auto_select={false}
        hosted_domain={hostedDomain}
        theme="outline"
        size="large"
        shape="pill"
      />
    </div>
  );
};