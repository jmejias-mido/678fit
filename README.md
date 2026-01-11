# 678FIT - Landing Page Gym Boutique 🏋️‍♀️✨

Bienvenido al repositorio del sitio web de **678FIT**. Esta es una landing page moderna, responsiva y de alta conversión diseñada específicamente para un gimnasio boutique enfocado en entrenamiento de fuerza semi-personalizado para mujeres profesionales.

## 🚀 Descripción del Proyecto

Este proyecto es una página de aterrizaje (Landing Page) "Single Page Application" (SPA) estática. Su objetivo principal es captar leads ofreciendo una clase de prueba gratuita. El diseño prioriza una estética premium, velocidad de carga y una experiencia de usuario fluida con animaciones sutiles.

### ✨ Características Principales

*   **Diseño Totalmente Responsivo**: Se adapta perfectamente a móviles, tablets y escritorio.
*   **Modo Claro / Oscuro 🌗**: Incluye un toggle para cambiar el tema, guardando la preferencia del usuario en `localStorage`.
*   **Animaciones Modernas**:
    *   Efecto Parallax en el Hero.
    *   Aparición gradual de elementos al hacer scroll (Scroll Reveal) usando `Intersection Observer`.
*   **Componentes Interactivos**:
    *   Menú de navegación móvil.
    *   Modal (Pop-up) para reservar clases con validación básica.
*   **Sin Dependencias Pesadas**: Construido con Vanilla JS y CSS puro para máximo rendimiento.

## 🛠 Tecnologías Utilizadas

*   **HTML5**: Estructura semántica.
*   **CSS3**:
    *   Variables CSS (Custom Properties) para fácil tematización.
    *   Flexbox y CSS Grid para layouts.
    *   Media Queries para diseño adaptativo.
*   **JavaScript (Vanilla)**: Lógica del DOM, animaciones y manejo de estado del tema.
*   **Librerías Externas (CDN)**:
    *   [Phosphor Icons](https://phosphoricons.com/): Iconografía ligera y moderna.
    *   [Google Fonts](https://fonts.google.com/): Tipografía 'Outfit'.

## 📂 Estructura del Proyecto

```text
/
├── index.html          # Estructura principal de la página
├── styles.css          # Estilos globales, temas y componentes
├── script.js           # Lógica: animaciones, modal, tema
├── assets/             
│   └── images/         # Logotipos y recursos gráficos
└── README.md           # Documentación del proyecto
```

## 🔧 Instalación y Uso

1.  **Clonar o Descargar**:
    Descarga los archivos de este repositorio en tu computadora.

2.  **Ejecutar**:
    Simplemente abre el archivo `index.html` en tu navegador web de preferencia (Chrome, Firefox, Safari, etc.).
    
    *Nota: Para una mejor experiencia de desarrollo, se recomienda usar una extensión como "Live Server" en VS Code.*

## 🎨 Personalización

### Cambiar Colores
Abre `styles.css` y modifica las variables en el bloque `:root`:

```css
:root {
    --color-primary: #8b5cf6; /* Cambiar color principal */
    --font-main: 'Outfit', sans-serif; /* Cambiar tipografía */
}
```

### Imágenes
Reemplaza las imágenes en la carpeta `assets/images/` manteniendo los nombres de archivo o actualizando las rutas en el HTML/CSS.

## 📄 Licencia

Este proyecto es de uso libre para propósitos educativos o comerciales propios.

---
Desarrollado con 💪 para 678FIT.