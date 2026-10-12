# EST 54 EduHub ⚡ (Plataforma Estilo Quizlet)

Plataforma educativa inspirada en el diseño moderno de **[Quizlet](https://quizlet.com/latest)** para la **Escuela Secundaria Técnica 54 (EST 54)**. Diseñada para vivir 100% de manera estática y eficiente en **GitHub Pages**, con base de datos local avanzada en **IndexedDB**, soporte para 3 grados escolares, materias, editor tipo WordPress (Drag & Drop), carga de archivos/imágenes y modo de autenticación administrativa protegida.

---

## 🚀 Características Principales

1. **Diseño Quizlet Moderno**:
   - Paleta de colores oficial estilo Quizlet (índigo vibrante `#4255ff`, tarjetas limpias, tipografía *Plus Jakarta Sans*, modo oscuro y claro).
   - Fichas interactivas con giro 3D (flip cards) y atajos de teclado (`Espacio` para voltear, `←` / `→` para navegar).
   - Artículos enriquecidos y visores multimedia.
2. **Organización por 3 Grados y Materias**:
   - **Primer Grado (1°)**: Biología, Matemáticas I, Lengua Materna I, etc.
   - **Segundo Grado (2°)**: Física, Matemáticas II, Historia II, etc.
   - **Tercer Grado (3°)**: Química, Matemáticas III, Lengua Materna III, etc.
   - Filtros dinámicos horizontales por asignatura con conteo en tiempo real.
3. **Editor de Bloques Drag & Drop (Estilo WordPress)**:
   - Permite arrastrar y soltar las tarjetas para reordenar la secuencia pedagógica. El nuevo orden se persiste automáticamente en la base de datos.
   - Tipos de bloques admitidos:
     - 📝 **Artículo explicativo / Resumen** (Markdown integrado, tiempo de lectura).
     - 🃏 **Set de Fichas de Estudio** (generador ilimitado de términos y definiciones).
     - 📁 **Recursos y Archivos Referentes** (subida de archivos reales con descarga directa en base64/blob).
     - 🖼️ **Imágenes e Infografías** (subida desde disco o URLs con visor modal).
4. **Pestaña de Eventos y Difusión en Redes Sociales (Facebook, Instagram y TikTok)**:
   - Publicación y edición de eventos escolares con fotos, fecha, hora, ubicación, descripción y hashtags.
   - Botón directo para postear en **Facebook** (dialogo web nativo).
   - Generador para **Instagram** y **TikTok** con copia de pie de foto con hashtags en un clic, descarga automática de foto optimizada y redirección a la app.
   - Soporte para **Web Share API** en móviles para compartir directo a cualquier aplicación instalada.
5. **Panel CRUD de Gestión de Usuarios y Permisos por Sección**:
   - Pestaña exclusiva para administradores con permiso `canManageUsers`.
   - Permite dar de alta nuevos docentes con su nombre, usuario y contraseña.
   - **Permisos Granulares:** Selecciona con precisión si el usuario puede editar:
     - 1° Grado
     - 2° Grado
     - 3° Grado
     - Publicar y gestionar Eventos
     - Administrar otros Usuarios (Super Administrador)
   - Tabla interactiva para editar credenciales, modificar permisos y eliminar cuentas.
6. **Base de Datos para GitHub Pages**:
   - Basada en **IndexedDB (v2)** del navegador del cliente con tiendas para bloques, eventos y usuarios.
   - Sincronización continua y respaldo en LocalStorage.
   - Herramienta de **Exportación e Importación JSON** para respaldar o transferir la base de datos completa.
   - Opción para restablecer datos semilla en cualquier momento.
7. **Autenticación y Roles**:
   - **Visitantes / Alumnos**: Modo solo lectura en las 3 secciones de grados y en la sección de eventos.
   - **Administrador Principal (Root)**:
     - **Usuario:** `josue958`
     - **Contraseña:** `Yoshi985` (Super Administrador protegido con acceso total).
   - **Docentes Secundarios de Ejemplo Precargados**:
     - `prof_martha` (contraseña `Martha2026`): Solo puede editar 1° Grado.
     - `difusion54` (contraseña `Difusion2026`): Solo puede publicar eventos y difusión.

---

## 📦 Conexión con GitHub y Despliegue en GitHub Pages

El repositorio está vinculado al proyecto oficial de GitHub:

- **Repositorio Remoto:** [https://github.com/josue958/EST54](https://github.com/josue958/EST54)
- **Sitio Web Público:** [https://josue958.github.io/EST54/](https://josue958.github.io/EST54/)

Para subir tus cambios a GitHub:

```bash
git push origin main
```
