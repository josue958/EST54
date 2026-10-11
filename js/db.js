/**
 * EST 54 EduHub - Base de Datos Local con IndexedDB (v2)
 * Compatible con GitHub Pages (100% estático en el cliente)
 * Persistencia permanente, soporte para imágenes Base64, archivos adjuntos,
 * Publicación de Eventos Escolares con Redes Sociales y Gestión CRUD de Usuarios y Permisos.
 */

const DB_NAME = 'EST54_EduHub_DB';
const DB_VERSION = 2;
const STORE_NAME = 'content_blocks';
const STORE_EVENTS = 'events';
const STORE_USERS = 'users';

// Fallback keys para LocalStorage si IndexedDB no está disponible
const STORAGE_BLOCKS_KEY = 'EST54_LOCAL_BLOCKS';
const STORAGE_EVENTS_KEY = 'EST54_LOCAL_EVENTS';
const STORAGE_USERS_KEY = 'EST54_LOCAL_USERS';

// Datos Semilla Iniciales con contenido enriquecido para los 3 Grados y diversas Materias
const INITIAL_DATA = [
  // --- 1° GRADO ---
  {
    id: 'block-1-1',
    grado: '1',
    materia: 'Biología (Ciencias I)',
    type: 'flashcards',
    title: 'La Célula y sus Organelos: Conceptos Clave',
    description: 'Set de estudio interactivo para repasar las partes de la célula eucariota y procariota antes del examen.',
    badge: 'Set de Fichas',
    author: 'Prof. Josué',
    date: '2026-10-10',
    order: 0,
    cards: [
      { term: 'Mitocondria', def: 'Organelo encargado de producir energía en forma de ATP mediante la respiración celular.' },
      { term: 'Núcleo Celular', def: 'Centro de control de la célula que resguarda el material genético (ADN).' },
      { term: 'Ribosomas', def: 'Estructuras encargadas de la síntesis de proteínas a partir de la información del ARN.' },
      { term: 'Cloroplasto', def: 'Organelo presente en células vegetales donde se lleva a cabo la fotosíntesis.' },
      { term: 'Membrana Plasmática', def: 'Bicapa lipídica que regula la entrada y salida de sustancias en la célula.' }
    ]
  },
  {
    id: 'block-1-2',
    grado: '1',
    materia: 'Matemáticas I',
    type: 'article',
    title: 'Guía Maestra: Fracciones, Decimales y Porcentajes',
    description: 'Aprende a convertir fácilmente entre fracciones comunes, su expresión decimal y su representación porcentual.',
    badge: 'Artículo de Repaso',
    author: 'Prof. Josué',
    date: '2026-10-08',
    order: 1,
    readTime: '6 min',
    content: `### ¿Cómo convertir fracciones a decimales?
Para convertir cualquier fracción común como **3/4** a decimal, simplemente dividimos el numerador entre el denominador:
\`\`\`
3 ÷ 4 = 0.75
\`\`\`

### Conversión a Porcentaje
Para pasar de un número decimal al porcentaje, multiplicamos dicho decimal por **100** y agregamos el símbolo **%**:
- **0.75 × 100 = 75%**
- **0.50 × 100 = 50%**
- **0.125 × 100 = 12.5%**

### Tabla de equivalencias rápidas para el examen:
- **1/2** = 0.5 = 50%
- **1/4** = 0.25 = 25%
- **3/4** = 0.75 = 75%
- **1/5** = 0.20 = 20%
- **1/10** = 0.10 = 10%

> **Consejo del profesor:** Recuerda siempre simplificar tus fracciones a su mínima expresión antes de resolver problemas de suma o resta.`
  },
  {
    id: 'block-1-3',
    grado: '1',
    materia: 'Lengua Materna I',
    type: 'resource',
    title: 'Guía de Lectura: Mitos y Leyendas Prehispánicas',
    description: 'Documento descargable en PDF con antología de textos tradicionales de México y rúbrica para el reporte de lectura.',
    badge: 'Recurso Descargable',
    author: 'Prof. Josué',
    date: '2026-10-05',
    order: 2,
    fileName: 'Antologia_Mitos_Leyendas_1Secundaria_EST54.pdf',
    fileSize: '1.4 MB',
    fileType: 'application/pdf',
    downloadData: 'data:text/plain;charset=utf-8,EST%2054%20-%20Antolog%C3%ADa%20de%20Mitos%20y%20Leyendas%20Prehisp%C3%A1nicas%0A%0AContenido%3A%0A1.%20El%20Quinto%20Sol%0A2.%20La%20Leyenda%20de%20los%20Volcanes%20Popocat%C3%A9petl%20e%20Iztacc%C3%ADhuatl%0A3.%20El%20Conejo%20en%20la%20Luna'
  },
  {
    id: 'block-1-4',
    grado: '1',
    materia: 'Biología (Ciencias I)',
    type: 'media',
    title: 'Infografía: Niveles de Organización Ecológica',
    description: 'Visualización esquemática desde el individuo, población y comunidad hasta el ecosistema y la biosfera.',
    badge: 'Infografía / Imagen',
    author: 'Prof. Josué',
    date: '2026-10-04',
    order: 3,
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80',
    caption: 'De la célula al bioma: mapa visual de la biodiversidad planetaria.'
  },

  // --- 2° GRADO ---
  {
    id: 'block-2-1',
    grado: '2',
    materia: 'Física (Ciencias II)',
    type: 'flashcards',
    title: 'Leyes del Movimiento de Newton y Energía',
    description: 'Aprende y memoriza las tres leyes de la dinámica formuladas por Isaac Newton con ejemplos cotidianos.',
    badge: 'Set de Fichas',
    author: 'Prof. Josué',
    date: '2026-10-09',
    order: 0,
    cards: [
      { term: 'Primera Ley (Inercia)', def: 'Todo cuerpo permanece en reposo o movimiento rectilíneo uniforme a menos que actúe una fuerza externa neta sobre él.' },
      { term: 'Segunda Ley (F = m · a)', def: 'La aceleración de un objeto es directamente proporcional a la fuerza neta aplicada e inversamente proporcional a su masa.' },
      { term: 'Tercera Ley (Acción y Reacción)', def: 'A toda acción le corresponde una reacción de igual magnitud y dirección contraria.' },
      { term: 'Energía Cinética', def: 'Energía asociada al movimiento de un cuerpo: Ec = 1/2 · m · v².' },
      { term: 'Energía Potencial Gravitatoria', def: 'Energía almacenada en función de la altura de un objeto: Ep = m · g · h.' }
    ]
  },
  {
    id: 'block-2-2',
    grado: '2',
    materia: 'Matemáticas II',
    type: 'article',
    title: 'Sistemas de Ecuaciones Lineales 2x2: Método de Reducción',
    description: 'Paso a paso para resolver dos ecuaciones con dos incógnitas usando eliminación rápida y verificación.',
    badge: 'Artículo Explicativo',
    author: 'Prof. Josué',
    date: '2026-10-07',
    order: 1,
    readTime: '7 min',
    content: `### ¿Qué es un sistema 2x2?
Es un conjunto de dos ecuaciones con dos incógnitas (generalmente **x** e **y**) que deben cumplirse simultáneamente:

1) **2x + 3y = 20**
2) **4x - 3y = -2**

### Pasos del Método de Suma y Resta (Reducción):
1. **Identificar coeficientes simétricos:** En el ejemplo anterior, nota que **+3y** y **-3y** se anulan directamente si sumamos ambas ecuaciones.
2. **Sumar las ecuaciones:**
   - (2x + 4x) + (3y - 3y) = 20 + (-2)
   - **6x = 18**
   - **x = 3**
3. **Sustituir para hallar la otra variable:**
   - Usamos la ecuación 1: 2(3) + 3y = 20  => 6 + 3y = 20  => 3y = 14 => **y = 14/3**
4. **Comprobación:** Siempre sustituye ambos valores en la segunda ecuación para confirmar que la igualdad se cumple.`
  },
  {
    id: 'block-2-3',
    grado: '2',
    materia: 'Historia II',
    type: 'resource',
    title: 'Cuadro Comparativo: Mesoamérica, Aridoamérica y Oasisamérica',
    description: 'Material de apoyo imprimible para completar durante la sesión de trabajo en equipo.',
    badge: 'Material de Clase',
    author: 'Prof. Josué',
    date: '2026-10-02',
    order: 2,
    fileName: 'Cuadro_Superareas_Culturales_EST54.pdf',
    fileSize: '950 KB',
    fileType: 'application/pdf',
    downloadData: 'data:text/plain;charset=utf-8,EST%2054%20-%20Historia%20de%20M%C3%A9xico%20II%0A%0A%C3%81reas%20Culturales%3A%0A-%20Mesoam%C3%A9rica%3A%20Agricultura%20sedentaria%2C%20pir%C3%A1mides%2C%20calendarios.%0A-%20Aridoam%C3%A9rica%3A%20Cazadores-recolectores%2C%20clima%20seco.%0A-%20Oasisam%C3%A9rica%3A%20Agricultura%20en%20oasis%2C%20Paquim%C3%A9.'
  },

  // --- 3° GRADO ---
  {
    id: 'block-3-1',
    grado: '3',
    materia: 'Química (Ciencias III)',
    type: 'flashcards',
    title: 'Tabla Periódica: Familias Químicas y Enlaces',
    description: 'Tarjetas de memorización sobre electrones de valencia, estructura de Lewis y tipos de enlace químico.',
    badge: 'Set de Fichas',
    author: 'Prof. Josué',
    date: '2026-10-11',
    order: 0,
    cards: [
      { term: 'Electrones de Valencia', def: 'Electrones ubicados en el último nivel de energía que participan en la formación de enlaces.' },
      { term: 'Regla del Octeto', def: 'Tendencia de los átomos a completar 8 electrones en su capa externa para adquirir estabilidad.' },
      { term: 'Enlace Iónico', def: 'Unión que ocurre por transferencia de electrones entre un metal (cede) y un no metal (recibe).' },
      { term: 'Enlace Covalente', def: 'Unión química donde dos átomos no metálicos comparten uno o más pares de electrones.' },
      { term: 'Metales Alcalinos', def: 'Elementos del Grupo 1 muy reactivos con 1 electrón de valencia (ej. Litio, Sodio, Potasio).' }
    ]
  },
  {
    id: 'block-3-2',
    grado: '3',
    materia: 'Matemáticas III',
    type: 'article',
    title: 'Teorema de Pitágoras y Razones Trigonométricas',
    description: 'Demostración geométrica, fórmula canónica y aplicaciones en la resolución de triángulos rectángulos.',
    badge: 'Artículo Teórico-Práctico',
    author: 'Prof. Josué',
    date: '2026-10-06',
    order: 1,
    readTime: '8 min',
    content: `### El Teorema de Pitágoras
En todo triángulo rectángulo, el cuadrado de la longitud de la **hipotenusa (c)** es igual a la suma de los cuadrados de las longitudes de los **catetos (a y b)**:

\`\`\`
c² = a² + b²
\`\`\`

### Despejes habituales:
- **Calcular hipotenusa:** c = √(a² + b²)
- **Calcular cateto faltante:** a = √(c² - b²)  o  b = √(c² - a²)

### Ejemplo de aplicación práctica:
Si un poste vertical mide 4 metros de altura y un cable de soporte se ancla en el suelo a 3 metros de la base:
- c² = 4² + 3² = 16 + 9 = 25
- c = √25 = **5 metros de cable**

### Razones Trigonométricas Fundamentales:
1. **Seno (sen θ):** Cateto Opuesto / Hipotenusa
2. **Coseno (cos θ):** Cateto Adyacente / Hipotenusa
3. **Tangente (tan θ):** Cateto Opuesto / Cateto Adyacente`
  },
  {
    id: 'block-3-3',
    grado: '3',
    materia: 'Lengua Materna III',
    type: 'resource',
    title: 'Rúbrica y Formato para Ensayo Argumentativo',
    description: 'Estructura oficial (Introducción, Tesis, Argumentos, Contraargumentos y Conclusión) con plantilla de redacción.',
    badge: 'Plantilla de Redacción',
    author: 'Prof. Josué',
    date: '2026-10-03',
    order: 2,
    fileName: 'Plantilla_Ensayo_3Secundaria_EST54.pdf',
    fileSize: '820 KB',
    fileType: 'application/pdf',
    downloadData: 'data:text/plain;charset=utf-8,EST%2054%20-%20Gu%C3%ADa%20de%20Ensayo%20Argumentativo%0A%0APartes%3A%0A1.%20T%C3%ADtulo%20atractivo%0A2.%20Introducci%C3%B3n%20con%20postura%20claramente%20delimitada%20(Tesis)%0A3.%20Cuerpo%20argumentativo%20con%20citas%20y%20ejemplos%0A4.%20Conclusi%C3%B3n%20sint%C3%A9tica'
  },
  {
    id: 'block-3-4',
    grado: '3',
    materia: 'Química (Ciencias III)',
    type: 'media',
    title: 'Esquema: Modelo Atómico de Bohr y Configuración',
    description: 'Ilustración interactiva de los niveles energéticos y distribución electrónica para elementos del periodo 2 y 3.',
    badge: 'Imagen / Infografía',
    author: 'Prof. Josué',
    date: '2026-10-01',
    order: 3,
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
    caption: 'Estructura atómica: visualización de órbitas y niveles de energía cuánticos.'
  }
];

