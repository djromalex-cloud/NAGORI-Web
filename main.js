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

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
animarSprite("hannaIdle", "assets/img/hanna-idle.webp", 48, 8, 220, 220, 30);
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
