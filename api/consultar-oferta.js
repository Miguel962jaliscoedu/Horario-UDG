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
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    try {
        const { ciclop, cup, majrp, materiap } = req.body;
        
        // LOG 1: Ver qué datos llegan del Frontend
        console.log("1. Datos recibidos:", { ciclop, cup, majrp, materiap });

        if (!ciclop || !cup || !majrp) return res.status(400).json({ error: "Faltan parámetros requeridos." });

        const postData = new URLSearchParams({
            ciclop, cup, majrp,
            mostrarp: "1000", crsep: "", 
            materiap: materiap || "", // Asegurar que no sea undefined
            horaip: "", horafp: "", edifp: "", aulap: "", ordenp: "0"
        });

        const response = await axios.post(POST_URL, postData.toString(), {
            headers, timeout: 15000, responseType: 'arraybuffer'
        });

        const html = iconv.decode(response.data, 'iso-8859-1');
        
        // LOG 2: Ver si el SIIAU respondió algo coherente
        console.log("2. Longitud HTML recibido:", html.length);

        if (html.includes("ORA-01403")) {
            console.log("3. Error ORA-01403 detectado (No data found)");
            return res.status(404).json({ error: "SIIAU dice: No se encontraron datos (ORA-01403)." });
        }

        const $ = load(html);
        const allRowsExpanded = [];

        // Buscar filas (usamos selector genérico de tabla)
        const tableRows = $('table tr'); 
        console.log("4. Filas de tabla encontradas (bruto):", tableRows.length);

        tableRows.each((i, row) => {
            const cells = $(row).children('td');
            const nrcText = cells.eq(0).text().trim();
            
            // Validamos si es una fila de materia real (tiene NRC numérico)
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

                // Extracción profesor
                let profesor_asignado = "No asignado";
                const profCell = cells.eq(8).find('.tdprofesor');
                if (profCell.length > 0) {
                    profesor_asignado = profCell.last().text().trim();
                } else {
                    const text8 = cells.eq(8).text().trim();
                    if (text8 && !/^\d+$/.test(text8)) profesor_asignado = text8;
                }

                // Extracción Horarios
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

                // Aplanar resultados (expandir horarios)
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

        // LOG 5: Resultado final
        console.log("5. Total filas procesadas y listas para enviar:", allRowsExpanded.length);

        if (allRowsExpanded.length === 0) {
            // Si llegamos aquí, el HTML no tenía la estructura esperada o no había materias
            // Imprimimos un pedazo del HTML para ver qué devolvió el SIIAU
            console.log("DEBUG HTML (Primeros 500 chars):", html.substring(0, 500));
            return res.status(404).json({ error: "La tabla fue encontrada pero no se extrajeron filas. Revisa los logs." });
        }

        return res.status(200).json(allRowsExpanded);

    } catch (error) {
        console.error("Error API SIIAU:", error);
        return res.status(500).json({ error: `Error interno: ${error.message}` });
    }
}