/**
 * script.js — Portfolio Interactive Logic & Cyberpunk Engine
 * Features:
 * 1. 3D Hologram Particle Sphere & Cyber-Ring Canvas (with Click Scatter & Mouse Tilt)
 * 2. Dynamic Content System (Live CMS & localStorage synchronization)
 * 3. Owner Admin Dashboard (Ctrl + Shift + A or Floating Button)
 * 4. Bidirectional Scroll Reveal, Top Progress Bar & Smart Navbar
 * 5. Theme Toggle & Contact Validation
 */

'use strict';

/* ═══════════════════════════════════════════════
   1. THEME MANAGEMENT
═══════════════════════════════════════════════ */
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

function getStoredTheme() {
  return localStorage.getItem('portfolio-theme') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
}

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
}

applyTheme(getStoredTheme());

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    themeToggle.style.transform = 'scale(0.8) rotate(20deg)';
    setTimeout(() => (themeToggle.style.transform = ''), 200);
  });
}


/* ═══════════════════════════════════════════════
   2. NAVBAR & DYNAMIC SCROLL DYNAMICS
═══════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
const progressBar = document.getElementById('scroll-progress-bar');
const progressGlow = document.getElementById('scroll-progress-glow');
const backToTopBtn = document.getElementById('back-to-top');
const scrollProgressRing = document.getElementById('scroll-progress-ring');

// Cyber Scroll Telemetry HUD Elements
const hudEl = document.getElementById('cyber-scroll-hud');
const hudArrow = document.getElementById('hud-scroll-arrow');
const hudArrowBox = document.getElementById('hud-arrow-box');
const hudDir = document.getElementById('hud-scroll-dir');
const hudVel = document.getElementById('hud-scroll-vel');
const hudZone = document.getElementById('hud-scroll-zone');
const hudPct = document.getElementById('hud-scroll-pct');
const hudMeterFill = document.getElementById('hud-meter-fill');

// Quick-Nav Radar Dots
const radarDots = document.querySelectorAll('.radar-dot');

let lastScrollY = window.scrollY;
let isScrollTicking = false;
let hudTimer = null;
let scrollStopTimer = null;

function onScroll() {
  const currentScrollY = window.scrollY;
  const deltaY = currentScrollY - lastScrollY;
  const isScrollingDown = deltaY > 0;
  const absDelta = Math.abs(deltaY);
  const scrollVelocity = Math.min(100, absDelta);

  // 1. Update CSS Variables for Grid Parallax & Velocity
  document.documentElement.style.setProperty('--scroll-y', `${currentScrollY}px`);
  document.documentElement.style.setProperty('--scroll-velocity', `${scrollVelocity}px`);

  // 2. Track Direction Classes on Body
  if (absDelta > 2) {
    if (isScrollingDown) {
      document.body.classList.add('scrolling-down');
      document.body.classList.remove('scrolling-up');
    } else {
      document.body.classList.add('scrolling-up');
      document.body.classList.remove('scrolling-down');
    }
  }

  // Velocity boost class
  document.body.classList.toggle('is-scrolling-fast', scrollVelocity > 35);
  clearTimeout(scrollStopTimer);
  scrollStopTimer = setTimeout(() => {
    document.body.classList.remove('is-scrolling-fast', 'scrolling-down', 'scrolling-up');
  }, 220);

  // 3. Top Scroll Progress Bar & Glowing Comet Head
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progressPct = docHeight > 0 ? (currentScrollY / docHeight) * 100 : 0;
  const clampedProgress = Math.min(100, Math.max(0, progressPct));

  if (progressBar) {
    progressBar.style.width = `${clampedProgress}%`;
  }
  if (progressGlow) {
    progressGlow.style.left = `${clampedProgress}%`;
  }

  // 4. Circular Back-to-Top Button with Real-Time SVG Progress Ring
  if (scrollProgressRing) {
    const circumference = 119.38; // 2 * Math.PI * 19
    const offset = circumference - (clampedProgress / 100) * circumference;
    scrollProgressRing.style.strokeDashoffset = `${offset}px`;
  }
  if (backToTopBtn) {
    if (currentScrollY > 220) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  // 5. Navbar Style & Auto-Hide on Fast Scroll Down, Reveal on Scroll Up
  if (navbar) {
    navbar.classList.toggle('scrolled', currentScrollY > 30);
    if (isScrollingDown && currentScrollY > 220 && scrollVelocity > 10) {
      navbar.classList.add('nav-hidden');
    } else {
      navbar.classList.remove('nav-hidden');
    }
  }

  // 6. Active Section Detection
  let currentSection = 'hero';
  sections.forEach(section => {
    const top = section.offsetTop - 180;
    if (currentScrollY >= top) currentSection = section.id;
  });

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const targetId = href.slice(1);
      link.classList.toggle('active', targetId === currentSection);
    }
  });

  // 7. Quick-Nav Radar Active Dot
  radarDots.forEach(dot => {
    const sec = dot.getAttribute('data-section');
    dot.classList.toggle('active', sec === currentSection);
  });

  // 8. Cyber Scroll Telemetry HUD Updates
  if (hudPct) hudPct.textContent = `${String(Math.round(clampedProgress)).padStart(2, '0')}%`;
  if (hudMeterFill) hudMeterFill.style.width = `${clampedProgress}%`;
  if (hudZone) hudZone.textContent = `// ${currentSection.toUpperCase()}_NODE`;

  if (absDelta > 2) {
    if (hudDir) hudDir.textContent = isScrollingDown ? 'SCROLLING DOWN ↓' : 'SCROLLING UP ↑';
    if (hudArrow) hudArrow.textContent = isScrollingDown ? '↓' : '↑';
    if (hudArrowBox) {
      hudArrowBox.classList.toggle('arrow-down', isScrollingDown);
      hudArrowBox.classList.toggle('arrow-up', !isScrollingDown);
    }
    if (hudVel) {
      hudVel.textContent = scrollVelocity > 35 ? 'WARP ⚡' : 'CRUISE';
      hudVel.classList.toggle('velocity-high', scrollVelocity > 35);
    }
    if (hudEl) {
      hudEl.classList.add('active');
      clearTimeout(hudTimer);
      hudTimer = setTimeout(() => {
        hudEl.classList.remove('active');
        if (hudDir) hudDir.textContent = 'READY // STANDBY';
        if (hudVel) hudVel.textContent = 'STEADY';
      }, 1500);
    }
  }

  // 9. Floating Parallax Cyber Runes
  const parallaxRunes = document.querySelectorAll('[data-parallax-speed]');
  parallaxRunes.forEach(rune => {
    const speed = parseFloat(rune.getAttribute('data-parallax-speed')) || 0.15;
    const parentSection = rune.closest('section');
    const parentTop = parentSection ? parentSection.offsetTop : 0;
    const relScroll = currentScrollY - parentTop;
    const translateY = relScroll * speed;
    rune.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
  });

  lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
  isScrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!isScrollTicking) {
    window.requestAnimationFrame(onScroll);
    isScrollTicking = true;
  }
}, { passive: true });
onScroll();

// Back-to-Top Button Smooth Action
if (backToTopBtn) {
  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Quick-Nav Radar Dot Click Smooth Action
radarDots.forEach(dot => {
  dot.addEventListener('click', (e) => {
    e.preventDefault();
    const secId = dot.getAttribute('data-section');
    const targetSection = document.getElementById(secId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


/* ═══════════════════════════════════════════════
   3. MOBILE NAVIGATION MENU
═══════════════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');

if (hamburger && navLinksEl) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinksEl.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navLinksEl.classList.contains('open')) {
      navLinksEl.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}


/* ═══════════════════════════════════════════════
   4. BIDIRECTIONAL SCROLL REVEAL (UP & DOWN)
═══════════════════════════════════════════════ */
let revealObserver = null;

