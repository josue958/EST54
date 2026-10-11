/**
 * EST 54 EduHub - Sistema de Autenticación de Administrador
 * Credenciales de acceso administrativo:
 * Usuario: josue958
 * Contraseña: Yoshi985
 */

const AUTH_STORAGE_KEY = 'EST54_AUTH_SESSION';
const VALID_CREDENTIALS = {
  username: 'josue958',
  password: 'Yoshi985',
  displayName: 'Prof. Josué',
  role: 'Administrador Escolar'
};

class EST54Auth {
  constructor() {
    this.currentUser = null;
    this.previewAsStudent = false;
  }

  init() {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user && user.username === VALID_CREDENTIALS.username) {
          this.currentUser = user;
        }
      } catch (e) {
        this.currentUser = null;
      }
    }
    this.updateUI();
  }

  login(username, password, remember = true) {
    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    if (cleanUser === VALID_CREDENTIALS.username && cleanPass === VALID_CREDENTIALS.password) {
      this.currentUser = {
        username: VALID_CREDENTIALS.username,
        displayName: VALID_CREDENTIALS.displayName,
        role: VALID_CREDENTIALS.role,
        loggedAt: new Date().toISOString()
      };
      this.previewAsStudent = false;

      const payload = JSON.stringify(this.currentUser);
      if (remember) {
        localStorage.setItem(AUTH_STORAGE_KEY, payload);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, payload);
      }

      this.updateUI();
      window.dispatchEvent(new CustomEvent('auth:change', { detail: { isAuthenticated: true, user: this.currentUser } }));
      return { success: true, message: '¡Bienvenido, ' + VALID_CREDENTIALS.displayName + '!' };
    }

    return {
      success: false,
      message: 'Usuario o contraseña incorrectos. Verifica tus credenciales.'
    };
  }

  logout() {
    this.currentUser = null;
    this.previewAsStudent = false;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    this.updateUI();
    window.dispatchEvent(new CustomEvent('auth:change', { detail: { isAuthenticated: false, user: null } }));
  }

  isAdmin() {
    return !!this.currentUser && !this.previewAsStudent;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  toggleStudentPreview() {
    if (!this.currentUser) return;
    this.previewAsStudent = !this.previewAsStudent;
    this.updateUI();
    window.dispatchEvent(new CustomEvent('auth:change', { detail: { isAuthenticated: this.isAdmin(), preview: this.previewAsStudent } }));
  }

  updateUI() {
    const isAdmin = this.isAdmin();
    const isLoggedIn = this.isLoggedIn();

    if (isAdmin) {
      document.body.classList.add('is-admin');
      document.body.classList.remove('is-preview-student');
    } else {
      document.body.classList.remove('is-admin');
      if (this.previewAsStudent) {
        document.body.classList.add('is-preview-student');
      } else {
        document.body.classList.remove('is-preview-student');
      }
    }

    // Actualizar elementos dinámicos en Navbar
    const loginBtn = document.getElementById('btn-header-login');
    const adminMenu = document.getElementById('header-admin-menu');
    const adminBadge = document.getElementById('admin-badge-name');
    const previewToggleBtn = document.getElementById('btn-toggle-preview');

    if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
    if (adminMenu) adminMenu.style.display = isLoggedIn ? 'inline-flex' : 'none';
    if (adminBadge) adminBadge.textContent = this.currentUser ? this.currentUser.displayName : '';
    
    if (previewToggleBtn) {
      if (this.previewAsStudent) {
        previewToggleBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span>Volver al Modo Edición</span>
        `;
        previewToggleBtn.classList.add('active-preview');
      } else {
        previewToggleBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Vista de Estudiante</span>
        `;
        previewToggleBtn.classList.remove('active-preview');
      }
    }
  }
}

window.est54Auth = new EST54Auth();
