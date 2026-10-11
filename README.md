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
4. **Base de Datos para GitHub Pages**:
   - Basada en **IndexedDB** del navegador del cliente (almacena grandes volúmenes de datos, fichas, imágenes y archivos sin el límite de 5MB de LocalStorage).
   - Incluye respaldo y sincronización con LocalStorage como fallback.
   - Herramienta de **Exportación e Importación JSON** para respaldar o transferir la base de datos completa.
   - Opción para restablecer datos semilla en cualquier momento.
5. **Autenticación y Permisos**:
   - **Visitantes / Alumnos**: Modo solo lectura. No pueden editar, mover ni borrar contenidos. Pueden interactuar con las fichas, leer artículos, ver imágenes y descargar guías.
   - **Administrador**:
     - **Usuario:** `josue958`
     - **Contraseña:** `Yoshi985`
     - Permite activar/desactivar el modo edición, arrastrar tarjetas, crear nuevos bloques, editar existentes, eliminar y gestionar la base de datos.
     - Botón **"Vista Alumno"** para previsualizar el sitio exactamente como lo ven los estudiantes sin tener que cerrar sesión.

---

## 📦 Conexión con GitHub y Despliegue en GitHub Pages

El repositorio está vinculado al proyecto oficial de GitHub:
- **Repositorio Remoto:** [https://github.com/josue958/EST54](https://github.com/josue958/EST54)
- **Sitio Web Público:** [https://josue958.github.io/EST54/](https://josue958.github.io/EST54/)

Para subir tus cambios a GitHub:
```bash
git push origin main
```

---

## 🛠️ Credenciales de Administrador

| Campo | Valor |
| :--- | :--- |
| **Usuario** | `josue958` |
| **Contraseña** | `Yoshi985` |