function setupScrollReveal() {
  if (revealObserver) {
    revealObserver.disconnect();
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.remove('hidden-below', 'hidden-above');
        } else {
          const rect = entry.boundingClientRect;
          if (rect.top > window.innerHeight) {
            entry.target.classList.remove('visible');
            entry.target.classList.add('hidden-below');
          } else if (rect.bottom < 0) {
            entry.target.classList.remove('visible');
            entry.target.classList.add('hidden-above');
          }
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    // If not manually set, calculate a staggered index based on its siblings with .reveal
    if (!el.style.getPropertyValue('--item-idx')) {
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(child => child.classList.contains('reveal'));
        const idx = siblings.indexOf(el);
        if (idx !== -1) {
          el.style.setProperty('--item-idx', idx);
        }
      }
    }
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('visible');
    }
    revealObserver.observe(el);
  });
}

setupScrollReveal();


/* ═══════════════════════════════════════════════
   5. SKILL BAR & COUNTER OBSERVERS
═══════════════════════════════════════════════ */
let skillObserver = null;
function setupSkillObserver() {
  if (skillObserver) skillObserver.disconnect();

  skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
            setTimeout(() => bar.classList.add('animated'), i * 120);
          });
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  document.querySelectorAll('.skill-category').forEach(el => skillObserver.observe(el));
}

function animateCounter(el, target, duration = 1400) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start);
    if (start >= target) clearInterval(timer);
  }, 16);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-number[data-count]').forEach(el => {
          const count = parseInt(el.getAttribute('data-count'), 10) || 0;
          animateCounter(el, count);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);