// Eventos Escolares Iniciales
const INITIAL_EVENTS = [
  {
    id: 'event-1',
    title: 'Muestra Anual de Proyectos Científicos y Tecnológicos 2026',
    date: '2026-10-25',
    time: '09:00 AM',
    location: 'Laboratorios y Explanada EST 54',
    description: 'Exposición interactiva de los alumnos de 1°, 2° y 3° grado presentando prototipos de energías renovables, modelos celulares y experimentos de física y química.',
    badge: 'Evento Institucional',
    imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1200&q=80',
    author: 'Prof. Josué',
    tags: 'Ciencia, Tecnología, SecundariaTécnica54, Proyectos',
    createdAt: '2026-10-11'
  },
  {
    id: 'event-2',
    title: 'Torneo Deportivo Interescolar de Otoño: Básquetbol y Fútbol',
    date: '2026-11-04',
    time: '08:30 AM',
    location: 'Canchas Deportivas EST 54',
    description: 'Gran jornada deportiva escolar donde nuestros representativos se enfrentarán a escuelas técnicas invitadas. ¡Ven con tu familia a apoyar a nuestros Halcones!',
    badge: 'Deportes y Convivencia',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    author: 'Prof. Josué',
    tags: 'Deportes, Torneo, HalconesEST54, Convivencia',
    createdAt: '2026-10-09'
  },
  {
    id: 'event-3',
    title: 'Festival Tradicional de Día de Muertos y Concurso de Calaveritas',
    date: '2026-11-01',
    time: '10:00 AM',
    location: 'Patio Cívico',
    description: 'Montaje de ofrendas prehispánicas monumentales dedicadas a personajes ilustres de la educación técnica, desfile de catrines y premiación de calaveritas literarias.',
    badge: 'Cultura y Tradición',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    author: 'Prof. Josué',
    tags: 'DiaDeMuertos, TradicionesMexicanas, CulturaEST54',
    createdAt: '2026-10-08'
  }
];

