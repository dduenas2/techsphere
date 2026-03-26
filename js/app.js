/**
 * ========================================
 * TechSphere - App Principal (app.js)
 * Módulo de utilidades compartidas y carga de datos
 * Tecnología: JavaScript ES6+
 * ========================================
 */

"use strict";

// --- Configuración Global ---
const APP_CONFIG = {
  appName: "TechSphere",
  version: "1.0.0",
  dataPath: "../data/services.json", // Ruta relativa desde /pages/
  dataPathRoot: "data/services.json", // Ruta desde raíz (index.html)
  storageKeys: {
    favorites: "techsphere_favorites",
    services: "techsphere_services",
  },
};

/**
 * Clase principal de la aplicación
 * Gestiona la carga de datos y utilidades compartidas
 */
class TechSphereApp {
  constructor() {
    this.services = [];
    this.favorites = this.loadFavorites();
  }

  /**
   * Carga los servicios desde el JSON local
   * Si hay servicios personalizados en localStorage, los combina
   * @param {boolean} isRoot - Si se llama desde index.html (raíz)
   * @returns {Promise<Array>} Lista de servicios
   */
  async loadServices(isRoot = false) {
    try {
      const path = isRoot ? APP_CONFIG.dataPathRoot : APP_CONFIG.dataPath;
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const jsonServices = await response.json();

      // Combinar con servicios creados por el usuario (CRUD)
      const userServices = this.loadUserServices();
      this.services = [...jsonServices, ...userServices];

      console.log(`✅ ${this.services.length} servicios cargados correctamente`);
      return this.services;
    } catch (error) {
      console.error("❌ Error al cargar servicios:", error);
      // Intentar cargar solo desde localStorage
      this.services = this.loadUserServices();
      return this.services;
    }
  }

  /**
   * Carga servicios creados por el usuario desde localStorage
   * @returns {Array} Servicios del usuario
   */
  loadUserServices() {
    try {
      const data = localStorage.getItem(APP_CONFIG.storageKeys.services);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error al cargar servicios del usuario:", error);
      return [];
    }
  }

  /**
   * Guarda un nuevo servicio creado por el usuario
   * @param {Object} service - Servicio a guardar
   */
  saveUserService(service) {
    const userServices = this.loadUserServices();
    // Generar ID único
    service.id = Date.now();
    service.fechaCreacion = new Date().toISOString().split("T")[0];
    service.estado = "activo";
    service.rating = 0;
    service.resenas = 0;
    service.clientes = 0;
    service.entrega = "Por definir";
    userServices.push(service);
    localStorage.setItem(
      APP_CONFIG.storageKeys.services,
      JSON.stringify(userServices)
    );
    this.services.push(service);
    return service;
  }

  /**
   * Elimina un servicio creado por el usuario
   * @param {number} serviceId - ID del servicio a eliminar
   * @returns {boolean} true si se eliminó correctamente
   */
  deleteUserService(serviceId) {
    let userServices = this.loadUserServices();
    const initialLength = userServices.length;
    userServices = userServices.filter((s) => s.id !== serviceId);

    if (userServices.length < initialLength) {
      localStorage.setItem(
        APP_CONFIG.storageKeys.services,
        JSON.stringify(userServices)
      );
      this.services = this.services.filter((s) => s.id !== serviceId);
      // También eliminar de favoritos si estaba
      this.removeFavorite(serviceId);
      return true;
    }
    return false;
  }

  // --- FAVORITOS ---

  /**
   * Carga la lista de IDs favoritos desde localStorage
   * @returns {Array<number>} IDs de favoritos
   */
  loadFavorites() {
    try {
      const data = localStorage.getItem(APP_CONFIG.storageKeys.favorites);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      return [];
    }
  }

  /**
   * Guarda la lista de favoritos en localStorage
   */
  saveFavorites() {
    localStorage.setItem(
      APP_CONFIG.storageKeys.favorites,
      JSON.stringify(this.favorites)
    );
    this.updateFavCounter();
  }

