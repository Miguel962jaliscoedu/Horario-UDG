/**
 * Convierte una hora en formato "HH:MM" a minutos desde la medianoche.
 * @param {string} timeStr - La hora en formato "HH:MM".
 * @returns {number} - El total de minutos.
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Detecta si dos clases tienen un conflicto de horario.
 * @param {object} claseA - El primer objeto de clase.
 * @param {object} claseB - El segundo objeto de clase.
 * @returns {boolean} - True si hay un cruce, false si no.
 */
const hayCruce = (claseA, claseB) => {
  // No hay cruce si son en días diferentes o si alguna no tiene día u hora
  if (!claseA.dia || !claseB.dia || claseA.dia !== claseB.dia || !claseA.hora_inicio || !claseB.hora_inicio) {
    return false;
  }

  const inicioA = timeToMinutes(claseA.hora_inicio);
  const finA = timeToMinutes(claseA.hora_fin);
  const inicioB = timeToMinutes(claseB.hora_inicio);
  const finB = timeToMinutes(claseB.hora_fin);

  // Lógica de superposición de tiempo:
  // (InicioA < FinB) y (FinA > InicioB)
  return inicioA < finB && finA > inicioB;
};

/**
 * Revisa una lista de clases seleccionadas y encuentra todos los conflictos de horario.
 * @param {Array<object>} clases - Un array de objetos de clase.
 * @returns {Array<Array<object>>} - Un array de pares de clases que tienen conflicto.
 */
export const detectarCruces = (clases) => {
  const cruces = [];
  // Copia para evitar mutaciones y asegurar que tenemos los datos correctos
  const clasesValidas = JSON.parse(JSON.stringify(clases));

  for (let i = 0; i < clasesValidas.length; i++) {
    for (let j = i + 1; j < clasesValidas.length; j++) {
      // No comparar clases del mismo NRC (si una materia tiene varias sesiones)
      if (clasesValidas[i].nrc !== clasesValidas[j].nrc) {
        if (hayCruce(clasesValidas[i], clasesValidas[j])) {
          cruces.push([clasesValidas[i], clasesValidas[j]]);
        }
      }
    }
  }
  return cruces;
};


/**
 * Genera mensajes legibles para los cruces detectados, eliminando duplicados.
 * @param {Array<Array<object>>} cruces - El array de pares de clases con conflicto.
 * @returns {Array<string>} - Un array de mensajes de error formateados y únicos.
 */
export const generarMensajeCruces = (cruces) => {
    const mensajes = cruces.map(([clase1, clase2]) => {
        return `El día ${clase1.dia}, la materia "${clase1.materia}" (${clase1.hora_inicio} - ${clase1.hora_fin}) se cruza con "${clase2.materia}" (${clase2.hora_inicio} - ${clase2.hora_fin}).`;
    });
    // Eliminar mensajes duplicados para una UI más limpia
    return [...new Set(mensajes)];
};