// Usuarios Iniciales con Permisos CRUD
const INITIAL_USERS = [
  {
    id: 'user-admin-root',
    username: 'josue958',
    password: 'Yoshi985',
    displayName: 'Prof. Josué',
    role: 'Super Administrador',
    isSuperAdmin: true,
    permissions: {
      canEditGrado1: true,
      canEditGrado2: true,
      canEditGrado3: true,
      canManageEvents: true,
      canManageUsers: true
    },
    createdAt: '2026-10-01'
  },
  {
    id: 'user-teacher-ciencias',
    username: 'prof_martha',
    password: 'Martha2026',
    displayName: 'Profra. Martha (Ciencias)',
    role: 'Docente de 1° Grado',
    isSuperAdmin: false,
    permissions: {
      canEditGrado1: true,
      canEditGrado2: false,
      canEditGrado3: false,
      canManageEvents: false,
      canManageUsers: false
    },
    createdAt: '2026-10-05'
  },
  {
    id: 'user-difusion',
    username: 'difusion54',
    password: 'Difusion2026',
    displayName: 'Comité de Difusión Cultural',
    role: 'Editor de Eventos y Redes',
    isSuperAdmin: false,
    permissions: {
      canEditGrado1: false,
      canEditGrado2: false,
      canEditGrado3: false,
      canManageEvents: true,
      canManageUsers: false
    },
    createdAt: '2026-10-08'
  }
];

