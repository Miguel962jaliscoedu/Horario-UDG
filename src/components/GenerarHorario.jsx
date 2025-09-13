import React, { useMemo } from 'react';

// Helper para crear la estructura de datos para el grid
const buildScheduleGrid = (clases) => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const timeSlots = [];
    for (let i = 7; i <= 21; i++) {
        timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
    }

    const grid = timeSlots.map(time => ({
        time,
        clases: Array(days.length).fill(null)
    }));

    clases.forEach(clase => {
        if (!clase.dia || !clase.hora_inicio || !clase.hora_fin) return;
        
        const dayIndex = days.indexOf(clase.dia);
        if (dayIndex === -1) return;
        
        const startHour = parseInt(clase.hora_inicio.split(':')[0]);
        const endHour = parseInt(clase.hora_fin.split(':')[0]);

        for (let i = startHour; i < endHour; i++) {
            const timeIndex = i - 7;
            if (timeIndex >= 0 && timeIndex < timeSlots.length) {
                if (!grid[timeIndex].clases[dayIndex]) {
                    grid[timeIndex].clases[dayIndex] = [];
                }
                grid[timeIndex].clases[dayIndex].push(clase);
            }
        }
    });

    return { grid, days, timeSlots };
};


export const GenerarHorario = ({ clasesSeleccionadas }) => {

    const { grid, days } = useMemo(() => buildScheduleGrid(clasesSeleccionadas), [clasesSeleccionadas]);

    return (
        <div className="card">
            <h2>Horario Final</h2>
            <p>Aquí tienes una vista visual de tu horario. Puedes descargarlo en diferentes formatos.</p>

            <div className="horario-grid">
                {/* Headers de días */}
                <div className="grid-header">Hora</div>
                {days.map(day => <div key={day} className="grid-header">{day}</div>)}

                {/* Filas de Horas y Clases */}
                {grid.map(({ time, clases }) => (
                    <React.Fragment key={time}>
                        <div className="time-slot">{time}</div>
                        {clases.map((claseList, dayIndex) => (
                            <div key={dayIndex} className="grid-cell">
                                {claseList && claseList.map((clase, i) => (
                                    // Mostramos la primera clase que ocupe este slot. 
                                    // Se puede mejorar para mostrar múltiples si se solapan.
                                    i === 0 && (
                                        <div key={clase.nrc + clase.dia} className="clase-card">
                                            <strong>{clase.materia}</strong>
                                            <span>NRC: {clase.nrc}</span>
                                            <span>{clase.edificio}-{clase.aula}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
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
};
