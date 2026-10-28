/* ─────────────────────────────────────────────
   script.js — Portfolio Interactive Logic
───────────────────────────────────────────── */

'use strict';

/* ══════════════ THEME TOGGLE ══════════════ */
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

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  themeToggle.style.transform = 'scale(0.8) rotate(20deg)';
  setTimeout(() => (themeToggle.style.transform = ''), 200);
});


/* ══════════════ NAVBAR SCROLL ══════════════ */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function onScroll() {
  // Scrolled class
  navbar.classList.toggle('scrolled', window.scrollY > 30);

  // Active nav link
  let currentSection = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) currentSection = section.id;
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href').slice(1);
    link.classList.toggle('active', href === currentSection);
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();


/* ══════════════ MOBILE MENU ══════════════ */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = navLinksEl.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close on link click
navLinksEl.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navLinksEl.classList.contains('open')) {
    navLinksEl.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});


/* ══════════════ SCROLL REVEAL ══════════════ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children in the same parent
        const siblings = entry.target.parentElement.querySelectorAll('.reveal:not(.visible)');
        let delay = 0;
        siblings.forEach(el => {
          if (el === entry.target || el.getBoundingClientRect().top < window.innerHeight) {
            setTimeout(() => el.classList.add('visible'), delay);
            delay += 80;
          }
        });
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ══════════════ SKILL BAR ANIMATION ══════════════ */
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
          setTimeout(() => bar.classList.add('animated'), i * 150);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('.skill-category').forEach(el => skillObserver.observe(el));


/* ══════════════ COUNTER ANIMATION ══════════════ */
function animateCounter(el, target, duration = 1500) {
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
          const count = parseInt(el.getAttribute('data-count'), 10);
          animateCounter(el, count);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);


/* ══════════════ TYPED TEXT EFFECT ══════════════ */
const typedEl = document.getElementById('typed-text');
const words = ['UI Architect', 'Open Source Contributor', 'Problem Solver', 'Tech Enthusiast', 'API Engineer'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
  if (!typedEl) return;
  const word = words[wordIndex % words.length];
  const speed = isDeleting ? 60 : charIndex === word.length ? 1800 : 90;

  if (!isDeleting) {
    typedEl.textContent = word.slice(0, ++charIndex);
    if (charIndex === word.length) { isDeleting = true; }
  } else {
    typedEl.textContent = word.slice(0, --charIndex);
    if (charIndex === 0) { isDeleting = false; wordIndex++; }
  }
  setTimeout(type, speed);
}
setTimeout(type, 1200);


/* ══════════════ CONTACT FORM ══════════════ */
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const submitBtn = document.getElementById('submit-btn');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const message = document.getElementById('contact-message').value.trim();

  // Basic validation
  if (!name || !email || !message) {
    formSuccess.textContent = '⚠ Please fill in all required fields.';
    formSuccess.style.color = 'hsl(38, 92%, 55%)';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formSuccess.textContent = '⚠ Please enter a valid email address.';
    formSuccess.style.color = 'hsl(38, 92%, 55%)';
    return;
  }

  // Simulate send
  const btnText = submitBtn.querySelector('.btn-text');
  btnText.textContent = 'Sending…';
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.75';

  await new Promise(r => setTimeout(r, 1800));

  btnText.textContent = 'Send Message';
  submitBtn.disabled = false;
  submitBtn.style.opacity = '';

  formSuccess.style.color = 'hsl(142, 71%, 55%)';
  formSuccess.textContent = '✓ Message sent successfully! I'll get back to you soon.';
  contactForm.reset();

  setTimeout(() => (formSuccess.textContent = ''), 6000);
});

// Real-time validation hint
document.querySelectorAll('.form-input').forEach(input => {
  input.addEventListener('blur', () => {
    if (input.required && !input.value.trim()) {
      input.style.borderColor = 'hsl(0, 72%, 60%)';
    } else {
      input.style.borderColor = '';
    }
  });
  input.addEventListener('input', () => {
    input.style.borderColor = '';
  });
});


/* ══════════════ SMOOTH SCROLL ══════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ══════════════ PARALLAX ORBS ══════════════ */
const orbs = document.querySelectorAll('.floating-orb');
document.addEventListener('mousemove', (e) => {
  if (window.innerWidth < 768) return;
  const xFactor = (e.clientX / window.innerWidth - 0.5) * 2;
  const yFactor = (e.clientY / window.innerHeight - 0.5) * 2;
  orbs.forEach((orb, i) => {
    const strength = (i + 1) * 12;
    orb.style.transform = `translate(${xFactor * strength}px, ${yFactor * strength}px)`;
  });
}, { passive: true });


/* ══════════════ TOOL BADGE RIPPLE ══════════════ */
document.querySelectorAll('.tool-badge').forEach(badge => {
  badge.addEventListener('mouseenter', (e) => {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute; border-radius:50%; background:rgba(255,255,255,0.3);
      width:6px; height:6px; transform:scale(0); animation:ripple 0.4s ease-out;
      pointer-events:none; left:50%; top:50%; margin:-3px;
    `;
    if (!document.querySelector('#ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = '@keyframes ripple { to { transform: scale(8); opacity: 0; } }';
      document.head.appendChild(style);
    }
    badge.style.position = 'relative';
    badge.style.overflow = 'hidden';
    badge.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);
  });
});


/* ══════════════ STAGGERED PROJECT CARDS ══════════════ */
document.querySelectorAll('.project-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});
