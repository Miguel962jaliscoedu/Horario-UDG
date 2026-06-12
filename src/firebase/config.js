// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Lazy getter para Firestore — se carga bajo demanda (ahorra ~119 KiB en carga inicial)
let _dbPromise = null;
export function getDb() {
  if (!_dbPromise) {
    _dbPromise = import('firebase/firestore').then(({ getFirestore }) => getFirestore(app));
  }
  return _dbPromise;
}