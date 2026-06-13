const STORAGE_KEY = "client-core-accessibility";
const MIN_SCALE = 0.875;
const MAX_SCALE = 2;
const SCALE_STEP = 0.125;

const defaults = {
  fontScale: 1,
  contrastTheme: "normal",
  readableFont: false,
  lineSpacing: false,
  textSpacing: false,
  paragraphSpacing: false,
  highlightLinks: false,
  largeCursor: false,
  readingMode: false,
  readingGuide: false,
  readingMask: false,
  magnifier: false,
  reduceMotion: false,
  soundFeedback: false
};

const labels = {
  readableFont: "Fonte hiperlegível",
  lineSpacing: "Espaçamento de linhas",
  textSpacing: "Espaçamento de letras e palavras",
  paragraphSpacing: "Espaçamento de parágrafos",
  highlightLinks: "Destaque de links",
  largeCursor: "Cursor ampliado",
  readingMode: "Modo leitura",
  readingGuide: "Guia de leitura",
  readingMask: "Máscara de leitura",
  magnifier: "Lupa textual",
  reduceMotion: "Redução de movimentos",
  soundFeedback: "Avisos sonoros"
};

const readPreferences = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.highContrast && !saved.contrastTheme) saved.contrastTheme = "blackYellow";
    return { ...defaults, ...saved };
  } catch {
    return { ...defaults };
  }
};

let preferences = readPreferences();
let audioContext = null;
let speechQueue = [];
let speechIndex = 0;
let speechActive = false;

const savePreferences = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
};

const ensureReadableFont = () => {
  if (!preferences.readableFont || document.getElementById("a11y-readable-font")) return;
  const link = document.createElement("link");
  link.id = "a11y-readable-font";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap";
  document.head.appendChild(link);
};

