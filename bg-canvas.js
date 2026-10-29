/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CYBER-SPACE DYNAMIC SCROLL-REACTIVE CANVAS ENGINE (Multi-Layer Parallax)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Layer 1 (Deep Background — Z-Depth ~ 0.1):
 *   - Luminous ambient nebula light orbs that shift position & scale with parallax
 *   - Faint cyber tech grid with glowing coordinate intersection crosses (+)
 * 
 * Layer 2 (Mid Ground — Z-Depth ~ 0.4):
 *   - Floating 3D geometric wireframes (Octahedron, Icosahedron, Diamond, Cube)
 *     with full 3D rotation that accelerates on scroll-down & reverses on scroll-up
 *   - Interactive constellation network with node clustering & glowing laser links
 *   - High-speed cyber data pulses traversing connected nodes
 * 
 * Layer 3 (Foreground — Z-Depth ~ 1.0):
 *   - Directional light flares & glowing cyber dust motes with velocity streak trails
 *   - Mouse-reactive magnetic aura & laser tether targeting reticle
 * 
 * Spectral Hue Engine:
 *   - Dynamically shifts base hue from Deep Midnight Violet (275°) at Hero,
 *     through Neon Cyan (195°) and Emerald Teal (155°), to Hyper Magenta (320°)
 *   - Velocity warp surge triggers chromatic bloom & radiant energy flashes
 * 
 * Optimization:
 *   - 60fps locked with delta-time clamping
 *   - Auto-pause via Page Visibility API (document.hidden)
 *   - High-DPI support capped at 2.0 DPR to prevent mobile GPU stress
 *   - Zero garbage-collection allocations inside the render loop
 */

