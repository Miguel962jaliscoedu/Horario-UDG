import React, { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Función para convertir la hora "HH:MM" a minutos para cálculos precisos.
const timeToMinutes = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// Componente para la tarjeta de clase en la VISTA WEB.
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
        pointerEvents: 'auto',
    };
    return (
        <div className="clase-card" style={cardStyle}>
            <div className="clase-card-inner">
                <strong>{clase.materia}</strong>
                <span>{clase.edificio} - {clase.aula}</span>
                <span>{clase.profesor}</span>
            </div>
        </div>
    );
};

// Componente de la imagen del horario estilizado para fondos de pantalla
const HorarioImagen = React.forwardRef(({ clases, calendarioLabel, aspectRatio, theme }, ref) => {
    const isVertical = aspectRatio === '9/16';
    const isLightTheme = theme === 'light';

    const lightPalette = ['#a2d2ff', '#ffb3c1', '#bde0fe', '#ffafcc', '#cdb4db', '#ffc8dd', '#d4e09b'];
    const darkPalette = ['#2980b9', '#c0392b', '#16a085', '#8e44ad', '#f39c12', '#2c3e50', '#d35400'];
    const colorPalette = isLightTheme ? lightPalette : darkPalette;

    const subjectColors = {};
    let colorIndex = 0;
    clases.forEach(clase => {
        if (!subjectColors[clase.clave]) {
            subjectColors[clase.clave] = colorPalette[colorIndex % colorPalette.length];
            colorIndex++;
        }
    });

    const hasSaturdayClasses = clases.some(c => c.dia === 'Sábado');
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', hasSaturdayClasses ? 'Sábado' : null].filter(Boolean);

    let minHour = 22, maxHour = 7;
    if (clases.length > 0) {
        clases.forEach(clase => {
            if (clase.hora_inicio && clase.hora_fin) {
                minHour = Math.min(minHour, Math.floor(timeToMinutes(clase.hora_inicio) / 60));
                maxHour = Math.max(maxHour, Math.ceil(timeToMinutes(clase.hora_fin) / 60));
            }
        });
    } else {
        minHour = 7; maxHour = 15;
    }

    const hours = Array.from({ length: maxHour - minHour }, (_, i) => i + minHour);
    
    const styles = {
        container: { background: isLightTheme ? '#f8f9fa' : '#212529', color: isLightTheme ? '#212529' : '#ffffff' },
        headerH2: { color: isLightTheme ? '#212529' : '#ffffff' },
        headerP: { color: isLightTheme ? '#6c757d' : '#aaa' },
        gridLabels: { color: isLightTheme ? '#6c757d' : '#aaa' },
        classText: { color: isLightTheme ? '#000000' : '#ffffff' }
    };

    return (
        <div ref={ref} className="horario-wallpaper-container" style={{ ...styles.container, aspectRatio }}>
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                .horario-wallpaper-container {
                    font-family: 'Inter', sans-serif;
                    padding: ${isVertical ? '50px 25px' : '40px'};
                    box-sizing: border-box; display: flex; flex-direction: column;
                    width: 100%; height: 100%;
                }
                .wallpaper-header { text-align: center; margin-bottom: ${isVertical ? '25px' : '20px'}; }
                .wallpaper-header h2 { font-size: ${isVertical ? '32px' : '28px'}; margin: 0 0 8px 0; }
                .wallpaper-header p { font-size: ${isVertical ? '18px' : '16px'}; margin: 0; }
                .wallpaper-grid {
                    display: grid;
                    grid-template-columns: ${isVertical ? '50px' : '55px'} repeat(${days.length}, 1fr);
                    grid-template-rows: ${isVertical ? '35px' : '30px'} repeat(${hours.length}, 1fr);
                    gap: ${isVertical ? '8px' : '8px'};
                    flex-grow: 1;
                }
                .wallpaper-day, .wallpaper-time {
                    font-size: ${isVertical ? '14px' : '12px'}; font-weight: 600; 
                    display: flex; align-items: center; justify-content: center;
                }
                .wallpaper-time { justify-content: flex-end; padding-right: 10px; }
                .wallpaper-clase {
                    padding: ${isVertical ? '10px' : '8px'}; border-radius: ${isVertical ? '8px' : '6px'};
                    box-sizing: border-box; display: flex; flex-direction: column;
                    justify-content: center; text-align: center;
                }
                .wallpaper-clase strong { font-size: ${isVertical ? '15px' : '13px'}; font-weight: 700; margin-bottom: 4px; }
                .wallpaper-clase span { font-size: ${isVertical ? '13px' : '11px'}; opacity: 0.9; }
                `}
            </style>
             <div className="wallpaper-header">
                <h2 style={styles.headerH2}>Mi Horario</h2>
                <p style={styles.headerP}>{calendarioLabel}</p>
            </div>
            <div className="wallpaper-grid">
                {days.map((day, i) => (
                    <div key={day} className="wallpaper-day" style={{ ...styles.gridLabels, gridColumn: i + 2, gridRow: 1 }}>{day.substring(0,3)}</div>
                ))}
                {hours.map((hour, i) => (
                    <div key={hour} className="wallpaper-time" style={{ ...styles.gridLabels, gridColumn: 1, gridRow: i + 2 }}>{`${hour}:00`}</div>
                ))}
                {clases.map((clase, index) => {
                    if (!clase.hora_inicio) return null;
                    const startMin = timeToMinutes(clase.hora_inicio);
                    const endMin = timeToMinutes(clase.hora_fin);
                    const startRow = Math.floor(startMin / 60) - minHour + 2;
                    const endRow = Math.ceil(endMin / 60) - minHour + 2;
                    const dayCol = days.indexOf(clase.dia) + 2;
                    if (dayCol < 2) return null;
                    return (
                        <div key={index} className="wallpaper-clase" style={{
                            gridColumn: dayCol, gridRow: `${startRow} / ${endRow}`,
                            backgroundColor: subjectColors[clase.clave], color: styles.classText.color,
                        }}>
                            <strong>{clase.materia}</strong>
                            <span>{clase.profesor}</span>
                            <span>{clase.edificio}-{clase.aula}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
HorarioImagen.displayName = 'HorarioImagen';

export function GenerarHorario({ clasesSeleccionadas, calendarioLabel, theme }) {
    const scheduleRef = useRef(null);
    const imageRenderRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [aspectRatio, setAspectRatio] = useState('9/16');
    const [imageTheme, setImageTheme] = useState(theme);
    const [isRendering, setIsRendering] = useState(false);
    const horas = Array.from({ length: 15 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);
    const [renderSize, setRenderSize] = useState({ width: 1080, height: 1920 });

    const handleDownloadPdf = () => {
        let minHour = 22, maxHour = 7;
        if (clasesSeleccionadas.length > 0) {
            clasesSeleccionadas.forEach(c => { if (c.hora_inicio) minHour = Math.min(minHour, Math.floor(timeToMinutes(c.hora_inicio) / 60)); if (c.hora_fin) maxHour = Math.max(maxHour, Math.ceil(timeToMinutes(c.hora_fin) / 60)); });
        } else { minHour = 7; maxHour = 15; }
        
        const subjectColors = {}, colorPalette = [[225, 245, 254], [255, 229, 228], [222, 247, 221], [255, 244, 222], [237, 230, 249]];
        let colorIndex = 0;
        clasesSeleccionadas.forEach(c => { if (!subjectColors[c.clave]) subjectColors[c.clave] = colorPalette[colorIndex++ % colorPalette.length]; });
        const hasSaturday = clasesSeleccionadas.some(c => c.dia === 'Sábado');
        const activeDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].concat(hasSaturday ? ['Sábado'] : []);
        const head = [['Hora', ...activeDays]], body = [], grid = Array.from({ length: maxHour - minHour }, () => Array(activeDays.length).fill(''));

        clasesSeleccionadas.forEach(clase => {
            const dayIndex = activeDays.indexOf(clase.dia);
            if (dayIndex === -1 || !clase.hora_inicio) return;
            const startRow = Math.floor(timeToMinutes(clase.hora_inicio) / 60) - minHour;
            const duration = Math.ceil((timeToMinutes(clase.hora_fin) - timeToMinutes(clase.hora_inicio)) / 60);
            if (startRow >= 0 && startRow < grid.length) {
                grid[startRow][dayIndex] = {
                    content: `${clase.materia}\n${clase.edificio} - ${clase.aula}\n${clase.profesor}`,
                    rowSpan: duration, styles: { fillColor: subjectColors[clase.clave], textColor: [40, 40, 40] }
                };
                for (let i = 1; i < duration; i++) if (startRow + i < grid.length) grid[startRow + i][dayIndex] = null;
            }
        });
        
        for (let i = 0; i < maxHour - minHour; i++) {
            const hour = minHour + i, row = [`${hour}:00\nA ${hour + 1}:00`];
            for (let j = 0; j < activeDays.length; j++) if (grid[i][j] !== null) row.push(grid[i][j]);
            body.push(row);
        }

        const tempDoc = new jsPDF(), pageHeight = tempDoc.internal.pageSize.getHeight();
        autoTable(tempDoc, { head, body });
        const tableHeight = tempDoc.lastAutoTable.finalY - tempDoc.lastAutoTable.startY;
        const orientation = (tableHeight + 45 > pageHeight / 2 && hasSaturday) ? 'l' : 'p';
        const doc = new jsPDF(orientation, 'mm', 'letter');
        doc.setFontSize(16).setFont('helvetica', 'bold').text("Universidad de Guadalajara", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.setFontSize(12).setFont('helvetica', 'normal').text(calendarioLabel || "Ciclo Escolar", doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
        autoTable(doc, { head, body, startY: 35, theme: 'grid', styles: { fontSize: 7, valign: 'middle', lineWidth: 0.1, lineColor: [200, 200, 200] }, headStyles: { fillColor: [41, 128, 185], textColor: 255 }, columnStyles: { 0: { cellWidth: 18 } } });
        doc.setFontSize(8).text(`Generado el ${new Date().toLocaleDateString('es-MX')} en horarioudg.vercel.app`, doc.internal.pageSize.getWidth() / 2, doc.lastAutoTable.finalY + 10, { align: 'center' });
        doc.save('horario.pdf');
    };

    const handleGenerateImage = () => {
        setIsModalOpen(false);
        setIsRendering(true);
        const isVertical = aspectRatio === '9/16';
        const newSize = { width: isVertical ? 1080 : 1920, height: isVertical ? 1920 : 1080 };
        setRenderSize(newSize);
        
        // useEffect se encargará de renderizar con el nuevo tamaño
    };

    useEffect(() => {
        if (isRendering) {
            const generate = async () => {
                const elementToRender = imageRenderRef.current;
                if (elementToRender) {
                    const canvas = await html2canvas(elementToRender, {
                        width: renderSize.width,
                        height: renderSize.height,
                        scale: 1, useCORS: true,
                    });
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/jpeg', 0.95);
                    link.download = `horario-${aspectRatio === '9/16' ? 'telefono' : 'escritorio'}-${imageTheme}.jpeg`;
                    link.click();
                }
                setIsRendering(false);
            };
            // Pequeño delay para que React renderice el componente con el nuevo tamaño
            const timer = setTimeout(generate, 100);
            return () => clearTimeout(timer);
        }
    }, [isRendering, renderSize, aspectRatio, imageTheme, clasesSeleccionadas, calendarioLabel]);

    const openImageModal = () => { setImageTheme(theme); setIsModalOpen(true); };

    return (
        <div className="card">
            <h2>Horario Final</h2>
            <p>Aquí tienes una vista visual de tu horario. Puedes descargarlo en diferentes formatos.</p>
            <div ref={scheduleRef} className="schedule-container">
                <div className="horario-grid">
                    <div className="grid-header">Hora</div>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => <div key={day} className="grid-header">{day}</div>)}
                    {horas.map(hora => (<React.Fragment key={hora}><div className="time-slot">{hora}</div>{[...Array(6)].map((_, i) => (<div key={`${hora}-${i}`} className="grid-cell"></div>))}</React.Fragment>))}
                </div>
                <div className="horario-grid" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {clasesSeleccionadas.filter(c => c.dia && c.hora_inicio).map((clase, i) => (<ClaseCard key={`${clase.nrc}-${clase.dia}-${i}`} clase={clase} />))}
                </div>
            </div>
            <div className="descargas">
                <button className="primary-button" onClick={handleDownloadPdf}>📄 Descargar PDF</button>
                <button className="primary-button" onClick={openImageModal}>🖼️ Descargar Imagen</button>
            </div>
            
            {isRendering && <div className="loading-overlay">Generando imagen...</div>}

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Configurar Imagen</h2>
                        <p>Elige las opciones para tu fondo de pantalla.</p>
                        <div className="image-options">
                            <div className="option-group">
                                <strong>Proporción:</strong>
                                <button onClick={() => setAspectRatio('9/16')} className={aspectRatio === '9/16' ? 'active' : ''}>📱 Teléfono</button>
                                <button onClick={() => setAspectRatio('16/9')} className={aspectRatio === '16/9' ? 'active' : ''}>💻 Escritorio</button>
                            </div>
                            <div className="option-group">
                                <strong>Tema:</strong>
                                <button onClick={() => setImageTheme('light')} className={imageTheme === 'light' ? 'active' : ''}>☀️ Claro</button>
                                <button onClick={() => setImageTheme('dark')} className={imageTheme === 'dark' ? 'active' : ''}>🌙 Oscuro</button>
                            </div>
                        </div>
                        <button className="primary-button generate-btn" onClick={handleGenerateImage}>Generar y Descargar</button>
                    </div>
                </div>
            )}
            
            <div style={{ position: 'fixed', left: '-9999px', top: 0, width: `${renderSize.width}px`, height: `${renderSize.height}px` }}>
                 <HorarioImagen ref={imageRenderRef} clases={clasesSeleccionadas} calendarioLabel={calendarioLabel} aspectRatio={aspectRatio} theme={imageTheme} />
            </div>
        </div>
    );
}

