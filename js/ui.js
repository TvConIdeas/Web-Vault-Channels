// ! ------ RELOJ, FECHA, TEMA E IDIOMA ------ //
function actualizarReloj() {
    const ahora = new Date();
    if (DOM.wiiClock) {
        DOM.wiiClock.textContent = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
    }
    if (DOM.wiiDate) {
        const locale = TRADUCCIONES[ESTADO.currentLang].localeDate;
        DOM.wiiDate.textContent = ahora.toLocaleDateString(locale, {
            weekday: "short",
            day: "numeric",
            month: "short"
        });
    }
}

function inicializarTema() {
    const guardado = localStorage.getItem(CONFIG.storageTheme);
    if (guardado === "dark") {
        document.body.classList.add("dark-mode");
        if (DOM.themeIcon) DOM.themeIcon.className = "fa-solid fa-sun";
    }

    DOM.toggleThemeBtn?.addEventListener("click", () => {
        const esOscuro = document.body.classList.toggle("dark-mode");
        if (DOM.themeIcon) {
            DOM.themeIcon.className = esOscuro ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }
        localStorage.setItem(CONFIG.storageTheme, esOscuro ? "dark" : "light");
    });
}

function aplicarIdioma(lang) {
    ESTADO.currentLang = lang === "en" ? "en" : "es";
    localStorage.setItem(CONFIG.storageLang, ESTADO.currentLang);
    document.documentElement.lang = ESTADO.currentLang;

    const dict = TRADUCCIONES[ESTADO.currentLang];

    DOM.langButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === ESTADO.currentLang);
    });

    if (DOM.searchInput) DOM.searchInput.placeholder = dict.searchPlaceholder;
    if (DOM.resetFiltersBtn) DOM.resetFiltersBtn.textContent = dict.resetFilters;
    if (DOM.tvHintText) DOM.tvHintText.textContent = dict.tvHint;
    if (DOM.shuffleBtn) DOM.shuffleBtn.title = dict.shuffleTitle;

    const mapOpciones = {
        "opt-all": dict.optAll,
        "opt-action": dict.optAction,
        "opt-sports": dict.optSports,
        "opt-retro": dict.optRetro,
        "opt-multiplayer": dict.optMulti,
        "opt-strategy": dict.optStrategy,
        "sort-random": dict.sortRandom,
        "sort-popular": dict.sortPopular,
        "sort-az": dict.sortAz,
        "sort-za": dict.sortZa
    };

    Object.entries(mapOpciones).forEach(([id, texto]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = texto;
    });

    actualizarReloj();
    filtrarCanales();
}

function inicializarControlesMovil() {
    const boxes = [DOM.searchBox, DOM.dropdownBox, DOM.sortBox].filter(Boolean);

    DOM.searchToggleBtn?.addEventListener("click", e => {
        e.stopPropagation();
        boxes.forEach(b => { if (b !== DOM.searchBox) b.classList.remove("expanded"); });
        DOM.searchBox?.classList.toggle("expanded");
        if (DOM.searchBox?.classList.contains("expanded")) DOM.searchInput?.focus();
    });

    DOM.genreToggleBtn?.addEventListener("click", e => {
        e.stopPropagation();
        boxes.forEach(b => { if (b !== DOM.dropdownBox) b.classList.remove("expanded"); });
        DOM.dropdownBox?.classList.toggle("expanded");
    });

    DOM.sortToggleBtn?.addEventListener("click", e => {
        e.stopPropagation();
        boxes.forEach(b => { if (b !== DOM.sortBox) b.classList.remove("expanded"); });
        DOM.sortBox?.classList.toggle("expanded");
    });

    document.addEventListener("click", e => {
        boxes.forEach(b => {
            if (!b.contains(e.target)) b.classList.remove("expanded");
        });
    });
}