// ============================================================
// ===== PERSONALIZACIÓN =====
// Cambia aquí lo que quieras sin tocar el resto del código.
// ============================================================
const CONFIG = {
  // Nombres. No se muestran todavía en ningún texto, pero están
  // preparados por si quieres añadirlos en el futuro.
  nombreElla: "",
  nombreYo: "",

  fecha: "24.07.2026",

  mensajeEggSeco: "Sigo trabajando en ello. 😂",
  mensajeEggAtleti: "🔴⚪ ya me estoy preparando mentalmente.",

  // Mensajes del botón secundario de la pregunta. Se muestran en
  // este orden y, si se pulsa más veces, vuelven a empezar.
  mensajesBotonMaybe: ["Vale, vale... 😂", "Pero déjame terminar.", "No me hagas trabajar más."],

  // Música de fondo (opcional). Coloca el mp3 dentro de una
  // carpeta /music y escribe su ruta, por ejemplo:
  // "music/nuestra-cancion.mp3". Si lo dejas en null, el botón
  // de música no aparece.
  musicSrc: "music/nuestra-cancion.mp3",

  // Número de partículas en la animación de celebración.
  numeroParticulas: 12,
};

// ============================================================
// ===== RECUERDOS (Parte 2 — "Desde entonces...") =====
// Añade aquí nuevos recuerdos según vayan pasando. Cada objeto
// se convierte automáticamente en una entrada de la línea
// temporal — no hace falta tocar el HTML.
//
// Campos:
//   date   (obligatorio) — texto, p. ej. "18.09.2026"
//   title  (obligatorio)
//   text   (obligatorio)
//   image  (opcional) — ruta dentro de img/, p. ej. "img/viaje.jpg".
//          Si el archivo no existe todavía, la web sigue
//          funcionando: la zona de la foto simplemente no se
//          muestra.
//   song   (opcional, de momento sin uso visual — preparado para
//          el futuro por si quieres asociar canciones a un
//          recuerdo concreto)
// ============================================================
const RECUERDOS = [
  {
    date: "24.07.2026",
    title: "El comienzo",
    text: "El día que empezó todo esto.",
  },
  {
    // MODIFICAR AQUÍ: coloca la foto en img/primer-recuerdo.jpg
    date: "18.09.2026",
    title: "La boda",
    text: "El primer recuerdo que llegó después de aquella historia. También el día en que te di el llavero que ahora lleva este mismo QR contigo a todas partes.",
    image: "img/primer-recuerdo.jpg",
  },
];

// Elementos que representan lo que todavía está por vivir. Se
// muestran siempre al final de la lista, con un estilo distinto
// (punto hueco, texto más apagado) para que no se confundan con
// recuerdos reales.
const PROXIMOS = [
  { title: "Próximo recuerdo", text: "Por descubrir." },
  { title: "Próxima aventura", text: "Sin fecha todavía." },
  { title: "Próximo capítulo", text: "Esta parte todavía está por escribir." },
];

// ---------------------------------------------------------------
// Estado de navegación entre pantallas
// ---------------------------------------------------------------
const steps = Array.from(document.querySelectorAll(".screen-step"));
const dotsContainer = document.getElementById("progress-dots");
const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll(".dot")) : [];
let currentIndex = 0;

function updateDots(step) {
  if (!dotsContainer) return;
  const dotIndex = step.dataset.dot;
  if (dotIndex === undefined) {
    dotsContainer.classList.add("hidden");
    return;
  }
  dotsContainer.classList.remove("hidden");
  dots.forEach((dot, i) => dot.classList.toggle("active", i === parseInt(dotIndex, 10)));
}

// Revela en orden los elementos ".seq" de una pantalla, según su
// "data-delay" (en milisegundos). Se relanza cada vez que se
// entra en la pantalla, incluso si ya se había visitado antes.
function runSequence(step) {
  const seqEls = step.querySelectorAll(".seq");
  seqEls.forEach((el) => el.classList.remove("in-view"));
  // Fuerza un reflow para que la transición se vuelva a disparar.
  void step.offsetWidth;
  seqEls.forEach((el) => {
    const delay = parseInt(el.dataset.delay || "0", 10);
    window.setTimeout(() => el.classList.add("in-view"), delay);
  });
}

function goToStep(index) {
  if (index < 0 || index >= steps.length) return;
  steps[currentIndex].classList.remove("active");
  currentIndex = index;
  const next = steps[currentIndex];
  next.classList.add("active");
  updateDots(next);
  runSequence(next);
}

function goToStepById(id) {
  const index = steps.findIndex((el) => el.id === id);
  if (index !== -1) goToStep(index);
}

// Arranque: puntos + secuencia de la portada.
updateDots(steps[currentIndex]);
runSequence(steps[currentIndex]);