  /**
   * Agrega o quita un servicio de favoritos (toggle)
   * @param {number} serviceId - ID del servicio
   * @returns {boolean} true si se agregó, false si se quitó
   */
  toggleFavorite(serviceId) {
    const index = this.favorites.indexOf(serviceId);
    if (index === -1) {
      this.favorites.push(serviceId);
      this.saveFavorites();
      return true; // Agregado
    } else {
      this.favorites.splice(index, 1);
      this.saveFavorites();
      return false; // Removido
    }
  }

  /**
   * Elimina un servicio de favoritos
   * @param {number} serviceId - ID del servicio
   */
  removeFavorite(serviceId) {
    this.favorites = this.favorites.filter((id) => id !== serviceId);
    this.saveFavorites();
  }

  /**
   * Verifica si un servicio está en favoritos
   * @param {number} serviceId - ID del servicio
   * @returns {boolean}
   */
  isFavorite(serviceId) {
    return this.favorites.includes(serviceId);
  }

  /**
   * Limpia todos los favoritos
   */
  clearFavorites() {
    this.favorites = [];
    this.saveFavorites();
  }

  /**
   * Actualiza el contador de favoritos en el navbar
   */
  updateFavCounter() {
    const counters = document.querySelectorAll(".fav-counter");
    counters.forEach((counter) => {
      counter.textContent = this.favorites.length;
      counter.style.display = this.favorites.length > 0 ? "inline-flex" : "none";
    });
  }

  /**
   * Obtiene un servicio por su ID
   * @param {number} id - ID del servicio
   * @returns {Object|null}
   */
  getServiceById(id) {
    return this.services.find((s) => s.id === parseInt(id)) || null;
  }

