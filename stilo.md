# Sistema de Diseño y Guía de Estilo Oficial — EST 54 EduHub

> **Referencia Obligatoria de Estilo (Design System)**  
> Este documento establece los estándares visuales, la paleta cromática, la tipografía, los componentes y las reglas de arquitectura CSS para mantener una estética moderna, limpia y consistente (inspirada en la experiencia visual de **Quizlet**) en todo el portal de la **Escuela Secundaria Técnica 54 "Ignacio Ramírez"**.

---

## 1. Principios de Diseño Visual

1. **Estética Quizlet Moderna:** Superficies limpias, tarjetas con bordes suaves, microinteracciones fluidas y tipografía legible y contemporánea.
2. **Jerarquía Visual Clara:** El usuario debe identificar de inmediato el grado escolar, la materia seleccionada y los tipos de recursos de estudio.
3. **Consistencia Cromática:** Nunca usar colores arbitrarios o no armonizados; toda la interfaz se basa estrictamente en las variables CSS globales (`:root`).
4. **Respeto a la Identidad Institucional:** El escudo oficial de la escuela (`Imagenes/Escudo_54.jpg`) debe presentarse con fondos limpios, proporciones exactas y bordes sutiles tanto en tema claro como en tema oscuro.
5. **Cero Reglas CSS Huérfanas:** Cada regla de selector debe cerrarse rigurosamente (`{ ... }`) para prevenir corrupción de la cascada CSS.

---

## 2. Tokens de Diseño Globales (`:root`)

### 2.1 Paleta de Color Principal (Brand Palette)
| Variable CSS | Valor Hex / RGB | Uso Principal |
| :--- | :--- | :--- |
| `--color-primary` | `#4255ff` | Azul/Índigo Quizlet. Botones primarios, pestañas activas, acentos de foco. |
| `--color-primary-hover` | `#3343d4` | Estado hover de botones y elementos interactivos primarios. |
| `--color-primary-light` | `#edefff` | Fondos de badges activos, chips seleccionados y estados hover suaves. |
| `--color-primary-subtle` | `#f0f2ff` | Fondos de banners y resaltados secundarios. |

### 2.2 Acentos Semánticos
| Variable CSS | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| `--color-accent-gold` | `#ffcd1f` | Favoritos, estrellas, tarjetas destacadas y advertencias. |
| `--color-accent-emerald`| `#23b26d` | Respuestas correctas, estados activos, éxito en formularios. |
| `--color-accent-coral` | `#ff705b` | Alertas, respuestas incorrectas, acciones destructivas. |
| `--color-accent-purple` | `#7b2cbf` | Acento institucional de eventos, talleres extracurriculares. |

### 2.3 Superficies y Fondos
| Variable CSS | Modo Claro (`:root`) | Modo Oscuro (`[data-theme="dark"]`) |
| :--- | :--- | :--- |
| `--bg-app` | `#f6f7fb` (Gris frío sutil) | `#0a092d` (Azul nocturno profundo) |
| `--bg-surface` | `#ffffff` (Blanco puro) | `#13141c` (Gris grafito oscuro) |
| `--bg-surface-elevated`| `#ffffff` | `#1a1d28` (Superficie elevada con relieve) |
| `--bg-input` | `#f6f7fb` | `#1a1d28` |

### 2.4 Tipografía y Textos
| Variable CSS | Modo Claro | Modo Oscuro |
| :--- | :--- | :--- |
| `--text-main` | `#2e3856` (Azul marino oscuro) | `#f6f7fb` (Blanco suave) |
| `--text-secondary` | `#586380` (Gris azulado medio) | `#939bb4` (Gris claro) |
| `--text-muted` | `#939bb4` | `#6b7280` |
| `--border-light` | `#e3e7fc` (Borde sutil) | `#282e3e` |

### 2.5 Sombras y Profundidad (Elevation)
```css
--shadow-sm: 0 2px 6px rgba(46, 56, 86, 0.05);
--shadow-md: 0 4px 16px rgba(46, 56, 86, 0.08);
--shadow-lg: 0 10px 30px rgba(46, 56, 86, 0.12);
--shadow-card-hover: 0 12px 28px rgba(66, 85, 255, 0.12);
```

### 2.6 Radios de Esquinas (Border Radius)
```css
--radius-sm: 8px;     /* Badges, inputs pequeños, escudos */
--radius-md: 12px;    /* Tarjetas secundarias, modales de confirmación */
--radius-lg: 18px;    /* Tarjetas principales de estudio y eventos */
--radius-pill: 9999px; /* Botones de acción, chips de materia, badges circulares */
```

### 2.7 Transiciones
```css
--transition-fast: 0.18s cubic-bezier(0.16, 1, 0.3, 1);
--transition-smooth: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
```

---

## 3. Tipografía Oficial

- **Fuente Primaria (UI & Encabezados):** `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`
  - Pesos disponibles:
    - `400` (Regular): Párrafos descriptivos, textos secundarios.
    - `500` (Medium): Metadatos, subtítulos breves.
    - `600` (Semi-Bold): Etiquetas de inputs, botones secundarios.
    - `700` (Bold): Títulos de tarjetas, nombres de materia, navegación activa.
    - `800` (Extra-Bold): Logotipo `EST 54`, títulos `h1` institucionales, números destacados.
- **Fuente Monoespaciada (Códigos & Credenciales):** `'JetBrains Mono', monospace`
  - Para usernames de administradores, IDs de recursos, claves y fechas de auditoría.

---

## 4. Componentes y Estándares de Implementación