// ---------------------------------------------------------------
// Botones "next-btn" y cualquier botón dentro de ".screen-step"
// que no tenga una acción específica avanzan a la pantalla
// siguiente. Los botones con id propio (música, easter eggs,
// tarjetas, la pregunta, reinicio) tienen su propio listener y no
// llevan la clase "next-btn".
// ---------------------------------------------------------------
document.querySelectorAll(".screen-step .btn-ghost:not(#btn-restart):not(#btn-ver-recuerdos)").forEach((btn) => {
  if (btn.id === "btn-parque-salir") return; // tiene su propia animación, ver más abajo
  btn.addEventListener("click", () => goToStep(currentIndex + 1));
});

// ---------------------------------------------------------------
// Pantalla del parque: la verja se "abre" un momento antes de
// avanzar a la siguiente pantalla.
// ---------------------------------------------------------------
const btnParqueSalir = document.getElementById("btn-parque-salir");
const gate = document.getElementById("gate");
if (btnParqueSalir) {
  btnParqueSalir.addEventListener("click", () => {
    if (gate) gate.classList.add("opening");
    window.setTimeout(() => goToStep(currentIndex + 1), 450);
  });
}

// ---------------------------------------------------------------
// Botón "Volver al principio"
// ---------------------------------------------------------------
const btnRestart = document.getElementById("btn-restart");
if (btnRestart) {
  btnRestart.addEventListener("click", () => goToStep(0));
}

// ============================================================
// PARTE 2 — "Desde entonces..." (línea temporal)
// ============================================================
const screensContainer = document.getElementById("screens");
const timelineView = document.getElementById("timeline-view");
const timelineList = document.getElementById("timeline-list");
const STORAGE_KEY = "nuestra-historia-vista";

// Construye una entrada de la línea temporal a partir de un
// recuerdo (real o "próximo").
function crearEntradaTimeline(recuerdo, esProximo) {
  const entry = document.createElement("div");
  entry.className = "timeline-entry" + (esProximo ? " upcoming" : "");

  if (recuerdo.date) {
    const date = document.createElement("p");
    date.className = "timeline-entry-date";
    date.textContent = recuerdo.date;
    entry.appendChild(date);
  }

  const title = document.createElement("p");
  title.className = "timeline-entry-title";
  title.textContent = recuerdo.title;
  entry.appendChild(title);

  if (recuerdo.image) {
    const photo = document.createElement("div");
    photo.className = "timeline-entry-photo";
    const img = document.createElement("img");
    img.src = recuerdo.image;
    img.alt = "";
    img.loading = "lazy";
    // Si la foto todavía no existe, ocultamos la zona entera en
    // vez de mostrar un icono de imagen rota.
    img.addEventListener("error", () => photo.classList.add("no-photo"));
    photo.appendChild(img);
    entry.appendChild(photo);
  }

  const text = document.createElement("p");
  text.className = "timeline-entry-text";
  text.textContent = recuerdo.text;
  entry.appendChild(text);

  return entry;
}

function renderTimeline() {
  if (!timelineList) return;
  timelineList.innerHTML = "";
  RECUERDOS.forEach((recuerdo) => timelineList.appendChild(crearEntradaTimeline(recuerdo, false)));
  PROXIMOS.forEach((recuerdo) => timelineList.appendChild(crearEntradaTimeline(recuerdo, true)));

  // Revelado sutil al hacer scroll, igual que el resto de la web.
  const entries = timelineList.querySelectorAll(".timeline-entry");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (changes) => {
        changes.forEach((change) => {
          if (change.isIntersecting) {
            change.target.classList.add("in-view");
            observer.unobserve(change.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
    );
    entries.forEach((entry) => observer.observe(entry));
  } else {
    entries.forEach((entry) => entry.classList.add("in-view"));
  }
}

function marcarHistoriaVista() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch (e) {
    // Si el navegador bloquea localStorage (modo privado, etc.),
    // simplemente no recordamos la visita. No rompe nada.
  }
}

function historiaYaVista() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch (e) {
    return false;
  }
}

function mostrarTimeline() {
  renderTimeline();
  if (screensContainer) screensContainer.style.display = "none";
  if (dotsContainer) dotsContainer.classList.add("hidden");
  if (timelineView) timelineView.hidden = false;
  marcarHistoriaVista();
  updateMusicVisibility();
}

function mostrarHistoriaOriginal() {
  if (timelineView) timelineView.hidden = true;
  if (screensContainer) screensContainer.style.display = "";
  updateMusicVisibility();
}

const btnVerRecuerdos = document.getElementById("btn-ver-recuerdos");
if (btnVerRecuerdos) {
  btnVerRecuerdos.addEventListener("click", mostrarTimeline);
}

const btnVolverHistoria = document.getElementById("btn-volver-historia");
if (btnVolverHistoria) {
  btnVolverHistoria.addEventListener("click", () => {
    mostrarHistoriaOriginal();
    goToStep(0);
  });
}

// ---------------------------------------------------------------
// Tarjetas de "Y aquí estamos": funcionan con toque en móvil
// (alternando la clase "revealed") y con :hover en escritorio.
// No son necesarias para avanzar.
// ---------------------------------------------------------------
document.querySelectorAll(".future-card").forEach((card) => {
  card.addEventListener("click", () => card.classList.toggle("revealed"));
});

// ---------------------------------------------------------------
// La chocolatina: el toque también separa el trocito.
// ---------------------------------------------------------------
const chocoCard = document.querySelector(".choco-card");
if (chocoCard) {
  chocoCard.addEventListener("click", () => chocoCard.classList.toggle("opened"));
}

// ---------------------------------------------------------------
// Toast genérico para mensajes cortos
// ---------------------------------------------------------------
const toast = document.getElementById("toast");
let toastTimer = null;

function showToast(message, duration = 2400) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), duration);
}