/* ═══════════════════════════════════════════════
   6. TYPED TEXT EFFECT
═══════════════════════════════════════════════ */
let typeTimeoutId = null;
let currentTypedWords = ['UI Architect', 'AI Engineer', 'Problem Solver', 'Open Source Builder'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeLoop() {
  const typedEl = document.getElementById('typed-text');
  if (!typedEl || !currentTypedWords.length) return;

  const word = currentTypedWords[wordIndex % currentTypedWords.length];
  const speed = isDeleting ? 50 : charIndex === word.length ? 1900 : 85;

  if (!isDeleting) {
    typedEl.textContent = word.slice(0, ++charIndex);
    if (charIndex === word.length) { isDeleting = true; }
  } else {
    typedEl.textContent = word.slice(0, --charIndex);
    if (charIndex === 0) { isDeleting = false; wordIndex++; }
  }
  typeTimeoutId = setTimeout(typeLoop, speed);
}

function startTyping(words) {
  if (typeTimeoutId) clearTimeout(typeTimeoutId);
  if (words && words.length) currentTypedWords = words;
  wordIndex = 0;
  charIndex = 0;
  isDeleting = false;
  typeLoop();
}


/* ═══════════════════════════════════════════════
   7. 3D INTERACTIVE CYBER-HOLOGRAM CANVAS ENGINE
      (Sphere, Rings, Click Scatter & Mouse Tilt)
═══════════════════════════════════════════════ */
class Cyber3DCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.rings = [];
    this.ambientParticles = [];
    this.numSphereParticles = 460;
    this.numRingParticles = 160;
    this.numAmbientParticles = 90;
    this.radius = 125;
    this.fov = 340;

    // Rotation & Mouse interaction
    this.rotX = 0.2;
    this.rotY = 0;
    this.rotZ = 0;
    this.targetRotX = 0.2;
    this.targetRotY = 0;
    this.autoSpeedY = 0.007;
    this.autoSpeedX = 0.003;
    this.isHovered = false;

    // Performance tracking
    this.fpsEl = document.getElementById('canvas-fps');
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();

    this.init();
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
    this.createParticles();
    this.setupInteractivity();
    this.animate();
  }

  handleResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.cx = this.width / 2;
    this.cy = this.height / 2;
  }

  createParticles() {
    this.particles = [];
    // 1. Fibonacci 3D Sphere Particles
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < this.numSphereParticles; i++) {
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / this.numSphereParticles);
      const x = this.radius * Math.sin(phi) * Math.cos(theta);
      const y = this.radius * Math.sin(phi) * Math.sin(theta);
      const z = this.radius * Math.cos(phi);

      this.particles.push({
        baseX: x, baseY: y, baseZ: z,
        x: x, y: y, z: z,
        vx: 0, vy: 0, vz: 0,
        size: Math.random() * 2 + 1.2,
        colorType: i % 3 === 0 ? 'cyan' : i % 3 === 1 ? 'purple' : 'pink',
        scattered: false
      });
    }

    // 2. Concentric Cyber-Rings (Planetary Gyroscope)
    for (let i = 0; i < this.numRingParticles; i++) {
      const angle = (i / this.numRingParticles) * Math.PI * 2;
      const ringRadius = this.radius * 1.5 + (Math.random() * 12 - 6);
      // Inclined ring plane
      const rx = Math.cos(angle) * ringRadius;
      const rz = Math.sin(angle) * ringRadius;
      const ry = Math.sin(angle) * 35; // Tilt

      this.particles.push({
        baseX: rx, baseY: ry, baseZ: rz,
        x: rx, y: ry, z: rz,
        vx: 0, vy: 0, vz: 0,
        size: Math.random() * 1.8 + 1,
        colorType: i % 2 === 0 ? 'emerald' : 'cyan',
        scattered: false
      });
    }

    // 3. Ambient Sparks
    for (let i = 0; i < this.numAmbientParticles; i++) {
      const dist = this.radius * (1.2 + Math.random() * 1.3);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const x = dist * Math.sin(phi) * Math.cos(theta);
      const y = dist * Math.sin(phi) * Math.sin(theta);
      const z = dist * Math.cos(phi);

      this.ambientParticles.push({
        x: x, y: y, z: z,
        pulseSpeed: 0.02 + Math.random() * 0.04,
        pulseVal: Math.random() * Math.PI
      });
    }
  }

  setupInteractivity() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    parent.addEventListener('mousemove', (e) => {
      this.isHovered = true;
      const rect = parent.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
      this.targetRotY = mouseX * 2.2;
      this.targetRotX = -mouseY * 2.2;
    });

    parent.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.targetRotX = 0.2;
    });

    // CLICK EXPLOSION: Scatter particles rapidly, then smoothly pull back!
    parent.addEventListener('click', () => {
      this.scatterParticles();
    });
  }

  scatterParticles() {
    this.particles.forEach(p => {
      const force = 9 + Math.random() * 14;
      const angleTheta = Math.random() * Math.PI * 2;
      const anglePhi = Math.random() * Math.PI;
      p.vx = Math.sin(anglePhi) * Math.cos(angleTheta) * force;
      p.vy = Math.sin(anglePhi) * Math.sin(angleTheta) * force;
      p.vz = Math.cos(anglePhi) * force;
      p.scattered = true;
    });

    const modeEl = document.getElementById('canvas-hud-mode');
    if (modeEl) {
      modeEl.textContent = 'SYS: SCATTER BURST';
      modeEl.style.color = 'var(--accent-pink)';
      setTimeout(() => {
        if (modeEl) {
          modeEl.textContent = 'SYS: ONLINE';
          modeEl.style.color = 'var(--accent-emerald)';
        }
      }, 1200);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // FPS update
    const now = performance.now();
    this.frameCount++;
    if (now - this.lastFpsUpdate >= 600) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      if (this.fpsEl) this.fpsEl.textContent = `${fps} FPS`;
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    // Smooth rotation lerping
    if (!this.isHovered) {
      this.rotY += this.autoSpeedY;
      this.rotX += this.autoSpeedX * 0.5;
    } else {
      this.rotY += (this.targetRotY - this.rotY) * 0.08;
      this.rotX += (this.targetRotX - this.rotX) * 0.08;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);

    // Update and project main particles
    const projected = [];

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Physics integration for scatter recoil
      if (p.scattered) {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.vz *= 0.88;

        // Spring attraction to base
        p.x += (p.baseX - p.x) * 0.07;
        p.y += (p.baseY - p.y) * 0.07;
        p.z += (p.baseZ - p.z) * 0.07;

        if (Math.hypot(p.baseX - p.x, p.baseY - p.y, p.baseZ - p.z) < 1.5) {
          p.x = p.baseX;
          p.y = p.baseY;
          p.z = p.baseZ;
          p.scattered = false;
        }
      } else {
        p.x = p.baseX;
        p.y = p.baseY;
        p.z = p.baseZ;
      }

      // 3D Matrix Rotation (Y then X)
      const x1 = p.x * cosY + p.z * sinY;
      const z1 = -p.x * sinY + p.z * cosY;
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      // Perspective Projection
      const scale = this.fov / (this.fov + z2);
      const px = this.cx + x1 * scale;
      const py = this.cy + y2 * scale;
      const alpha = Math.min(1, Math.max(0.12, (z2 + this.radius * 1.5) / (this.radius * 3)));

      projected.push({ px, py, scale, z2, alpha, colorType: p.colorType, size: p.size * scale });
    }

    // Sort by depth (draw back to front)
    projected.sort((a, b) => a.z2 - b.z2);

    // Draw connecting network lines for nearby particles
    this.ctx.lineWidth = 0.55;
    for (let i = 0; i < projected.length; i += 4) {
      const p1 = projected[i];
      for (let j = i + 1; j < Math.min(i + 8, projected.length); j++) {
        const p2 = projected[j];
        const dist = Math.hypot(p1.px - p2.px, p1.py - p2.py);
        if (dist < 42) {
          const lineAlpha = (1 - dist / 42) * 0.28 * p1.alpha;
          this.ctx.strokeStyle = `rgba(0, 245, 255, ${lineAlpha})`;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.px, p1.py);
          this.ctx.lineTo(p2.px, p2.py);
          this.ctx.stroke();
        }
      }
    }

    // Render Particles
    projected.forEach(p => {
      let fill = '';
      if (p.colorType === 'cyan') fill = `rgba(0, 245, 255, ${p.alpha})`;
      else if (p.colorType === 'purple') fill = `rgba(168, 85, 247, ${p.alpha})`;
      else if (p.colorType === 'pink') fill = `rgba(255, 0, 127, ${p.alpha})`;
      else fill = `rgba(0, 255, 136, ${p.alpha})`;

      this.ctx.fillStyle = fill;
      this.ctx.beginPath();
      this.ctx.arc(p.px, p.py, Math.max(0.7, p.size), 0, Math.PI * 2);
      this.ctx.fill();

      // Front particle glow bloom
      if (p.z2 > 40 && p.alpha > 0.65) {
        this.ctx.fillStyle = fill.replace(/[\d\.]+\)$/, '0.18)');
        this.ctx.beginPath();
        this.ctx.arc(p.px, p.py, p.size * 2.8, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    // Render Ambient Core Glow
    const gradient = this.ctx.createRadialGradient(this.cx, this.cy, 5, this.cx, this.cy, this.radius * 0.9);
    gradient.addColorStop(0, 'rgba(0, 245, 255, 0.08)');
    gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.04)');
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, this.radius * 0.9, 0, Math.PI * 2);
    this.ctx.fill();
  }
}


