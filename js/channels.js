// ! ------ ORDENAMIENTO ALEATORIO (FISHER-YATES) Y POR CRITERIO ------ //
function generarPoolAleatorio(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function ordenarCanales(lista) {
    const modo = ESTADO.currentSort;

    if (modo === "random") {
        const ordenMap = new Map(ESTADO.shuffledPool.map((g, idx) => [g.id, idx]));
        return [...lista].sort((a, b) => (ordenMap.get(a.id) ?? 0) - (ordenMap.get(b.id) ?? 0));
    }

    if (modo === "popular") {
        return [...lista].sort((a, b) => {
            const popA = typeof a.popularity === "number" ? a.popularity : (a.popular ? 85 : 50);
            const popB = typeof b.popularity === "number" ? b.popularity : (b.popular ? 85 : 50);
            if (popB !== popA) return popB - popA;
            return a.title.localeCompare(b.title, ESTADO.currentLang);
        });
    }

    if (modo === "az") {
        return [...lista].sort((a, b) => a.title.localeCompare(b.title, ESTADO.currentLang, { sensitivity: "base" }));
    }

    if (modo === "za") {
        return [...lista].sort((a, b) => b.title.localeCompare(a.title, ESTADO.currentLang, { sensitivity: "base" }));
    }

    return [...lista];
}

// ? ------ Portada estilo Canal Wii generada al vuelo si no hay imagen o falla ------ //
function generarPortadaWiiAuto(game) {
    const paletas = {
        action: ["#184e2e", "#45b368"],
        sports: ["#14496a", "#38bdf8"],
        retro: ["#4d2563", "#c084fc"],
        multiplayer: ["#782910", "#fb923c"],
        strategy: ["#1c385c", "#60a5fa"]
    };

    const [colorA, colorB] = paletas[(game.category || "").toLowerCase()] || ["#243042", "#45b368"];
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 270;
    const ctx = canvas.getContext("2d");

    if (!ctx) return CONFIG.fallbackImage;

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, colorA);
    grad.addColorStop(1, colorB);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // * ------ Brillo superior tipo botón Wii ------ //
    ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);

    // * ------ Título del juego centrado ------ //
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 26px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const titulo = game.title || "WII CHANNEL";
    if (titulo.length > 22) {
        const mitad = titulo.lastIndexOf(" ", 22);
        const corte = mitad > 6 ? mitad : 22;
        ctx.fillText(titulo.slice(0, corte).trim(), canvas.width / 2, canvas.height / 2 - 14);
        ctx.fillText(titulo.slice(corte).trim().slice(0, 24), canvas.width / 2, canvas.height / 2 + 20);
    } else {
        ctx.fillText(titulo, canvas.width / 2, canvas.height / 2 + 4);
    }

    return canvas.toDataURL("image/png");
}

function resolverImagenJuego(game) {
    const autoImg = generarPortadaWiiAuto(game);
    const srcInicial = game.image && game.image.trim() !== "" ? game.image.trim() : autoImg;
    return { srcInicial, autoImg };
}

// ! ------ FILTROS Y BÚSQUEDA ------ //
function filtrarCanales() {
    const query = normalizarTexto(DOM.searchInput?.value || "");
    const category = DOM.genreSelect?.value || "all";

    if (DOM.clearSearchBtn) DOM.clearSearchBtn.hidden = query.length === 0;

    const hayFiltroActivo = query.length > 0 || category !== "all" || ESTADO.currentSort !== "random";
    if (DOM.resetFiltersBtn) DOM.resetFiltersBtn.hidden = !hayFiltroActivo;

    const filtrados = ESTADO.gamesData.filter(game => {
        const langData = game[ESTADO.currentLang] || game.es || {};
        const tagsTexto = Array.isArray(game.tags) ? game.tags.join(" ") : "";

        const matchTexto =
            !query ||
            normalizarTexto(game.title).includes(query) ||
            normalizarTexto(game.creator).includes(query) ||
            normalizarTexto(langData.description).includes(query) ||
            normalizarTexto(langData.genre).includes(query) ||
            normalizarTexto(tagsTexto).includes(query);

        const matchCategoria = category === "all" || normalizarTexto(game.category) === normalizarTexto(category);
        return matchTexto && matchCategoria;
    });

    ESTADO.filteredGames = ordenarCanales(filtrados);

    if (DOM.channelsCounter) {
        DOM.channelsCounter.textContent = TRADUCCIONES[ESTADO.currentLang].channelsCount(ESTADO.filteredGames.length);
    }

    renderGrid();
}

