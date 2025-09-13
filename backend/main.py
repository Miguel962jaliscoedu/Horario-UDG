import logging
import re
from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
from io import StringIO
import pandas as pd

# --- Configuración de Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Configuración de la Aplicación Flask ---
app = Flask(__name__)

# --- URLs del SIIAU ---
FORM_URL = "https://siiauescolar.siiau.udg.mx/wal/sspseca.forma_consulta"
POST_URL = "https://siiauescolar.siiau.udg.mx/wal/sspseca.consulta_oferta"

# --- Lógica de Scraping y Procesamiento ---

def fetch_form_options_with_descriptions(url):
    """Obtiene y parsea las opciones de los menús de selección del formulario del SIIAU."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        with open("form_options_response.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        logging.info("HTML de opciones de formulario guardado en 'form_options_response.html'")
            
        soup = BeautifulSoup(response.text, "html.parser")
        important_fields = ["ciclop", "cup"]
        options_data = {}

        for field_name in important_fields:
            select_tag = soup.find("select", {"name": field_name})
            if select_tag:
                logging.info(f"Se encontró la etiqueta <select> para el campo '{field_name}'.")
                options = []
                for option in select_tag.find_all("option"):
                    value = option.get("value", "").strip()
                    if value:
                        text_parts = [child.strip() for child in option.contents if isinstance(child, str)]
                        full_text = " ".join(filter(None, text_parts)).strip()
                        full_text = re.sub(r'\s+', ' ', full_text)
                        
                        parts = full_text.split("-", 1)
                        description = parts[1].strip() if len(parts) > 1 else full_text
                        options.append({"value": value, "description": description})
                options_data[field_name] = options
            else:
                logging.warning(f"ALERTA: No se encontró la etiqueta <select> para el campo '{field_name}'.")
        
        return options_data
    except Exception as e:
        logging.error(f"Falló la obtención de opciones del formulario: {e}", exc_info=True)
        return {}


def get_majors_from_html(html_content):
    """Extrae las carreras de la página de abreviaturas del SIIAU."""
    soup = BeautifulSoup(html_content, "html.parser")
    table = soup.find("table")
    if not table:
        logging.warning("No se encontró la tabla de carreras en la página de abreviaturas.")
        return {}
        
    try:
        df = pd.read_html(StringIO(str(table)), flavor='lxml')[0]
        if 'CICLO' in df.columns and 'DESCRIPCION' in df.columns:
            df_cleaned = df.dropna(subset=['CICLO'])
            return dict(zip(df_cleaned['CICLO'], df_cleaned['DESCRIPCION']))
        else:
            logging.warning(f"La tabla de carreras no contiene las columnas 'CICLO' y 'DESCRIPCION'. Columnas encontradas: {df.columns.to_list()}")
            return {}
    except Exception as e:
        logging.error(f"Error al parsear la tabla de carreras con pandas: {e}")
        return {}

def find_main_courses_table(soup):
    """
    Encuentra la tabla principal de cursos de manera definitiva buscando el
    encabezado 'NRC' y navegando hacia sus elementos padres.
    """
    try:
        # Busca el encabezado <th> que contiene exactamente "NRC".
        # La expresión regular ^NRC$ asegura una coincidencia exacta.
        nrc_header = soup.find("th", string=re.compile(r"^\s*NRC\s*$"))
        if nrc_header:
            logging.info("Encabezado 'NRC' encontrado.")
            # Navega hacia el padre <tr> (la fila de encabezados)
            header_row = nrc_header.find_parent("tr")
            if header_row:
                logging.info("Fila de encabezados encontrada.")
                # Navega hacia el padre <table> (la tabla principal)
                main_table = header_row.find_parent("table")
                if main_table:
                    logging.info("Tabla de cursos principal encontrada.")
                    return main_table, header_row
    except Exception as e:
        logging.error(f"Ocurrió un error al buscar la tabla principal: {e}")

    logging.warning("No se pudo encontrar la tabla de cursos principal mediante el método de búsqueda de encabezado.")
    return None, None


def clean_days(day_string):
    """Traduce el formato de días posicional del SIIAU a una lista de nombres de días."""
    day_names = {"L": "Lunes", "M": "Martes", "I": "Miércoles", "J": "Jueves", "V": "Viernes", "S": "Sábado"}
    cleaned = []
    
    parts = day_string.replace(" ", "").split('.')
    for char in parts:
        if char in day_names:
            cleaned.append(day_names[char])
            
    return cleaned

def parse_time(time_str):
    """Convierte un string de hora HHMM a formato HH:MM."""
    if not time_str or len(time_str) != 4:
        return time_str
    return f"{time_str[:2]}:{time_str[2:]}"

def process_and_expand_rows(table, header_row):
    """
    Procesa las filas de la tabla de cursos, extrayendo la información
    de las celdas y las tablas anidadas de sesiones y profesores.
    """
    all_rows_expanded = []
    # Todas las filas después de la fila de encabezado son datos
    data_rows = header_row.find_next_siblings("tr")

    for row in data_rows:
        # --- INICIO DE LA SOLUCIÓN ---
        # Usamos recursive=False para obtener solo los <td> hijos directos de la fila,
        # ignorando los <td> anidados en las tablas de horario.
        cells = row.find_all("td", recursive=False)
        # --- FIN DE LA SOLUCIÓN ---

        if len(cells) < 9:
            continue

        base_info = {
            "nrc": cells[0].get_text(strip=True),
            "clave": cells[1].get_text(strip=True),
            "materia": cells[2].get_text(strip=True),
            "seccion": cells[3].get_text(strip=True),
            "creditos": cells[4].get_text(strip=True),
            "cupos": cells[5].get_text(strip=True),
            "disponibles": cells[6].get_text(strip=True),
        }

        sesiones_table = cells[7].find("table")
        sesiones = []
        if sesiones_table:
            for ses_row in sesiones_table.find_all("tr"):
                ses_cells = ses_row.find_all("td")
                if len(ses_cells) >= 5: # Flexible por si falta la columna de periodo
                    sesiones.append({
                        "hora_str": ses_cells[1].get_text(strip=True),
                        "dias_str": ses_cells[2].get_text(strip=True),
                        "edificio": ses_cells[3].get_text(strip=True),
                        "aula": ses_cells[4].get_text(strip=True),
                    })
        
        profesores_table = cells[8].find("table")
        profesor_asignado = "No asignado"
        if profesores_table:
            prof_cells = profesores_table.find_all("td", class_="tdprofesor")
            if len(prof_cells) == 2:
                profesor_asignado = prof_cells[1].get_text(strip=True)
            elif len(prof_cells) == 1:
                 profesor_asignado = prof_cells[0].get_text(strip=True)

        if not sesiones:
            final_entry = base_info.copy()
            final_entry["profesor"] = profesor_asignado
            final_entry.update({"hora_inicio": None, "hora_fin": None, "dia": None, "edificio": None, "aula": None})
            all_rows_expanded.append(final_entry)
            continue
        
        for sesion in sesiones:
            dias = clean_days(sesion["dias_str"])
            hora_parts = sesion["hora_str"].split('-')
            hora_inicio = parse_time(hora_parts[0]) if hora_parts and hora_parts[0] else None
            hora_fin = parse_time(hora_parts[1]) if hora_parts and len(hora_parts) > 1 else None

            if not dias:
                final_entry = base_info.copy()
                final_entry.update({
                    "profesor": profesor_asignado,
                    "hora_inicio": hora_inicio,
                    "hora_fin": hora_fin,
                    "dia": None,
                    "edificio": sesion["edificio"],
                    "aula": sesion["aula"]
                })
                all_rows_expanded.append(final_entry)
            else:
                for dia in dias:
                    final_entry = base_info.copy()
                    final_entry.update({
                        "profesor": profesor_asignado,
                        "hora_inicio": hora_inicio,
                        "hora_fin": hora_fin,
                        "dia": dia,
                        "edificio": sesion["edificio"],
                        "aula": sesion["aula"]
                    })
                    all_rows_expanded.append(final_entry)

    return all_rows_expanded

# --- Endpoints de la API ---

@app.route('/form-options', methods=['GET'])
def get_form_options():
    try:
        logging.info("Solicitando opciones del formulario desde SIIAU...")
        options_data = fetch_form_options_with_descriptions(FORM_URL)
        if not options_data or "ciclop" not in options_data or "cup" not in options_data:
            logging.error("No se pudieron extraer las opciones del formulario.")
            return jsonify({"error": "No se pudieron obtener los datos de los formularios del SIIAU."}), 404
        logging.info("Opciones del formulario obtenidas con éxito.")
        return jsonify(options_data)
    except Exception as e:
        logging.error(f"Error inesperado al procesar las opciones del formulario: {e}", exc_info=True)
        return jsonify({"error": f"Ocurrió un error interno al procesar las opciones: {e}"}), 500

@app.route('/majors', methods=['GET'])
def get_majors():
    cup_value = request.args.get('cup')
    if not cup_value:
        return jsonify({"error": "El parámetro 'cup' es requerido."}), 400
    try:
        logging.info(f"Solicitando carreras para el centro: {cup_value}")
        abrev_url = f"https://siiauescolar.siiau.udg.mx/wal/sspseca.lista_carreras?cup={cup_value}"
        response = requests.get(abrev_url, timeout=10)
        response.raise_for_status()
        with open("majors_response.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        logging.info("HTML de carreras guardado en 'majors_response.html' para depuración.")
        majors_dict = get_majors_from_html(response.text)
        logging.info(f"Se encontraron {len(majors_dict)} carreras.")
        return jsonify(majors_dict)
    except Exception as e:
        logging.error(f"Error inesperado al procesar las carreras: {e}", exc_info=True)
        return jsonify({"error": f"Ocurrió un error interno al procesar las carreras: {e}"}), 500

@app.route('/consultar-oferta', methods=['POST'])
def consultar_oferta():
    try:
        form_data = request.json
        if not all(k in form_data for k in ["ciclop", "cup", "majrp"]):
            return jsonify({"error": "Faltan parámetros requeridos (ciclop, cup, majrp)."}), 400

        post_data = {
            "ciclop": form_data.get("ciclop", ""), "cup": form_data.get("cup", ""),
            "majrp": form_data.get("majrp", ""), "mostrarp": "1000",
            "crsep": "", "materiap": "", "horaip": "", "horafp": "", 
            "edifp": "", "aulap": "", "ordenp": "0"
        }
        
        logging.info(f"Enviando los siguientes datos al SIIAU: {post_data}")
        response = requests.post(POST_URL, data=post_data, timeout=15)
        response.raise_for_status()
        
        with open("siiau_response.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        logging.info("Respuesta del SIIAU guardada en 'siiau_response.html' para depuración.")

        soup = BeautifulSoup(response.text, 'lxml')
        
        if "ORA-01403: no data found" in response.text:
            logging.warning("El SIIAU devolvió 'no data found'.")
            return jsonify({"error": "El sistema de la universidad (SIIAU) indica que no se encontraron datos para los filtros seleccionados."}), 404

        main_table, header_row = find_main_courses_table(soup)
        if not main_table:
            logging.error("No se encontró la tabla de cursos en la respuesta del SIIAU.")
            return jsonify({"error": "Se recibió una respuesta del SIIAU, pero no se pudo encontrar la tabla de materias. La estructura de la página pudo haber cambiado."}), 404
        
        materias = process_and_expand_rows(main_table, header_row)
        
        if not materias:
            logging.warning("La tabla fue encontrada, pero el procesamiento no extrajo ninguna materia.")
            return jsonify({"error": "Se encontró la tabla de materias, pero no se pudo extraer ninguna. La estructura de las filas puede haber cambiado."}), 404

        logging.info(f"Procesamiento exitoso. Se extrajeron {len(materias)} registros de horarios.")
        return jsonify(materias)
    except Exception as e:
        logging.error(f"Error fatal en la consulta de oferta: {e}", exc_info=True)
        return jsonify({"error": f"Ocurrió un error interno inesperado: {e}"}), 500

# --- Ejecución de la Aplicación ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

