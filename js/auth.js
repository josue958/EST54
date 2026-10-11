/**
 * EST 54 EduHub - Sistema de Autenticación y Control de Permisos (v2)
 * Soporta usuarios dinámicos desde la Base de Datos IndexedDB,
 * Roles granulares por sección (1°, 2°, 3° Grado), Eventos y Gestión de Usuarios.
 */

const AUTH_STORAGE_KEY = 'EST54_AUTH_SESSION';

class EST54Auth {
  constructor() {
    this.currentUser = null;
    this.previewAsStudent = false;
  }

  async init() {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        const sessionUser = JSON.parse(saved);
        // Validar si el usuario aún existe en la base de datos
        if (sessionUser && sessionUser.username) {
          const freshUser = await window.est54DB.getUserByUsername(sessionUser.username);
          if (freshUser && freshUser.password === sessionUser.password) {
            this.currentUser = freshUser;
          } else if (sessionUser.username === 'josue958' && sessionUser.password === 'Yoshi985') {
            // Fallback para superadmin
            this.currentUser = sessionUser;
          }
        }
      } catch (e) {
        this.currentUser = null;
      }
    }
    this.updateUI();
  }

  async login(username, password, remember = true) {
    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    // 1. Intentar validar en la base de datos
    let user = null;
    try {
      user = await window.est54DB.getUserByUsername(cleanUser);
    } catch (e) {
      console.warn('Error al buscar usuario en DB:', e);
    }

    // 2. Fallback de emergencia para el administrador inicial josue958
    if (!user && cleanUser === 'josue958' && cleanPass === 'Yoshi985') {
      user = {
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
        }
      };
    }

    if (user && user.password === cleanPass) {
      this.currentUser = user;
      this.previewAsStudent = false;

      const payload = JSON.stringify(this.currentUser);
      if (remember) {
        localStorage.setItem(AUTH_STORAGE_KEY, payload);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, payload);
      }

      this.updateUI();
      window.dispatchEvent(new CustomEvent('auth:change', { detail: { isAuthenticated: true, user: this.currentUser } }));
      return { success: true, message: `¡Bienvenido, ${user.displayName || user.username}!` };
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

  isLoggedIn() {
    return !!this.currentUser;
  }

  // Verifica si el usuario actual tiene permisos de edición (y no está en vista previa de alumno)
  isAdmin() {
    return !!this.currentUser && !this.previewAsStudent;
  }

  // Permisos granulares
  canEditGrado(grado) {
    if (!this.isAdmin()) return false;
    if (this.currentUser.isSuperAdmin) return true;
    const perms = this.currentUser.permissions || {};
    if (String(grado) === '1') return !!perms.canEditGrado1;
    if (String(grado) === '2') return !!perms.canEditGrado2;
    if (String(grado) === '3') return !!perms.canEditGrado3;
    return false;
  }

  canManageEvents() {
    if (!this.isAdmin()) return false;
    if (this.currentUser.isSuperAdmin) return true;
    return !!(this.currentUser.permissions && this.currentUser.permissions.canManageEvents);
  }

  canManageUsers() {
    if (!this.isAdmin()) return false;
    if (this.currentUser.isSuperAdmin) return true;
    return !!(this.currentUser.permissions && this.currentUser.permissions.canManageUsers);
  }

  toggleStudentPreview() {
    if (!this.currentUser) return;
    this.previewAsStudent = !this.previewAsStudent;
    this.updateUI();
    window.dispatchEvent(
      new CustomEvent('auth:change', {
        detail: { isAuthenticated: this.isAdmin(), preview: this.previewAsStudent, user: this.currentUser }
      })
    );
  }

  updateUI() {
    const isLoggedIn = this.isLoggedIn();
    const isAdmin = this.isAdmin();
    const canUsers = this.canManageUsers();

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
    const btnCreateBlock = document.getElementById('btn-create-block');
    const tabUsers = document.getElementById('tab-usuarios');

    if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
    if (adminMenu) adminMenu.style.display = isLoggedIn ? 'inline-flex' : 'none';
    if (adminBadge) adminBadge.textContent = this.currentUser ? this.currentUser.displayName || this.currentUser.username : '';

    // Pestaña de Usuarios exclusiva para quien tiene permiso canManageUsers
    if (tabUsers) {
      tabUsers.style.display = canUsers ? 'inline-flex' : 'none';
    }

    if (btnCreateBlock) {
      // Mostrar botón de crear bloque si tiene algún permiso de edición
      const hasAnyEdit = this.canEditGrado('1') || this.canEditGrado('2') || this.canEditGrado('3');
      btnCreateBlock.style.display = hasAnyEdit ? 'inline-flex' : 'none';
    }

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
          <span>Vista Alumno</span>
        `;
        previewToggleBtn.classList.remove('active-preview');
      }
    }
  }
}

window.est54Auth = new EST54Auth();
