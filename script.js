let gamesData = [];
let filteredGames = [];
let currentLang = 'es';
let currentPage = 0;
let itemsPerPage = 12;

const translations = {
    es: {
        searchPlaceholder: "Buscar...",
        creatorLabel: "Creador",
        genreLabel: "Género",
        startChannel: "Iniciar Canal",
        optAll: "Todos",
        optAction: "Acción",
        optSports: "Deportes",
        optRetro: "Retro",
        optMulti: "Multijugador",
        noResults: "No se encontraron canales."
    },
    en: {
        searchPlaceholder: "Search...",
        creatorLabel: "Creator",
        genreLabel: "Genre",
        startChannel: "Start Channel",
        optAll: "All",
        optAction: "Action",
        optSports: "Sports",
        optRetro: "Retro",
        optMulti: "Multiplayer",
        noResults: "No channels found."
    }
};

const gamesGrid = document.getElementById('gamesGrid');
const searchInput = document.getElementById('searchInput');
const genreSelect = document.getElementById('genreSelect');
const langButtons = document.querySelectorAll('.lang-btn');
const paginationDots = document.getElementById('paginationDots');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');

const gameModal = document.getElementById('gameModal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModalBtn');
const wiiClock = document.getElementById('wiiClock');

// Elementos expandibles en móviles
const searchBox = document.getElementById('searchBox');
const searchToggleBtn = document.getElementById('searchToggleBtn');
const dropdownBox = document.getElementById('dropdownBox');
const genreToggleBtn = document.getElementById('genreToggleBtn');

// Modo Oscuro / Claro
const toggleThemeBtn = document.getElementById('toggleThemeBtn');
const themeIcon = document.getElementById('themeIcon');

// Control de Audio
const bgMusic = document.getElementById('bgMusic');
const toggleAudioBtn = document.getElementById('toggleAudioBtn');
const audioIcon = document.getElementById('audioIcon');
const volumeSlider = document.getElementById('volumeSlider');
const volumeContainer = toggleAudioBtn.closest('.wii-volume-container');
let isMusicPlaying = false;

bgMusic.volume = 0.5;

// Gestionar Tema Oscuro / Claro con persistencia
if (localStorage.getItem('wii_theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.className = 'fa-solid fa-sun';
}

toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.className = 'fa-solid fa-sun';
        localStorage.setItem('wii_theme', 'dark');
    } else {
        themeIcon.className = 'fa-solid fa-moon';
        localStorage.setItem('wii_theme', 'light');
    }
});

// Configurar items por página según el tamaño de la pantalla
function updateItemsPerPage() {
    if (window.innerWidth <= 680) {
        itemsPerPage = 6;
    } else {
        itemsPerPage = 12;
    }
}
window.addEventListener('resize', () => {
    const prevItems = itemsPerPage;
    updateItemsPerPage();
    if (prevItems !== itemsPerPage) {
        renderGrid();
    }
});
updateItemsPerPage();

// Reloj
function updateClock() {
    const now = new Date();
    wiiClock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
setInterval(updateClock, 1000);
updateClock();

// Control de Audio
toggleAudioBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    volumeContainer.classList.toggle('active');
    
    if (!isMusicPlaying) {
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            audioIcon.className = 'fa-solid fa-volume-high';
        }).catch(err => console.log("Audio bloqueado:", err));
    }
});

document.addEventListener('click', (e) => {
    if (!volumeContainer.contains(e.target)) {
        volumeContainer.classList.remove('active');
    }
});

volumeSlider.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    bgMusic.volume = vol;
    if (vol === 0) {
        audioIcon.className = 'fa-solid fa-volume-off';
        isMusicPlaying = false;
        bgMusic.pause();
    } else {
        audioIcon.className = 'fa-solid fa-volume-high';
        if (!isMusicPlaying) {
            bgMusic.play();
            isMusicPlaying = true;
        }
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden && isMusicPlaying) {
        bgMusic.pause();
    } else if (!document.hidden && isMusicPlaying) {
        bgMusic.play();
    }
});

// Botones expandibles en celular
searchToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchBox.classList.toggle('expanded');
    dropdownBox.classList.remove('expanded');
    if (searchBox.classList.contains('expanded')) {
        searchInput.focus();
    }
});

genreToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownBox.classList.toggle('expanded');
    searchBox.classList.remove('expanded');
});

document.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target)) searchBox.classList.remove('expanded');
    if (!dropdownBox.contains(e.target)) dropdownBox.classList.remove('expanded');
});

// Carga de datos
document.addEventListener('DOMContentLoaded', () => {
    fetch('games.json')
        .then(res => res.json())
        .then(data => {
            gamesData = data;
            filteredGames = data;
            renderGrid();
        })
        .catch(err => console.error("Error al cargar games.json:", err));
});

// Renderizado con Animaciones
function renderGrid(direction = '') {
    if (direction) {
        gamesGrid.className = 'wii-grid ' + (direction === 'next' ? 'slide-left' : 'slide-right');
        setTimeout(() => {
            updateGridContent();
            gamesGrid.className = 'wii-grid ' + (direction === 'next' ? 'slide-in-right' : 'slide-in-left');
        }, 200);
    } else {
        updateGridContent();
    }
}