// ---------------------------------------------------------------
// Easter eggs
// ---------------------------------------------------------------
const eggSeco = document.getElementById("egg-seco");
if (eggSeco) {
  eggSeco.addEventListener("click", (e) => {
    e.stopPropagation();
    showToast(CONFIG.mensajeEggSeco);
  });
}

const eggAtleti = document.getElementById("egg-atleti");
if (eggAtleti) {
  eggAtleti.addEventListener("click", (e) => {
    e.stopPropagation();
    showToast(CONFIG.mensajeEggAtleti);
  });
}

// ---------------------------------------------------------------
// Botón secundario de la pregunta: va mostrando una serie de
// mensajes cortos según se pulsa, sin bloquear nunca el botón
// principal ni cambiar de pantalla por su cuenta.
// ---------------------------------------------------------------
const btnMaybe = document.getElementById("btn-maybe");
let maybeIndex = 0;
if (btnMaybe) {
  btnMaybe.addEventListener("click", () => {
    const mensajes = CONFIG.mensajesBotonMaybe;
    showToast(mensajes[maybeIndex % mensajes.length]);
    maybeIndex++;
  });
}

// ---------------------------------------------------------------
// Botón principal de la pregunta: oscurece un instante, vibra si
// el dispositivo lo permite, lanza una celebración muy sutil y
// pasa a la pantalla "El sí", donde la secuencia se cuenta poco a
// poco (ver runSequence, que se dispara sola al entrar).
// ---------------------------------------------------------------
const btnYes = document.getElementById("btn-yes");
const celebrationBox = document.getElementById("celebration");
const dimOverlay = document.getElementById("dim-overlay");

function launchCelebration() {
  if (!celebrationBox) return;
  const symbols = ["❤️", "✦", "❤️", "·"];
  for (let i = 0; i < CONFIG.numeroParticulas; i++) {
    const particle = document.createElement("span");
    particle.className = "celebration-particle";
    particle.textContent = symbols[i % symbols.length];
    particle.style.left = `${10 + Math.random() * 80}%`;
    particle.style.setProperty("--drift", `${(Math.random() - 0.5) * 55}px`);
    particle.style.animationDelay = `${0.6 + Math.random() * 0.5}s`;
    celebrationBox.appendChild(particle);
    window.setTimeout(() => particle.remove(), 3400);
  }
}

if (btnYes) {
  btnYes.addEventListener("click", () => {
    if ("vibrate" in navigator) navigator.vibrate([16, 35, 16]);

    goToStepById("s-si");

    if (dimOverlay) {
      dimOverlay.classList.remove("flash");
      void dimOverlay.offsetWidth;
      dimOverlay.classList.add("flash");
    }
    launchCelebration();
  });
}

// ---------------------------------------------------------------
// Música opcional. Los navegadores bloquean el autoplay, así que
// la música solo se activa cuando el usuario pulsa el botón.
// Se prioriza en la Parte 2 ("Desde entonces...") para no
// interferir con la experiencia original: el botón solo se
// muestra mientras se está viendo la línea temporal.
// ---------------------------------------------------------------
const musicBtn = document.getElementById("music-toggle");
let musicReady = false;
let audio = null;
let playing = false;

function updateMusicVisibility() {
  if (!musicBtn) return;
  if (!musicReady) {
    musicBtn.style.display = "none";
    return;
  }
  const enTimeline = timelineView && !timelineView.hidden;
  musicBtn.style.display = enTimeline ? "flex" : "none";
}

if (CONFIG.musicSrc) {
  musicReady = true;
  audio = new Audio(CONFIG.musicSrc);
  audio.loop = true;

  musicBtn.addEventListener("click", () => {
    if (!playing) {
      audio.play().catch(() => {
        // Si el navegador bloquea la reproducción, no rompemos nada.
      });
      musicBtn.classList.add("playing");
      musicBtn.querySelector(".music-label").textContent = "Pausar";
      playing = true;
    } else {
      audio.pause();
      musicBtn.classList.remove("playing");
      musicBtn.querySelector(".music-label").textContent = "Música";
      playing = false;
    }
  });
}

updateMusicVisibility();

// En visitas futuras (mismo dispositivo/navegador), si ya vivió la
// historia original al menos una vez, se entra directamente en los
// recuerdos al abrir la web. La primera vez siempre se ve primero
// la historia completa.
if (historiaYaVista()) {
  mostrarTimeline();
}
