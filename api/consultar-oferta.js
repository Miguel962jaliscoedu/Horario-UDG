// api/consultar-oferta.js
import axios from 'axios';
import { load } from 'cheerio';
import iconv from 'iconv-lite';

const POST_URL = "https://siiauescolar.siiau.udg.mx/wal/sspseca.consulta_oferta";

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded'
};

const cleanDays = (dayString) => {
    if (!dayString) return [];
    const dayNames = { "L": "Lunes", "M": "Martes", "I": "Miércoles", "J": "Jueves", "V": "Viernes", "S": "Sábado" };
    const cleaned = [];
    for (const char of dayString) {
        if (dayNames[char]) cleaned.push(dayNames[char]);
    }
    return cleaned;
};

const parseTime = (timeStr) => {
    if (!timeStr || timeStr.length !== 4 || !/^\d+$/.test(timeStr)) return timeStr;
    return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
};

export default async function handler(req, res) {
    // Configuración CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    try {
        const { ciclop, cup, majrp, materiap } = req.body;

        if (!ciclop || !cup || !majrp) return res.status(400).json({ error: "Faltan parámetros requeridos." });

        const postData = new URLSearchParams({
            ciclop, cup, majrp,
            mostrarp: "1000", crsep: "", 
            materiap: materiap || "", 
            horaip: "", horafp: "", edifp: "", aulap: "", ordenp: "0"
        });

        const response = await axios.post(POST_URL, postData.toString(), {
            headers, timeout: 20000, responseType: 'arraybuffer'
        });

        const html = iconv.decode(response.data, 'iso-8859-1');
        
        // Error explícito de base de datos SIIAU
        if (html.includes("ORA-01403")) {
            return res.status(404).json({ error: "No se encontraron clases para los filtros seleccionados." });
        }

        const $ = load(html);
        const allRowsExpanded = [];
        const tableRows = $('table tr'); 

        tableRows.each((i, row) => {
            const cells = $(row).children('td');
            const nrcText = cells.eq(0).text().trim();
            
            // Validación: NRC numérico y suficientes columnas
            if (cells.length >= 8 && /^\d+$/.test(nrcText)) {
                
                const baseInfo = {
                    nrc: nrcText,
                    clave: cells.eq(1).text().trim(),
                    materia: cells.eq(2).text().trim(),
                    seccion: cells.eq(3).text().trim(),
                    creditos: cells.eq(4).text().trim(),
                    cupos: cells.eq(5).text().trim(),
                    disponibles: cells.eq(6).text().trim(),
                };

                // Profesor
                let profesor_asignado = "No asignado";
                const profCell = cells.eq(8).find('.tdprofesor');
                if (profCell.length > 0) {
                    profesor_asignado = profCell.last().text().trim();
                } else {
                    const text8 = cells.eq(8).text().trim();
                    if (text8 && !/^\d+$/.test(text8)) profesor_asignado = text8;
                }

                // Horarios
                const sesiones = [];
                const horarioTable = cells.eq(7).find('table');
                
                if (horarioTable.length > 0) {
                    horarioTable.find('tr').each((j, sesRow) => {
                        const sesCells = $(sesRow).find('td');
                        if (sesCells.length >= 2) {
                            sesiones.push({
                                hora_str: sesCells.eq(1).text().trim(),
                                dias_str: sesCells.eq(2).text().trim(),
                                edificio: sesCells.eq(3).text().trim(),
                                aula: sesCells.eq(4).text().trim(),
                            });
                        }
                    });
                }

                if (sesiones.length === 0) {
                    allRowsExpanded.push({ ...baseInfo, profesor: profesor_asignado, hora_inicio: null, hora_fin: null, dia: null, edificio: null, aula: null });
                } else {
                    sesiones.forEach(sesion => {
                        const dias = cleanDays(sesion.dias_str);
                        const [inicio, fin] = sesion.hora_str.split('-');
                        const hora_inicio = parseTime(inicio);
                        const hora_fin = parseTime(fin);

                        if (dias.length === 0) {
                             allRowsExpanded.push({ ...baseInfo, profesor: profesor_asignado, hora_inicio, hora_fin, dia: null, edificio: sesion.edificio, aula: sesion.aula });
                        } else {
                            dias.forEach(dia => {
                                allRowsExpanded.push({ ...baseInfo, profesor: profesor_asignado, hora_inicio, hora_fin, dia, edificio: sesion.edificio, aula: sesion.aula });
                            });
                        }
                    });
                }
            }
        });

        // --- MENSAJE DE ERROR AMIGABLE ACTUALIZADO ---
        if (allRowsExpanded.length === 0) {
            // Este mensaje se mostrará en el frontend cuando la tabla esté vacía o no exista
            return res.status(404).json({ 
                error: "No se encontraron clases para los filtros seleccionados." 
            });
        }

        return res.status(200).json(allRowsExpanded);

    } catch (error) {
        console.error("Error API SIIAU:", error.message);
        return res.status(500).json({ error: "Ocurrió un error de conexión con el SIIAU. Inténtalo de nuevo." });
    }
}