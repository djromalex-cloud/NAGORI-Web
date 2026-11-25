/* =========================================================
   NAGORI — sitio oficial
   ---------------------------------------------------------
   CONFIGURACIÓN: cambia estos valores cuando tengas los links
   ========================================================= */
const CONFIG = {
  // Link de descarga del juego (itch.io, Google Drive, Release de GitHub, etc.)
  // Mientras esté vacío, el botón dirá "Próximamente".
  descargaUrl: "",
  version: "Beta",
  tamano: "",            // ej. "350 MB"
  // Link del Google Forms para las pruebas con usuarios (vacío = no se muestra)
  encuestaUrl: ""
};

// Las animaciones del sitio son parte del arte del juego: se muestran siempre,
// aunque Windows tenga desactivados los "efectos de animación".
const reduceMotion = false;

/* ---------- botón de descarga ---------- */
(function () {
  const btn = document.getElementById("btnDescarga");
  const meta = document.getElementById("downloadMeta");
  if (CONFIG.descargaUrl) {
    btn.href = CONFIG.descargaUrl;
    btn.target = "_blank";
    btn.rel = "noopener";
    meta.textContent = [CONFIG.version, CONFIG.tamano].filter(Boolean).join(" · ");
  } else {
    btn.textContent = "Próximamente";
    btn.classList.add("disabled");
    btn.setAttribute("aria-disabled", "true");
    meta.textContent = CONFIG.version + " · muy pronto";
  }
  const enc = document.getElementById("btnEncuesta");
  if (CONFIG.encuestaUrl) {
    enc.href = CONFIG.encuestaUrl;
    enc.target = "_blank";
    enc.rel = "noopener";
    enc.hidden = false;
  }
})();

/* ---------- navegación ---------- */
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});
document.querySelectorAll(".nav-links a").forEach(a =>
  a.addEventListener("click", () => { nav.classList.remove("open"); navToggle.setAttribute("aria-expanded", false); })
);

/* ---------- scroll: nav sólida + parallax del hero ---------- */
const heroBg = document.querySelector(".hero-bg");
function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle("solid", y > 40);
  if (!reduceMotion && y < window.innerHeight) heroBg.style.transform = `translateY(${y * 0.3}px) scale(1.05)`;
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- aparición al hacer scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.08 + "s";
  io.observe(el);
});

/* ---------- sprites animados (spritesheets del juego) ---------- */
function animarSprite(canvasId, src, frames, cols, fw, fh, fps) {
  const cv = document.getElementById(canvasId);
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const img = new Image();
  img.src = src;
  let f = 0, last = 0;
  const step = 1000 / fps;
  img.onload = () => {
    const draw = t => {
      if (t - last >= step) {
        last = t;
        ctx.clearRect(0, 0, fw, fh);
        ctx.drawImage(img, (f % cols) * fw, Math.floor(f / cols) * fh, fw, fh, 0, 0, fw, fh);
        f = (f + 1) % frames;
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };
}

/* ---------- Hanna en la portada: idle + ataque con corte ---------- */
(function hannaHero() {
  const cv = document.getElementById("hannaIdle");
  const box = document.getElementById("heroHanna");
  const burst = document.getElementById("heroBurst");
  const ctx = cv.getContext("2d");
  const cargar = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
  const golpe = new Audio("assets/media/golpe.mp3");
  golpe.volume = 0.5;
  const C = 220, AW = 330, HX = 110, HY = 10;                 // celda del sprite y posición de Hanna
  let modo = "idle", f = 0, last = 0, proximo = performance.now() + 3500;

  Promise.all([cargar("assets/img/hanna-idle.webp"), cargar("assets/img/hanna-ataque.webp"), cargar("assets/img/fx-corte.webp")])
    .then(([idle, atk, fx]) => {
      const celda = (img, i) => [(i % 8) * C, Math.floor(i / 8) * C];
      const celdaAtk = i => [(i % 5) * AW, Math.floor(i / 5) * C];
      function dibujar() {
        ctx.clearRect(0, 0, cv.width, cv.height);
        if (modo === "idle") {
          const [sx, sy] = celda(idle, f % 48);
          ctx.drawImage(idle, sx, sy, C, C, HX, HY, C, C);
        } else {
          const [sx, sy] = celdaAtk(Math.min(f, 15));
          ctx.drawImage(atk, sx, sy, AW, C, HX, HY, AW, C);
          const k = f - 3;                           // el corte aparece desde el cuadro 3
          if (k >= 0 && k < 12) {
            const fi = Math.min(5, Math.floor(k / 2));
            ctx.globalAlpha = k < 8 ? 1 : 1 - (k - 8) / 4;
            ctx.drawImage(fx, fi * 160, 0, 160, 180, HX + 118, HY + 30, 150, 169);
            ctx.globalAlpha = 1;
          }
        }
      }
      function atacar(conSonido) {
        if (modo === "ataque") return;
        modo = "ataque"; f = 0;
        box.classList.remove("golpe"); void box.offsetWidth; box.classList.add("golpe");
        if (conSonido) { golpe.currentTime = 0; golpe.play().catch(() => {}); }
        petalos(conSonido ? 14 : 8);
      }
      function petalos(n) {
        for (let i = 0; i < n; i++) {
          const s = document.createElement("span");
          const a = (-60 + Math.random() * 120) * Math.PI / 180, d = 80 + Math.random() * 120;
          s.style.setProperty("--dx", Math.cos(a) * d + 40 + "px");
          s.style.setProperty("--dy", Math.sin(a) * d + "px");
          s.style.setProperty("--rot", Math.random() * 540 + "deg");
          s.style.animationDelay = Math.random() * 0.12 + "s";
          burst.appendChild(s);
          setTimeout(() => s.remove(), 1200);
        }
      }
      cv.addEventListener("click", () => atacar(true));
      function loop(t) {
        if (t - last >= 1000 / 30) {
          last = t;
          dibujar();
          f++;
          if (modo === "ataque" && f >= 18) { modo = "idle"; f = 0; proximo = t + 4000 + Math.random() * 2500; }
          if (modo === "idle" && t > proximo) atacar(false);
        }
        requestAnimationFrame(loop);
      }
      if (reduceMotion) { dibujar(); cv.addEventListener("click", () => {}); }
      else requestAnimationFrame(loop);
    });

  // inclinación suave siguiendo el mouse
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", e => {
      const r = box.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      box.querySelectorAll(".hero-ring, .hero-glow").forEach((el, i) => {
        el.style.translate = `${x * (14 + i * 10)}px ${y * (14 + i * 10)}px`;
      });
      box.querySelector(".hero-float").style.translate = `${x * -10}px ${y * -8}px`;
    }, { passive: true });
  }
})();
animarSprite("dedaleraIdle", "assets/img/dedalera-idle.webp", 72, 12, 200, 224, 30);