function limpiarFiltros() {
    if (DOM.searchInput) DOM.searchInput.value = "";
    if (DOM.genreSelect) DOM.genreSelect.value = "all";
    ESTADO.currentSort = "random";
    localStorage.setItem(CONFIG.storageSort, "random");
    if (DOM.sortSelect) DOM.sortSelect.value = "random";
    ESTADO.shuffledPool = generarPoolAleatorio(ESTADO.gamesData);
    ESTADO.currentPage = 0;
    filtrarCanales();
}

// ! ------ PAGINACIÓN, GRILLA Y GESTOS TÁCTILES ------ //
function actualizarItemsPorPagina() {
    ESTADO.itemsPerPage = window.innerWidth <= 680 ? 10 : 12;
}

function updateGridContent() {
    if (!DOM.gamesGrid || !DOM.paginationDots) return;
    DOM.gamesGrid.innerHTML = "";
    DOM.paginationDots.innerHTML = "";

    const totalPages = Math.ceil(ESTADO.filteredGames.length / ESTADO.itemsPerPage) || 1;
    if (ESTADO.currentPage >= totalPages) ESTADO.currentPage = 0;

    if (DOM.prevPageBtn) DOM.prevPageBtn.disabled = ESTADO.currentPage === 0;
    if (DOM.nextPageBtn) DOM.nextPageBtn.disabled = ESTADO.currentPage >= totalPages - 1;

    const start = ESTADO.currentPage * ESTADO.itemsPerPage;
    const paginatedGames = ESTADO.filteredGames.slice(start, start + ESTADO.itemsPerPage);

    if (paginatedGames.length === 0) {
        DOM.gamesGrid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--wii-text-muted); font-size: 1.1rem; font-weight: 700; padding: 3rem 1rem;">${TRADUCCIONES[ESTADO.currentLang].noResults}</p>`;
        return;
    }

    paginatedGames.forEach(game => {
        const channel = document.createElement("div");
        channel.className = "wii-channel";
        channel.tabIndex = 0;
        channel.setAttribute("role", "button");
        channel.setAttribute("aria-label", game.title);

        const { srcInicial, autoImg } = resolverImagenJuego(game);

        channel.innerHTML = `
            <div class="wii-channel-img-container">
                <img src="${srcInicial}" alt="${game.title}" class="wii-channel-img" loading="lazy" onerror="if(!this.dataset.auto){this.dataset.auto='1';this.src='${autoImg}';}else{this.src='${CONFIG.fallbackImage}';}">
            </div>
            <div class="wii-channel-title-bar">
                <h3>${game.title}</h3>
            </div>
        `;

        channel.addEventListener("click", () => abrirModalCanal(game));
        channel.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                abrirModalCanal(game);
            }
        });

        DOM.gamesGrid.appendChild(channel);
    });

    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = `dot${i === ESTADO.currentPage ? " active" : ""}`;
        dot.setAttribute("aria-label", `Página ${i + 1}`);
        dot.addEventListener("click", () => {
            if (i === ESTADO.currentPage) return;
            const dir = i > ESTADO.currentPage ? "next" : "prev";
            ESTADO.currentPage = i;
            renderGrid(dir);
        });
        DOM.paginationDots.appendChild(dot);
    }
}

function renderGrid(direction = "") {
    if (!DOM.gamesGrid) return;
    if (direction) {
        DOM.gamesGrid.className = `wii-grid ${direction === "next" ? "slide-left" : "slide-right"}`;
        setTimeout(() => {
            updateGridContent();
            DOM.gamesGrid.className = `wii-grid ${direction === "next" ? "slide-in-right" : "slide-in-left"}`;
        }, 180);
    } else {
        updateGridContent();
    }
}

