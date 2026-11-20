// ! ------ MÚSICA, AUTOPLAY Y PAUSA AL JUGAR ------ //
function sincronizarIconoAudio() {
    if (!DOM.audioIcon) return;
    if (!ESTADO.isMusicPlaying || DOM.bgMusic?.volume === 0) {
        DOM.audioIcon.className = DOM.bgMusic?.volume === 0 ? "fa-solid fa-volume-off" : "fa-solid fa-volume-xmark";
    } else {
        DOM.audioIcon.className = "fa-solid fa-volume-high";
    }
}

async function intentarReproducirMusica() {
    if (!DOM.bgMusic || DOM.bgMusic.volume === 0) return false;
    try {
        await DOM.bgMusic.play();
        ESTADO.isMusicPlaying = true;
        sincronizarIconoAudio();
        return true;
    } catch {
        ESTADO.isMusicPlaying = false;
        sincronizarIconoAudio();
        return false;
    }
}

function pausarMusicaPorJuego() {
    if (DOM.bgMusic && !DOM.bgMusic.paused) {
        DOM.bgMusic.pause();
        ESTADO.isMusicPlaying = false;
        ESTADO.pausedByGame = true;
        sincronizarIconoAudio();
    }
}

function reanudarMusicaTrasJuego() {
    if (ESTADO.pausedByGame) {
        ESTADO.pausedByGame = false;
        intentarReproducirMusica();
    }
}

function inicializarMusica() {
    if (!DOM.bgMusic) return;
    DOM.bgMusic.volume = DOM.volumeSlider ? parseFloat(DOM.volumeSlider.value) : 0.5;

    // * ------ Intento directo al entrar ------ //
    intentarReproducirMusica().then(reproduciendo => {
        if (!reproduciendo) {
            // * ------ Si el navegador bloquea el autoplay, arranca en el primer toque o tecla ------ //
            const desbloquearEnInteraccion = () => {
                if (ESTADO.pausedByGame) return;
                intentarReproducirMusica().then(ok => {
                    if (ok) {
                        document.removeEventListener("pointerdown", desbloquearEnInteraccion);
                        document.removeEventListener("keydown", desbloquearEnInteraccion);
                    }
                });
            };
            document.addEventListener("pointerdown", desbloquearEnInteraccion, { passive: true });
            document.addEventListener("keydown", desbloquearEnInteraccion, { passive: true });
        }
    });

    DOM.toggleAudioBtn?.addEventListener("click", e => {
        e.stopPropagation();
        DOM.volumeContainer?.classList.toggle("active");

        if (!ESTADO.isMusicPlaying) {
            ESTADO.pausedByGame = false;
            if (DOM.bgMusic.volume === 0 && DOM.volumeSlider) {
                DOM.bgMusic.volume = 0.5;
                DOM.volumeSlider.value = "0.5";
            }
            intentarReproducirMusica();
        } else {
            DOM.bgMusic.pause();
            ESTADO.isMusicPlaying = false;
            ESTADO.pausedByGame = false;
            sincronizarIconoAudio();
        }
    });

    document.addEventListener("click", e => {
        if (DOM.volumeContainer && !DOM.volumeContainer.contains(e.target)) {
            DOM.volumeContainer.classList.remove("active");
        }
    });

    DOM.volumeSlider?.addEventListener("input", e => {
        const vol = parseFloat(e.target.value);
        DOM.bgMusic.volume = vol;
        if (vol === 0) {
            DOM.bgMusic.pause();
            ESTADO.isMusicPlaying = false;
            ESTADO.pausedByGame = false;
        } else if (!ESTADO.isMusicPlaying && !ESTADO.pausedByGame) {
            intentarReproducirMusica();
        }
        sincronizarIconoAudio();
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden && ESTADO.isMusicPlaying) {
            DOM.bgMusic.pause();
        } else if (!document.hidden && ESTADO.isMusicPlaying && !ESTADO.pausedByGame) {
            DOM.bgMusic.play().catch(() => {});
        }
    });
}