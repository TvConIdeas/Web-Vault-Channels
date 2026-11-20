// ! ------ CONFIGURACIÓN Y CONSTANTES ------ //
const CONFIG = {
    storageLang: "wvc_lang",
    storageTheme: "wvc_theme",
    storageSort: "wvc_sort",
    dataUrl: "games.json",
    fallbackImage: "assets/Error-Img.svg",
    swipeThreshold: 50
};

// ? ------ Referencias del DOM ------ //
const DOM = {
    gamesGrid: document.getElementById("gamesGrid"),
    menuContainer: document.getElementById("menuContainer"),
    searchBox: document.getElementById("searchBox"),
    searchToggleBtn: document.getElementById("searchToggleBtn"),
    searchInput: document.getElementById("searchInput"),
    clearSearchBtn: document.getElementById("clearSearchBtn"),
    dropdownBox: document.getElementById("dropdownBox"),
    genreToggleBtn: document.getElementById("genreToggleBtn"),
    genreSelect: document.getElementById("genreSelect"),
    sortBox: document.getElementById("sortBox"),
    sortToggleBtn: document.getElementById("sortToggleBtn"),
    sortSelect: document.getElementById("sortSelect"),
    shuffleBtn: document.getElementById("shuffleBtn"),
    resetFiltersBtn: document.getElementById("resetFiltersBtn"),
    channelsCounter: document.getElementById("channelsCounter"),
    langButtons: document.querySelectorAll(".lang-btn"),
    paginationDots: document.getElementById("paginationDots"),
    prevPageBtn: document.getElementById("prevPageBtn"),
    nextPageBtn: document.getElementById("nextPageBtn"),
    wiiClock: document.getElementById("wiiClock"),
    wiiDate: document.getElementById("wiiDate"),
    toggleThemeBtn: document.getElementById("toggleThemeBtn"),
    themeIcon: document.getElementById("themeIcon"),
    bgMusic: document.getElementById("bgMusic"),
    toggleAudioBtn: document.getElementById("toggleAudioBtn"),
    audioIcon: document.getElementById("audioIcon"),
    volumeSlider: document.getElementById("volumeSlider"),
    volumeContainer: document.getElementById("toggleAudioBtn")?.closest(".wii-volume-container"),
    gameModal: document.getElementById("gameModal"),
    modalBody: document.getElementById("modalBody"),
    closeModalBtn: document.getElementById("closeModalBtn"),
    tvPlayModal: document.getElementById("tvPlayModal"),
    tvChCode: document.getElementById("tvChCode"),
    tvPlayTitle: document.getElementById("tvPlayTitle"),
    tvGameIframe: document.getElementById("tvGameIframe"),
    tvReloadBtn: document.getElementById("tvReloadBtn"),
    tvFullscreenBtn: document.getElementById("tvFullscreenBtn"),
    tvExternalBtn: document.getElementById("tvExternalBtn"),
    tvCloseBtn: document.getElementById("tvCloseBtn"),
    tvBackMenuBtn: document.getElementById("tvBackMenuBtn"),
    tvScreenWrap: document.getElementById("tvScreenWrap"),
    tvHintText: document.getElementById("tvHintText")
};

// ? ------ Estado de la aplicación ------ //
const ESTADO = {
    gamesData: [],
    shuffledPool: [],
    filteredGames: [],
    currentLang: localStorage.getItem(CONFIG.storageLang) === "en" ? "en" : "es",
    currentSort: localStorage.getItem(CONFIG.storageSort) || "random",
    currentPage: 0,
    itemsPerPage: 12,
    isMusicPlaying: false,
    pausedByGame: false,
    activeTvGame: null
};

// ! ------ DICCIONARIO DE INTERFAZ (ES / EN) ------ //
const TRADUCCIONES = {
    es: {
        searchPlaceholder: "Buscar canal...",
        creatorLabel: "Creador",
        genreLabel: "Género",
        playInTv: "Jugar en TV",
        openExternal: "Abrir externa",
        optAll: "Todos los géneros",
        optAction: "Acción",
        optSports: "Deportes",
        optRetro: "Retro",
        optMulti: "Multijugador",
        optStrategy: "Estrategia",
        sortRandom: "Orden: Aleatorio",
        sortPopular: "Más populares",
        sortAz: "Alfabético (A - Z)",
        sortZa: "Alfabético (Z - A)",
        shuffleTitle: "Mezclar orden aleatorio",
        noResults: "No se encontraron canales.",
        resetFilters: "Limpiar filtros",
        channelsCount: (n) => `${n} ${n === 1 ? "canal" : "canales"}`,
        tvHint: 'Si el juego no carga dentro de la TV por seguridad del sitio, usá "Abrir externa".',
        localeDate: "es-AR"
    },
    en: {
        searchPlaceholder: "Search channel...",
        creatorLabel: "Creator",
        genreLabel: "Genre",
        playInTv: "Play on TV",
        openExternal: "Open external",
        optAll: "All genres",
        optAction: "Action",
        optSports: "Sports",
        optRetro: "Retro",
        optMulti: "Multiplayer",
        optStrategy: "Strategy",
        sortRandom: "Sort: Random",
        sortPopular: "Most popular",
        sortAz: "Alphabetical (A - Z)",
        sortZa: "Alphabetical (Z - A)",
        shuffleTitle: "Shuffle random order",
        noResults: "No channels found.",
        resetFilters: "Reset filters",
        channelsCount: (n) => `${n} ${n === 1 ? "channel" : "channels"}`,
        tvHint: 'If the game does not load inside the TV due to site security, use "Open external".',
        localeDate: "en-US"
    }
};

// ? ------ Normalización de texto para búsquedas sin acentos ------ //
function normalizarTexto(texto) {
    return (texto || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}