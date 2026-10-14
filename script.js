let gamesData = [];
let filteredGames = [];
let currentLang = 'es';
let currentPage = 0;
const itemsPerPage = 12;

const translations = {
    es: {
        searchPlaceholder: "Buscar canal...",
        creatorLabel: "Creador",
        genreLabel: "Género",
        startChannel: "Iniciar Canal",
        optAll: "Todos los géneros",
        optAction: "Acción",
        optSports: "Deportes",
        optRetro: "Retro",
        optMulti: "Multijugador",
        noResults: "No se encontraron canales."
    },
    en: {
        searchPlaceholder: "Search channel...",
        creatorLabel: "Creator",
        genreLabel: "Genre",
        startChannel: "Start Channel",
        optAll: "All genres",
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

// Control de Música y Volumen por Clic
const bgMusic = document.getElementById('bgMusic');
const toggleAudioBtn = document.getElementById('toggleAudioBtn');
const audioIcon = document.getElementById('audioIcon');
const volumeSlider = document.getElementById('volumeSlider');
const volumeContainer = toggleAudioBtn.closest('.wii-volume-container');
let isMusicPlaying = false;

bgMusic.volume = 0.5;

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

// Reloj
function updateClock() {
    const now = new Date();
    wiiClock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
setInterval(updateClock, 1000);
updateClock();

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

function renderGrid() {
    gamesGrid.innerHTML = '';
    paginationDots.innerHTML = '';

    const totalPages = Math.ceil(filteredGames.length / itemsPerPage) || 1;
    if (currentPage >= totalPages) currentPage = 0;

    prevPageBtn.disabled = currentPage === 0;
    nextPageBtn.disabled = currentPage >= totalPages - 1;

    const start = currentPage * itemsPerPage;
    const paginatedGames = filteredGames.slice(start, start + itemsPerPage);

    if (paginatedGames.length === 0) {
        gamesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--wii-text-muted); font-size: 1.2rem; padding: 4rem;">${translations[currentLang].noResults}</p>`;
        return;
    }

    paginatedGames.forEach(game => {
        const channel = document.createElement('div');
        channel.classList.add('wii-channel');
        
        const imgSrc = game.image ? game.image : 'assets/Error-Img.jpg';
        
        channel.innerHTML = `
            <div class="wii-channel-img-container">
                <img src="${imgSrc}" alt="${game.title}" class="wii-channel-img" onerror="this.src='assets/Error-Img.jpg'">
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
            currentPage = i;
            renderGrid();
        });
        paginationDots.appendChild(dot);
    }
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 0) { currentPage--; renderGrid(); }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
    if (currentPage < totalPages - 1) { currentPage++; renderGrid(); }
});

function openWiiModal(game) {
    const langData = game[currentLang] || game.es;
    const imgSrc = game.image ? game.image : 'assets/Error-Img.jpg';

    modalBody.innerHTML = `
        <img src="${imgSrc}" alt="${game.title}" class="modal-banner-img" onerror="this.src='assets/Error-Img.jpg'">
        <h2>${game.title}</h2>
        <p class="meta" style="font-size:0.95rem;">${translations[currentLang].creatorLabel}: <strong>${game.creator}</strong></p>
        <p class="meta" style="font-size:0.95rem;">${translations[currentLang].genreLabel}: <strong style="text-transform: uppercase;">${langData.genre}</strong></p>
        <p class="desc" style="font-size:0.95rem; background:#f4f4f4; padding:0.8rem; border-radius:10px; border:1px solid #ddd;">${langData.description}</p>
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