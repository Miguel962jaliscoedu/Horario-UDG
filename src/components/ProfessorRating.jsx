import React, { useState, useEffect, useCallback } from 'react';
import { getProfessorData } from '../services/professorService';
import './ProfessorRating.css';

const ProfessorRating = ({ professorName }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const closeModal = useCallback(() => {
        document.body.classList.remove('modal-open');
        setShowModal(false);
    }, []);

    const openModal = useCallback(() => {
        document.body.classList.add('modal-open');
        setShowModal(true);
    }, []);

    // Cerrar con Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && showModal) {
                closeModal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showModal, closeModal]);

    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);

    const fetchRating = async () => {
        if (!professorName || professorName.toLowerCase().includes("vacio") || professorName.includes("---")) {
            setLoading(false);
            return;
        }
        const profData = await getProfessorData(professorName);
        setData(profData);
        setLoading(false);
    };

    useEffect(() => {
        fetchRating();
    }, [professorName]);

    if (loading) {
        return <span className="rating-skeleton"></span>;
    }

    if (!data || data.notFound) {
        return (
            <div className="professor-rating-container">
                <span className="no-rating-badge" title="Sin evaluación en MisProfesores">
                    ?
                </span>
            </div>
        );
    }

    const { ratingMP, difficultyMP, comments = [] } = data;

    const getRatingClass = (rating) => {
        const numRating = parseFloat(rating);
        if (numRating >= 7) return 'high';
        if (numRating >= 5) return 'mid';
        return 'low';
    };

    return (
        <div className="professor-rating-container">
            <div 
                className={`rating-badge ${getRatingClass(ratingMP)}`}
                onClick={openModal}
                title="Haga clic para ver detalles"
            >
                <span className="star">⭐</span>
                <span className="score">{ratingMP}</span>
            </div>

            {showModal && (
                <>
                    <div className="modal-overlay" onClick={closeModal} />
                    <div className="rating-details-card animate-pop-in">
                        <button 
                            className="rating-form-close-alt"
                            onClick={closeModal}
                            title="Cerrar (Esc)"
                        >
                            ×
                        </button>
                        <div className="rating-header">
                            <h4>{professorName}</h4>
                            <button className="close-mini-btn" onClick={closeModal}>×</button>
                        </div>
                        
                        <div className="rating-stats-grid">
                            <div className="stat-item">
                                <span className="stat-label">Calificación</span>
                                <span className="stat-value">{ratingMP}/10</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Dificultad</span>
                                <span className="stat-value">{difficultyMP}/10</span>
                            </div>
                        </div>

                        {comments && comments.length > 0 && (
                            <div className="comments-section">
                                <div className="comments-header">
                                    <h5>Comentarios de Alumnos</h5>
                                    <span className="comments-count">{comments.length} comentarios</span>
                                </div>
                                <div className="comments-list">
                                    {comments.slice(0, 10).map((comment, index) => (
                                        <div key={index} className="comment-card">
                                            {comment.score && (
                                                <div className="comment-score">
                                                    ⭐ {comment.score}
                                                </div>
                                            )}
                                            <div className="comment-text">
                                                {comment.text}
                                            </div>
                                            {comment.tags && comment.tags.length > 0 && (
                                                <div className="comment-tags">
                                                    {comment.tags.map((tag, tagIdx) => (
                                                        <span key={tagIdx} className="tag-badge">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {comment.date && (
                                                <div className="comment-date">
                                                    {comment.date}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(!comments || comments.length === 0) && (
                            <div className="comments-section">
                                <div className="no-comments">
                                    No hay comentarios disponibles para este profesor.
                                </div>
                            </div>
                        )}

                        <div className="rating-actions">
                            {data.urlMP && (
                                <a 
                                    href={data.urlMP} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="external-link-btn"
                                >
                                    Ver perfil completo en MisProfesores
                                </a>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProfessorRating;
