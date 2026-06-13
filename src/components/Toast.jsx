// src/components/Toast.jsx
// Contenedor global de notificaciones toast
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TOAST_EVENT } from '../utils/toast';
import './Toast.css';

const ICONS = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

export function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handler = (e) => {
            const { message, type = 'info', duration = 4000 } = e.detail;
            const id = Date.now() + Math.random();
            setToasts(prev => [...prev, { id, message, type, duration }]);
            if (duration > 0) {
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== id));
                }, duration);
            }
        };
        window.addEventListener(TOAST_EVENT, handler);
        return () => window.removeEventListener(TOAST_EVENT, handler);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    if (toasts.length === 0) return null;

    return createPortal(
        <div className="toast-container" aria-live="polite">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type} animate-toast-in`}
                    onClick={() => removeToast(toast.id)}
                    role="alert"
                >
                    <span className="toast-icon">{ICONS[toast.type] || 'ℹ️'}</span>
                    <span className="toast-message">{toast.message}</span>
                    <button className="toast-close" onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }} aria-label="Cerrar">
                        ×
                    </button>
                </div>
            ))}
        </div>,
        document.body
    );
}

export default ToastContainer;