  /**
   * Filtra servicios por categoría
   * @param {string} category - Categoría a filtrar
   * @returns {Array}
   */
  filterByCategory(category) {
    if (!category || category === "all") return this.services;
    return this.services.filter(
      (s) => s.categoria.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Busca servicios por texto
   * @param {string} query - Texto de búsqueda
   * @returns {Array}
   */
  searchServices(query) {
    if (!query) return this.services;
    const q = query.toLowerCase();
    return this.services.filter(
      (s) =>
        s.nombre.toLowerCase().includes(q) ||
        s.descripcionCorta.toLowerCase().includes(q) ||
        s.categoria.toLowerCase().includes(q) ||
        s.tecnologias.some((t) => t.toLowerCase().includes(q))
    );
  }

  /**
   * Ordena servicios
   * @param {Array} services - Lista de servicios
   * @param {string} sortBy - Criterio de ordenamiento
   * @returns {Array}
   */
  sortServices(services, sortBy) {
    const sorted = [...services];
    switch (sortBy) {
      case "precio-asc":
        return sorted.sort((a, b) => a.precio - b.precio);
      case "precio-desc":
        return sorted.sort((a, b) => b.precio - a.precio);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "reciente":
        return sorted.sort(
          (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
        );
      default:
        return sorted;
    }
  }

  /**
   * Obtiene las categorías únicas
   * @returns {Array<string>}
   */
  getCategories() {
    return [...new Set(this.services.map((s) => s.categoria))];
  }

  /**
   * Obtiene servicios activos
   * @returns {Array}
   */
  getActiveServices() {
    return this.services.filter((s) => s.estado === "activo");
  }
}

// --- UTILIDADES GLOBALES ---

/**
 * Muestra un toast/notificación
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: success, error, info
 */
function showToast(message, type = "success") {
  // Eliminar toast previo si existe
  const existing = document.querySelector(".toast-custom");
  if (existing) existing.remove();

  const icons = {
    success: "bi-check-circle-fill",
    error: "bi-exclamation-circle-fill",
    info: "bi-info-circle-fill",
  };

  const colors = {
    success: "#10B981",
    error: "#EF4444",
    info: "#2563EB",
  };

  const toast = document.createElement("div");
  toast.className = "toast-custom show";
  toast.innerHTML = `
    <i class="bi ${icons[type]}" style="color:${colors[type]};font-size:1.25rem"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  // Auto-cerrar después de 3 segundos
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Asigna color de tag según la categoría
 * @param {string} category - Nombre de la categoría
 * @returns {string} Clase CSS del tag
 */
function getCategoryTagClass(category) {
  const map = {
    Web: "tag-blue",
    Mobile: "tag-purple",
    Cloud: "tag-green",
    IA: "tag-orange",
    Security: "tag-red",
    DevOps: "tag-cyan",
  };
  return map[category] || "tag-blue";
}

/**
 * Asigna gradiente según la categoría
 * @param {string} category
 * @returns {string}
 */
function getCategoryGradient(category) {
  const map = {
    Web: "bg-gradient-blue",
    Mobile: "bg-gradient-purple",
    Cloud: "bg-gradient-green",
    IA: "bg-gradient-orange",
    Security: "bg-gradient-cyan",
    DevOps: "bg-gradient-indigo",
  };
  return map[category] || "bg-gradient-blue";
}

/**
 * Formatea precio con separadores de miles
 * @param {number} price
 * @returns {string}
 */
function formatPrice(price) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Genera el HTML de una tarjeta de servicio
 * @param {Object} service - Datos del servicio
 * @param {TechSphereApp} app - Instancia de la app
 * @returns {string} HTML de la tarjeta
 */
function renderServiceCard(service, app) {
  const isFav = app.isFavorite(service.id);
  const tagClass = getCategoryTagClass(service.categoria);

  // Determinar la URL de detalle según ubicación
  const isRoot = !window.location.pathname.includes("/pages/");
  const detailUrl = isRoot
    ? `pages/detalle.html?id=${service.id}`
    : `detalle.html?id=${service.id}`;

  return `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="service-card">
        <div class="card-img-wrapper">
          <img src="${service.imagen}" alt="${service.nombre}" 
               onerror="this.src='https://placehold.co/600x400/1E293B/94A3B8?text=${encodeURIComponent(service.nombre)}'">
          ${service.badge ? `<span class="card-badge-overlay">${service.badge}</span>` : ""}
          <button class="card-fav-btn ${isFav ? "active" : ""}" 
                  onclick="handleToggleFavorite(${service.id}, this)" 
                  title="${isFav ? "Quitar de favoritos" : "Agregar a favoritos"}">
            <i class="bi ${isFav ? "bi-heart-fill" : "bi-heart"}"></i>
          </button>
        </div>
        <div class="card-body-custom">
          <div class="mb-2">
            <span class="tag ${tagClass}">${service.categoria}</span>
            ${service.tecnologias.slice(0, 2).map((t) => `<span class="tag tag-green">${t}</span>`).join("")}
          </div>
          <h5 class="card-title">${service.nombre}</h5>
          <p class="card-text">${service.descripcionCorta}</p>
        </div>
        <div class="card-footer-custom">
          <div class="card-price">
            ${formatPrice(service.precio)} <small>${service.tipoPrecio.replace("USD / ", "/ ")}</small>
          </div>
          <a href="${detailUrl}" class="btn btn-sm btn-primary-custom">Ver más →</a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Maneja el toggle de favorito desde cualquier página
 * @param {number} serviceId
 * @param {HTMLElement} btn - Botón clickeado
 */
function handleToggleFavorite(serviceId, btn) {
  const added = app.toggleFavorite(serviceId);
  const icon = btn.querySelector("i");

  if (added) {
    btn.classList.add("active");
    icon.className = "bi bi-heart-fill";
    showToast("Servicio agregado a favoritos ♥", "success");
  } else {
    btn.classList.remove("active");
    icon.className = "bi bi-heart";
    showToast("Servicio removido de favoritos", "info");
  }
}

/**
 * Genera el HTML del navbar
 * @param {string} activePage - Página activa
 * @returns {string}
 */
function renderNavbar(activePage = "") {
  const isRoot = !window.location.pathname.includes("/pages/");
  const prefix = isRoot ? "" : "../";
  const pagesPrefix = isRoot ? "pages/" : "";

  return `
  <nav class="navbar navbar-expand-lg navbar-custom">
    <div class="container">
      <a class="navbar-brand" href="${prefix}index.html">
        <span class="logo-icon">⚡</span>
        TechSphere
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
              style="border-color:rgba(255,255,255,0.2)">
        <span class="navbar-toggler-icon" style="filter:invert(1)"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav mx-auto">
          <li class="nav-item">
            <a class="nav-link ${activePage === "home" ? "active" : ""}" href="${prefix}index.html">Inicio</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "servicios" ? "active" : ""}" href="${isRoot ? pagesPrefix : ""}servicios.html">Servicios</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "favoritos" ? "active" : ""}" href="${isRoot ? pagesPrefix : ""}favoritos.html">
              Favoritos <span class="fav-counter" style="display:none">0</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "gestion" ? "active" : ""}" href="${isRoot ? pagesPrefix : ""}gestion.html">Gestión</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "contacto" ? "active" : ""}" href="${isRoot ? pagesPrefix : ""}contacto.html">Contacto</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "nosotros" ? "active" : ""}" href="${isRoot ? pagesPrefix : ""}nosotros.html">Nosotros</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>`;
}

/**
 * Genera el HTML del footer
 * @returns {string}
 */
function renderFooter() {
  const isRoot = !window.location.pathname.includes("/pages/");
  const prefix = isRoot ? "pages/" : "";

  return `
  <footer class="footer-custom">
    <div class="container">
      <div class="row">
        <div class="col-lg-4 mb-4">
          <div class="navbar-brand text-white mb-2" style="font-family:'Space Grotesk',sans-serif;font-size:1.3rem;font-weight:700">
            <span class="logo-icon me-2">⚡</span> TechSphere
          </div>
          <p class="footer-brand-text">
            Plataforma líder en servicios tecnológicos digitales. Conectamos empresas con las mejores 
            soluciones de desarrollo, cloud e inteligencia artificial.
          </p>
          <div class="footer-social mt-3">
            <a href="#"><i class="bi bi-facebook"></i></a>
            <a href="#"><i class="bi bi-linkedin"></i></a>
            <a href="#"><i class="bi bi-twitter-x"></i></a>
            <a href="#"><i class="bi bi-github"></i></a>
          </div>
        </div>
        <div class="col-lg-2 col-md-4 mb-4">
          <h5>Servicios</h5>
          <ul>
            <li><a href="${prefix}servicios.html">Desarrollo Web</a></li>
            <li><a href="${prefix}servicios.html">Apps Móviles</a></li>
            <li><a href="${prefix}servicios.html">Cloud & DevOps</a></li>
            <li><a href="${prefix}servicios.html">IA & ML</a></li>
          </ul>
        </div>
        <div class="col-lg-2 col-md-4 mb-4">
          <h5>Compañía</h5>
          <ul>
            <li><a href="${prefix}nosotros.html">Sobre Nosotros</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="${prefix}contacto.html">Contacto</a></li>
          </ul>
        </div>
        <div class="col-lg-4 col-md-4 mb-4">
          <h5>Contacto</h5>
          <ul>
            <li><a href="mailto:info@techsphere.co">📧 info@techsphere.co</a></li>
            <li><a href="tel:+573001234567">📞 +57 300 123 4567</a></li>
            <li><a href="#">📍 Medellín, Colombia</a></li>
            <li><a href="#">⏰ Lun-Vie 8am - 6pm</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom d-flex flex-wrap justify-content-between">
        <span>© 2026 TechSphere. Todos los derechos reservados.</span>
        <div>
          <a href="#" class="text-muted me-3">Política de Privacidad</a>
          <a href="#" class="text-muted">Términos de Uso</a>
        </div>
      </div>
    </div>
  </footer>`;
}

// --- Instancia Global ---
const app = new TechSphereApp();