class EST54Database {
  constructor() {
    this.db = null;
    this.isIndexedDBReady = false;
  }

  async init() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB no soportado en este navegador, usando LocalStorage como fallback.');
        this._initLocalStorage();
        resolve(this);
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Tienda de Bloques de Estudio
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('grado', 'grado', { unique: false });
          store.createIndex('materia', 'materia', { unique: false });
          store.createIndex('order', 'order', { unique: false });
        }

        // Tienda de Eventos y Difusión
        if (!db.objectStoreNames.contains(STORE_EVENTS)) {
          const storeEvents = db.createObjectStore(STORE_EVENTS, { keyPath: 'id' });
          storeEvents.createIndex('date', 'date', { unique: false });
          storeEvents.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Tienda de Usuarios y Permisos
        if (!db.objectStoreNames.contains(STORE_USERS)) {
          const storeUsers = db.createObjectStore(STORE_USERS, { keyPath: 'id' });
          storeUsers.createIndex('username', 'username', { unique: true });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        this.isIndexedDBReady = true;

        await this._ensureSeedData();
        resolve(this);
      };

      request.onerror = (event) => {
        console.error('Error abriendo IndexedDB:', event.target.error);
        this._initLocalStorage();
        resolve(this);
      };
    });
  }

  _initLocalStorage() {
    this.isIndexedDBReady = false;
    if (!localStorage.getItem(STORAGE_BLOCKS_KEY)) {
      localStorage.setItem(STORAGE_BLOCKS_KEY, JSON.stringify(INITIAL_DATA));
    }
    if (!localStorage.getItem(STORAGE_EVENTS_KEY)) {
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_USERS_KEY)) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
    }
  }

  async _ensureSeedData() {
    const blocksCount = await this._countStore(STORE_NAME);
    if (blocksCount === 0) {
      await this._seedStore(STORE_NAME, INITIAL_DATA);
    }

    const eventsCount = await this._countStore(STORE_EVENTS);
    if (eventsCount === 0) {
      await this._seedStore(STORE_EVENTS, INITIAL_EVENTS);
    }

    const usersCount = await this._countStore(STORE_USERS);
    if (usersCount === 0) {
      await this._seedStore(STORE_USERS, INITIAL_USERS);
    }
  }

  async _countStore(storeName) {
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction([storeName], 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(0);
      } catch (e) {
        resolve(0);
      }
    });
  }

  async _seedStore(storeName, dataArray) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);
      for (const item of dataArray) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // ==========================================================================
  // BLOQUES DE ESTUDIO (CRUD)
  // ==========================================================================

  async getAllBlocks() {
    if (!this.isIndexedDBReady) {
      const raw = localStorage.getItem(STORAGE_BLOCKS_KEY) || '[]';
      return JSON.parse(raw);
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const sorted = (req.result || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getBlocksByGrado(grado) {
    const all = await this.getAllBlocks();
    return all
      .filter((b) => String(b.grado) === String(grado))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async saveBlock(block) {
    if (!block.id) {
      block.id = 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    }
    if (typeof block.order !== 'number') {
      const current = await this.getBlocksByGrado(block.grado);
      block.order = current.length;
    }

    if (!this.isIndexedDBReady) {
      const all = JSON.parse(localStorage.getItem(STORAGE_BLOCKS_KEY) || '[]');
      const index = all.findIndex((b) => b.id === block.id);
      if (index >= 0) all[index] = block;
      else all.push(block);
      localStorage.setItem(STORAGE_BLOCKS_KEY, JSON.stringify(all));
      return block;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(block);
      req.onsuccess = () => resolve(block);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteBlock(id) {
    if (!this.isIndexedDBReady) {
      let all = JSON.parse(localStorage.getItem(STORAGE_BLOCKS_KEY) || '[]');
      all = all.filter((b) => b.id !== id);
      localStorage.setItem(STORAGE_BLOCKS_KEY, JSON.stringify(all));
      return true;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async updateOrder(orderedIds) {
    const all = await this.getAllBlocks();
    const idMap = new Map(all.map((b) => [b.id, b]));

    if (!this.isIndexedDBReady) {
      orderedIds.forEach((id, index) => {
        if (idMap.has(id)) {
          idMap.get(id).order = index;
        }
      });
      localStorage.setItem(STORAGE_BLOCKS_KEY, JSON.stringify(Array.from(idMap.values())));
      return true;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      orderedIds.forEach((id, index) => {
        if (idMap.has(id)) {
          const item = idMap.get(id);
          item.order = index;
          store.put(item);
        }
      });

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  // ==========================================================================
  // EVENTOS Y DIFUSIÓN (CRUD)
  // ==========================================================================

  async getAllEvents() {
    if (!this.isIndexedDBReady) {
      const raw = localStorage.getItem(STORAGE_EVENTS_KEY) || '[]';
      return JSON.parse(raw);
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_EVENTS], 'readonly');
      const store = tx.objectStore(STORE_EVENTS);
      const req = store.getAll();
      req.onsuccess = () => {
        // Ordenar por fecha descendente o creación
        const sorted = (req.result || []).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getEventById(id) {
    if (!this.isIndexedDBReady) {
      const all = JSON.parse(localStorage.getItem(STORAGE_EVENTS_KEY) || '[]');
      return all.find((e) => e.id === id) || null;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_EVENTS], 'readonly');
      const store = tx.objectStore(STORE_EVENTS);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveEvent(event) {
    if (!event.id) {
      event.id = 'event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    }
    if (!event.createdAt) {
      event.createdAt = new Date().toISOString().split('T')[0];
    }

    if (!this.isIndexedDBReady) {
      const all = JSON.parse(localStorage.getItem(STORAGE_EVENTS_KEY) || '[]');
      const index = all.findIndex((e) => e.id === event.id);
      if (index >= 0) all[index] = event;
      else all.unshift(event);
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(all));
      return event;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_EVENTS], 'readwrite');
      const store = tx.objectStore(STORE_EVENTS);
      const req = store.put(event);
      req.onsuccess = () => resolve(event);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteEvent(id) {
    if (!this.isIndexedDBReady) {
      let all = JSON.parse(localStorage.getItem(STORAGE_EVENTS_KEY) || '[]');
      all = all.filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(all));
      return true;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_EVENTS], 'readwrite');
      const store = tx.objectStore(STORE_EVENTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================================================
  // USUARIOS Y PERMISOS (CRUD)
  // ==========================================================================

  async getAllUsers() {
    if (!this.isIndexedDBReady) {
      const raw = localStorage.getItem(STORAGE_USERS_KEY) || '[]';
      return JSON.parse(raw);
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_USERS], 'readonly');
      const store = tx.objectStore(STORE_USERS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getUserById(id) {
    if (!this.isIndexedDBReady) {
      const all = JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]');
      return all.find((u) => u.id === id) || null;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_USERS], 'readonly');
      const store = tx.objectStore(STORE_USERS);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getUserByUsername(username) {
    const all = await this.getAllUsers();
    return all.find((u) => (u.username || '').toLowerCase() === (username || '').toLowerCase()) || null;
  }

  async saveUser(user) {
    if (!user.id) {
      user.id = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    }
    if (!user.createdAt) {
      user.createdAt = new Date().toISOString().split('T')[0];
    }
    if (!user.permissions) {
      user.permissions = {
        canEditGrado1: false,
        canEditGrado2: false,
        canEditGrado3: false,
        canManageEvents: false,
        canManageUsers: false
      };
    }

    // Proteger al superadmin root
    if (user.username === 'josue958') {
      user.isSuperAdmin = true;
      user.permissions.canEditGrado1 = true;
      user.permissions.canEditGrado2 = true;
      user.permissions.canEditGrado3 = true;
      user.permissions.canManageEvents = true;
      user.permissions.canManageUsers = true;
    }

    if (!this.isIndexedDBReady) {
      const all = JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]');
      const index = all.findIndex((u) => u.id === user.id);
      if (index >= 0) all[index] = user;
      else all.push(user);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(all));
      return user;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_USERS], 'readwrite');
      const store = tx.objectStore(STORE_USERS);
      const req = store.put(user);
      req.onsuccess = () => resolve(user);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteUser(id) {
    const user = await this.getUserById(id);
    if (user && user.username === 'josue958') {
      throw new Error('El usuario administrador principal no puede ser eliminado.');
    }

    if (!this.isIndexedDBReady) {
      let all = JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]');
      all = all.filter((u) => u.id !== id);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(all));
      return true;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_USERS], 'readwrite');
      const store = tx.objectStore(STORE_USERS);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================================================
  // EXPORTACIÓN, IMPORTACIÓN Y RESETEO
  // ==========================================================================

  async exportJSON() {
    const blocks = await this.getAllBlocks();
    const events = await this.getAllEvents();
    const users = await this.getAllUsers();
    return JSON.stringify({ blocks, events, users, version: DB_VERSION }, null, 2);
  }

  async importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      let blocks = [];
      let events = INITIAL_EVENTS;
      let users = INITIAL_USERS;

      if (Array.isArray(parsed)) {
        blocks = parsed;
      } else if (parsed && typeof parsed === 'object') {
        blocks = parsed.blocks || [];
        if (parsed.events) events = parsed.events;
        if (parsed.users) users = parsed.users;
      }

      if (this.isIndexedDBReady) {
        const tx = this.db.transaction([STORE_NAME, STORE_EVENTS, STORE_USERS], 'readwrite');
        const sBlocks = tx.objectStore(STORE_NAME);
        const sEvents = tx.objectStore(STORE_EVENTS);
        const sUsers = tx.objectStore(STORE_USERS);

        sBlocks.clear();
        for (const b of blocks) sBlocks.put(b);

        sEvents.clear();
        for (const e of events) sEvents.put(e);

        sUsers.clear();
        for (const u of users) sUsers.put(u);

        await new Promise((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      } else {
        localStorage.setItem(STORAGE_BLOCKS_KEY, JSON.stringify(blocks));
        localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      }

      return true;
    } catch (err) {
      console.error('Error importando datos:', err);
      throw err;
    }
  }

  async resetDefault() {
    if (this.isIndexedDBReady) {
      const tx = this.db.transaction([STORE_NAME, STORE_EVENTS, STORE_USERS], 'readwrite');
      const sBlocks = tx.objectStore(STORE_NAME);
      const sEvents = tx.objectStore(STORE_EVENTS);
      const sUsers = tx.objectStore(STORE_USERS);

      sBlocks.clear();
      for (const b of INITIAL_DATA) sBlocks.put(b);

      sEvents.clear();
      for (const e of INITIAL_EVENTS) sEvents.put(e);

      sUsers.clear();
      for (const u of INITIAL_USERS) sUsers.put(u);

      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } else {
      localStorage.setItem(STORAGE_BLOCKS_KEY, JSON.stringify(INITIAL_DATA));
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
    }
    return true;
  }
}

// Instancia global
window.est54DB = new EST54Database();
