/**
 * IBOGAINE DAO — Main JavaScript
 * Core app logic: parallax, accordion, panel system, counters, scroll animations
 */

'use strict';

/* ── PARALLAX ── */
function initParallax() {
  const els = document.querySelectorAll('[data-parallax-speed]');
  if (!els.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function update() {
    const scrollY = window.scrollY;
    els.forEach(el => {
      const speed = parseFloat(el.dataset.parallaxSpeed || 0.4);
      const rect = el.closest('.hero, .parallax-section')?.getBoundingClientRect();
      if (!rect) return;
      const offset = (rect.top + scrollY) * speed;
      el.style.transform = `translateY(${offset * 0.3}px)`;
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── ACCORDION ── */
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const isOpen = item.classList.contains('open');

      // Close all siblings in the same group
      const group = item.closest('[role="list"]') || item.parentElement;
      group?.querySelectorAll('.accordion-item.open').forEach(o => {
        o.classList.remove('open');
        o.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ── PANEL SYSTEM (ibo.garden-style expandable panels) ── */
function initPanels(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const panels = container.querySelectorAll('.panel, .gaine-panel');

  panels.forEach(panel => {
    panel.addEventListener('click', () => {
      if (panel.classList.contains('active')) return;
      panels.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      panel.classList.add('active');
      panel.setAttribute('aria-selected', 'true');
    });
  });
}

/* ── COUNTER ANIMATION ── */
function animateCounter(el, target, suffix = '', duration = 1800) {
  const start = performance.now();
  const isDecimal = String(target).includes('.');

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = isDecimal
      ? (eased * target).toFixed(1)
      : Math.round(eased * target);

    el.textContent = current.toLocaleString() + suffix;

    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString() + suffix;
  }

  requestAnimationFrame(step);
}

/* ── SCROLL OBSERVER (fade-up, counters) ── */
function initScrollObserver() {
  const fadeEls = document.querySelectorAll('.fade-up, .fade-in');
  const counterEls = document.querySelectorAll('.count-up[data-target]');

  if (!('IntersectionObserver' in window)) {
    fadeEls.forEach(el => el.classList.add('visible'));
    counterEls.forEach(el => {
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      el.textContent = target.toLocaleString() + suffix;
    });
    return;
  }

  // Fade observer
  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => fadeObserver.observe(el));

  // Counter observer
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counterEls.forEach(el => counterObserver.observe(el));
}

/* ── MOBILE NAV ── */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const closeBtn = document.getElementById('mobile-nav-close');

  if (!hamburger || !mobileNav) return;

  function open() {
    mobileNav.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);

  // Close on outside tap
  mobileNav.addEventListener('click', e => {
    if (e.target === mobileNav) close();
  });

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) close();
  });
}

/* ── BUTTON RIPPLE ── */
function initRipple() {
  document.querySelectorAll('.btn-ripple').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* ── LIVE GAINE PRICE DISPLAY ── */
async function fetchGainePrice() {
  const mint = 'ibozy4AxS6TdsBDerGJN1ZKFFohEubFdHWGcyLxPLFL';
  const priceEls = document.querySelectorAll('[id*="gaine-price"]');
  if (!priceEls.length) return;

  try {
    const res = await fetch(
      `https://price.jup.ag/v6/price?ids=${mint}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error('Price fetch failed');
    const data = await res.json();
    const price = data?.data?.[mint]?.price;
    if (price) {
      const formatted = '$' + parseFloat(price).toFixed(4);
      priceEls.forEach(el => { el.textContent = formatted; });
    }
  } catch {
    // Silently fail — static fallback already in DOM
  }
}

/* ── STATS BAR DUPLICATE CHECK ── */
function initStatsBar() {
  const marquee = document.getElementById('stats-marquee');
  if (!marquee) return;
  // Animation runs via CSS — just ensure content is doubled for seamless loop
}

/* ── VOTE BAR ANIMATION ── */
function initVoteBars() {
  const bars = document.querySelectorAll('.vote-bar-fill');
  if (!bars.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const target = bar.style.width;
        bar.style.width = '0%';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            bar.style.transition = 'width 1.2s cubic-bezier(0.22, 0.61, 0.36, 1)';
            bar.style.width = target;
          });
        });
        obs.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(b => obs.observe(b));
}

/* ── ACTIVE NAV LINK ── */
function highlightActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.includes(path) && path !== 'index.html') {
      a.classList.add('active');
    }
  });
}

/* ── DAO PROPOSAL VOTE INTERACTION ── */
function initDAOProposals() {
  const connectVoteBtn = document.getElementById('connect-to-vote');
  if (connectVoteBtn) {
    connectVoteBtn.addEventListener('click', () => {
      window.walletConnect?.();
    });
  }
}

/* ── AIRDROP WALLET CONNECT ── */
function initAirdropSection() {
  const btn = document.getElementById('airdrop-wallet-connect');
  if (btn) {
    btn.addEventListener('click', () => {
      window.walletConnect?.();
    });
  }
}

/* ── INIT ALL ── */
document.addEventListener('DOMContentLoaded', () => {
  initParallax();
  initAccordions();
  initPanels('dao-panels');
  initPanels('gaine-panels');
  initScrollObserver();
  initMobileNav();
  initRipple();
  initStatsBar();
  initVoteBars();
  highlightActiveNav();
  initDAOProposals();
  initAirdropSection();

  // Delayed price fetch — non-blocking
  setTimeout(fetchGainePrice, 1000);
});

/* ── EXPOSE FOR EXTERNAL CALL ── */
window.initPanels = initPanels;
window.animateCounter = animateCounter;
