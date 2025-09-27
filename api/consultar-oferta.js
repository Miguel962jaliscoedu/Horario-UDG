import axios from 'axios';
import { load } from 'cheerio';
import iconv from 'iconv-lite';

const POST_URL = "https://siiauescolar.siiau.udg.mx/wal/sspseca.consulta_oferta";

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded'
};

// --- Funciones de Ayuda para el Parsing ---

const cleanDays = (dayString) => {
    if (!dayString) return [];
    const dayNames = { "L": "Lunes", "M": "Martes", "I": "Miércoles", "J": "Jueves", "V": "Viernes", "S": "Sábado" };
    const cleaned = [];
    // Se eliminan todos los espacios y se divide por el punto, que a veces no está presente.
    // Se recorre cada caracter para encontrar las letras de los días.
    for (const char of dayString) {
        if (dayNames[char]) {
            cleaned.push(dayNames[char]);
        }
    }
    return cleaned;
};

const parseTime = (timeStr) => {
    if (!timeStr || timeStr.length !== 4 || !/^\d+$/.test(timeStr)) {
        return timeStr;
    }
    return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
};

// --- Handler Principal de la API ---

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { ciclop, cup, majrp } = req.body;

        if (!ciclop || !cup || !majrp) {
            return res.status(400).json({ error: "Faltan parámetros requeridos (ciclop, cup, majrp)." });
        }

        const postData = new URLSearchParams({
            ciclop,
            cup,
            majrp,
            mostrarp: "1000", // Aumentado para asegurar que se obtienen todos los resultados
            crsep: "",
            materiap: "",
            horaip: "",
            horafp: "",
            edifp: "",
            aulap: "",
            ordenp: "0"
        });
        
        const response = await axios.post(POST_URL, postData.toString(), { 
            headers, 
            timeout: 15000,
            responseType: 'arraybuffer' // 1. Pedir la respuesta como buffer
        });

        // 2. Decodificar el buffer usando la codificación correcta
        const html = iconv.decode(response.data, 'iso-8859-1');
        
        if (html.includes("ORA-01403: no data found")) {
            return res.status(404).json({ error: "No se encontraron datos para los filtros seleccionados." });
        }

        const $ = load(html);

        const nrcHeader = $("th:contains('NRC')");
        if (nrcHeader.length === 0) {
            return res.status(404).json({ error: "No se pudo encontrar la tabla de materias en la respuesta." });
        }
        
        const headerRow = nrcHeader.parent();
        const dataRows = headerRow.nextAll('tr');
        const allRowsExpanded = [];

        dataRows.each((i, row) => {
            const cells = $(row).children('td');
            
            if (cells.length < 9) return;

            const baseInfo = {
                nrc: cells.eq(0).text().trim(),
                clave: cells.eq(1).text().trim(),
                materia: cells.eq(2).text().trim(),
                seccion: cells.eq(3).text().trim(),
                creditos: cells.eq(4).text().trim(),
                cupos: cells.eq(5).text().trim(),
                disponibles: cells.eq(6).text().trim(),
            };
            
            let profesor_asignado = "No asignado";
            const profNameCell = cells.eq(8).find('td.tdprofesor').eq(1); 
            if (profNameCell.length > 0) {
                profesor_asignado = profNameCell.text().trim();
            } else {
                const singleProfCell = cells.eq(8).find('td.tdprofesor');
                if (singleProfCell.length === 1 && !/^\d+$/.test(singleProfCell.text().trim())) {
                     profesor_asignado = singleProfCell.text().trim();
                }
            }

            const sesiones = [];
            cells.eq(7).find('table tr').each((j, sesRow) => {
                const sesCells = $(sesRow).find('td');
                if (sesCells.length >= 5) {
                    sesiones.push({
                        hora_str: sesCells.eq(1).text().trim(),
                        dias_str: sesCells.eq(2).text().trim(),
                        edificio: sesCells.eq(3).text().trim(),
                        aula: sesCells.eq(4).text().trim(),
                    });
                }
            });

            if (sesiones.length === 0) {
                const finalEntry = { ...baseInfo, profesor: profesor_asignado, hora_inicio: null, hora_fin: null, dia: null, edificio: null, aula: null };
                allRowsExpanded.push(finalEntry);
            } else {
                sesiones.forEach(sesion => {
                    const dias = cleanDays(sesion.dias_str);
                    const [hora_inicio_raw, hora_fin_raw] = sesion.hora_str.split('-');
                    const hora_inicio = parseTime(hora_inicio_raw);
                    const hora_fin = parseTime(hora_fin_raw);

                    if (dias.length === 0 && sesion.edificio) {
                         const finalEntry = { ...baseInfo, profesor: profesor_asignado, hora_inicio, hora_fin, dia: null, edificio: sesion.edificio, aula: sesion.aula };
                         allRowsExpanded.push(finalEntry);
                    } else {
                        dias.forEach(dia => {
                            const finalEntry = { ...baseInfo, profesor: profesor_asignado, hora_inicio, hora_fin, dia, edificio: sesion.edificio, aula: sesion.aula };
                            allRowsExpanded.push(finalEntry);
                        });
                    }
                });
            }
        });

        if (allRowsExpanded.length === 0) {
            return res.status(404).json({ error: "La tabla de materias fue encontrada pero no se pudo extraer ninguna fila. La estructura puede haber cambiado." });
        }

        return res.status(200).json(allRowsExpanded);

    } catch (error) {
        console.error("Error en /api/consultar-oferta:", error.message, error.stack);
        return res.status(500).json({ error: `Ocurrió un error interno al consultar la oferta: ${error.message}` });
    }
}
