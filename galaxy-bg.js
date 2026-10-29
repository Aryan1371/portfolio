/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FULL-PAGE THREE.JS 3D PARTICLE GALAXY BACKGROUND ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * 1. Dedicated Three.js Scene, Camera & WebGLRenderer inside fixed background
 * 2. 14,000+ Dense 3D Spiral Galaxy Particles with logarithmic arm distribution
 * 3. Dynamic Cosmic Vertex Color Palette (White Core -> Indigo -> Cyan -> Magenta)
 * 4. Ambient Deep-Space Starfield (1,800 stars) for multidimensional spatial depth
 * 5. Smooth Continuous Idle Orbit & Axis Precession
 * 6. High-Frequency Scroll Reactivity:
 *    - Accelerates rotation proportionally to scroll velocity
 *    - Reverses/decelerates gracefully on scroll-up
 *    - Shifts camera altitude & perspective through galaxy plane per section
 * 7. Weightless Mouse Parallax with smooth lerp tracking
 * 8. Performance & Battery Optimization (Visibility API, IntersectionObserver, 60fps locked)
 */

(function () {
  'use strict';

  class ThreeGalaxyBackground {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      // Check for Three.js global
      if (typeof THREE === 'undefined') {
        console.warn('[ThreeGalaxyBackground] THREE is not loaded yet. Retrying in 100ms...');
        setTimeout(() => new ThreeGalaxyBackground(containerId), 100);
        return;
      }

      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Reduced motion accessibility
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Galaxy configuration parameters
      this.params = {
        count: this.reducedMotion ? 6500 : 14000,
        size: 0.026,
        radius: 7.5,
        branches: 3,
        spin: 1.35,
        randomness: 0.45,
        power: 3.6,
        coreColor: '#ffffff',     // Dazzling white core stars
        insideColor: '#7928ca',   // Deep cosmic purple/indigo
        midColor: '#00f5ff',      // Neon cyber cyan
        outsideColor: '#ff007f'   // Hyper magenta on spiral perimeter
      };

      // Scroll State & Momentum
      this.scrollY = window.scrollY || 0;
      this.targetScrollY = this.scrollY;
      this.scrollVelocity = 0;
      this.smoothVelocity = 0;
      this.scrollDirection = 1;
      this.scrollProgress = 0;

      // Mouse Parallax State
      this.mouse = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
      };

      // Lifecycle State
      this.isPaused = false;
      this.isContainerVisible = true;
      this.clock = new THREE.Clock();
      this.rafId = null;

      // Initialize Three.js Engine
      this.initScene();
      this.initGalaxy();
      this.initAmbientStarfield();
      this.bindEvents();

      // Start 60fps Render Loop
      this.loop = this.loop.bind(this);
      this.rafId = requestAnimationFrame(this.loop);
    }

    /* ═══════════════ SCENE, CAMERA & RENDERER SETUP ═══════════════ */
    initScene() {
      // 1. Scene
      this.scene = new THREE.Scene();

      // Atmospheric cosmic fog for depth attenuation
      this.scene.fog = new THREE.FogExp2(0x060814, 0.018);

      // 2. Camera
      this.camera = new THREE.PerspectiveCamera(
        58,
        this.width / this.height,
        0.1,
        100
      );
      this.baseCameraY = 3.2;
      this.baseCameraZ = 5.2;
      this.camera.position.set(0, this.baseCameraY, this.baseCameraZ);
      this.camera.lookAt(0, 0, 0);

      // 3. WebGLRenderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(this.dpr);
      this.renderer.setClearColor(0x060814, 1.0);

      // Append canvas to background container
      this.container.innerHTML = '';
      this.container.appendChild(this.renderer.domElement);
    }

    /* ═══════════════ TEXTURE GENERATION ═══════════════ */
    // Generates a soft, glowing spherical particle texture dynamically in memory
    createParticleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.18, 'rgba(240, 245, 255, 0.95)');
      grad.addColorStop(0.45, 'rgba(120, 160, 255, 0.45)');
      grad.addColorStop(0.75, 'rgba(168, 85, 247, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    /* ═══════════════ 3D SPIRAL GALAXY GEOMETRY ═══════════════ */
    initGalaxy() {
      const count = this.params.count;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      const colorCore = new THREE.Color(this.params.coreColor);
      const colorInside = new THREE.Color(this.params.insideColor);
      const colorMid = new THREE.Color(this.params.midColor);
      const colorOutside = new THREE.Color(this.params.outsideColor);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // Radial distance with exponential clustering towards dense core
        const rNorm = Math.pow(Math.random(), this.params.power);
        const radius = rNorm * this.params.radius;

        // Spiral angle based on branch index + radial spin twist
        const branchAngle = ((i % this.params.branches) / this.params.branches) * Math.PI * 2;
        const spinAngle = radius * this.params.spin;

        // Gaussian-style random offsets for thickness and arm spread
        // Core is a spheroidal bulge; spiral arms flatten out into a thin disc
        const coreThickness = Math.max(0.15, 1.0 - (radius / this.params.radius));
        const randomX = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * this.params.randomness * (0.4 + radius * 0.18);
        const randomY = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * this.params.randomness * (coreThickness * 0.85);
        const randomZ = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * this.params.randomness * (0.4 + radius * 0.18);

        positions[i3]     = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        // Dynamic Cosmic Color Interpolation across radius
        const normR = radius / this.params.radius;
        const mixedColor = new THREE.Color();

        if (normR < 0.12) {
          // Dense central core: Bright white to deep purple
          const t = normR / 0.12;
          mixedColor.lerpColors(colorCore, colorInside, t);
        } else if (normR < 0.55) {
          // Inner spiral arms: Deep purple/indigo to electric cyan
          const t = (normR - 0.12) / 0.43;
          mixedColor.lerpColors(colorInside, colorMid, t);
        } else {
          // Outer spiral arms: Electric cyan to hyper magenta
          const t = (normR - 0.55) / 0.45;
          mixedColor.lerpColors(colorMid, colorOutside, t);
        }

        // Add subtle cosmic variance per star
        const hueJitter = (Math.random() - 0.5) * 0.04;
        mixedColor.offsetHSL(hueJitter, 0, (Math.random() - 0.5) * 0.08);

        colors[i3]     = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
      }

      this.galaxyGeometry = new THREE.BufferGeometry();
      this.galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Circular Glowing Additive Shader Material
      this.galaxyMaterial = new THREE.PointsMaterial({
        size: this.params.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        map: this.createParticleTexture(),
        transparent: true,
        opacity: 0.95
      });

      this.galaxy = new THREE.Points(this.galaxyGeometry, this.galaxyMaterial);
      // Gentle initial cosmic pitch
      this.galaxy.rotation.x = 0.28;
      this.galaxy.rotation.z = -0.15;
      this.scene.add(this.galaxy);
    }

    /* ═══════════════ AMBIENT DEEP STARFIELD ═══════════════ */
    initAmbientStarfield() {
      const starCount = this.reducedMotion ? 800 : 1800;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);

      const colorPalette = [
        new THREE.Color('#9aa8c7'), // Faint stellar blue
        new THREE.Color('#00f5ff'), // Cyan
        new THREE.Color('#a855f7'), // Purple
        new THREE.Color('#ffffff')  // Pure white
      ];

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        // Spherical distribution around galaxy
        const radius = 10 + Math.random() * 22;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        positions[i3]     = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        const starColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3]     = starColor.r * (0.4 + Math.random() * 0.6);
        colors[i3 + 1] = starColor.g * (0.4 + Math.random() * 0.6);
        colors[i3 + 2] = starColor.b * (0.4 + Math.random() * 0.6);
      }

      this.starfieldGeometry = new THREE.BufferGeometry();
      this.starfieldGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.starfieldGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      this.starfieldMaterial = new THREE.PointsMaterial({
        size: 0.038,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        map: this.createParticleTexture(),
        transparent: true,
        opacity: 0.75
      });

      this.starfield = new THREE.Points(this.starfieldGeometry, this.starfieldMaterial);
      this.scene.add(this.starfield);
    }

    /* ═══════════════ RESIZE HANDLER ═══════════════ */
    onResize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(this.dpr);
    }

    /* ═══════════════ EVENT LISTENERS ═══════════════ */
    bindEvents() {
      // 1. Debounced Window Resize
      let resizeTimeout = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.onResize(), 80);
      }, { passive: true });

      // 2. High-Frequency Scroll Listener
      window.addEventListener('scroll', () => {
        this.targetScrollY = window.scrollY;
      }, { passive: true });

      // 3. Mouse Parallax (Normalized -1.0 to 1.0)
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
        this.mouse.targetY = -(e.clientY / this.height) * 2 + 1;
      }, { passive: true });

      // 4. IntersectionObserver: Pause rendering when container is offscreen
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isContainerVisible = entry.isIntersecting;
            if (entry.isIntersecting) {
              if (!document.hidden) this.resume();
            } else {
              this.pause();
            }
          });
        }, { threshold: 0.01 });
        this.observer.observe(this.container);
      }

      // 5. Page Visibility API: Pause when tab is inactive to preserve 100% GPU
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else if (this.isContainerVisible) {
          this.resume();
        }
      });

      // 6. Theme Change Listener
      const themeObserver = new MutationObserver(() => {
        this.updateThemeColors();
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
      this.updateThemeColors();
    }

    /* ═══════════════ THEME COLOR ADAPTATION ═══════════════ */
    updateThemeColors() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (this.renderer) {
        if (isLight) {
          this.renderer.setClearColor(0xeef2f9, 1.0);
          if (this.scene.fog) this.scene.fog.color.set(0xeef2f9);
          if (this.galaxyMaterial) this.galaxyMaterial.opacity = 0.85;
        } else {
          this.renderer.setClearColor(0x060814, 1.0);
          if (this.scene.fog) this.scene.fog.color.set(0x060814);
          if (this.galaxyMaterial) this.galaxyMaterial.opacity = 0.95;
        }
      }
    }

    /* ═══════════════ PAUSE & RESUME ═══════════════ */
    pause() {
      if (this.isPaused) return;
      this.isPaused = true;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    resume() {
      if (!this.isPaused) return;
      this.isPaused = false;
      this.clock.start();
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(this.loop);
      }
    }

    /* ═══════════════ RENDER & ANIMATION LOOP (60FPS) ═══════════════ */
    loop() {
      if (this.isPaused) return;

      const dt = Math.min(0.05, this.clock.getDelta());
      const elapsedTime = this.clock.getElapsedTime();

      // 1. Calculate Scroll Delta, Velocity & Direction
      const prevScrollY = this.scrollY;
      this.scrollY += (this.targetScrollY - this.scrollY) * 0.16; // smooth lerp
      const scrollDelta = this.scrollY - prevScrollY;

      const instantVelocity = Math.abs(scrollDelta);
      this.smoothVelocity += (instantVelocity - this.smoothVelocity) * 0.12;

      if (Math.abs(scrollDelta) > 0.3) {
        this.scrollDirection = scrollDelta > 0 ? 1 : -1;
      }

      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      this.scrollProgress = Math.min(1, Math.max(0, this.scrollY / docHeight));

      // 2. Continuous Idle & Scroll-Driven Galaxy Rotation
      if (this.galaxy) {
        // Base idle rotation speed
        const baseRotationSpeed = 0.045;
        // Scroll velocity boost (accelerates rotation on scroll down, reverses on scroll up)
        const velocityBoost = (this.smoothVelocity * 0.035 * this.scrollDirection);

        this.galaxy.rotation.y += (baseRotationSpeed + velocityBoost) * dt;

        // Subtle organic tilt oscillation on X and Z
        const basePitch = 0.28 + (this.scrollProgress * 0.42); // tilts gradually as user scrolls
        this.galaxy.rotation.x = basePitch + Math.sin(elapsedTime * 0.35) * 0.03;
        this.galaxy.rotation.z = -0.15 + Math.cos(elapsedTime * 0.25) * 0.02;
      }

      // 3. Ambient Starfield Slow Counter-Drift
      if (this.starfield) {
        this.starfield.rotation.y -= 0.008 * dt;
        this.starfield.rotation.x = Math.sin(elapsedTime * 0.15) * 0.02;
      }

      // 4. Mouse Parallax Smoothing (Lerp)
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

      // 5. Dynamic Camera Perspective & Depth Navigation
      // As the user navigates down the portfolio, camera dives subtly deeper into the galaxy
      const targetCamY = this.baseCameraY - (this.scrollProgress * 1.6) + (this.mouse.y * 0.65);
      const targetCamZ = this.baseCameraZ + Math.sin(this.scrollProgress * Math.PI) * 0.85;
      const targetCamX = this.mouse.x * 0.85;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.08;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 0.08;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.08;

      // Look slightly offset from center based on mouse for cinematic depth
      this.camera.lookAt(this.mouse.x * 0.25, -this.scrollProgress * 0.5, 0);

      // 6. WebGL Render
      this.renderer.render(this.scene, this.camera);

      // Next frame
      this.rafId = requestAnimationFrame(this.loop);
    }

    /* ═══════════════ CLEANUP & DESTROY ═══════════════ */
    destroy() {
      this.pause();
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      if (this.renderer && this.renderer.domElement) {
        this.renderer.dispose();
      }
      if (this.galaxyGeometry) this.galaxyGeometry.dispose();
      if (this.galaxyMaterial) this.galaxyMaterial.dispose();
      if (this.starfieldGeometry) this.starfieldGeometry.dispose();
      if (this.starfieldMaterial) this.starfieldMaterial.dispose();
    }
  }

  // Auto-Initialize on DOM ready
  function init() {
    window.threeGalaxyBg = new ThreeGalaxyBackground('galaxy-bg-container');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