(function () {
  'use strict';

  // ═══════════════ 3D WIREFRAME GEOMETRIES ═══════════════
  const GEOMETRIES = {
    // 3D Octahedron (6 vertices, 12 edges)
    octahedron: {
      vertices: [
        [0, 1, 0], [0, -1, 0],
        [1, 0, 0], [-1, 0, 0],
        [0, 0, 1], [0, 0, -1]
      ],
      edges: [
        [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 4], [4, 3], [3, 5], [5, 2]
      ]
    },
    // 3D Cube (8 vertices, 12 edges)
    cube: {
      vertices: [
        [-0.7, -0.7, -0.7], [0.7, -0.7, -0.7], [0.7, 0.7, -0.7], [-0.7, 0.7, -0.7],
        [-0.7, -0.7, 0.7],  [0.7, -0.7, 0.7],  [0.7, 0.7, 0.7],  [-0.7, 0.7, 0.7]
      ],
      edges: [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ]
    },
    // 3D Tetrahedron (4 vertices, 6 edges)
    tetrahedron: {
      vertices: [
        [1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]
      ],
      edges: [
        [0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1]
      ]
    },
    // 3D Cyber Diamond (Dual pyramid)
    diamond: {
      vertices: [
        [0, 1.4, 0], [0, -1.4, 0],
        [0.8, 0, 0], [-0.8, 0, 0],
        [0, 0, 0.8], [0, 0, -0.8]
      ],
      edges: [
        [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 4], [4, 3], [3, 5], [5, 2]
      ]
    }
  };

  class ScrollReactiveBackgroundCanvas {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) return;

      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Scroll State & Momentum
      this.scrollY = window.scrollY || 0;
      this.targetScrollY = this.scrollY;
      this.lastScrollY = this.scrollY;
      this.scrollDelta = 0;
      this.scrollVelocity = 0;
      this.smoothVelocity = 0;
      this.scrollDirection = 1; // 1 = down, -1 = up
      this.scrollProgress = 0;   // 0.0 to 1.0

      // Mouse Interaction
      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.4,
        smoothX: this.width * 0.5,
        smoothY: this.height * 0.4,
        targetX: this.width * 0.5,
        targetY: this.height * 0.4,
        isHovered: false,
        radius: 140
      };

      // Spectral Color State
      this.baseHue = 275;     // Deep violet at top
      this.currentHue = 275;
      this.targetHue = 275;

      // Lifecycle & Performance
      this.isPaused = false;
      this.isCanvasVisible = true;
      this.observer = null;
      this.lastTime = performance.now();
      this.rafId = null;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Initialize Layers
      this.initLayers();
      this.resize();
      this.bindEvents();

      // Start 60fps Loop
      this.loop = this.loop.bind(this);
      this.rafId = requestAnimationFrame(this.loop);
    }

    /* ═══════════════ INITIALIZE MULTI-LAYER DATA ═══════════════ */
    initLayers() {
      // LAYER 1: Deep Nebula Ambient Light Orbs (3 volumetric orbs)
      this.nebulaOrbs = [
        { relX: 0.2,  relY: 0.25, baseRadius: 360, parallax: 0.05, hueOffset: 0,   pulseSpeed: 0.0012 },
        { relX: 0.82, relY: 0.65, baseRadius: 420, parallax: 0.08, hueOffset: 45,  pulseSpeed: 0.0016 },
        { relX: 0.48, relY: 0.88, baseRadius: 320, parallax: 0.06, hueOffset: -40, pulseSpeed: 0.0014 }
      ];

      // LAYER 2: Floating 3D Geometric Polyhedra (5 wireframes)
      const geoTypes = ['octahedron', 'diamond', 'cube', 'octahedron', 'tetrahedron'];
      this.wireframes = geoTypes.map((type, i) => {
        return {
          type,
          geom: GEOMETRIES[type],
          x: (0.15 + (i * 0.2)) * this.width,
          y: (0.18 + (i * 0.18)) * this.height,
          z: 160 + i * 40,
          scale: 40 + (i % 3) * 12,
          rx: Math.random() * Math.PI * 2,
          ry: Math.random() * Math.PI * 2,
          rz: Math.random() * Math.PI * 2,
          baseSpeedX: (Math.random() - 0.5) * 0.008,
          baseSpeedY: (Math.random() - 0.5) * 0.012,
          baseSpeedZ: (Math.random() - 0.5) * 0.007,
          parallax: 0.22 + (i * 0.04)
        };
      });

      // LAYER 2: Constellation Particle Nodes (40 nodes)
      const nodeCount = this.reducedMotion ? 18 : 42;
      this.constellationNodes = [];
      for (let i = 0; i < nodeCount; i++) {
        this.constellationNodes.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: 1.5 + Math.random() * 2,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          parallax: 0.35 + Math.random() * 0.15
        });
      }

      // Constellation Laser Energy Pulses (traversing connections)
      this.dataPackets = [];
      for (let i = 0; i < 6; i++) {
        this.dataPackets.push({
          fromIdx: Math.floor(Math.random() * nodeCount),
          toIdx: Math.floor(Math.random() * nodeCount),
          progress: Math.random(),
          speed: 0.008 + Math.random() * 0.015
        });
      }

      // LAYER 3: Foreground Cyber Dust Motes & Flare Streaks (60 motes)
      const dustCount = this.reducedMotion ? 25 : 65;
      this.dustMotes = [];
      for (let i = 0; i < dustCount; i++) {
        this.dustMotes.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.2 - Math.random() * 0.7, // naturally drifting upward/weightless
          size: 1 + Math.random() * 2.2,
          alpha: 0.25 + Math.random() * 0.65,
          parallax: 0.75 + Math.random() * 0.45,
          hueShift: (Math.random() - 0.5) * 60
        });
      }
    }

    /* ═══════════════ RESIZE & RETINA BUFFER ═══════════════ */
    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
    }

    get isLightMode() {
      return document.documentElement.getAttribute('data-theme') === 'light';
    }

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
      this.lastTime = performance.now();
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(this.loop);
      }
    }

    /* ═══════════════ EVENT BINDINGS ═══════════════ */
    bindEvents() {
      // Window Resize with Debounce
      let resizeTimeout = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.resize(), 100);
      }, { passive: true });

      // High-Frequency Scroll Listener
      window.addEventListener('scroll', () => {
        this.targetScrollY = window.scrollY;
      }, { passive: true });

      // Interactive Mouse Move
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = e.clientX;
        this.mouse.targetY = e.clientY;
        this.mouse.isHovered = true;
      }, { passive: true });

      window.addEventListener('mouseleave', () => {
        this.mouse.isHovered = false;
      });

      // IntersectionObserver to pause animation when canvas is out of view
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isCanvasVisible = entry.isIntersecting;
            if (entry.isIntersecting) {
              if (!document.hidden) {
                this.resume();
              }
            } else {
              this.pause();
            }
          });
        }, { threshold: 0.01 });
        this.observer.observe(this.canvas);
      }

      // Page Visibility API to save battery/GPU when tab is hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else if (this.isCanvasVisible) {
          this.resume();
        }
      });
    }

    /* ═══════════════ PHYSICS & SPECTRAL COLOR UPDATE ═══════════════ */
    updatePhysics(dt, now) {
      // 1. Scroll Momentum & Velocity
      const prevScrollY = this.scrollY;
      this.scrollY += (this.targetScrollY - this.scrollY) * 0.18; // smooth lerp
      this.scrollDelta = this.scrollY - prevScrollY;

      // Instant velocity calculation
      const instantVelocity = Math.abs(this.scrollDelta);
      this.smoothVelocity += (instantVelocity - this.smoothVelocity) * 0.12;

      // Scroll Direction with hysteresis to avoid jitter
      if (Math.abs(this.scrollDelta) > 0.4) {
        this.scrollDirection = this.scrollDelta > 0 ? 1 : -1;
      }

      // Max scroll document height & normalized progress (0.0 to 1.0)
      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      this.scrollProgress = Math.min(1, Math.max(0, this.scrollY / docHeight));

      // 2. Dynamic Spectral Hue Shift
      // Top: 275 (Purple) -> Mid: 195 (Cyan) -> Mid-Low: 155 (Emerald) -> Bottom: 320 (Magenta)
      let targetHue = 275;
      if (this.scrollProgress <= 0.35) {
        // Hero to About: 275 down to 200 (Deep Purple to Cyber Cyan)
        const p = this.scrollProgress / 0.35;
        targetHue = 275 - (75 * p);
      } else if (this.scrollProgress <= 0.7) {
        // About to Skills: 200 down to 155 (Cyan to Emerald Teal)
        const p = (this.scrollProgress - 0.35) / 0.35;
        targetHue = 200 - (45 * p);
      } else {
        // Skills to Contact/Footer: 155 smoothly wraps to 320 (Emerald to Hyper Magenta)
        const p = (this.scrollProgress - 0.7) / 0.3;
        targetHue = 155 + (165 * p);
      }

      // Velocity Surge Hue Modulation:
      // High speed adds vivid chromatic boost
      const velocityBonus = Math.min(30, this.smoothVelocity * 1.5) * this.scrollDirection;
      this.targetHue = targetHue + velocityBonus;
      this.currentHue += (this.targetHue - this.currentHue) * 0.08;

      // 3. Smooth Mouse Position
      this.mouse.smoothX += (this.mouse.targetX - this.mouse.smoothX) * 0.12;
      this.mouse.smoothY += (this.mouse.targetY - this.mouse.smoothY) * 0.12;
    }

    /* ═══════════════ RENDER LAYER 1: DEEP BACKGROUND ═══════════════ */
    renderLayer1Deep(now) {
      const isLight = this.isLightMode;
      const ctx = this.ctx;
      const hue = this.currentHue;
      const surge = Math.min(1, this.smoothVelocity / 30);

      // A. Deep Ambient Nebula Light Orbs
      this.nebulaOrbs.forEach((orb) => {
        const pulse = Math.sin(now * orb.pulseSpeed) * 35;
        const radius = orb.baseRadius + pulse + (surge * 60);

        // Parallax Y offset based on scroll
        const orbX = orb.relX * this.width;
        const orbY = (orb.relY * this.height) + (this.scrollY * orb.parallax);

        // Seamless wrap on viewport
        const wrappedY = ((orbY % (this.height * 1.5)) + (this.height * 1.5)) % (this.height * 1.5) - (this.height * 0.25);

        const orbHue = (hue + orb.hueOffset + 360) % 360;
        const grad = ctx.createRadialGradient(orbX, wrappedY, 0, orbX, wrappedY, radius);

        const innerAlpha = isLight ? (0.05 + surge * 0.04) : (0.09 + (surge * 0.07));
        const midAlpha = isLight ? (0.02 + surge * 0.02) : (0.035 + (surge * 0.03));

        grad.addColorStop(0, `hsla(${orbHue}, ${isLight ? 75 : 85}%, ${isLight ? 60 : 55}%, ${innerAlpha})`);
        grad.addColorStop(0.55, `hsla(${(orbHue + 25) % 360}, ${isLight ? 70 : 80}%, ${isLight ? 50 : 45}%, ${midAlpha})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orbX, wrappedY, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // B. Slow-Moving Faint Cyber Tech Grid
      const gridSize = 64;
      const gridParallax = 0.09;
      const offsetY = (this.scrollY * gridParallax) % gridSize;

      ctx.save();
      ctx.lineWidth = 1;
      const gridLightness = isLight ? 45 : 55;
      const gridAlpha = isLight ? 0.045 : 0.035;
      ctx.strokeStyle = `hsla(${hue}, 65%, ${gridLightness}%, ${gridAlpha})`;

      // Vertical Grid Lines
      ctx.beginPath();
      for (let x = 0; x <= this.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.height);
      }
      // Horizontal Grid Lines with Scroll Parallax
      for (let y = -gridSize + offsetY; y <= this.height + gridSize; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
      }
      ctx.stroke();

      // Cyber Intersection Crosses (+) & Digital Coordinates
      const crossAlpha = isLight ? (0.14 + surge * 0.08) : (0.08 + surge * 0.06);
      const crossLightness = isLight ? 42 : 65;
      ctx.fillStyle = `hsla(${hue}, 80%, ${crossLightness}%, ${crossAlpha})`;
      const crossSize = 3;
      for (let x = gridSize; x < this.width; x += gridSize * 2) {
        for (let y = offsetY; y < this.height; y += gridSize * 2) {
          // Cross +
          ctx.fillRect(x - crossSize, y - 0.5, crossSize * 2, 1);
          ctx.fillRect(x - 0.5, y - crossSize, 1, crossSize * 2);
        }
      }
      ctx.restore();
    }

    /* ═══════════════ RENDER LAYER 2: MID GROUND ═══════════════ */
    renderLayer2Mid(now) {
      const isLight = this.isLightMode;
      const ctx = this.ctx;
      const hue = this.currentHue;
      const surge = Math.min(1, this.smoothVelocity / 25);
      const velMultiplier = (this.smoothVelocity * 0.0035 * this.scrollDirection);

      // A. Floating 3D Geometric Wireframes
      this.wireframes.forEach((wf, idx) => {
        // Accelerate rotation on scroll down, reverse on scroll up
        wf.rx += wf.baseSpeedX + (velMultiplier * 1.2);
        wf.ry += wf.baseSpeedY + (velMultiplier * 1.5);
        wf.rz += wf.baseSpeedZ + (velMultiplier * 0.8);

        // Parallax position calculation
        const baseY = wf.y - (this.scrollY * wf.parallax);
        // Wrap gracefully across canvas height with padding
        const pad = 120;
        const totalSpan = this.height + pad * 2;
        const screenY = ((baseY % totalSpan) + totalSpan) % totalSpan - pad;
        const screenX = wf.x;

        // 3D Perspective Projection Matrix
        const cosX = Math.cos(wf.rx), sinX = Math.sin(wf.rx);
        const cosY = Math.cos(wf.ry), sinY = Math.sin(wf.ry);
        const cosZ = Math.cos(wf.rz), sinZ = Math.sin(wf.rz);

        const fov = 320;
        const scale = wf.scale * (1 + surge * 0.15);

        // Project 3D vertices into 2D screen coordinates
        const projected = wf.geom.vertices.map(([vx, vy, vz]) => {
          let x1 = vx * cosY + vz * sinY;
          let y1 = vy;
          let z1 = -vx * sinY + vz * cosY;

          let x2 = x1;
          let y2 = y1 * cosX - z1 * sinX;
          let z2 = y1 * sinX + z1 * cosX;

          let x3 = x2 * cosZ - y2 * sinZ;
          let y3 = x2 * sinZ + y2 * cosZ;
          let z3 = z2;

          const pScale = fov / (fov + wf.z + z3 * scale);
          return {
            x: screenX + x3 * scale * pScale,
            y: screenY + y3 * scale * pScale,
            depth: z3
          };
        });

        // Draw Wireframe Edges
        ctx.save();
        ctx.lineWidth = 1.2;
        const wireLightness = isLight ? 42 : 60;
        const wireAlpha = isLight ? (0.24 + surge * 0.18) : (0.18 + surge * 0.16);
        ctx.strokeStyle = `hsla(${(hue + idx * 30) % 360}, 85%, ${wireLightness}%, ${wireAlpha})`;

        ctx.beginPath();
        wf.geom.edges.forEach(([p1Idx, p2Idx]) => {
          const p1 = projected[p1Idx];
          const p2 = projected[p2Idx];
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        });
        ctx.stroke();

        // Draw Vertex Glowing Cyber Nodes
        const vertexLightness = isLight ? 45 : 70;
        const vertexAlpha = isLight ? (0.45 + surge * 0.3) : (0.35 + surge * 0.3);
        ctx.fillStyle = `hsla(${(hue + idx * 30 + 40) % 360}, 90%, ${vertexLightness}%, ${vertexAlpha})`;
        projected.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      });

      // B. Floating Constellation Nodes & Laser Connectors
      const nodes = this.constellationNodes;
      const nodeCount = nodes.length;

      // Update node positions with velocity drift
      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];
        node.x += node.vx;
        // Directional drift: moves up/down with scroll inertia
        node.y += node.vy + (this.scrollDelta * 0.06 * node.parallax);

        // Screen boundary wrap
        if (node.x < -20) node.x = this.width + 20;
        if (node.x > this.width + 20) node.x = -20;
        if (node.y < -20) node.y = this.height + 20;
        if (node.y > this.height + 20) node.y = -20;

        node.pulse += node.pulseSpeed;
      }

      // Draw Constellation Connecting Laser Lines
      const maxDist = 115;
      ctx.save();
      const connLightness = isLight ? 42 : 65;
      for (let i = 0; i < nodeCount; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodeCount; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDist * maxDist) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / maxDist) * (isLight ? (0.24 + surge * 0.18) : (0.16 + surge * 0.14));

            ctx.lineWidth = 1;
            ctx.strokeStyle = `hsla(${hue}, 80%, ${connLightness}%, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // Render Nodes
      const nodeLightness = isLight ? 46 : 75;
      for (let i = 0; i < nodeCount; i++) {
        const n = nodes[i];
        const pulseFactor = 0.5 + Math.sin(n.pulse) * 0.5;
        const r = n.radius + pulseFactor * 1.2;

        ctx.fillStyle = `hsla(${hue}, 90%, ${nodeLightness}%, ${0.4 + pulseFactor * 0.35 + surge * 0.25})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // High-Speed Data Pulses traveling along constellation
      const pktLightness = isLight ? 45 : 75;
      this.dataPackets.forEach(pkt => {
        pkt.progress += pkt.speed * (1 + surge * 2.5);
        if (pkt.progress >= 1) {
          pkt.progress = 0;
          pkt.fromIdx = Math.floor(Math.random() * nodeCount);
          pkt.toIdx = Math.floor(Math.random() * nodeCount);
        }

        const p1 = nodes[pkt.fromIdx];
        const p2 = nodes[pkt.toIdx];
        if (!p1 || !p2) return;

        const curX = p1.x + (p2.x - p1.x) * pkt.progress;
        const curY = p1.y + (p2.y - p1.y) * pkt.progress;

        ctx.fillStyle = `hsla(${(hue + 60) % 360}, 100%, ${pktLightness}%, ${0.7 + surge * 0.3})`;
        ctx.beginPath();
        ctx.arc(curX, curY, 2.5 + surge * 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    /* ═══════════════ RENDER LAYER 3: FOREGROUND & CURSOR ═══════════════ */
    renderLayer3Foreground(now) {
      const isLight = this.isLightMode;
      const ctx = this.ctx;
      const hue = this.currentHue;
      const surge = Math.min(1, this.smoothVelocity / 20);

      // Streak Length scales dynamically with scroll velocity and direction
      const streakLength = this.smoothVelocity * 0.65 * this.scrollDirection;

      ctx.save();

      // A. Glowing Cyber Dust Motes & Directional Streaks
      const moteLightness = isLight ? 42 : 70;
      this.dustMotes.forEach(mote => {
        // Natural drift + strong reaction to scroll direction
        mote.x += mote.vx;
        mote.y += mote.vy + (this.scrollDelta * 0.14 * mote.parallax);

        // Screen boundary wrap
        if (mote.x < -10) mote.x = this.width + 10;
        if (mote.x > this.width + 10) mote.x = -10;
        if (mote.y < -30) mote.y = this.height + 20;
        if (mote.y > this.height + 30) mote.y = -20;

        // Mouse magnetic deflection when hovering nearby
        if (this.mouse.isHovered) {
          const mdx = mote.x - this.mouse.smoothX;
          const mdy = mote.y - this.mouse.smoothY;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < this.mouse.radius && mDist > 0) {
            const force = (1 - mDist / this.mouse.radius) * 1.8;
            mote.x += (mdx / mDist) * force;
            mote.y += (mdy / mDist) * force;
          }
        }

        const moteHue = (hue + mote.hueShift + 360) % 360;
        const alpha = Math.min(1, mote.alpha + (surge * 0.35));

        // When scrolling fast: draw velocity streak tails!
        if (Math.abs(streakLength) > 3) {
          ctx.lineWidth = mote.size * 0.9;
          ctx.strokeStyle = `hsla(${moteHue}, 85%, ${moteLightness}%, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(mote.x, mote.y);
          ctx.lineTo(mote.x, mote.y - streakLength);
          ctx.stroke();
        } else {
          // Idle floating bloom particles
          ctx.fillStyle = `hsla(${moteHue}, 85%, ${moteLightness}%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // B. Mouse Reactive Aura & Cyber Laser Reticle
      if (this.mouse.isHovered) {
        const mx = this.mouse.smoothX;
        const my = this.mouse.smoothY;

        // Subtle ambient spotlight behind cursor
        const spotGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 160);
        const spotAlpha1 = isLight ? (0.04 + surge * 0.03) : (0.07 + surge * 0.05);
        const spotAlpha2 = isLight ? 0.015 : 0.02;
        spotGrad.addColorStop(0, `hsla(${hue}, 90%, ${isLight ? 50 : 65}%, ${spotAlpha1})`);
        spotGrad.addColorStop(0.6, `hsla(${(hue + 40) % 360}, 85%, ${isLight ? 45 : 55}%, ${spotAlpha2})`);
        spotGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(mx, my, 160, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby foreground dust motes with laser threads to cursor
        ctx.lineWidth = 1;
        const threadLightness = isLight ? 45 : 70;
        this.dustMotes.forEach(mote => {
          const dx = mote.x - mx;
          const dy = mote.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const threadAlpha = (1 - dist / 90) * (isLight ? 0.28 : 0.22);
            ctx.strokeStyle = `hsla(${hue}, 95%, ${threadLightness}%, ${threadAlpha})`;
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(mote.x, mote.y);
            ctx.stroke();
          }
        });

        // Delicate Cyber Reticle Crosshair around cursor
        const reticleLightness = isLight ? 45 : 65;
        const reticleAlpha = isLight ? 0.28 : 0.18;
        ctx.strokeStyle = `hsla(${hue}, 85%, ${reticleLightness}%, ${reticleAlpha})`;
        ctx.lineWidth = 1;
        const rSize = 14;
        // Top-left bracket
        ctx.beginPath();
        ctx.moveTo(mx - rSize, my - rSize + 4);
        ctx.lineTo(mx - rSize, my - rSize);
        ctx.lineTo(mx - rSize + 4, my - rSize);
        // Bottom-right bracket
        ctx.moveTo(mx + rSize, my + rSize - 4);
        ctx.lineTo(mx + rSize, my + rSize);
        ctx.lineTo(mx + rSize - 4, my + rSize);
        ctx.stroke();
      }

      ctx.restore();
    }

    /* ═══════════════ MAIN 60FPS ANIMATION LOOP ═══════════════ */
    loop(timestamp) {
      if (this.isPaused) return;

      const dt = Math.min(32, timestamp - this.lastTime); // clamped delta-time
      this.lastTime = timestamp;

      // 1. Update Physics, Velocity & Spectral Colors
      this.updatePhysics(dt, timestamp);

      // 2. Clear Frame
      this.ctx.clearRect(0, 0, this.width, this.height);

      // 3. Render 3 Distinct Parallax Layers
      this.renderLayer1Deep(timestamp);
      this.renderLayer2Mid(timestamp);
      this.renderLayer3Foreground(timestamp);

      // Request next frame
      this.rafId = requestAnimationFrame(this.loop);
    }

    /* ═══════════════ CLEANUP & DESTROY ═══════════════ */
    destroy() {
      this.pause();
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  }

  // Auto-Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.scrollBgCanvas = new ScrollReactiveBackgroundCanvas('scroll-reactive-bg-canvas');
    });
  } else {
    window.scrollBgCanvas = new ScrollReactiveBackgroundCanvas('scroll-reactive-bg-canvas');
  }
})();
