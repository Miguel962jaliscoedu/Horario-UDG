// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Importamos el Layout Principal
import App from './App.jsx';

// Importamos las Páginas
import { HomePage } from './pages/HomePage.jsx';
import { PlannerPage } from './pages/PlannerPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { MySchedulesPage } from './pages/MySchedulesPage.jsx';
import { BenefitsPage } from './pages/BenefitsPage.jsx';

import './index.css';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// DEFINICIÓN DEL ROUTER (Data Router)
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App es el contenedor principal (Layout + AuthProvider)
    children: [
      {
        index: true, // Ruta raíz "/"
        element: <HomePage />,
      },
      {
        path: "planear",
        element: <PlannerPage />, 
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "mis-horarios",
        element: <MySchedulesPage />,
      },
      {
        path: "beneficios",
        element: <BenefitsPage />,
      },
      {
        path: "*",
        element: <HomePage />, // Fallback para rutas no encontradas
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      {/* RouterProvider provee el contexto necesario para useBlocker */}
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);