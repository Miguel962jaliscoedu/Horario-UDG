import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { addRating } from '../services/professorService';
import { updateMyRating, hasUserRatedProfessor } from '../services/myRatingsService';
import { loginWithGoogle } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import './RatingForm.css';

const AVAILABLE_TAGS = [
  'Califica Duro',
  'Barco',
  'Muy cómico',
  'Da buena retroalimentación',
  'Muchas tareas',
  'Prepárate para leer',
  'Hace exámenes sorpresa',
  'La Participación Importa',
  'Asistencia obligatoria',
  'Respetado por los estudiantes',
  'Inspiracional',
  'Las clases son largas',
  'Da Crédito Extra',
  'Pocos Exámenes',
  'Muchos Exámenes',
  'Aspectos de calificación claros',
  'Brinda apoyo',
  'Deja trabajos largos',
  'Clases excelentes',
  'Los exámenes son difíciles',
  'Muchos proyectos grupales',
  'Tomaría su clase otra vez',
];

const RatingForm = ({ professorId, professorName, onClose, onRatingEscaped, editingRating }) => {
    const { user: currentUser } = useAuth();
    const isEditing = !!editingRating;
    
    // Cargar datos existentes si está editando
    const [stars, setStars] = useState(editingRating?.stars || 8);
    const [difficulty, setDifficulty] = useState(editingRating?.difficulty || 5);
    const [comment, setComment] = useState(editingRating?.comment || "");
    const [selectedTags, setSelectedTags] = useState(editingRating?.tags || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleSignIn = async () => {
        setIsSigningIn(true);
        setError(null);
        try {
            await loginWithGoogle();
        } catch (err) {
            console.error("Error signing in:", err);
            setError(err.message || "No se pudo iniciar sesión. Intenta de nuevo.");
        } finally {
            setIsSigningIn(false);
        }
    };

    const toggleTag = (tag) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag].slice(0, 5)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!currentUser) {
            setError("Debes iniciar sesión para calificar.");
            setIsSubmitting(false);
            return;
        }

        if (!isEditing) {
            const alreadyRated = await hasUserRatedProfessor(currentUser.uid, professorId);
            if (alreadyRated) {
                setError("Ya has evaluado a este profesor. Solo puedes editar tu evaluación.");
                setIsSubmitting(false);
                return;
            }
        }

        const ratingData = {
            stars: parseInt(stars),
            difficulty: parseInt(difficulty),
            comment: comment.trim(),
            tags: selectedTags,
        };

        let success;

        if (isEditing) {
            // Actualizar evaluación existente
            success = await updateMyRating(editingRating.id, currentUser.uid, ratingData);
        } else {
            // Crear nueva evaluación
            const newRatingData = {
                ...ratingData,
                userId: currentUser.uid,
                userName: currentUser.displayName || "Usuario Anónimo",
            };
            success = await addRating(professorId, newRatingData);
        }

        if (success) {
            onClose();
            if (onRatingEscaped) onRatingEscaped();
        } else {
            setError(isEditing ? "Error al actualizar la evaluación." : "Error al guardar la evaluación.");
            setIsSubmitting(false);
        }
    };

    const handleCloseForm = () => {
        document.body.classList.remove('modal-open');
        onClose();
    };

    // Cerrar con Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleCloseForm();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Bloquear scroll cuando se abre el modal
    useEffect(() => {
        document.body.classList.add('modal-open');
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);

    const isAuthenticated = !!currentUser;

    return createPortal(
        <div className="rating-form-overlay" onClick={handleCloseForm}>
            <div className="rating-form-content animate-pop-in" onClick={e => e.stopPropagation()}>
                <button 
                    type="button" 
                    className="rating-form-close-alt"
                    onClick={handleCloseForm}
                    title="Cerrar (Esc)"
                >
                    ×
                </button>
                <h3>
                    {isEditing 
                        ? `Editar evaluación de ${professorName}`
                        : `Evaluar a ${professorName}`
                    }
                </h3>
                
                {!isAuthenticated ? (
                    <div className="rating-form-unauthenticated">
                        <div className="auth-prompt">
                            <span className="auth-icon">🔒</span>
                            <p className="auth-message">
                                Necesitas iniciar sesión para evaluar a este profesor.
                            </p>
                            <p className="auth-submessage">
                                Tu evaluación ayuda a otros estudiantes de la UDG.
                            </p>
                        </div>
                        
                        {error && <div className="rating-form-error">{error}</div>}
                        
                        <div className="rating-form-actions">
                            <button type="button" className="cancel-btn" onClick={handleCloseForm}>
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                className="submit-rating-btn google-signin-btn"
                                onClick={handleSignIn}
                                disabled={isSigningIn}
                            >
                                {isSigningIn ? 'Iniciando sesión...' : 'Iniciar sesión con Google'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Tu calificación general (1-10)</label>
                            <div className="star-rating-input star-rating-10">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <span 
                                        key={num} 
                                        className={`star-input-item ${num <= stars ? 'active' : ''}`}
                                        onClick={() => setStars(num)}
                                    >
                                        {num}
                                    </span>
                                ))}
                            </div>
                            <span className="stars-display">{stars}/10</span>
                        </div>

                        <div className="form-group">
                            <label>Nivel de Dificultad (1 - Fácil, 10 - Difícil)</label>
                            <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                value={difficulty} 
                                onChange={e => setDifficulty(e.target.value)}
                                className="difficulty-range"
                            />
                            <span className="difficulty-value">{difficulty}/10</span>
                        </div>

                        <div className="form-group">
                            <label>Etiquetas (Selecciona hasta 5)</label>
                            <div className="tags-selector">
                                {AVAILABLE_TAGS.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        className={`tag-select-btn ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            {selectedTags.length > 0 && (
                                <small className="tags-selected">
                                    {selectedTags.length}/5 etiquetas seleccionadas
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Comentario (Opcional)</label>
                            <textarea 
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Ej: Explica muy bien, pero los exámenes son difíciles..."
                                className="rating-textarea"
                                maxLength={300}
                            />
                            <small className="char-count">{comment.length}/300</small>
                        </div>

                        {error && <div className="rating-form-error">{error}</div>}

                        <div className="rating-form-actions">
                            <button type="button" className="cancel-btn" onClick={handleCloseForm}>
                                Cancelar
                            </button>
                            <button type="submit" className="submit-rating-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Enviar Calificación'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
};

export default RatingForm;