### 4.1 Barra de Navegación Superior (Header)
- **Fijada en la parte superior (`sticky`, `top: 0`, `z-index: 100`)**.
- **Logotipo y Escudo:**
  - El escudo oficial (`.brand-logo-img`) mide exactamente `40px x 40px`, contiene `border-radius: var(--radius-sm)`, `background: #ffffff`, `padding: 2px` y borde sutil `1px solid var(--border-light)`.
  - Al pasar el cursor (`:hover`), aplica un escalado suave: `transform: scale(1.08)`.
- **Buscador Central (`.header-search`):**
  - Input redondeado (`border-radius: var(--radius-pill)`), icono SVG de lupa a la izquierda, borde con transición a foco en `--color-primary`.

### 4.2 Hero Banner y Título Institucional
- **Alineación:** Totalmente centrado horizontalmente (`text-align: center; justify-content: center;`).
- **Escudo Institucional Principal (`.hero-school-logo`):**
  - Dimensiones: `58px x 58px` a `62px x 62px`.
  - Fondo blanco protector, `border: 1px solid var(--border-light)`, `border-radius: var(--radius-sm)`.
  - Efecto hover: `transform: scale(1.08) rotate(-2deg)`.
- **Título (`h1`):** `font-size: 2.1rem; font-weight: 800; letter-spacing: -0.5px;`.

### 4.3 Barra de Navegación de Grados y Secciones (`.grados-tab-bar`)
- **Estructura y Comportamiento:**
  - Centrada en pantallas grandes, con `overflow-x: auto` y barra de desplazamiento oculta para móviles.
  - Botones (`.nav-main-tab`, `.grado-tab`):
    - `padding: 12px 20px;`
    - `font-weight: 700;`
    - `border-bottom: 3px solid transparent;`
    - `border-radius: var(--radius-sm) var(--radius-sm) 0 0;`
  - **Estado Hover:**
    - Texto: `var(--color-primary)`
    - Fondo suave: `rgba(66, 85, 255, 0.04)`
  - **Estado Activo (`.active`):**
    - Texto y borde inferior: `var(--color-primary)`
    - Fondo suave: `rgba(66, 85, 255, 0.05)`
    - La pastilla numérica (`.grado-badge-num`) se pinta de `var(--color-primary)` con número blanco.

### 4.4 Filtros Horizontales por Materia (`.filter-chip`)
- Botón estilo píldora (`border-radius: var(--radius-pill)`).
- Icono temático de materia + texto de la asignatura.
- Estado inactivo: fondo `var(--bg-surface)`, borde `var(--border-light)`.
- Estado activo: fondo `var(--color-primary)`, texto blanco, sombra `0 4px 12px rgba(66, 85, 255, 0.25)`.

### 4.5 Tarjetas de Contenido (`.content-block-card`)
- Borde: `1.5px solid var(--border-light)`.
- Esquinas: `var(--radius-lg)` (18px).
- Sombra en reposo: `var(--shadow-sm)`.
- Sombra al interactuar (`:hover`): `transform: translateY(-3px); box-shadow: var(--shadow-card-hover); border-color: #b8c4fc;`.

### 4.6 Tarjetas de Eventos y Difusión Social (`.event-card`)
- **Proporción de Imagen:** `height: 200px; object-fit: cover;` con zoom sutil `1.05` en hover.
- **Badge Flotante (`.event-badge-pill`):** `backdrop-filter: blur(8px); background: rgba(10, 9, 45, 0.75); color: #fff;`.
- **Botones Sociales en Tarjeta:**
  - Facebook (`.chip-fb`): `#1877f2`.
  - Instagram (`.chip-ig`): Gradiente característico `linear-gradient(45deg, #f09433, #dc2743, #bc1888)`.
  - TikTok (`.chip-tiktok`): Fondo negro `#000` con detalles `#00f2fe`.
  - Botón de compartir nativo (`.btn-open-share-modal`): Fondo `var(--color-primary-light)` y texto `var(--color-primary)`.

### 4.7 Tablas de Gestión Administrativa (`.users-table`)
- Encabezados con mayúsculas sutiles (`font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;`).
- Hover en filas (`tr:hover td`): fondo suave `var(--color-primary-light)`.
- Pastillas de permisos (`.badge-perm`): redondeadas (`var(--radius-pill)`), diferenciadas por grado o función administrativa.

---

## 5. Reglas de Mantenimiento CSS

Para evitar cualquier pérdida accidental de estética al editar estilos en el futuro:

1. **Validación Estricta de Llaves `{}`:**  
   Siempre verificar que toda regla o pseudo-clase (ej. `.footer-right a:hover { ... }`) tenga sus llaves de apertura y cierre intactas.
2. **Ubicación Modular de Clases:**  
   - Los estilos de navegación del encabezado van en la sección `Hero & Navigation Tabs`.
   - Los estilos de tarjetas de recursos van en `Blocks Grid & Cards`.
   - Los estilos de eventos escolares van en `Grid y Tarjetas de Eventos Escolares`.
   - Los estilos del pie de página van al final, justo antes de los `@media queries`.
3. **Compatibilidad con Modo Oscuro:**  
   Nunca usar colores hexadecimales oscuros o blancos fijos en fondos o textos; usar siempre variables semánticas:
   - ✅ `background: var(--bg-surface); color: var(--text-main);`
   - ❌ `background: #ffffff; color: #2e3856;` (Esto rompería el tema oscuro).
4. **Prueba de Balance Sintáctico:**  
   Antes de finalizar cualquier edición en `css/styles.css`, validar que la cantidad de llaves abiertas sea exactamente igual a las llaves cerradas.

---
*Escuela Secundaria Técnica 54 "Ignacio Ramírez" — Plataforma de Recursos Académicos EduHub*
