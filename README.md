# 🎮 Web-Vault-Channels

[🇪🇸 Español](#-español) | [🇬🇧 English](#-english)

---

## 🇪🇸 Español

**Web-Vault-Channels** es un lanzador web interactivo inspirado en la clásica interfaz del **Menú de Nintendo Wii**, diseñado para recopilar y ejecutar puertos de juegos retro, aplicaciones WebAssembly y experiencias WebGL directamente en tu navegador sin necesidad de descargas[cite: 11].

### 🚀 Características principales
- **Estética Wii Menu:** Canales ordenados en bloques interactivos con animaciones, efectos de sonido y reloj en tiempo real.
- **Multilenguaje (ES / EN):** Cambio dinámico de idioma en toda la interfaz y descripciones de los juegos[cite: 1].
- **Música de fondo y control de volumen:** Reproductor de audio integrado con pausa automática al cambiar de pestaña y deslizador de volumen ajustable[cite: 1].
- **Buscador y filtros desplegables:** Filtrado en tiempo real por títulos, creadores o categorías[cite: 11].
- **100% Responsive:** Diseñado para adaptarse de manera fluida a computadoras, tablets y teléfonos móviles[cite: 1].
- **Creado por:** TvConIdeas[cite: 8].

---

## 🇬🇧 English

**Web-Vault-Channels** is an interactive web launcher inspired by the classic **Nintendo Wii Menu** interface, designed to host and play retro gaming ports, WebAssembly classics, and WebGL web apps directly in your browser with zero downloads[cite: 11].

### 🚀 Key Features
- **Wii Menu Aesthetics:** Channels organized in interactive blocks featuring custom sounds, smooth animations, and a live system clock.
- **Multi-language (ES / EN):** Dynamic language switching across the entire UI and game descriptions[cite: 1].
- **Background Music & Volume Control:** Built-in audio player with automatic pause on tab switch and an adjustable volume slider[cite: 1].
- **Real-time Search & Filters:** Instant filtering by game titles, creators, or genres[cite: 11].
- **100% Responsive:** Fully optimized to run smoothly across desktops, tablets, and mobile devices[cite: 1].
- **Created by:** TvConIdeas[cite: 8].

---

## 🤝 Cómo agregar un nuevo juego / How to add a new game

1. Abre el archivo `games.json`[cite: 11].
2. Agrega una nueva entrada siguiendo la estructura oficial con soporte para ambos idiomas:
```json
{
  "id": "tu-juego",
  "title": "Nombre del Juego",
  "category": "action/sports/retro/multiplayer",
  "creator": "Creador / Autor",
  "image": "assets/tu-juego.jpg",
  "es": { "description": "Descripción en español.", "genre": "Acción" },
  "en": { "description": "Description in English.", "genre": "Action" },
  "url": "[https://link-al-juego.com](https://link-al-juego.com)"
}