/* ---------- tráiler ---------- */
const video = document.getElementById("trailerVideo");
const frame = video.parentElement;
document.getElementById("videoPlay").addEventListener("click", () => {
  video.play();
  video.controls = true;
  frame.classList.add("playing");
});

/* ---------- música ---------- */
const music = document.getElementById("music");
const musicBtn = document.getElementById("musicToggle");
music.volume = 0.45;
musicBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play().then(() => {
      musicBtn.classList.add("on");
      musicBtn.setAttribute("aria-pressed", "true");
      musicBtn.setAttribute("aria-label", "Silenciar música");
    }).catch(() => {});
  } else {
    music.pause();
    musicBtn.classList.remove("on");
    musicBtn.setAttribute("aria-pressed", "false");
    musicBtn.setAttribute("aria-label", "Activar música");
  }
});

/* ---------- pétalos cayendo ---------- */
(function petalos() {
  if (reduceMotion) return;
  const cv = document.getElementById("petalos");
  const ctx = cv.getContext("2d");
  let W, H, dpr;
  const lista = [];
  const N = window.innerWidth < 700 ? 14 : 28;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function nuevo(inicio) {
    return {
      x: Math.random() * W, y: inicio ? Math.random() * H : -20,
      s: 6 + Math.random() * 8, vy: 0.4 + Math.random() * 0.8, vx: -0.3 + Math.random() * 0.9,
      r: Math.random() * Math.PI * 2, vr: -0.02 + Math.random() * 0.04,
      osc: Math.random() * Math.PI * 2, a: 0.45 + Math.random() * 0.45
    };
  }
  function dibujar(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.scale(1, Math.abs(Math.cos(p.osc)) * 0.7 + 0.3);
    ctx.globalAlpha = p.a;
    ctx.fillStyle = "#f6b6cf";
    ctx.beginPath();
    ctx.moveTo(0, -p.s);
    ctx.bezierCurveTo(p.s * 0.9, -p.s * 0.6, p.s * 0.7, p.s * 0.6, 0, p.s);
    ctx.bezierCurveTo(-p.s * 0.7, p.s * 0.6, -p.s * 0.9, -p.s * 0.6, 0, -p.s);
    ctx.fill();
    ctx.restore();
  }
  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const p of lista) {
      p.osc += 0.03;
      p.x += p.vx + Math.sin(p.osc) * 0.5;
      p.y += p.vy;
      p.r += p.vr;
      if (p.y > H + 20 || p.x > W + 30 || p.x < -30) Object.assign(p, nuevo(false));
      dibujar(p);
    }
    requestAnimationFrame(loop);
  }
  resize();
  window.addEventListener("resize", resize);
  for (let i = 0; i < N; i++) lista.push(nuevo(true));
  loop();
})();
