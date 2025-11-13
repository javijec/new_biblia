# 📖 Biblia Digital

Una aplicación web moderna y rápida para leer y buscar en la Biblia del Pueblo de Dios. Construida con React, Vite y Tailwind CSS.

## ✨ Características

### 📚 Navegación Intuitiva
- **Sidebar colapsable** con acceso a los 76 libros de la Biblia
- Separación clara entre **Antiguo Testamento** y **Nuevo Testamento**
- Selección rápida de capítulos numerados
- Carga dinámica de capítulos bajo demanda

### 🔍 Búsqueda Avanzada
- **Búsqueda por palabra completa** usando expresiones regulares con límites de palabra
- Barra de búsqueda expandible en el header
- Resultados compactos en una sola línea
- Búsqueda desde palabras individuales dentro de versículos

### 📖 Lectura Confortable
- **Interfaz limpia y moderna** con gradientes y sombras suaves
- Selección múltiple de versículos para copiar
- Botón de búsqueda en cada versículo para explorar palabras específicas
- Modo oscuro/claro

### ⚡ Rendimiento Optimizado
- **Carga progresiva**: La Biblia se divide en 76 archivos JSON (uno por libro)
- Los libros se cargan bajo demanda cuando se seleccionan
- Cache en memoria para libros ya cargados
- Búsqueda eficiente con resultados instantáneos

### 🎨 Diseño Responsive
- Interfaz adaptable a diferentes tamaños de pantalla
- Controles intuitivos y accesibles
- Colores degradados profesionales (azul, ámbar, rosa)

## 🚀 Tecnologías

- **React 18+** - Framework UI
- **Vite** - Bundler ultrarrápido
- **Bun** - Runtime y package manager
- **Tailwind CSS** - Estilos CSS utility-first
- **React Hooks** - State management moderno

## 📦 Estructura del Proyecto

```
new_biblia/
├── src/
│   ├── App.jsx                 # Componente principal
│   ├── App.css                 # Estilos globales
│   ├── main.jsx                # Punto de entrada
│   ├── components/
│   │   ├── Sidebar.jsx         # Navegación lateral
│   │   ├── MainContent.jsx     # Contenido principal
│   │   ├── SearchBar.jsx       # Barra de búsqueda
│   │   ├── BookSelector.jsx    # Selector de libros y capítulos
│   │   ├── ChapterView.jsx     # Vista del capítulo
│   │   └── VerseItem.jsx       # Componente individual de versículo
│   ├── context/
│   │   └── BibleContext.jsx    # Context para gestión de datos
│   ├── hooks/
│   │   └── useBibleSearch.js   # Hook para búsqueda en Biblia
│   └── data/
│       ├── books/              # Archivos JSON por libro
│       │   ├── genesis.json
│       │   ├── exodo.json
│       │   └── ... (74 más)
│       └── index.json          # Índice de metadatos
├── scripts/
│   ├── splitBibleByBook.js     # Genera archivos por libro
│   ├── checkDuplicates.js      # Verifica duplicados
│   └── ... (otros scripts)
└── vite.config.js              # Configuración de Vite
```

## 🛠️ Instalación

### Prerrequisitos
- Node.js o Bun instalado

### Pasos
```bash
# Clonar el repositorio
git clone <tu-repo>
cd new_biblia

# Instalar dependencias
bun install

# Ejecutar servidor de desarrollo
bun run dev

# Acceder a http://localhost:5173
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
bun run dev              # Inicia servidor con HMR

# Producción
bun run build            # Build optimizado
bun run preview          # Preview del build

# Utilidades
bun scripts/splitBibleByBook.js    # Divide Biblia en libros
bun scripts/checkDuplicates.js     # Verifica capítulos duplicados
```

## 🎯 Casos de Uso

1. **Lectura diaria** - Navega cómodamente entre libros y capítulos
2. **Investigación** - Busca palabras clave en toda la Biblia
3. **Estudios temáticos** - Selecciona múltiples versículos para copiar y analizar
4. **Exploración de palabras** - Haz clic en palabras dentro de versículos para encontrar todas sus ocurrencias

## 🔧 Características Técnicas

### Carga Dinámica
- Los libros se cargan mediante `import()` cuando se expanden en el selector
- Cache en memoria para optimizar acceso repetido
- Índice ligero para navegación rápida

### Búsqueda con Regex
- Usa límites de palabra `\b` para búsquedas exactas
- Evita coincidencias parciales (ej: "fe" no coincide con "feliz")
- Búsqueda sensible a mayúsculas/minúsculas

### Gestión de Estado
- Context API de React para datos globales
- Hooks personalizados (`useBibleSearch`) para lógica reutilizable
- Props drilling optimizado

## 🌙 Modo Oscuro

Toggle de oscuridad en el header. Las preferencias se mantienen durante la sesión.

## 📱 Responsive Design

- **Desktop** - Layout completo con sidebar y contenido
- **Tablet** - Sidebar colapsable con más espacio para contenido
- **Mobile** - Stack vertical optimizado

## 🐛 Solución de Problemas

### La búsqueda es lenta
- Los libros grandes (como Salmos con 150 capítulos) pueden tomar algunos segundos
- Los resultados se cachean para búsquedas posteriores

### El versículo no aparece completo
- Los resultados de búsqueda están truncados a una línea
- Haz clic para ver el capítulo completo

### Capítulos duplicados
- Se eliminan automáticamente durante la generación de archivos
- Ejecuta `bun scripts/splitBibleByBook.js` para regenerar

## 📄 Versión de la Biblia

**Biblia del Pueblo de Dios** - Traducción ecuménica de 2007

## 📞 Soporte

Para reportar bugs o sugerir mejoras, contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto contiene contenido de dominio público de la Biblia del Pueblo de Dios.

---

**Desarrollado con ❤️ para lectores modernos de la Biblia**
