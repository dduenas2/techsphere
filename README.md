# TechSphere — Plataforma de Servicios Digitales

## Descripción
Aplicación web tipo catálogo de servicios tecnológicos digitales desarrollada con HTML5, CSS3, JavaScript (ES6+) y Bootstrap 5.

## Demo
- **Repositorio:** [GitHub](https://github.com/dduenas2/techsphere)
- **Despliegue:** [GitHub Pages](https://dduenas2.github.io/techsphere/)

## Estructura del Proyecto
```
techsphere/
├── index.html              # Página principal (Home)
├── css/
│   └── styles.css          # Estilos principales
├── js/
│   └── app.js              # Lógica principal de la aplicación
├── data/
│   └── services.json       # Datos de servicios (JSON local)
├── pages/
│   ├── servicios.html      # Catálogo de servicios
│   ├── detalle.html        # Detalle del servicio
│   ├── favoritos.html      # Gestión de favoritos
│   ├── contacto.html       # Formulario de contacto
│   ├── gestion.html        # CRUD de servicios
│   └── nosotros.html       # Sobre nosotros
└── README.md
```

## Tecnologías
- HTML5
- CSS3 (Variables CSS, Flexbox, Grid)
- JavaScript ES6+ (Clases, Async/Await, Fetch API)
- Bootstrap 5.3
- Bootstrap Icons
- localStorage (persistencia de favoritos)
- JSON local (datos de servicios)

## Funcionalidades
1. **Catálogo dinámico**: Renderizado de servicios desde JSON con filtros y paginación.
2. **Detalle de servicio**: Vista completa con características y servicios relacionados.
3. **Favoritos**: Guardar/eliminar con persistencia en localStorage.
4. **Contacto**: Formulario con validaciones en tiempo real.
5. **CRUD**: Crear y eliminar servicios (datos en localStorage).
6. **Responsive**: Adaptable a móvil, tablet y escritorio.

## Ejecución Local
Abrir `index.html` en un navegador, o usar un servidor local:
```bash
# Con Python
python3 -m http.server 8080

# Con Node.js
npx serve .

# Con VS Code
# Instalar extensión "Live Server" y hacer clic en "Go Live"
```

## Autor
David Alejandro Dueñas Castrillon - Módulo Desarrollo de Front-End - 2026