function inicializarNavegacion() {
    DOM.prevPageBtn?.addEventListener("click", () => {
        if (ESTADO.currentPage > 0) {
            ESTADO.currentPage--;
            renderGrid("prev");
        }
    });

    DOM.nextPageBtn?.addEventListener("click", () => {
        const totalPages = Math.ceil(ESTADO.filteredGames.length / ESTADO.itemsPerPage);
        if (ESTADO.currentPage < totalPages - 1) {
            ESTADO.currentPage++;
            renderGrid("next");
        }
    });

    let touchStartX = 0;
    let touchEndX = 0;

    DOM.menuContainer?.addEventListener("touchstart", e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    DOM.menuContainer?.addEventListener("touchend", e => {
        touchEndX = e.changedTouches[0].screenX;
        const deltaX = touchStartX - touchEndX;
        const totalPages = Math.ceil(ESTADO.filteredGames.length / ESTADO.itemsPerPage);

        if (deltaX > CONFIG.swipeThreshold && ESTADO.currentPage < totalPages - 1) {
            ESTADO.currentPage++;
            renderGrid("next");
        } else if (deltaX < -CONFIG.swipeThreshold && ESTADO.currentPage > 0) {
            ESTADO.currentPage--;
            renderGrid("prev");
        }
    }, { passive: true });

    window.addEventListener("resize", () => {
        const anterior = ESTADO.itemsPerPage;
        actualizarItemsPorPagina();
        if (anterior !== ESTADO.itemsPerPage) renderGrid();
    });
}

// ! ------ MODALES DE DETALLE Y PANTALLA DE TV ------ //
function abrirModalCanal(game) {
    if (!DOM.gameModal || !DOM.modalBody) return;
    const dict = TRADUCCIONES[ESTADO.currentLang];
    const langData = game[ESTADO.currentLang] || game.es || {};
    const { srcInicial, autoImg } = resolverImagenJuego(game);

    DOM.modalBody.innerHTML = `
        <img src="${srcInicial}" alt="${game.title}" class="modal-banner-img" onerror="if(!this.dataset.auto){this.dataset.auto='1';this.src='${autoImg}';}else{this.src='${CONFIG.fallbackImage}';}">
        <h2 id="modalGameTitle">${game.title}</h2>
        <p style="font-size:0.92rem; color:var(--wii-text-muted);">${dict.creatorLabel}: <strong>${game.creator || "-"}</strong></p>
        <p style="font-size:0.92rem; color:var(--wii-text-muted);">${dict.genreLabel}: <strong style="text-transform:uppercase;">${langData.genre || game.category}</strong></p>
        <p style="font-size:0.9rem; background:var(--wii-modal-desc); padding:0.75rem 0.9rem; border-radius:12px; border:1px solid var(--wii-border); line-height:1.5;">${langData.description || ""}</p>
        <div class="modal-actions-row">
            <button type="button" class="start-channel-btn" id="btnPlayInTv">
                <i class="fa-solid fa-tv"></i> ${dict.playInTv}
            </button>
            <a href="${game.url}" target="_blank" rel="noopener noreferrer" class="secondary-channel-btn">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> ${dict.openExternal}
            </a>
        </div>
    `;

    DOM.gameModal.classList.add("active");

    document.getElementById("btnPlayInTv")?.addEventListener("click", () => {
        DOM.gameModal.classList.remove("active");
        abrirPantallaTv(game);
    });

    DOM.modalBody.querySelector(".secondary-channel-btn")?.addEventListener("click", () => {
        pausarMusicaPorJuego();
    });
}

function cerrarModalCanal() {
    DOM.gameModal?.classList.remove("active");
}

function abrirPantallaTv(game) {
    if (!DOM.tvPlayModal || !DOM.tvGameIframe) return;
    ESTADO.activeTvGame = game;
    pausarMusicaPorJuego();

    const idxGlobal = ESTADO.gamesData.findIndex(g => g.id === game.id);
    const numCanal = String((idxGlobal >= 0 ? idxGlobal : 0) + 1).padStart(2, "0");

    if (DOM.tvChCode) DOM.tvChCode.textContent = `CH-${numCanal}`;
    if (DOM.tvPlayTitle) DOM.tvPlayTitle.textContent = game.title;
    if (DOM.tvExternalBtn) DOM.tvExternalBtn.href = game.url;

    DOM.tvGameIframe.src = game.url;
    DOM.tvPlayModal.classList.add("active");
}

function cerrarPantallaTv() {
    if (!DOM.tvPlayModal) return;
    DOM.tvPlayModal.classList.remove("active");
    if (DOM.tvGameIframe) DOM.tvGameIframe.src = "about:blank";
    ESTADO.activeTvGame = null;
    reanudarMusicaTrasJuego();
}

function inicializarModales() {
    DOM.closeModalBtn?.addEventListener("click", cerrarModalCanal);
    DOM.gameModal?.addEventListener("click", e => {
        if (e.target === DOM.gameModal) cerrarModalCanal();
    });

    DOM.tvCloseBtn?.addEventListener("click", cerrarPantallaTv);
    DOM.tvBackMenuBtn?.addEventListener("click", cerrarPantallaTv);
    DOM.tvPlayModal?.addEventListener("click", e => {
        if (e.target === DOM.tvPlayModal) cerrarPantallaTv();
    });

    DOM.tvReloadBtn?.addEventListener("click", () => {
        if (ESTADO.activeTvGame && DOM.tvGameIframe) {
            DOM.tvGameIframe.src = ESTADO.activeTvGame.url;
        }
    });

    DOM.tvFullscreenBtn?.addEventListener("click", () => {
        if (!DOM.tvScreenWrap) return;
        if (!document.fullscreenElement) {
            DOM.tvScreenWrap.requestFullscreen?.().catch(() => {});
        } else {
            document.exitFullscreen?.().catch(() => {});
        }
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            if (DOM.tvPlayModal?.classList.contains("active")) cerrarPantallaTv();
            else if (DOM.gameModal?.classList.contains("active")) cerrarModalCanal();
        }
    });
}