/* ═══════════════════════════════════════════════
   8. DYNAMIC CONTENT RENDERING & DATA BINDING
═══════════════════════════════════════════════ */
function renderPortfolioContent(data) {
  if (!data) return;

  // 1. Profile / Hero
  const heroNameEl = document.getElementById('hero-name');
  if (heroNameEl && data.profile.name) heroNameEl.textContent = data.profile.name;

  const heroRoleEl = document.getElementById('hero-role-prefix');
  if (heroRoleEl && data.profile.role) heroRoleEl.textContent = `${data.profile.role} &`;

  const heroBadgeEl = document.getElementById('hero-badge-text');
  if (heroBadgeEl && data.profile.badge) heroBadgeEl.textContent = data.profile.badge;

  const heroTaglineEl = document.getElementById('hero-tagline');
  if (heroTaglineEl && data.profile.tagline) {
    // Convert markdown bold **text** to <strong>
    const formatted = data.profile.tagline.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    heroTaglineEl.innerHTML = formatted;
  }

  // Hero Stats
  if (data.profile.heroStats) {
    const sProjects = document.getElementById('stat-projects');
    const sExp = document.getElementById('stat-experience');
    const sClients = document.getElementById('stat-clients');
    if (sProjects) { sProjects.setAttribute('data-count', data.profile.heroStats.projects); sProjects.textContent = data.profile.heroStats.projects; }
    if (sExp) { sExp.setAttribute('data-count', data.profile.heroStats.experience); sExp.textContent = data.profile.heroStats.experience; }
    if (sClients) { sClients.setAttribute('data-count', data.profile.heroStats.clients); sClients.textContent = data.profile.heroStats.clients; }
  }

  // Nav Logo Initials
  if (data.profile.name) {
    const initials = data.profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const navInitials = document.getElementById('nav-initials');
    const aboutInitials = document.getElementById('about-avatar-initials');
    if (navInitials) navInitials.textContent = initials;
    if (aboutInitials) aboutInitials.textContent = initials;
  }

  // Typed Text
  if (data.profile.typedWords && data.profile.typedWords.length) {
    startTyping(data.profile.typedWords);
  }

  // 2. About Section
  const aboutIntroEl = document.getElementById('about-intro');
  const aboutBio1El = document.getElementById('about-bio-1');
  const aboutBio2El = document.getElementById('about-bio-2');
  const aboutBadgeEl = document.getElementById('about-exp-badge');

  if (aboutIntroEl && data.about.intro) aboutIntroEl.innerHTML = data.about.intro.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  if (aboutBio1El && data.about.bio1) aboutBio1El.innerHTML = data.about.bio1.replace(/\*(.*?)\*/g, '<em>$1</em>');
  if (aboutBio2El && data.about.bio2) aboutBio2El.innerHTML = data.about.bio2;
  if (aboutBadgeEl && data.about.yearsBadge) aboutBadgeEl.textContent = data.about.yearsBadge;

  // 3. Projects Grid
  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid && data.projects && data.projects.length) {
    projectsGrid.innerHTML = data.projects.map((proj, idx) => `
      <article class="project-card reveal reveal-tilt" style="--item-idx: ${idx}" id="${proj.id || 'proj-' + idx}">
        <div class="project-image-wrap">
          <img src="${proj.image || 'project1.jpg'}" alt="${proj.title}" loading="lazy" onerror="this.src='project1.jpg'" />
          <div class="project-overlay">
            <div class="project-links-overlay">
              <a href="${proj.demoLink || '#'}" class="overlay-link" target="_blank" rel="noopener">Live Demo ↗</a>
              <a href="${proj.codeLink || '#'}" class="overlay-link" target="_blank" rel="noopener">GitHub ↗</a>
            </div>
          </div>
          <span class="project-number">${String(idx + 1).padStart(2, '0')}</span>
        </div>
        <div class="project-info">
          <div class="project-tags">
            ${(proj.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <h3 class="project-title">${proj.title}</h3>
          <p class="project-desc">${proj.desc}</p>
          <div class="project-links">
            <a href="${proj.demoLink || '#'}" class="btn btn-primary btn-sm" target="_blank" rel="noopener">Live Demo ↗</a>
            <a href="${proj.codeLink || '#'}" class="btn btn-ghost btn-sm" target="_blank" rel="noopener">Code</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  // 4. Skills Grid
  const skillsGrid = document.getElementById('skills-grid');
  if (skillsGrid && data.skills && data.skills.length) {
    const categoriesHtml = data.skills.map((cat, i) => `
      <div class="skill-category reveal ${i % 2 === 0 ? 'reveal-left' : 'reveal-right'}" style="--item-idx: ${i}" id="skill-cat-${i}">
        <div class="skill-category-header">
          <span class="skill-cat-icon">${cat.icon || '⚡'}</span>
          <h3>${cat.category}</h3>
        </div>
        <div class="skill-items">
          ${(cat.items || []).map(item => `
            <div class="skill-item">
              <span class="skill-name">${item.name}</span>
              <div class="skill-bar"><div class="skill-fill animated" style="--level: ${item.level}%"></div></div>
              <span class="skill-pct">${item.level}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    const softSkillsHtml = data.softSkills && data.softSkills.length ? `
      <div class="skill-category reveal reveal-left" style="--item-idx: ${(data.skills || []).length}" id="skills-soft">
        <div class="skill-category-header">
          <span class="skill-cat-icon">🎯</span>
          <h3>Core Competencies</h3>
        </div>
        <div class="soft-skills-grid">
          ${data.softSkills.map(s => `<span class="soft-skill-badge">${s}</span>`).join('')}
        </div>
      </div>
    ` : '';

    skillsGrid.innerHTML = categoriesHtml + softSkillsHtml;
  }

  // 5. Contact Info
  if (data.contact) {
    const emailVal = document.getElementById('contact-email-val');
    const locVal = document.getElementById('contact-location-val');
    const statusVal = document.getElementById('contact-status-val');
    const emailLink = document.getElementById('email-link');

    if (emailVal) emailVal.textContent = data.contact.email;
    if (locVal) locVal.textContent = data.contact.location;
    if (statusVal) statusVal.textContent = data.contact.status;
    if (emailLink) emailLink.setAttribute('href', `mailto:${data.contact.email}`);
  }

  // 6. Social Links
  if (data.social) {
    const gh = document.getElementById('social-github');
    const li = document.getElementById('social-linkedin');
    const tw = document.getElementById('social-twitter');
    if (gh && data.social.github) gh.setAttribute('href', data.social.github);
    if (li && data.social.linkedin) li.setAttribute('href', data.social.linkedin);
    if (tw && data.social.twitter) tw.setAttribute('href', data.social.twitter);
  }

  // 7. Footer
  const footerCopy = document.getElementById('footer-copy');
  if (footerCopy && data.profile.name) {
    footerCopy.innerHTML = `&copy; ${new Date().getFullYear()} ${data.profile.name}. Crafted with ❤️ and Cyberpunk Precision.`;
  }

  // Re-bind observers
  setupScrollReveal();
  setupSkillObserver();
}


/* ═══════════════════════════════════════════════
   9. OWNER ADMIN DASHBOARD (LIVE CMS MODAL)
═══════════════════════════════════════════════ */
class OwnerAdminManager {
  constructor() {
    this.modal = document.getElementById('admin-modal');
    this.toggleBtn = document.getElementById('admin-toggle-btn');
    this.closeBtn = document.getElementById('admin-close-btn');
    this.cancelBtn = document.getElementById('admin-cancel-btn');
    this.backdrop = document.getElementById('admin-backdrop');
    this.saveBtn = document.getElementById('admin-save-btn');
    this.statusMsg = document.getElementById('admin-status-msg');

    this.currentData = window.PortfolioStore ? window.PortfolioStore.get() : null;

    this.init();
  }

  init() {
    if (!this.modal || !this.currentData) return;

    // Open/Close triggers
    if (this.toggleBtn) this.toggleBtn.addEventListener('click', () => this.toggleModal());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.closeModal());
    if (this.cancelBtn) this.cancelBtn.addEventListener('click', () => this.closeModal());
    if (this.backdrop) this.backdrop.addEventListener('click', () => this.closeModal());

    // Keyboard shortcut Ctrl + Shift + A
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        this.toggleModal();
      } else if (e.key === 'Escape' && this.modal.classList.contains('open')) {
        this.closeModal();
      }
    });

    // Tab switching
    const tabs = this.modal.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        this.modal.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.getAttribute('data-tab');
        const panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
      });
    });

    // Skill slider feedback
    const skillRange = document.getElementById('new-skill-level');
    const skillVal = document.getElementById('skill-level-val');
    if (skillRange && skillVal) {
      skillRange.addEventListener('input', () => {
        skillVal.textContent = `${skillRange.value}%`;
      });
    }

    // Add Skill Action
    const addSkillBtn = document.getElementById('add-skill-btn');
    if (addSkillBtn) {
      addSkillBtn.addEventListener('click', () => this.addNewSkill());
    }

    // Add Project Action
    const addProjBtn = document.getElementById('add-proj-btn');
    if (addProjBtn) {
      addProjBtn.addEventListener('click', () => this.addNewProject());
    }

    // Save Action
    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', () => this.saveChanges());
    }

    // Export Action
    const exportBtn = document.getElementById('export-json-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (window.PortfolioStore) window.PortfolioStore.exportJSON();
      });
    }

    // Import Action
    const importBtn = document.getElementById('import-json-btn');
    const importFileInput = document.getElementById('import-json-file');
    if (importBtn && importFileInput) {
      importBtn.addEventListener('click', () => importFileInput.click());
      importFileInput.addEventListener('change', (e) => this.handleImportJSON(e));
    }

    // Factory Reset Action
    const resetBtn = document.getElementById('reset-default-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to revert all changes and restore default Cyberpunk settings?')) {
          if (window.PortfolioStore) {
            this.currentData = window.PortfolioStore.reset();
            this.populateForms();
            this.showStatus('✓ System restored to default configuration.');
          }
        }
      });
    }

    // Initial population
    this.populateForms();
  }

  toggleModal() {
    if (this.modal.classList.contains('open')) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  openModal() {
    this.currentData = window.PortfolioStore ? window.PortfolioStore.get() : null;
    this.populateForms();
    this.modal.classList.add('open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal.classList.remove('open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  populateForms() {
    if (!this.currentData) return;
    const d = this.currentData;

    // Profile fields
    const nameInput = document.getElementById('edit-name');
    const roleInput = document.getElementById('edit-role');
    const badgeInput = document.getElementById('edit-badge');
    const typedInput = document.getElementById('edit-typed');
    const taglineInput = document.getElementById('edit-tagline');
    const statP = document.getElementById('edit-stat-projects');
    const statE = document.getElementById('edit-stat-experience');
    const statC = document.getElementById('edit-stat-clients');

    if (nameInput) nameInput.value = d.profile.name || '';
    if (roleInput) roleInput.value = d.profile.role || '';
    if (badgeInput) badgeInput.value = d.profile.badge || '';
    if (typedInput) typedInput.value = (d.profile.typedWords || []).join(', ');
    if (taglineInput) taglineInput.value = d.profile.tagline || '';
    if (statP && d.profile.heroStats) statP.value = d.profile.heroStats.projects;
    if (statE && d.profile.heroStats) statE.value = d.profile.heroStats.experience;
    if (statC && d.profile.heroStats) statC.value = d.profile.heroStats.clients;

    // About fields
    const aboutIntro = document.getElementById('edit-about-intro');
    const aboutBio1 = document.getElementById('edit-about-bio1');
    const aboutBio2 = document.getElementById('edit-about-bio2');

    if (aboutIntro) aboutIntro.value = d.about.intro || '';
    if (aboutBio1) aboutBio1.value = d.about.bio1 || '';
    if (aboutBio2) aboutBio2.value = d.about.bio2 || '';

    // Contact fields
    const emailInput = document.getElementById('edit-email');
    const locInput = document.getElementById('edit-location');
    const ghInput = document.getElementById('edit-github');
    const liInput = document.getElementById('edit-linkedin');
    const twInput = document.getElementById('edit-twitter');

    if (emailInput && d.contact) emailInput.value = d.contact.email || '';
    if (locInput && d.contact) locInput.value = d.contact.location || '';
    if (ghInput && d.social) ghInput.value = d.social.github || '';
    if (liInput && d.social) liInput.value = d.social.linkedin || '';
    if (twInput && d.social) twInput.value = d.social.twitter || '';

    // Render Manage Lists
    this.renderSkillsManagerList();
    this.renderProjectsManagerList();
  }

  renderSkillsManagerList() {
    const list = document.getElementById('admin-skills-list');
    if (!list || !this.currentData.skills) return;

    let itemsHtml = '';
    this.currentData.skills.forEach((cat, catIdx) => {
      (cat.items || []).forEach((item, itemIdx) => {
        itemsHtml += `
          <div class="admin-item-card">
            <div class="admin-item-meta">
              <strong>${item.name} (${item.level}%)</strong>
              <small>${cat.category}</small>
            </div>
            <button type="button" class="admin-del-btn" data-cat="${catIdx}" data-item="${itemIdx}">Delete ✕</button>
          </div>
        `;
      });
    });

    list.innerHTML = itemsHtml || '<p style="color:var(--text-muted);font-size:0.85rem;">No skills registered.</p>';

    list.querySelectorAll('.admin-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const catIdx = parseInt(e.target.getAttribute('data-cat'), 10);
        const itemIdx = parseInt(e.target.getAttribute('data-item'), 10);
        this.currentData.skills[catIdx].items.splice(itemIdx, 1);
        this.renderSkillsManagerList();
      });
    });
  }

  addNewSkill() {
    const catSelect = document.getElementById('new-skill-cat');
    const nameInput = document.getElementById('new-skill-name');
    const levelRange = document.getElementById('new-skill-level');

    if (!nameInput || !nameInput.value.trim()) {
      alert('Please enter a skill name.');
      return;
    }

    const catName = catSelect ? catSelect.value : 'Frontend & UI';
    const skillName = nameInput.value.trim();
    const level = parseInt(levelRange.value, 10) || 85;

    let categoryObj = this.currentData.skills.find(c => c.category === catName);
    if (!categoryObj) {
      categoryObj = { category: catName, icon: '⚡', items: [] };
      this.currentData.skills.push(categoryObj);
    }

    categoryObj.items.push({ name: skillName, level });
    nameInput.value = '';
    this.renderSkillsManagerList();
    this.showStatus(`+ Added skill: ${skillName}`);
  }

  renderProjectsManagerList() {
    const list = document.getElementById('admin-projects-list');
    if (!list || !this.currentData.projects) return;

    const itemsHtml = this.currentData.projects.map((proj, idx) => `
      <div class="admin-item-card">
        <div class="admin-item-meta">
          <strong>${proj.title}</strong>
          <small>${(proj.tags || []).join(' • ')}</small>
        </div>
        <button type="button" class="admin-del-btn" data-proj="${idx}">Delete ✕</button>
      </div>
    `).join('');

    list.innerHTML = itemsHtml || '<p style="color:var(--text-muted);font-size:0.85rem;">No projects added.</p>';

    list.querySelectorAll('.admin-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-proj'), 10);
        const deleted = this.currentData.projects.splice(idx, 1);
        this.renderProjectsManagerList();
        this.showStatus(`Deleted project: ${deleted[0]?.title}`);
      });
    });
  }

  addNewProject() {
    const titleInput = document.getElementById('new-proj-title');
    const descInput = document.getElementById('new-proj-desc');
    const tagsInput = document.getElementById('new-proj-tags');
    const imgInput = document.getElementById('new-proj-img');
    const demoInput = document.getElementById('new-proj-demo');
    const codeInput = document.getElementById('new-proj-code');

    if (!titleInput || !titleInput.value.trim()) {
      alert('Please enter a project title.');
      return;
    }

    const newProj = {
      id: `proj-${Date.now()}`,
      title: titleInput.value.trim(),
      desc: descInput ? descInput.value.trim() : '',
      tags: tagsInput && tagsInput.value.trim() ? tagsInput.value.split(',').map(s => s.trim()).filter(Boolean) : ['React', 'TypeScript'],
      image: imgInput && imgInput.value.trim() ? imgInput.value.trim() : 'project1.jpg',
      demoLink: demoInput ? demoInput.value.trim() : '#',
      codeLink: codeInput ? codeInput.value.trim() : '#'
    };

    this.currentData.projects.push(newProj);
    titleInput.value = '';
    if (descInput) descInput.value = '';
    if (tagsInput) tagsInput.value = '';

    this.renderProjectsManagerList();
    this.showStatus(`+ Added project: ${newProj.title}`);
  }

  saveChanges() {
    // Gather all inputs from forms
    const name = document.getElementById('edit-name')?.value.trim();
    const role = document.getElementById('edit-role')?.value.trim();
    const badge = document.getElementById('edit-badge')?.value.trim();
    const typed = document.getElementById('edit-typed')?.value;
    const tagline = document.getElementById('edit-tagline')?.value.trim();
    const statP = parseInt(document.getElementById('edit-stat-projects')?.value, 10);
    const statE = parseInt(document.getElementById('edit-stat-experience')?.value, 10);
    const statC = parseInt(document.getElementById('edit-stat-clients')?.value, 10);

    if (name) this.currentData.profile.name = name;
    if (role) this.currentData.profile.role = role;
    if (badge) this.currentData.profile.badge = badge;
    if (typed) this.currentData.profile.typedWords = typed.split(',').map(s => s.trim()).filter(Boolean);
    if (tagline) this.currentData.profile.tagline = tagline;

    if (!isNaN(statP) && !isNaN(statE) && !isNaN(statC)) {
      this.currentData.profile.heroStats = { projects: statP, experience: statE, clients: statC };
    }

    // About
    const intro = document.getElementById('edit-about-intro')?.value.trim();
    const bio1 = document.getElementById('edit-about-bio1')?.value.trim();
    const bio2 = document.getElementById('edit-about-bio2')?.value.trim();
    if (intro) this.currentData.about.intro = intro;
    if (bio1) this.currentData.about.bio1 = bio1;
    if (bio2) this.currentData.about.bio2 = bio2;

    // Contact
    const email = document.getElementById('edit-email')?.value.trim();
    const loc = document.getElementById('edit-location')?.value.trim();
    if (email) this.currentData.contact.email = email;
    if (loc) this.currentData.contact.location = loc;

    // Social
    const gh = document.getElementById('edit-github')?.value.trim();
    const li = document.getElementById('edit-linkedin')?.value.trim();
    const tw = document.getElementById('edit-twitter')?.value.trim();
    if (gh) this.currentData.social.github = gh;
    if (li) this.currentData.social.linkedin = li;
    if (tw) this.currentData.social.twitter = tw;

    // Save to localStorage & trigger live update
    if (window.PortfolioStore) {
      window.PortfolioStore.set(this.currentData);
      this.showStatus('✓ CYBER-SYNC COMPLETE: Live content updated and saved!');
    }
  }

  handleImportJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (window.PortfolioStore) {
        const res = window.PortfolioStore.importJSON(event.target.result);
        if (res.success) {
          this.currentData = window.PortfolioStore.get();
          this.populateForms();
          this.showStatus('✓ Configuration imported successfully!');
        } else {
          alert('Import failed: ' + res.error);
        }
      }
    };
    reader.readAsText(file);
  }

  showStatus(msg) {
    if (!this.statusMsg) return;
    this.statusMsg.textContent = msg;
    this.statusMsg.style.opacity = '1';
    setTimeout(() => {
      if (this.statusMsg) this.statusMsg.style.opacity = '0.7';
    }, 4000);
  }
}


/* ═══════════════════════════════════════════════
   10. CONTACT FORM HANDLING
═══════════════════════════════════════════════ */
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const submitBtn = document.getElementById('submit-btn');

if (contactForm && formSuccess && submitBtn) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      formSuccess.textContent = '⚠ Please fill in all required fields.';
      formSuccess.style.color = 'var(--accent-amber)';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formSuccess.textContent = '⚠ Please enter a valid email address.';
      formSuccess.style.color = 'var(--accent-amber)';
      return;
    }

    const btnText = submitBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'Transmitting…';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.75';

    await new Promise(r => setTimeout(r, 1400));

    if (btnText) btnText.textContent = 'Send Message';
    submitBtn.disabled = false;
    submitBtn.style.opacity = '';

    formSuccess.style.color = 'var(--accent-emerald)';
    formSuccess.textContent = "✓ Packet transmitted! I'll get back to you soon.";
    contactForm.reset();

    setTimeout(() => (formSuccess.textContent = ''), 6000);
  });
}


/* ═══════════════════════════════════════════════
   11. INITIALIZATION ON DOM READY
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Load initial data and render DOM
  if (window.PortfolioStore) {
    const data = window.PortfolioStore.get();
    renderPortfolioContent(data);
  }

  // 2. Listen for store changes to re-render in real time
  window.addEventListener('portfolioDataChanged', (e) => {
    renderPortfolioContent(e.detail);
  });

  // 3. Initialize 3D Cyber-Hologram Canvas
  new Cyber3DCanvas('hero-3d-canvas');

  // 4. Initialize Owner Admin Dashboard
  new OwnerAdminManager();
});
