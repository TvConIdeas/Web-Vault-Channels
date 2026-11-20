// ! ------ ORQUESTACIÓN E INICIALIZACIÓN ------ //
document.addEventListener("DOMContentLoaded", () => {
    actualizarItemsPorPagina();
    actualizarReloj();
    setInterval(actualizarReloj, 1000);

    if (DOM.sortSelect) {
        DOM.sortSelect.value = ESTADO.currentSort;
    }

    inicializarTema();
    inicializarMusica();
    inicializarNavegacion();
    inicializarModales();
    inicializarControlesMovil();

    DOM.langButtons.forEach(btn => {
        btn.addEventListener("click", () => aplicarIdioma(btn.dataset.lang));
    });

    DOM.searchInput?.addEventListener("input", () => {
        ESTADO.currentPage = 0;
        filtrarCanales();
    });

    DOM.clearSearchBtn?.addEventListener("click", () => {
        if (DOM.searchInput) DOM.searchInput.value = "";
        ESTADO.currentPage = 0;
        filtrarCanales();
    });

    DOM.genreSelect?.addEventListener("change", () => {
        ESTADO.currentPage = 0;
        filtrarCanales();
    });

    DOM.sortSelect?.addEventListener("change", e => {
        ESTADO.currentSort = e.target.value;
        localStorage.setItem(CONFIG.storageSort, ESTADO.currentSort);
        if (ESTADO.currentSort === "random") {
            ESTADO.shuffledPool = generarPoolAleatorio(ESTADO.gamesData);
        }
        ESTADO.currentPage = 0;
        filtrarCanales();
    });

    DOM.shuffleBtn?.addEventListener("click", () => {
        ESTADO.currentSort = "random";
        localStorage.setItem(CONFIG.storageSort, "random");
        if (DOM.sortSelect) DOM.sortSelect.value = "random";
        ESTADO.shuffledPool = generarPoolAleatorio(ESTADO.gamesData);
        ESTADO.currentPage = 0;
        filtrarCanales();
    });

    DOM.resetFiltersBtn?.addEventListener("click", limpiarFiltros);

    fetch(CONFIG.dataUrl)
        .then(res => res.json())
        .then(data => {
            ESTADO.gamesData = Array.isArray(data) ? data : [];
            ESTADO.shuffledPool = generarPoolAleatorio(ESTADO.gamesData);
            aplicarIdioma(ESTADO.currentLang);
        })
        .catch(err => {
            console.error("Error al cargar games.json:", err);
            if (DOM.gamesGrid) {
                DOM.gamesGrid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--wii-text-muted); padding: 3rem;">Error al cargar los canales.</p>`;
            }
        });
});