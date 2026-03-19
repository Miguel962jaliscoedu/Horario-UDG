# 📅 Planeador de Horarios UDG: Consulta Académica y Gestión de Carga

## I. Introducción y Propósito del Proyecto

Esta herramienta fue desarrollada con el propósito fundamental de simplificar el proceso de planificación semestral para la comunidad estudiantil de la Universidad de Guadalajara. El *Planeador de Horarios UDG* es una aplicación web que automatiza y simplifica la consulta de la oferta académica, permitiendo la construcción visual de un horario personalizado y detectando conflictos de tiempo de manera eficiente.

Mi objetivo al desarrollar este proyecto es Facilitar la consulta de la oferta academica mediante una herramienta ágil que facilite la toma de decisiones informadas sobre la carga académica.

---

## II. Características

El proyecto se distingue por las siguientes funcionalidades clave, que aseguran una experiencia de planificación robusta:

* **Consulta Directa a SIIAU:** Extrae y procesa la oferta académica (materias y NRCs) en tiempo real. Para lograrlo, he implementado funciones *serverless* que interactúan con la fuente de datos oficial.
* **Selección Modular de Materias:** Permite la búsqueda y adición dinámica de materias, facilitando la elección del Número de Referencia del Curso (**NRC**) adecuado para cada asignatura.
* **Detección de Cruces de Horario:** Implementa una lógica precisa para identificar y notificar cualquier superposición de sesiones entre los NRCs seleccionados. Las clases con conflicto se resaltan visualmente en el horario final.
* **Visualización Detallada del Horario:** Genera una representación gráfica e intuitiva del horario, con soporte para dos temas visuales: **Claro** y **Oscuro**.
* **Exportación Profesional:** Ofrece la capacidad de exportar el horario generado en formatos **PDF** (útil para registros) y **JPEG** (ideal para fondos de pantalla o compartir en redes sociales).
* **Persistencia de Sesión:** Guarda el estado de la consulta y la selección de materias en `sessionStorage`, permitiendo al usuario recargar la página sin perder su progreso.

---

## III. Estructura y Tecnologías Empleadas

La arquitectura del proyecto se divide en un *frontend* interactivo y un conjunto de funciones *serverless* que actúan como API, asegurando un desempeño ágil y escalable.

### 3.1. Stack Tecnológico

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React v19 + Vite | Interfaz de usuario dinámica y moderna. |
| **API** | Vercel Serverless Functions (Node.js) | Lógica de negocio para el *scraping* y consulta de datos del SIIAU. |
| **Scraping** | Axios, Cheerio, Iconv-lite | Peticiones HTTP, análisis sintáctico (parsing) del HTML y manejo de codificación de caracteres (`iso-8859-1`). |
| **Exportación** | jspdf, jspdf-autotable, html2canvas | Generación de documentos PDF y captura de la representación visual del DOM a imagen. |
| **Linting** | ESLint | Mantenimiento de la calidad y estándares del código. |

### 3.2. Configuración para Desarrollo

Para desplegar y desarrollar el proyecto en un entorno local, siga los siguientes pasos rigurosos.

**Prerrequisitos:**
* Node.js (v18+)
* npm (o el gestor de paquetes de su preferencia)

**Instalación:**

```bash
# 1. Clonar el repositorio
git clone https://github.com/Miguel962jaliscoedu/Horario-UDG.git.git
cd Horario-UDG

# 2. Instalar dependencias
# (El proyecto utiliza npm según el package-lock.json)
npm install 

# 3. Levantar el servidor de desarrollo (Vite + Vercel)
# Esto ejecutará el frontend y las funciones serverless de la carpeta /api
npx vercel dev 
Si se utiliza el entorno de contenedores, la configuración expone los puertos 8501 (Aplicación) y 5001 (Backend API) para facilitar el desarrollo.
```

## IV. Advertencia de Uso (Disclaimer)
DECLARACIÓN IMPORTANTE: Como autor del código, es mi deber informar que esta herramienta se fundamenta en la técnica de web scraping sobre una interfaz pública del Sistema Integral de Información Administrativa y Escolar (SIIAU) de la Universidad de Guadalajara.

Esta herramienta es un esfuerzo de la comunidad y no cuenta con el respaldo o la afiliación oficial de la UDG.

La disponibilidad y precisión de la información dependen de la estabilidad de la estructura del sitio web oficial. Cualquier cambio en la página de consulta del SIIAU podría resultar en fallos en la extracción de datos o la inoperatividad de la API.

Utilice siempre la información generada con esta herramienta para fines de planificación únicamente y confirme cualquier dato crítico directamente con las fuentes oficiales de la Universidad.