const applyPreferences = () => {
  const root = document.documentElement;
  root.style.setProperty("--a11y-font-scale", preferences.fontScale);
  root.dataset.a11yContrast = preferences.contrastTheme;
  [
    "readableFont",
    "lineSpacing",
    "textSpacing",
    "paragraphSpacing",
    "highlightLinks",
    "largeCursor",
    "readingMode",
    "readingGuide",
    "readingMask",
    "magnifier",
    "reduceMotion"
  ].forEach((key) => {
    root.classList.toggle(`a11y-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, preferences[key]);
  });

  ensureReadableFont();
  document.querySelectorAll("[data-a11y-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(Boolean(preferences[button.dataset.a11yToggle])));
  });

  const contrastSelect = document.getElementById("a11y-contrast");
  if (contrastSelect) contrastSelect.value = preferences.contrastTheme;
};

const playFeedback = () => {
  if (!preferences.soundFeedback) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.04, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.12);
  } catch {
    // O feedback visual e para leitores de tela continua disponível.
  }
};

const announce = (message) => {
  const status = document.getElementById("a11y-status");
  if (status) status.textContent = message;
  playFeedback();
};

const speechSupported = () =>
  "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

const getPortugueseVoice = () => {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang === "pt-BR")
    || voices.find((voice) => voice.lang.startsWith("pt"))
    || null;
};

const collectReadableText = () => {
  const main = document.querySelector("main");
  if (!main) return "";

  const selectors = [
    "h1", "h2", "h3", "h4",
    "p", "li", "label",
    "[role='status']", "[role='alert']",
    "button:not([aria-hidden='true'])"
  ].join(",");

  const parts = [`${document.title}.`];
  main.querySelectorAll(selectors).forEach((element) => {
    if (element.closest("[hidden], [aria-hidden='true'], .a11y-panel")) return;
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return;

    const text = element.textContent.replace(/\s+/g, " ").trim();
    if (text && parts[parts.length - 1] !== text) parts.push(text);
  });
  return parts.join(". ");
};

const splitSpeechText = (text, maxLength = 220) => {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  const chunks = [];
  let current = "";

  sentences.forEach((sentence) => {
    const normalized = sentence.trim();
    if (!normalized) return;
    if (`${current} ${normalized}`.trim().length <= maxLength) {
      current = `${current} ${normalized}`.trim();
      return;
    }
    if (current) chunks.push(current);
    current = normalized;
  });
  if (current) chunks.push(current);
  return chunks;
};

const updateSpeechControls = () => {
  const listen = document.getElementById("a11y-listen");
  const pause = document.getElementById("a11y-pause");
  const stop = document.getElementById("a11y-stop");
  const paused = speechSupported() && window.speechSynthesis.paused;

  if (listen) listen.setAttribute("aria-pressed", String(speechActive));
  if (pause) {
    pause.disabled = !speechActive;
    pause.textContent = paused ? "Continuar leitura" : "Pausar leitura";
    pause.setAttribute("aria-label", paused ? "Continuar leitura em voz alta" : "Pausar leitura em voz alta");
  }
  if (stop) stop.disabled = !speechActive;
};

const speakNextChunk = () => {
  if (!speechActive || speechIndex >= speechQueue.length) {
    speechActive = false;
    updateSpeechControls();
    announce("Leitura da página concluída.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(speechQueue[speechIndex]);
  utterance.lang = "pt-BR";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  const voice = getPortugueseVoice();
  if (voice) utterance.voice = voice;
  utterance.onend = () => {
    speechIndex += 1;
    speakNextChunk();
  };
  utterance.onerror = (event) => {
    if (event.error === "canceled" || event.error === "interrupted") return;
    speechActive = false;
    updateSpeechControls();
    announce("Não foi possível continuar a leitura em voz alta.");
  };
  window.speechSynthesis.speak(utterance);
};

const startSpeech = () => {
  if (!speechSupported()) {
    announce("Este navegador não oferece leitura em voz alta.");
    return;
  }

  window.speechSynthesis.cancel();
  const text = collectReadableText();
  if (!text) {
    announce("Não há conteúdo disponível para leitura nesta página.");
    return;
  }

  speechQueue = splitSpeechText(text);
  speechIndex = 0;
  speechActive = true;
  updateSpeechControls();
  announce("Leitura da página iniciada.");
  speakNextChunk();
};

const toggleSpeechPause = () => {
  if (!speechSupported() || !speechActive) return;
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    announce("Leitura retomada.");
  } else {
    window.speechSynthesis.pause();
    announce("Leitura pausada.");
  }
  updateSpeechControls();
};

const stopSpeech = (announceStop = true) => {
  if (!speechSupported()) return;
  window.speechSynthesis.cancel();
  speechQueue = [];
  speechIndex = 0;
  speechActive = false;
  updateSpeechControls();
  if (announceStop) announce("Leitura interrompida.");
};

const changeFont = (direction) => {
  const next = preferences.fontScale + direction * SCALE_STEP;
  preferences.fontScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
  applyPreferences();
  savePreferences();
  announce(`Tamanho da fonte ajustado para ${Math.round(preferences.fontScale * 100)}%.`);
};

const togglePreference = (key) => {
  preferences[key] = !preferences[key];
  applyPreferences();
  savePreferences();
  announce(`${labels[key]} ${preferences[key] ? "ativado" : "desativado"}.`);
};

const resetPreferences = () => {
  preferences = { ...defaults };
  applyPreferences();
  savePreferences();
  announce("Preferências de acessibilidade restauradas.");
};

const updateReadingTools = (event) => {
  const y = event.clientY;
  const guide = document.getElementById("a11y-reading-guide");
  const maskTop = document.getElementById("a11y-mask-top");
  const maskBottom = document.getElementById("a11y-mask-bottom");
  const magnifier = document.getElementById("a11y-magnifier");

  if (guide) guide.style.top = `${Math.max(0, y - 2)}px`;
  if (maskTop && maskBottom) {
    const readingHeight = 96;
    maskTop.style.height = `${Math.max(0, y - readingHeight / 2)}px`;
    maskBottom.style.top = `${Math.min(window.innerHeight, y + readingHeight / 2)}px`;
  }

  if (magnifier && preferences.magnifier) {
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const text = target?.closest("p, a, button, label, input, textarea, select, h1, h2, h3, h4, td, th")?.textContent?.trim();
    magnifier.textContent = text || "Aponte para um texto";
    magnifier.style.left = `${Math.min(event.clientX + 20, window.innerWidth - magnifier.offsetWidth - 12)}px`;
    magnifier.style.top = `${Math.max(12, event.clientY - magnifier.offsetHeight - 16)}px`;
  }
};

const createReadingTools = () => {
  const tools = document.createElement("div");
  tools.setAttribute("aria-hidden", "true");
  tools.innerHTML = `
    <div id="a11y-reading-guide" class="a11y-reading-guide"></div>
    <div id="a11y-mask-top" class="a11y-reading-mask a11y-reading-mask--top"></div>
    <div id="a11y-mask-bottom" class="a11y-reading-mask a11y-reading-mask--bottom"></div>
    <div id="a11y-magnifier" class="a11y-magnifier">Aponte para um texto</div>
  `;
  document.body.appendChild(tools);
  document.addEventListener("pointermove", updateReadingTools, { passive: true });
};

const createCenter = () => {
  if (document.getElementById("a11y-trigger")) return;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <button id="a11y-trigger" class="a11y-trigger" type="button"
      aria-label="Abrir Central de Acessibilidade" aria-controls="a11y-panel"
      aria-expanded="false" title="Central de Acessibilidade">A</button>
    <section id="a11y-panel" class="a11y-panel" aria-labelledby="a11y-title" hidden>
      <div class="a11y-panel__header">
        <h2 id="a11y-title" class="a11y-panel__title">Acessibilidade</h2>
        <button id="a11y-close" class="a11y-panel__close" type="button"
          aria-label="Fechar Central de Acessibilidade" title="Fechar">X</button>
      </div>
      <div class="a11y-section">
        <h3 class="a11y-section__title">Texto e visualização</h3>
        <div class="a11y-controls">
          <button class="a11y-control" type="button" data-font="-1" aria-label="Diminuir tamanho da fonte">A-</button>
          <button class="a11y-control" type="button" data-font="1" aria-label="Aumentar tamanho da fonte">A+</button>
          <label class="a11y-field a11y-control--wide" for="a11y-contrast">
            Tema de contraste
            <select id="a11y-contrast" class="a11y-select">
              <option value="normal">Original</option>
              <option value="blackYellow">Preto e amarelo</option>
              <option value="whiteBlack">Branco e preto</option>
              <option value="inverted">Contraste invertido</option>
            </select>
          </label>
          <button class="a11y-control" type="button" data-a11y-toggle="readableFont" aria-pressed="false">Fonte legível</button>
          <button class="a11y-control" type="button" data-a11y-toggle="highlightLinks" aria-pressed="false">Destacar links</button>
          <button class="a11y-control" type="button" data-a11y-toggle="lineSpacing" aria-pressed="false">Espaçar linhas</button>
          <button class="a11y-control" type="button" data-a11y-toggle="textSpacing" aria-pressed="false">Letras e palavras</button>
          <button class="a11y-control" type="button" data-a11y-toggle="paragraphSpacing" aria-pressed="false">Parágrafos</button>
          <button class="a11y-control" type="button" data-a11y-toggle="largeCursor" aria-pressed="false">Cursor ampliado</button>
        </div>
      </div>
      <div class="a11y-section">
        <h3 class="a11y-section__title">Auxílio de leitura</h3>
        <div class="a11y-controls">
          <button id="a11y-listen" class="a11y-control a11y-control--wide" type="button"
            aria-pressed="false">Ouvir página</button>
          <button id="a11y-pause" class="a11y-control" type="button"
            aria-label="Pausar leitura em voz alta" disabled>Pausar leitura</button>
          <button id="a11y-stop" class="a11y-control" type="button"
            aria-label="Parar leitura em voz alta" disabled>Parar leitura</button>
          <button class="a11y-control" type="button" data-a11y-toggle="readingMode" aria-pressed="false">Modo leitura</button>
          <button class="a11y-control" type="button" data-a11y-toggle="readingGuide" aria-pressed="false">Guia de leitura</button>
          <button class="a11y-control" type="button" data-a11y-toggle="readingMask" aria-pressed="false">Máscara de leitura</button>
          <button class="a11y-control" type="button" data-a11y-toggle="magnifier" aria-pressed="false">Lupa textual</button>
          <button class="a11y-control" type="button" data-a11y-toggle="reduceMotion" aria-pressed="false">Reduzir movimentos</button>
          <button class="a11y-control" type="button" data-a11y-toggle="soundFeedback" aria-pressed="false">Avisos sonoros</button>
        </div>
      </div>
      <button class="a11y-control a11y-control--reset" type="button" data-reset>Restaurar todas as opções</button>
      <p id="a11y-status" class="a11y-status" aria-live="polite"></p>
    </section>
  `;
  document.body.appendChild(wrapper);
  createReadingTools();

  const trigger = document.getElementById("a11y-trigger");
  const panel = document.getElementById("a11y-panel");
  const close = document.getElementById("a11y-close");

  const setPanelOpen = (open) => {
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    if (open) close.focus();
    else trigger.focus();
  };

  trigger.addEventListener("click", () => setPanelOpen(panel.hidden));
  close.addEventListener("click", () => setPanelOpen(false));
  document.getElementById("a11y-listen").addEventListener("click", startSpeech);
  document.getElementById("a11y-pause").addEventListener("click", toggleSpeechPause);
  document.getElementById("a11y-stop").addEventListener("click", () => stopSpeech());
  panel.addEventListener("click", (event) => {
    const fontButton = event.target.closest("[data-font]");
    const toggleButton = event.target.closest("[data-a11y-toggle]");
    if (fontButton) changeFont(Number(fontButton.dataset.font));
    if (toggleButton) togglePreference(toggleButton.dataset.a11yToggle);
    if (event.target.closest("[data-reset]")) resetPreferences();
  });
  document.getElementById("a11y-contrast").addEventListener("change", (event) => {
    preferences.contrastTheme = event.target.value;
    applyPreferences();
    savePreferences();
    announce("Tema de contraste atualizado.");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setPanelOpen(false);
  });

  applyPreferences();
  updateSpeechControls();
};

const prepareDocument = () => {
  if (!document.querySelector(".skip-link")) {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.className = "skip-link";
    skipLink.textContent = "Pular para o conteúdo principal";
    document.body.prepend(skipLink);
  }

  const main = document.querySelector("main");
  if (main && !main.id) main.id = "main-content";
  if (main) main.tabIndex = -1;
  createCenter();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", prepareDocument);
} else {
  prepareDocument();
}

window.addEventListener("pagehide", () => stopSpeech(false));