function updateGridContent() {
    gamesGrid.innerHTML = '';
    paginationDots.innerHTML = '';

    const totalPages = Math.ceil(filteredGames.length / itemsPerPage) || 1;
    if (currentPage >= totalPages) currentPage = 0;

    prevPageBtn.disabled = currentPage === 0;
    nextPageBtn.disabled = currentPage >= totalPages - 1;

    const start = currentPage * itemsPerPage;
    const paginatedGames = filteredGames.slice(start, start + itemsPerPage);

    if (paginatedGames.length === 0) {
        gamesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--wii-text-muted); font-size: 1.1rem; padding: 4rem;">${translations[currentLang].noResults}</p>`;
        return;
    }

    paginatedGames.forEach(game => {
        const channel = document.createElement('div');
        channel.classList.add('wii-channel');
        
        const imgSrc = game.image ? game.image : 'assets/Error-Img.svg';
        
        channel.innerHTML = `
            <div class="wii-channel-img-container">
                <img src="${imgSrc}" alt="${game.title}" class="wii-channel-img" onerror="this.src='assets/Error-Img.svg'">
            </div>
            <div class="wii-channel-title-bar">
                <h3>${game.title}</h3>
            </div>
        `;
        
        channel.addEventListener('click', () => openWiiModal(game));
        gamesGrid.appendChild(channel);
    });

    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === currentPage) dot.classList.add('active');
        dot.addEventListener('click', () => {
            const dir = i > currentPage ? 'next' : 'prev';
            currentPage = i;
            renderGrid(dir);
        });
        paginationDots.appendChild(dot);
    }
}

// Navegación con Botones
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        renderGrid('prev');
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
    if (currentPage < totalPages - 1) {
        currentPage++;
        renderGrid('next');
    }
});

// Soporte para Gestos Táctiles (Swipe Gesture)
let touchStartX = 0;
let touchEndX = 0;
const menuContainer = document.getElementById('menuContainer');

menuContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

menuContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const totalPages = Math.ceil(filteredGames.length / itemsPerPage);

    if (touchStartX - touchEndX > swipeThreshold) {
        if (currentPage < totalPages - 1) {
            currentPage++;
            renderGrid('next');
        }
    } else if (touchEndX - touchStartX > swipeThreshold) {
        if (currentPage > 0) {
            currentPage--;
            renderGrid('prev');
        }
    }
}

// Ventana Modal
function openWiiModal(game) {
    const langData = game[currentLang] || game.es;
    const imgSrc = game.image ? game.image : 'assets/Error-Img.svg';

    modalBody.innerHTML = `
        <img src="${imgSrc}" alt="${game.title}" class="modal-banner-img" onerror="this.src='assets/Error-Img.svg'">
        <h2>${game.title}</h2>
        <p class="meta" style="font-size:0.9rem;">${translations[currentLang].creatorLabel}: <strong>${game.creator}</strong></p>
        <p class="meta" style="font-size:0.9rem;">${translations[currentLang].genreLabel}: <strong style="text-transform: uppercase;">${langData.genre}</strong></p>
        <p class="desc" style="font-size:0.88rem; background:var(--wii-modal-desc); padding:0.7rem; border-radius:10px; border:1px solid var(--wii-border);">${langData.description}</p>
        <div>
            <a href="${game.url}" target="_blank" rel="noopener" class="start-channel-btn">
                <i class="fa-solid fa-play"></i> ${translations[currentLang].startChannel}
            </a>
        </div>
    `;
    gameModal.classList.add('active');
}

closeModalBtn.addEventListener('click', () => gameModal.classList.remove('active'));
gameModal.addEventListener('click', (e) => { if (e.target === gameModal) gameModal.classList.remove('active'); });

// Idioma y Filtros
langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        langButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLang = btn.dataset.lang;
        
        searchInput.placeholder = translations[currentLang].searchPlaceholder;
        document.getElementById('opt-all').textContent = translations[currentLang].optAll;
        document.getElementById('opt-action').textContent = translations[currentLang].optAction;
        document.getElementById('opt-sports').textContent = translations[currentLang].optSports;
        document.getElementById('opt-retro').textContent = translations[currentLang].optRetro;
        document.getElementById('opt-multiplayer').textContent = translations[currentLang].optMulti;

        filterGames(searchInput.value.toLowerCase(), genreSelect.value);
    });
});

searchInput.addEventListener('input', (e) => {
    currentPage = 0;
    filterGames(e.target.value.toLowerCase(), genreSelect.value);
});

genreSelect.addEventListener('change', (e) => {
    currentPage = 0;
    filterGames(searchInput.value.toLowerCase(), e.target.value);
});

function filterGames(query, category) {
    filteredGames = gamesData.filter(game => {
        const langData = game[currentLang] || game.es;
        const matchesSearch = game.title.toLowerCase().includes(query) || 
                              game.creator.toLowerCase().includes(query) ||
                              langData.description.toLowerCase().includes(query);
        const matchesCat = category === 'all' || game.category.toLowerCase() === category;
        return matchesSearch && matchesCat;
    });
    renderGrid();
}