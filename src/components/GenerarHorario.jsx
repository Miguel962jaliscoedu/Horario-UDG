import React from 'react';

// Función para convertir la hora "HH:MM" a minutos para cálculos precisos.
const timeToMinutes = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// Componente para la tarjeta de clase. Ahora tiene una estructura de dos capas.
const ClaseCard = ({ clase }) => {
    const dayToColumn = {
        'Lunes': 2, 'Martes': 3, 'Miércoles': 4, 'Jueves': 5, 'Viernes': 6, 'Sábado': 7,
    };

    const startMinutes = timeToMinutes(clase.hora_inicio);
    const endMinutes = timeToMinutes(clase.hora_fin);

    const startRow = Math.floor((startMinutes - 420) / 60) + 2;
    const durationInRows = Math.ceil((endMinutes - startMinutes) / 60);
    const endRow = startRow + durationInRows;

    const cardStyle = {
        gridColumn: dayToColumn[clase.dia],
        gridRow: `${startRow} / ${endRow}`,
        // El contenedor exterior ahora solo es un marcador de posición.
        // Se le añade pointerEvents para que el hover funcione.
        pointerEvents: 'auto',
    };

    return (
        // Contenedor estructural que se posiciona en la grilla.
        <div className="clase-card" style={cardStyle}>
            {/* Contenedor visual interno que se anima. */}
            <div className="clase-card-inner">
                <strong>{clase.materia}</strong>
                <span>{clase.edificio} - {clase.aula}</span>
                <span>{clase.profesor}</span>
            </div>
        </div>
    );
};

export function GenerarHorario({ clasesSeleccionadas }) {
    const horas = [];
    for (let i = 7; i <= 21; i++) {
        horas.push(`${i.toString().padStart(2, '0')}:00`);
    }
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    return (
        <div className="card">
            <h2>Horario Final</h2>
            <p>Aquí tienes una vista visual de tu horario. Puedes descargarlo en diferentes formatos.</p>

            <div className="schedule-container">
                {/* Capa 1: La Grilla de Fondo */}
                <div className="horario-grid">
                    <div className="grid-header">Hora</div>
                    {days.map(day => <div key={day} className="grid-header">{day}</div>)}
                    {horas.map((hora) => (
                        <React.Fragment key={hora}>
                            <div className="time-slot">{hora}</div>
                            {[...Array(days.length)].map((_, colIndex) => (
                                <div key={`${hora}-${colIndex}`} className="grid-cell"></div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>

                {/* Capa 2: Overlay para las Clases */}
                <div 
                    className="horario-grid"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                >
                    {clasesSeleccionadas
                        .filter(clase => clase.dia && clase.hora_inicio && clase.hora_fin)
                        .map((clase, index) => (
                            <ClaseCard key={`${clase.nrc}-${clase.dia}-${index}`} clase={clase} />
                        ))}
                </div>
            </div>

            <div className="descargas">
                <button className="primary-button" onClick={() => alert('Función de descarga PDF próximamente.')}>
                    📄 Descargar PDF
                </button>
                <button className="primary-button" onClick={() => alert('Función de descarga Excel próximamente.')}>
                    📊 Descargar Excel
                </button>
            </div>
        </div>
    );
}

