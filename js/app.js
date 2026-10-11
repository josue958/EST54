/**
 * EST 54 EduHub - Lógica Principal de la Aplicación
 * Inspirada en el diseño y experiencia de Quizlet (quizlet.com/latest)
 * Soporte para 3 Grados, filtro por Materias, Drag & Drop WordPress-style,
 * Gestión de Artículos, Archivos e Imágenes, y Modo Estudio de Fichas.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar Base de Datos y Autenticación
  await window.est54DB.init();
  window.est54Auth.init();

  const App = {
    currentGrado: '1',
    currentMateria: 'all',
    searchQuery: '',
    blocks: [],
    studySet: null,
    currentCardIndex: 0,
    isCardFlipped: false,
    draggedElement: null,

    async init() {
      this.bindEvents();
      this.initTheme();
      await this.loadBlocks();
    },

    bindEvents() {
      // Cambio de Grado (1°, 2°, 3°)
      const gradoTabs = document.querySelectorAll('.grado-tab');
      gradoTabs.forEach((tab) => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          const grado = tab.dataset.grado;
          if (grado && grado !== this.currentGrado) {
            gradoTabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            this.currentGrado = grado;
            this.currentMateria = 'all';
            this.loadBlocks();
          }
        });
      });

      // Búsqueda en tiempo real
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.toLowerCase().trim();
          this.renderBlocks();
        });
      }

      // Modal de Inicio de Sesión
      const btnHeaderLogin = document.getElementById('btn-header-login');
      const authModal = document.getElementById('auth-modal');
      const authForm = document.getElementById('auth-form');
      const closeAuthModal = document.getElementById('close-auth-modal');

      if (btnHeaderLogin) {
        btnHeaderLogin.addEventListener('click', () => {
          authModal.classList.add('open');
          document.getElementById('login-username').focus();
        });
      }

      if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => authModal.classList.remove('open'));
      }

      if (authForm) {
        authForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const user = document.getElementById('login-username').value;
          const pass = document.getElementById('login-password').value;
          const remember = document.getElementById('login-remember').checked;
          const errorMsg = document.getElementById('login-error-msg');

          const result = window.est54Auth.login(user, pass, remember);
          if (result.success) {
            authModal.classList.remove('open');
            authForm.reset();
            errorMsg.textContent = '';
            this.showToast(result.message, 'success');
            this.renderBlocks();
          } else {
            errorMsg.textContent = result.message;
          }
        });
      }

      // Cerrar sesión
      const btnLogout = document.getElementById('btn-logout');
      if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
          e.preventDefault();
          window.est54Auth.logout();
          this.showToast('Sesión de administrador cerrada', 'info');
          this.renderBlocks();
        });
      }

      // Toggle vista previa de estudiante
      const btnTogglePreview = document.getElementById('btn-toggle-preview');
      if (btnTogglePreview) {
        btnTogglePreview.addEventListener('click', () => {
          window.est54Auth.toggleStudentPreview();
          this.renderBlocks();
          const isPreview = window.est54Auth.previewAsStudent;
          this.showToast(
            isPreview ? 'Modo de vista previa para alumnos activado' : 'Modo edición de administrador reactivado',
            'info'
          );
        });
      }

      // Evento de cambio de Auth
      window.addEventListener('auth:change', () => {
        this.renderBlocks();
      });

      // Botón Crear Bloque (Gutenberg / WordPress style)
      const btnCreateBlock = document.getElementById('btn-create-block');
      if (btnCreateBlock) {
        btnCreateBlock.addEventListener('click', () => {
          this.openBlockEditor();
        });
      }

      // Botón Base de Datos (Export / Import / Reset)
      const btnDbManager = document.getElementById('btn-db-manager');
      if (btnDbManager) {
        btnDbManager.addEventListener('click', () => {
          this.openDbModal();
        });
      }

      // Modo Oscuro / Claro
      const btnThemeToggle = document.getElementById('btn-theme-toggle');
      if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', () => {
          this.toggleTheme();
        });
      }

      // Cerrar modales con clic en backdrop o Escape
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.modal-overlay.open').forEach((m) => m.classList.remove('open'));
        }
      });
      document.querySelectorAll('.modal-overlay').forEach((overlay) => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) overlay.classList.remove('open');
        });
      });
    },

    initTheme() {
      const saved = localStorage.getItem('EST54_THEME') || 'light';
      document.documentElement.setAttribute('data-theme', saved);
      this.updateThemeIcon(saved);
    },

    toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('EST54_THEME', next);
      this.updateThemeIcon(next);
    },

    updateThemeIcon(theme) {
      const btn = document.getElementById('btn-theme-toggle');
      if (!btn) return;
      if (theme === 'dark') {
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
      } else {
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      }
    },

    async loadBlocks() {
      this.blocks = await window.est54DB.getBlocksByGrado(this.currentGrado);
      this.renderMateriaFilters();
      this.renderBlocks();
    },

    renderMateriaFilters() {
      const container = document.getElementById('materias-filter-container');
      if (!container) return;

      // Extraer materias únicas del grado actual
      const materias = Array.from(new Set(this.blocks.map((b) => b.materia).filter(Boolean)));

      let html = `
        <button class="materia-chip ${this.currentMateria === 'all' ? 'active' : ''}" data-materia="all">
          <span>📚 Todas las materias</span>
          <span class="chip-count">${this.blocks.length}</span>
        </button>
      `;

      materias.forEach((materia) => {
        const count = this.blocks.filter((b) => b.materia === materia).length;
        html += `
          <button class="materia-chip ${this.currentMateria === materia ? 'active' : ''}" data-materia="${this.escapeHtml(materia)}">
            <span>${this.getMateriaIcon(materia)} ${this.escapeHtml(materia)}</span>
            <span class="chip-count">${count}</span>
          </button>
        `;
      });

      container.innerHTML = html;

      // Vincular eventos de clic a las etiquetas
      container.querySelectorAll('.materia-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          this.currentMateria = chip.dataset.materia;
          container.querySelectorAll('.materia-chip').forEach((c) => c.classList.remove('active'));
          chip.classList.add('active');
          this.renderBlocks();
        });
      });
    },

    getMateriaIcon(materia) {
      const m = materia.toLowerCase();
      if (m.includes('matemática')) return '📐';
      if (m.includes('español') || m.includes('lengua')) return '📖';
      if (m.includes('biología') || m.includes('ciencias')) return '🧬';
      if (m.includes('física')) return '⚡';
      if (m.includes('química')) return '🧪';
      if (m.includes('historia')) return '🏛️';
      if (m.includes('inglés')) return '🌍';
      if (m.includes('cívica') || m.includes('ética')) return '⚖️';
      return '📌';
    },

    renderBlocks() {
      const grid = document.getElementById('content-blocks-grid');
      const countEl = document.getElementById('results-count');
      const emptyState = document.getElementById('empty-state');
      if (!grid) return;

      const isAdmin = window.est54Auth.isAdmin();

      // Filtrado por materia y texto de búsqueda
      let filtered = this.blocks.filter((b) => {
        const matchesMateria = this.currentMateria === 'all' || b.materia === this.currentMateria;
        if (!matchesMateria) return false;

        if (!this.searchQuery) return true;
        const q = this.searchQuery;
        const inTitle = (b.title || '').toLowerCase().includes(q);
        const inDesc = (b.description || '').toLowerCase().includes(q);
        const inMateria = (b.materia || '').toLowerCase().includes(q);
        const inContent = (b.content || '').toLowerCase().includes(q);
        return inTitle || inDesc || inMateria || inContent;
      });

      if (countEl) {
        countEl.textContent = `${filtered.length} elemento${filtered.length === 1 ? '' : 's'}`;
      }

      if (filtered.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      grid.innerHTML = filtered.map((block) => this.createBlockCardHtml(block, isAdmin)).join('');

      // Asignar eventos de drag & drop si es administrador
      if (isAdmin && this.currentMateria === 'all' && !this.searchQuery) {
        this.setupDragAndDrop(grid);
      }

      // Vincular botones de acciones de tarjetas
      this.attachCardActions(grid);
    },

    createBlockCardHtml(block, isAdmin) {
      const typeIcons = {
        flashcards: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
        article: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
        resource: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
        media: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
      };

      const typeBadgeClass = {
        flashcards: 'badge-flashcards',
        article: 'badge-article',
        resource: 'badge-resource',
        media: 'badge-media'
      }[block.type] || 'badge-default';

      let specificSnippet = '';

      if (block.type === 'flashcards') {
        const count = block.cards ? block.cards.length : 0;
        specificSnippet = `
          <div class="card-preview-flashcards">
            <div class="flashcards-pill-count">
              <span class="icon-cards">🃏</span> ${count} fichas de estudio
            </div>
            <button class="btn-play-set" data-action="study" data-id="${block.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Estudiar con Fichas
            </button>
          </div>
        `;
      } else if (block.type === 'resource') {
        specificSnippet = `
          <div class="card-preview-resource">
            <div class="file-info-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
              <div>
                <strong class="file-name-truncate">${this.escapeHtml(block.fileName || 'Archivo_Adjunto.pdf')}</strong>
                <span class="file-size-tag">${this.escapeHtml(block.fileSize || 'Descarga disponible')}</span>
              </div>
            </div>
            <button class="btn-download-resource" data-action="download" data-id="${block.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Descargar
            </button>
          </div>
        `;
      } else if (block.type === 'media') {
        specificSnippet = `
          <div class="card-preview-media" data-action="view-image" data-id="${block.id}">
            <img src="${this.escapeHtml(block.imageUrl || '')}" alt="${this.escapeHtml(block.title)}" loading="lazy" />
            <div class="media-overlay-zoom">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>
          </div>
        `;
      } else if (block.type === 'article') {
        specificSnippet = `
          <div class="card-preview-article">
            <span class="read-time-tag">⏱️ Lectura: ${this.escapeHtml(block.readTime || '5 min')}</span>
            <button class="btn-read-article" data-action="read" data-id="${block.id}">
              Leer Artículo Completo &rarr;
            </button>
          </div>
        `;
      }

      // Controles exclusivos para Administrador
      const adminControlsHtml = isAdmin
        ? `
        <div class="admin-card-actions">
          <div class="drag-handle" title="Arrastra para reordenar este bloque (WordPress-style)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8" cy="6" r="2"/><circle cx="16" cy="6" r="2"/>
              <circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/>
              <circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/>
            </svg>
            <span>Arrastrar</span>
          </div>
          <div class="admin-btn-group">
            <button class="btn-admin-icon" data-action="edit" data-id="${block.id}" title="Editar este bloque">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-admin-icon btn-admin-danger" data-action="delete" data-id="${block.id}" title="Eliminar bloque">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </div>
      `
        : '';

      return `
        <article class="quizlet-card ${isAdmin ? 'is-draggable-card' : ''}" data-id="${block.id}" ${isAdmin ? 'draggable="true"' : ''}>
          ${adminControlsHtml}
          <div class="card-inner">
            <div class="card-top-meta">
              <span class="materia-pill-tag">
                ${this.getMateriaIcon(block.materia || '')} ${this.escapeHtml(block.materia || 'General')}
              </span>
              <span class="type-badge ${typeBadgeClass}">
                ${typeIcons[block.type] || ''}
                ${this.escapeHtml(block.badge || block.type)}
              </span>
            </div>

            <h3 class="card-title">${this.escapeHtml(block.title)}</h3>
            <p class="card-description">${this.escapeHtml(block.description || '')}</p>

            ${specificSnippet}

            <div class="card-footer-meta">
              <div class="author-info">
                <span class="avatar-circle">${(block.author || 'P').charAt(0)}</span>
                <span class="author-name">${this.escapeHtml(block.author || 'Prof. Josué')}</span>
              </div>
              <time class="post-date">${this.formatDate(block.date)}</time>
            </div>
          </div>
        </article>
      `;
    },

    attachCardActions(container) {
      container.querySelectorAll('[data-action]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          const id = btn.dataset.id;
          const block = this.blocks.find((b) => b.id === id);
          if (!block) return;

          switch (action) {
            case 'study':
              this.openStudyModal(block);
              break;
            case 'read':
              this.openArticleModal(block);
              break;
            case 'download':
              this.downloadResource(block);
              break;
            case 'view-image':
              this.openImageLightbox(block);
              break;
            case 'edit':
              this.openBlockEditor(block);
              break;
            case 'delete':
              this.confirmDeleteBlock(block);
              break;
          }
        });
      });
    },

    setupDragAndDrop(grid) {
      const cards = grid.querySelectorAll('.quizlet-card.is-draggable-card');

      cards.forEach((card) => {
        card.addEventListener('dragstart', (e) => {
          this.draggedElement = card;
          card.classList.add('is-dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', card.dataset.id);
        });

        card.addEventListener('dragend', async () => {
          if (this.draggedElement) {
            this.draggedElement.classList.remove('is-dragging');
            this.draggedElement = null;
          }
          grid.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach((el) => {
            el.classList.remove('drag-over-top', 'drag-over-bottom');
          });

          // Obtener nuevo orden de IDs en el DOM
          const currentDomCards = Array.from(grid.querySelectorAll('.quizlet-card'));
          const orderedIds = currentDomCards.map((c) => c.dataset.id);

          await window.est54DB.updateOrder(orderedIds);
          // Refrescar lista de bloques en memoria
          this.blocks = await window.est54DB.getBlocksByGrado(this.currentGrado);
          this.showToast('Nuevo orden guardado automáticamente en la base de datos', 'success');
        });

        card.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (!this.draggedElement || this.draggedElement === card) return;

          const rect = card.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;

          if (e.clientY < midY) {
            card.classList.add('drag-over-top');
            card.classList.remove('drag-over-bottom');
          } else {
            card.classList.add('drag-over-bottom');
            card.classList.remove('drag-over-top');
          }
        });

        card.addEventListener('dragleave', () => {
          card.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        card.addEventListener('drop', (e) => {
          e.preventDefault();
          if (!this.draggedElement || this.draggedElement === card) return;

          const rect = card.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;

          if (e.clientY < midY) {
            grid.insertBefore(this.draggedElement, card);
          } else {
            grid.insertBefore(this.draggedElement, card.nextSibling);
          }

          card.classList.remove('drag-over-top', 'drag-over-bottom');
        });
      });
    },

    // --- MODAL MODO ESTUDIO DE FICHAS (TIPO QUIZLET) ---
    openStudyModal(block) {
      this.studySet = block;
      this.currentCardIndex = 0;
      this.isCardFlipped = false;

      const modal = document.getElementById('study-modal');
      const title = document.getElementById('study-set-title');
      const subtitle = document.getElementById('study-set-materia');

      if (title) title.textContent = block.title;
      if (subtitle) subtitle.textContent = `${block.materia} • ${block.cards?.length || 0} términos`;

      this.updateStudyCardView();
      modal.classList.add('open');

      // Teclado para estudiar como Quizlet (Espacio para voltear, Flechas para navegar)
      this._studyKeyHandler = (e) => {
        if (!modal.classList.contains('open')) return;
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          this.flipCurrentCard();
        } else if (e.key === 'ArrowRight') {
          this.nextStudyCard();
        } else if (e.key === 'ArrowLeft') {
          this.prevStudyCard();
        }
      };
      window.addEventListener('keydown', this._studyKeyHandler);

      // Eventos de botones
      const btnFlip = document.getElementById('btn-flip-card');
      const cardInner = document.getElementById('interactive-flashcard');
      const btnPrev = document.getElementById('btn-prev-card');
      const btnNext = document.getElementById('btn-next-card');
      const btnShuffle = document.getElementById('btn-shuffle-cards');

      if (cardInner) {
        cardInner.onclick = () => this.flipCurrentCard();
      }
      if (btnFlip) {
        btnFlip.onclick = () => this.flipCurrentCard();
      }
      if (btnPrev) {
        btnPrev.onclick = () => this.prevStudyCard();
      }
      if (btnNext) {
        btnNext.onclick = () => this.nextStudyCard();
      }
      if (btnShuffle) {
        btnShuffle.onclick = () => this.shuffleCards();
      }

      const closeBtn = document.getElementById('close-study-modal');
      if (closeBtn) {
        closeBtn.onclick = () => {
          modal.classList.remove('open');
          window.removeEventListener('keydown', this._studyKeyHandler);
        };
      }
    },

    flipCurrentCard() {
      const card = document.getElementById('interactive-flashcard');
      if (!card) return;
      this.isCardFlipped = !this.isCardFlipped;
      if (this.isCardFlipped) {
        card.classList.add('is-flipped');
      } else {
        card.classList.remove('is-flipped');
      }
    },

    nextStudyCard() {
      if (!this.studySet || !this.studySet.cards) return;
      if (this.currentCardIndex < this.studySet.cards.length - 1) {
        this.currentCardIndex++;
        this.isCardFlipped = false;
        this.updateStudyCardView();
      }
    },

    prevStudyCard() {
      if (!this.studySet || !this.studySet.cards) return;
      if (this.currentCardIndex > 0) {
        this.currentCardIndex--;
        this.isCardFlipped = false;
        this.updateStudyCardView();
      }
    },

    shuffleCards() {
      if (!this.studySet || !this.studySet.cards) return;
      const cards = [...this.studySet.cards];
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
      this.studySet.cards = cards;
      this.currentCardIndex = 0;
      this.isCardFlipped = false;
      this.updateStudyCardView();
      this.showToast('Fichas mezcladas aleatoriamente', 'info');
    },

    updateStudyCardView() {
      const card = document.getElementById('interactive-flashcard');
      const termEl = document.getElementById('flashcard-front-term');
      const defEl = document.getElementById('flashcard-back-def');
      const progressText = document.getElementById('study-progress-text');
      const progressBar = document.getElementById('study-progress-fill');
      const btnPrev = document.getElementById('btn-prev-card');
      const btnNext = document.getElementById('btn-next-card');

      if (!this.studySet || !this.studySet.cards || this.studySet.cards.length === 0) {
        if (termEl) termEl.textContent = 'No hay fichas en este set';
        return;
      }

      if (card) card.classList.remove('is-flipped');
      this.isCardFlipped = false;

      const current = this.studySet.cards[this.currentCardIndex];
      const total = this.studySet.cards.length;

      if (termEl) termEl.textContent = current.term;
      if (defEl) defEl.textContent = current.def;

      if (progressText) progressText.textContent = `${this.currentCardIndex + 1} de ${total}`;
      if (progressBar) {
        const pct = ((this.currentCardIndex + 1) / total) * 100;
        progressBar.style.width = `${pct}%`;
      }

      if (btnPrev) btnPrev.disabled = this.currentCardIndex === 0;
      if (btnNext) btnNext.disabled = this.currentCardIndex === total - 1;
    },

    // --- MODAL DE LECTURA DE ARTÍCULO ---
    openArticleModal(block) {
      const modal = document.getElementById('article-modal');
      const title = document.getElementById('article-modal-title');
      const meta = document.getElementById('article-modal-meta');
      const body = document.getElementById('article-modal-body');

      if (title) title.textContent = block.title;
      if (meta) {
        meta.innerHTML = `
          <span>${this.getMateriaIcon(block.materia)} ${this.escapeHtml(block.materia)}</span> • 
          <span>Por ${this.escapeHtml(block.author || 'Prof. Josué')}</span> • 
          <span>⏱️ ${this.escapeHtml(block.readTime || '5 min')} de lectura</span>
        `;
      }
      if (body) {
        body.innerHTML = this.formatArticleMarkdown(block.content || block.description);
      }

      modal.classList.add('open');

      const closeBtn = document.getElementById('close-article-modal');
      if (closeBtn) closeBtn.onclick = () => modal.classList.remove('open');
    },

    formatArticleMarkdown(text) {
      if (!text) return '';
      let escaped = this.escapeHtml(text);
      // Cabeceras
      escaped = escaped.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      escaped = escaped.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      escaped = escaped.replace(/^# (.*$)/gim, '<h1>$1</h1>');
      // Negritas
      escaped = escaped.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
      // Citas
      escaped = escaped.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
      // Bloques de código
      escaped = escaped.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
      // Listas
      escaped = escaped.replace(/^- (.*$)/gim, '<li>$1</li>');
      // Saltos de línea
      escaped = escaped.replace(/\n\n/g, '<p></p>');
      return escaped;
    },

    // --- DESCARGA DE RECURSOS ---
    downloadResource(block) {
      const link = document.createElement('a');
      link.href = block.downloadData || 'data:text/plain;charset=utf-8,' + encodeURIComponent(block.description);
      link.download = block.fileName || `${block.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showToast(`Descargando "${link.download}"...`, 'success');
    },

    // --- VISOR DE IMAGEN / INFOGRAFÍA ---
    openImageLightbox(block) {
      const modal = document.getElementById('image-modal');
      const img = document.getElementById('lightbox-img');
      const caption = document.getElementById('lightbox-caption');
      const title = document.getElementById('lightbox-title');

      if (img) img.src = block.imageUrl;
      if (caption) caption.textContent = block.caption || block.description || '';
      if (title) title.textContent = block.title;

      modal.classList.add('open');
      const closeBtn = document.getElementById('close-image-modal');
      if (closeBtn) closeBtn.onclick = () => modal.classList.remove('open');
    },

    // --- EDITOR DE BLOQUES (WORDPRESS / GUTENBERG STYLE) ---
    openBlockEditor(blockToEdit = null) {
      const modal = document.getElementById('editor-modal');
      const titleEl = document.getElementById('editor-modal-title');
      const form = document.getElementById('block-editor-form');

      titleEl.textContent = blockToEdit ? 'Editar Bloque de Contenido' : 'Crear Nuevo Bloque (WordPress Style)';

      // Campos base
      document.getElementById('editor-block-id').value = blockToEdit ? blockToEdit.id : '';
      document.getElementById('editor-grado').value = blockToEdit ? blockToEdit.grado : this.currentGrado;
      document.getElementById('editor-materia').value = blockToEdit ? blockToEdit.materia : 'Matemáticas';
      document.getElementById('editor-title').value = blockToEdit ? blockToEdit.title : '';
      document.getElementById('editor-desc').value = blockToEdit ? blockToEdit.description : '';
      document.getElementById('editor-badge').value = blockToEdit ? blockToEdit.badge : '';

      // Tipo de Bloque
      const typeSelect = document.getElementById('editor-type');
      typeSelect.value = blockToEdit ? blockToEdit.type : 'article';

      this.updateEditorFieldsByType(typeSelect.value, blockToEdit);

      typeSelect.onchange = () => {
        this.updateEditorFieldsByType(typeSelect.value, blockToEdit);
      };

      // Manejo de envío
      form.onsubmit = async (e) => {
        e.preventDefault();
        await this.handleSaveBlock(blockToEdit);
      };

      modal.classList.add('open');
      const closeBtn = document.getElementById('close-editor-modal');
      if (closeBtn) closeBtn.onclick = () => modal.classList.remove('open');
    },

    updateEditorFieldsByType(type, block) {
      const dynamicContainer = document.getElementById('editor-dynamic-fields');

      if (type === 'article') {
        dynamicContainer.innerHTML = `
          <div class="form-group">
            <label for="editor-read-time">Tiempo Estimado de Lectura</label>
            <input type="text" id="editor-read-time" class="form-input" placeholder="ej. 5 min" value="${this.escapeHtml(
              block?.readTime || '5 min'
            )}" />
          </div>
          <div class="form-group">
            <label for="editor-article-content">Contenido del Artículo (Compatible con Markdown)</label>
            <textarea id="editor-article-content" class="form-textarea" rows="8" placeholder="Escribe el artículo, explicaciones, fórmulas...">${this.escapeHtml(
              block?.content || ''
            )}</textarea>
          </div>
        `;
      } else if (type === 'flashcards') {
        const cards = block?.cards || [
          { term: '', def: '' },
          { term: '', def: '' }
        ];

        let cardsHtml = `
          <div class="form-group">
            <div class="flashcards-builder-header">
              <label>Pares de Fichas (Término y Definición)</label>
              <button type="button" class="btn-secondary-sm" id="btn-add-card-row">+ Agregar Ficha</button>
            </div>
            <div id="flashcards-rows-container" class="flashcards-rows-container">
        `;

        cards.forEach((c, idx) => {
          cardsHtml += this.createCardRowHtml(idx + 1, c.term, c.def);
        });

        cardsHtml += `</div></div>`;
        dynamicContainer.innerHTML = cardsHtml;

        const btnAdd = document.getElementById('btn-add-card-row');
        if (btnAdd) {
          btnAdd.onclick = () => {
            const container = document.getElementById('flashcards-rows-container');
            const newIndex = container.children.length + 1;
            const div = document.createElement('div');
            div.innerHTML = this.createCardRowHtml(newIndex, '', '');
            container.appendChild(div.firstElementChild);
            this.bindCardRowDeleteButtons();
          };
        }
        this.bindCardRowDeleteButtons();
      } else if (type === 'resource') {
        dynamicContainer.innerHTML = `
          <div class="form-group">
            <label>Subir Archivo de Referencia (PDF, Documento, etc.)</label>
            <input type="file" id="editor-file-picker" class="form-file-input" />
            <small class="form-hint">O ingresa los datos manualmente a continuación:</small>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="editor-file-name">Nombre del Archivo</label>
              <input type="text" id="editor-file-name" class="form-input" placeholder="ej. Guia_Examen.pdf" value="${this.escapeHtml(
                block?.fileName || ''
              )}" />
            </div>
            <div class="form-group">
              <label for="editor-file-size">Tamaño / Extensión</label>
              <input type="text" id="editor-file-size" class="form-input" placeholder="ej. 1.2 MB" value="${this.escapeHtml(
                block?.fileSize || '1.0 MB'
              )}" />
            </div>
          </div>
          <input type="hidden" id="editor-file-data" value="${this.escapeHtml(block?.downloadData || '')}" />
        `;

        const filePicker = document.getElementById('editor-file-picker');
        if (filePicker) {
          filePicker.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              document.getElementById('editor-file-name').value = file.name;
              document.getElementById('editor-file-size').value = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
              const reader = new FileReader();
              reader.onload = (event) => {
                document.getElementById('editor-file-data').value = event.target.result;
                this.showToast(`Archivo "${file.name}" cargado para adjuntar`, 'info');
              };
              reader.readAsDataURL(file);
            }
          };
        }
      } else if (type === 'media') {
        dynamicContainer.innerHTML = `
          <div class="form-group">
            <label>Subir Imagen desde tu Equipo o URL</label>
            <input type="file" id="editor-image-picker" accept="image/*" class="form-file-input" />
          </div>
          <div class="form-group">
            <label for="editor-image-url">URL de Imagen (o generada automáticamente al subir archivo)</label>
            <input type="text" id="editor-image-url" class="form-input" placeholder="https://..." value="${this.escapeHtml(
              block?.imageUrl || ''
            )}" />
          </div>
          <div class="form-group">
            <label for="editor-image-caption">Pie de Foto / Explicación</label>
            <input type="text" id="editor-image-caption" class="form-input" placeholder="Breve descripción de la imagen" value="${this.escapeHtml(
              block?.caption || ''
            )}" />
          </div>
          <div class="image-preview-box" id="editor-img-preview-box" style="${
            block?.imageUrl ? 'display: block;' : 'display: none;'
          }">
            <img id="editor-img-preview" src="${this.escapeHtml(block?.imageUrl || '')}" alt="Vista previa" />
          </div>
        `;

        const imgPicker = document.getElementById('editor-image-picker');
        const imgUrlInput = document.getElementById('editor-image-url');
        const previewBox = document.getElementById('editor-img-preview-box');
        const previewImg = document.getElementById('editor-img-preview');

        if (imgPicker) {
          imgPicker.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                imgUrlInput.value = event.target.result;
                previewImg.src = event.target.result;
                previewBox.style.display = 'block';
              };
              reader.readAsDataURL(file);
            }
          };
        }

        if (imgUrlInput) {
          imgUrlInput.oninput = () => {
            if (imgUrlInput.value) {
              previewImg.src = imgUrlInput.value;
              previewBox.style.display = 'block';
            } else {
              previewBox.style.display = 'none';
            }
          };
        }
      }
    },

    createCardRowHtml(index, term = '', def = '') {
      return `
        <div class="card-builder-row">
          <div class="card-row-num">${index}</div>
          <div class="card-row-inputs">
            <input type="text" class="form-input card-term-input" placeholder="Término / Pregunta" value="${this.escapeHtml(
              term
            )}" required />
            <input type="text" class="form-input card-def-input" placeholder="Definición / Respuesta" value="${this.escapeHtml(
              def
            )}" required />
          </div>
          <button type="button" class="btn-card-row-delete" title="Eliminar ficha">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `;
    },

    bindCardRowDeleteButtons() {
      const container = document.getElementById('flashcards-rows-container');
      if (!container) return;
      container.querySelectorAll('.btn-card-row-delete').forEach((btn) => {
        btn.onclick = () => {
          if (container.children.length > 1) {
            btn.closest('.card-builder-row').remove();
            // Re-enumerar
            container.querySelectorAll('.card-builder-row').forEach((row, idx) => {
              row.querySelector('.card-row-num').textContent = idx + 1;
            });
          } else {
            this.showToast('Debe existir al menos una ficha en el set', 'warning');
          }
        };
      });
    },

    async handleSaveBlock(existingBlock) {
      const id = document.getElementById('editor-block-id').value;
      const grado = document.getElementById('editor-grado').value;
      const materia = document.getElementById('editor-materia').value.trim();
      const title = document.getElementById('editor-title').value.trim();
      const description = document.getElementById('editor-desc').value.trim();
      const badge = document.getElementById('editor-badge').value.trim();
      const type = document.getElementById('editor-type').value;

      if (!title || !materia) {
        this.showToast('Por favor completa el título y la materia', 'warning');
        return;
      }

      const block = {
        id: id || undefined,
        grado,
        materia,
        title,
        description,
        badge:
          badge ||
          (type === 'flashcards'
            ? 'Set de Fichas'
            : type === 'article'
            ? 'Artículo'
            : type === 'resource'
            ? 'Recurso'
            : 'Infografía'),
        type,
        author: 'Prof. Josué',
        date: existingBlock?.date || new Date().toISOString().split('T')[0],
        order: existingBlock?.order !== undefined ? existingBlock.order : undefined
      };

      if (type === 'article') {
        block.readTime = document.getElementById('editor-read-time')?.value.trim() || '5 min';
        block.content = document.getElementById('editor-article-content')?.value || '';
      } else if (type === 'flashcards') {
        const rows = document.querySelectorAll('.card-builder-row');
        block.cards = [];
        rows.forEach((r) => {
          const term = r.querySelector('.card-term-input').value.trim();
          const def = r.querySelector('.card-def-input').value.trim();
          if (term || def) {
            block.cards.push({ term, def });
          }
        });
      } else if (type === 'resource') {
        block.fileName = document.getElementById('editor-file-name')?.value.trim() || 'Recurso_EST54.pdf';
        block.fileSize = document.getElementById('editor-file-size')?.value.trim() || '1.0 MB';
        block.downloadData =
          document.getElementById('editor-file-data')?.value ||
          'data:text/plain;charset=utf-8,' + encodeURIComponent(description);
      } else if (type === 'media') {
        block.imageUrl =
          document.getElementById('editor-image-url')?.value.trim() ||
          'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80';
        block.caption = document.getElementById('editor-image-caption')?.value.trim() || '';
      }

      await window.est54DB.saveBlock(block);
      document.getElementById('editor-modal').classList.remove('open');
      this.showToast(existingBlock ? 'Bloque actualizado con éxito' : 'Nuevo bloque agregado con éxito', 'success');

      // Si se guardó en el grado actual, recargar; de lo contrario cambiar de pestaña
      if (this.currentGrado !== grado) {
        this.currentGrado = grado;
        document.querySelectorAll('.grado-tab').forEach((t) => {
          t.classList.toggle('active', t.dataset.grado === grado);
        });
      }
      await this.loadBlocks();
    },

    async confirmDeleteBlock(block) {
      if (confirm(`¿Estás seguro de que deseas eliminar el bloque "${block.title}"?`)) {
        await window.est54DB.deleteBlock(block.id);
        this.showToast(`Bloque "${block.title}" eliminado`, 'info');
        await this.loadBlocks();
      }
    },

    // --- MODAL DE GESTIÓN DE BASE DE DATOS ---
    openDbModal() {
      const modal = document.getElementById('db-modal');
      modal.classList.add('open');

      const btnExport = document.getElementById('btn-export-db');
      const btnImport = document.getElementById('btn-import-db');
      const fileInput = document.getElementById('import-file-input');
      const btnReset = document.getElementById('btn-reset-db');
      const closeBtn = document.getElementById('close-db-modal');

      if (btnExport) {
        btnExport.onclick = async () => {
          const json = await window.est54DB.exportJSON();
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `EST54_EduHub_Backup_${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
          this.showToast('Copia de seguridad descargada en JSON', 'success');
        };
      }

      if (btnImport && fileInput) {
        btnImport.onclick = () => fileInput.click();
        fileInput.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (evt) => {
            try {
              await window.est54DB.importJSON(evt.target.result);
              this.showToast('Base de datos restaurada con éxito', 'success');
              modal.classList.remove('open');
              await this.loadBlocks();
            } catch (err) {
              this.showToast('Error al importar archivo JSON inválido', 'danger');
            }
          };
          reader.readAsText(file);
        };
      }

      if (btnReset) {
        btnReset.onclick = async () => {
          if (confirm('¿Restablecer la base de datos a los valores iniciales de demostración?')) {
            await window.est54DB.resetDefault();
            this.showToast('Base de datos restablecida a los valores iniciales', 'info');
            modal.classList.remove('open');
            await this.loadBlocks();
          }
        };
      }

      if (closeBtn) closeBtn.onclick = () => modal.classList.remove('open');
    },

    // --- UTILIDADES ---
    showToast(message, type = 'info') {
      const toastContainer = document.getElementById('toast-container');
      if (!toastContainer) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <span class="toast-message">${this.escapeHtml(message)}</span>
      `;

      toastContainer.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('show');
      }, 10);

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    },

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          const m = parseInt(parts[1], 10) - 1;
          return `${parts[2]} ${months[m] || ''} ${parts[0]}`;
        }
      } catch (e) {}
      return dateStr;
    }
  };

  window.est54App = App;
  App.init();
});
