/**
 * motion.js — No More Psychopaths & The Integrity Protocol
 * GSAP 3 + ScrollTrigger Motion Flow Engine
 * Mobile Flagship Optimized: iPhone 16/17 Pro & Pixel 9/10 Pro
 * Scroll Progress Bar, Mobile Drawer, 3D Tilt & Kinetic Reveals
 */

/* ─── 0. REGISTER GSAP PLUGINS ─────────────────────────────────────── */
if (typeof gsap !== 'undefined') {
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
  if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);
}

/* ─── 1. SCROLL PROGRESS BAR ────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const bar = document.querySelector('.scroll-progress-bar');
  if (!bar) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  bar.style.width = percent + '%';
}, { passive: true });

/* ─── 2. MOBILE NAVIGATION DRAWER ──────────────────────────────────── */
function initMobileDrawer() {
  const toggle = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  if (!toggle || !drawer || !overlay) return;

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !drawer.classList.contains('open');
    if (isOpen) {
      toggle.classList.add('open');
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      toggle.classList.remove('open');
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  toggle.addEventListener('click', () => toggleMenu());
  overlay.addEventListener('click', () => toggleMenu(false));

  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => toggleMenu(false));
  });
}
document.addEventListener('DOMContentLoaded', initMobileDrawer);

/* ─── 3. WARM NEURAL CANVAS ────────────────────────────────────────── */
(function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], mouse = { x: -9999, y: -9999 };
  const isMobile = window.innerWidth < 768;
  const NODE_COUNT = isMobile ? 40 : 65;
  const MAX_DIST = isMobile ? 100 : 135;
  const COLOR_PINK = 'rgba(200, 125, 123, ';
  const COLOR_ROSE = 'rgba(163, 88, 92, ';

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function spawnNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 2 + Math.random() * 1.5,
        hue: Math.random() > 0.5 ? COLOR_PINK : COLOR_ROSE
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.32;
          ctx.beginPath();
          ctx.strokeStyle = COLOR_PINK + alpha + ')';
          ctx.lineWidth = 0.8;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
      const mdx = nodes[i].x - mouse.x;
      const mdy = nodes[i].y - mouse.y;
      const md = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < 110) {
        nodes[i].vx += (mdx / md) * 0.4;
        nodes[i].vy += (mdy / md) * 0.4;
      }
      ctx.beginPath();
      ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI * 2);
      ctx.fillStyle = nodes[i].hue + '0.75)';
      ctx.fill();

      nodes[i].x += nodes[i].vx;
      nodes[i].y += nodes[i].vy;
      nodes[i].vx *= 0.98;
      nodes[i].vy *= 0.98;
      if (nodes[i].x < 0 || nodes[i].x > W) nodes[i].vx *= -1;
      if (nodes[i].y < 0 || nodes[i].y > H) nodes[i].vy *= -1;
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); spawnNodes(); }, { passive: true });
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  resize();
  spawnNodes();
  draw();
})();

/* ─── 4. SMOOTH SCROLL FOR HASH LINKS ───────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target && typeof gsap !== 'undefined') {
      e.preventDefault();
      gsap.to(window, { duration: 1, scrollTo: { y: target, offsetY: 70 }, ease: 'power3.inOut' });
    }
  });
});

/* ─── 5. HERO KINETIC ENTRANCE ──────────────────────────────────────── */
(function heroReveal() {
  if (typeof gsap === 'undefined') return;
  const tl = gsap.timeline({ delay: 0.1 });
  const badge = document.querySelector('.hero-badge');
  const title = document.querySelector('.hero-title');
  const sub = document.querySelector('.hero-subtitle');
  const actions = document.querySelectorAll('.hero-actions .btn');

  if (badge) tl.from(badge, { y: -18, opacity: 0, duration: 0.6, ease: 'back.out(1.7)' });
  if (title) tl.from(title, { y: 25, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.2');
  if (sub) tl.from(sub, { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4');
  if (actions.length) tl.from(actions, { y: 15, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.3');
})();

/* ─── 6. SCROLLTRIGGER SECTION & CARD REVEALS ───────────────────────── */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.utils.toArray('.section-label, .section-title, .section-desc').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
      y: 30, opacity: 0, duration: 0.75, ease: 'power3.out'
    });
  });

  gsap.utils.toArray('.card, .pillar-card, .not-item, .disclaimer-box').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 93%', toggleActions: 'play none none none' },
      y: 35, opacity: 0, duration: 0.65, delay: (i % 3) * 0.08, ease: 'power2.out'
    });
  });

  gsap.utils.toArray('.card-media img').forEach(img => {
    gsap.to(img, {
      scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: 1 },
      yPercent: -6, ease: 'none'
    });
  });
}

/* ─── 7. HEADER BLUR ON SCROLL ──────────────────────────────────────── */
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('nav-scrolled');
    } else {
      header.classList.remove('nav-scrolled');
    }
  }, { passive: true });
}

console.log('[motion.js] Flagship Mobile & Motion Flow Engine Active ✓');
