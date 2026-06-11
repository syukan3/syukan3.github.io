// Hero — one of three interactive scenes, picked at random per visit:
//   "fluid"     墨流しの光 — stable-fluids sim; drag stirs, tap blooms
//   "particles" 粒子の書   — the title assembled from embers; pointer scatters
//   "spotlight" 暗室の光   — a darkroom beam follows the pointer, dust in it
// Force one with ?hero=fluid|particles|spotlight. The variant shown last time
// is excluded from the draw so repeat visits always feel different.
(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;

  let W = 0, H = 0;
  let engine = null;
  let running = false, rafId = 0;

  const pointer = { x: -1, y: -1, active: false };

  function rand(a, b) { return a + Math.random() * (b - a); }

  // =========================================================================
  // A. FLUID — Jos Stam "stable fluids", light-ink on dark paper
  // =========================================================================
  function FluidEngine() {
    const isMobile = W < 700;
    const N = isMobile ? 72 : 100;
    const size = (N + 2) * (N + 2);
    const u = new Float32Array(size), v = new Float32Array(size);
    const u0 = new Float32Array(size), v0 = new Float32Array(size);
    const r = new Float32Array(size), g = new Float32Array(size), b = new Float32Array(size);
    const r0 = new Float32Array(size), g0 = new Float32Array(size), b0 = new Float32Array(size);
    const iters = isMobile ? 8 : 12;
    const off = document.createElement('canvas');
    off.width = N; off.height = N;
    const offCtx = off.getContext('2d');
    const img = offCtx.createImageData(N, N);

    const PALETTE = [
      [255, 158, 64], [246, 207, 134], [255, 120, 50], [212, 96, 130], [96, 158, 178]
    ];
    let strokeHue = 0;

    const IX = (i, j) => i + (N + 2) * j;

    function setBnd(bnd, x) {
      for (let i = 1; i <= N; i++) {
        x[IX(0, i)] = bnd === 1 ? -x[IX(1, i)] : x[IX(1, i)];
        x[IX(N + 1, i)] = bnd === 1 ? -x[IX(N, i)] : x[IX(N, i)];
        x[IX(i, 0)] = bnd === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
        x[IX(i, N + 1)] = bnd === 2 ? -x[IX(i, N)] : x[IX(i, N)];
      }
    }

    function linSolve(bnd, x, x_, a, c) {
      for (let k = 0; k < iters; k++) {
        for (let j = 1; j <= N; j++) {
          for (let i = 1; i <= N; i++) {
            x[IX(i, j)] = (x_[IX(i, j)] + a * (x[IX(i - 1, j)] + x[IX(i + 1, j)] + x[IX(i, j - 1)] + x[IX(i, j + 1)])) / c;
          }
        }
        setBnd(bnd, x);
      }
    }

    function advect(bnd, d, d_, uu, vv, dt) {
      const dt0 = dt * N;
      for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
          let x = i - dt0 * uu[IX(i, j)];
          let y = j - dt0 * vv[IX(i, j)];
          if (x < 0.5) x = 0.5; if (x > N + 0.5) x = N + 0.5;
          if (y < 0.5) y = 0.5; if (y > N + 0.5) y = N + 0.5;
          const i0 = x | 0, i1 = i0 + 1, j0 = y | 0, j1 = j0 + 1;
          const s1 = x - i0, s0 = 1 - s1, t1 = y - j0, t0 = 1 - t1;
          d[IX(i, j)] = s0 * (t0 * d_[IX(i0, j0)] + t1 * d_[IX(i0, j1)]) +
                        s1 * (t0 * d_[IX(i1, j0)] + t1 * d_[IX(i1, j1)]);
        }
      }
      setBnd(bnd, d);
    }

    function project() {
      const p = u0, div = v0;
      for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
          div[IX(i, j)] = -0.5 * (u[IX(i + 1, j)] - u[IX(i - 1, j)] + v[IX(i, j + 1)] - v[IX(i, j - 1)]) / N;
          p[IX(i, j)] = 0;
        }
      }
      setBnd(0, div); setBnd(0, p);
      linSolve(0, p, div, 1, 4);
      for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
          u[IX(i, j)] -= 0.5 * N * (p[IX(i + 1, j)] - p[IX(i - 1, j)]);
          v[IX(i, j)] -= 0.5 * N * (p[IX(i, j + 1)] - p[IX(i, j - 1)]);
        }
      }
      setBnd(1, u); setBnd(2, v);
    }

    function splat(nx, ny, dx, dy, color, amount) {
      const i = Math.max(1, Math.min(N, Math.round(nx * N)));
      const j = Math.max(1, Math.min(N, Math.round(ny * N)));
      const rad = 2;
      for (let oj = -rad; oj <= rad; oj++) {
        for (let oi = -rad; oi <= rad; oi++) {
          const ii = i + oi, jj = j + oj;
          if (ii < 1 || ii > N || jj < 1 || jj > N) continue;
          const fall = 1 - Math.hypot(oi, oj) / (rad + 1);
          if (fall <= 0) continue;
          const idx = IX(ii, jj);
          u[idx] += dx * fall;
          v[idx] += dy * fall;
          r[idx] += color[0] / 255 * amount * fall;
          g[idx] += color[1] / 255 * amount * fall;
          b[idx] += color[2] / 255 * amount * fall;
        }
      }
    }

    function step(time) {
      const e1x = 0.68 + Math.sin(time * 0.21) * 0.2, e1y = 0.62 + Math.cos(time * 0.16) * 0.22;
      const e2x = 0.3 + Math.cos(time * 0.13) * 0.16, e2y = 0.35 + Math.sin(time * 0.18) * 0.2;
      splat(e1x, e1y, Math.cos(time * 0.5) * 1.1, Math.sin(time * 0.4) * 1.1, PALETTE[0], 0.13);
      splat(e2x, e2y, Math.sin(time * 0.45) * 0.9, Math.cos(time * 0.35) * 0.9, PALETTE[3], 0.06);

      const dt = 0.016, visc = 0.00008;
      u0.set(u); v0.set(v);
      linSolve(1, u, u0, dt * visc * N * N, 1 + 4 * dt * visc * N * N);
      linSolve(2, v, v0, dt * visc * N * N, 1 + 4 * dt * visc * N * N);
      project();
      u0.set(u); v0.set(v);
      advect(1, u, u0, u0, v0, dt);
      advect(2, v, v0, u0, v0, dt);
      project();
      r0.set(r); g0.set(g); b0.set(b);
      advect(0, r, r0, u, v, dt);
      advect(0, g, g0, u, v, dt);
      advect(0, b, b0, u, v, dt);
      for (let k = 0; k < size; k++) { r[k] *= 0.991; g[k] *= 0.991; b[k] *= 0.991; }
    }

    this.frame = (time) => {
      step(time);
      const d = img.data;
      let p = 0;
      for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
          const idx = IX(i, j);
          d[p++] = Math.min(255, 11 + r[idx] * 340);
          d[p++] = Math.min(255, 10 + g[idx] * 340);
          d[p++] = Math.min(255, 8 + b[idx] * 340);
          d[p++] = 255;
        }
      }
      offCtx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(off, 0, 0, W, H);
    };

    this.pointerMove = (x, y, dx, dy) => {
      strokeHue += 0.018;
      const c = PALETTE[Math.floor(strokeHue) % PALETTE.length];
      splat(x / W, y / H, dx / W * 110, dy / H * 110, c, 0.85);
    };
    this.pointerDown = (x, y) => {
      const c = PALETTE[Math.floor(rand(0, PALETTE.length))];
      for (let k = 0; k < 10; k++) {
        const a = rand(0, TAU);
        splat(x / W + Math.cos(a) * 0.012, y / H + Math.sin(a) * 0.012, Math.cos(a) * 4, Math.sin(a) * 4, c, 1.1);
      }
    };

    // Seed so the very first paint is already alive
    for (let k = 0; k < 7; k++) {
      const a = rand(0, TAU);
      splat(rand(0.3, 0.9), rand(0.25, 0.85), Math.cos(a) * 5, Math.sin(a) * 5, PALETTE[k % PALETTE.length], 1.4);
    }
    for (let k = 0; k < 26; k++) step(k * 0.016);

    this.warmup = () => { for (let k = 0; k < 40; k++) step(k * 0.016); };
  }

  // =========================================================================
  // B. PARTICLES — the title assembled from embers (the HTML title is hidden
  // via .hero-mode-particles; its layout box drives where the glyphs form)
  // =========================================================================
  function ParticleEngine() {
    const titleEl = document.querySelector('.hero-title');
    let particles = [];
    let burst = null;

    function buildTargets() {
      particles = [];
      if (!titleEl) return;
      const canvasRect = canvas.getBoundingClientRect();
      const rect = titleEl.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(titleEl).fontSize);
      const offc = document.createElement('canvas');
      offc.width = Math.ceil(W);
      offc.height = Math.ceil(H);
      const o = offc.getContext('2d');
      o.font = `600 ${fs}px Fraunces, "Shippori Mincho", serif`;
      o.textBaseline = 'alphabetic';
      const x0 = rect.left - canvasRect.left;
      const y1 = rect.top - canvasRect.top + fs * 0.92;
      const y2 = y1 + fs * 1.18;
      o.fillStyle = '#f3ecdc';
      o.fillText('攻めのAIを、', x0, y1);
      o.fillStyle = '#f6cf86';
      o.fillText('守りの統制', x0, y2);
      o.fillStyle = '#f3ecdc';
      o.fillText('で。', x0 + o.measureText('守りの統制').width, y2);

      const budget = W < 700 ? 1600 : 3200;
      let step = 2;
      const data = o.getImageData(0, 0, offc.width, offc.height).data;
      let pts = [];
      do {
        pts = [];
        for (let y = 0; y < offc.height; y += step) {
          for (let x = 0; x < offc.width; x += step) {
            const i = (y * offc.width + x) * 4;
            if (data[i + 3] > 140) pts.push({ tx: x, ty: y, warm: data[i + 2] < 180 });
          }
        }
        step++;
      } while (pts.length > budget && step < 10);

      particles = pts.map(p => ({
        tx: p.tx, ty: p.ty,
        x: rand(0, W), y: rand(0, H),
        vx: 0, vy: 0,
        warm: p.warm,
        size: rand(1.4, 2.4),
        tw: rand(0, TAU)
      }));
    }

    this.frame = (time) => {
      ctx.fillStyle = '#0b0a08';
      ctx.fillRect(0, 0, W, H);
      const gl = ctx.createRadialGradient(W * 0.8, H * 0.85, 0, W * 0.8, H * 0.85, Math.min(W, H) * 0.7);
      gl.addColorStop(0, 'rgba(255,140,60,0.10)');
      gl.addColorStop(1, 'rgba(255,140,60,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(0, 0, W, H);

      const repelR = 95;
      for (const p of particles) {
        p.vx += (p.tx - p.x) * 0.045;
        p.vy += (p.ty - p.y) * 0.045;
        if (pointer.active) {
          const dx = p.x - pointer.x, dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < repelR && d > 0.5) {
            const f = (1 - d / repelR) * 3.4;
            p.vx += dx / d * f;
            p.vy += dy / d * f;
          }
        }
        if (burst) {
          const dx = p.x - burst.x, dy = p.y - burst.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 340) {
            const f = (1 - d / 340) * burst.power;
            p.vx += dx / d * f;
            p.vy += dy / d * f;
          }
        }
        p.vx *= 0.86; p.vy *= 0.86;
        p.x += p.vx; p.y += p.vy;

        const flicker = 0.78 + Math.sin(time * 3 + p.tw) * 0.22;
        ctx.fillStyle = p.warm
          ? `rgba(246,207,134,${flicker})`
          : `rgba(243,236,220,${flicker * 0.92})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      if (burst) burst = null;
    };

    this.pointerMove = () => {};
    this.pointerDown = (x, y) => { burst = { x, y, power: 14 }; };
    this.warmup = () => {
      buildTargets();
      for (const p of particles) { p.x = p.tx; p.y = p.ty; }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(buildTargets);
    }
    buildTargets();
  }

  // =========================================================================
  // C. SPOTLIGHT — darkroom beam aimed by the pointer, dust in the light
  // =========================================================================
  function SpotlightEngine() {
    const dust = [];
    const count = W < 700 ? 90 : 150;
    for (let i = 0; i < count; i++) {
      dust.push({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.12, 0.12), vy: rand(-0.3, -0.06),
        s: rand(0.7, 2.1), tw: rand(0, TAU)
      });
    }
    const aim = { x: 0.4, y: 0.55 };
    let flash = 0;
    let ring = null;

    function beamFactor(x, y, ox, oy, ax, ay, halfWidth) {
      const bx = ax - ox, by = ay - oy;
      const len = Math.hypot(bx, by) || 1;
      const px = x - ox, py = y - oy;
      const along = (px * bx + py * by) / len;
      if (along < 0) return 0;
      const perp = Math.abs(px * by - py * bx) / len;
      const w = halfWidth * (0.25 + along / len);
      return Math.max(0, 1 - perp / w);
    }

    this.frame = (time) => {
      ctx.fillStyle = '#0a0907';
      ctx.fillRect(0, 0, W, H);

      const ix = pointer.active ? pointer.x / W : 0.42 + Math.sin(time * 0.3) * 0.16;
      const iy = pointer.active ? pointer.y / H : 0.52 + Math.sin(time * 0.43) * 0.1;
      aim.x += (ix - aim.x) * 0.05;
      aim.y += (iy - aim.y) * 0.05;

      const ox = 0.76 * W, oy = -0.12 * H;
      const ax = aim.x * W, ay = aim.y * H;
      const dirX = ax - ox, dirY = ay - oy;
      const len = Math.hypot(dirX, dirY) || 1;
      const nx = -dirY / len, ny = dirX / len;
      const reach = len * 2.1;
      const endX = ox + dirX / len * reach, endY = oy + dirY / len * reach;
      const wEnd = Math.min(W, H) * 0.42;

      ctx.globalCompositeOperation = 'lighter';
      const cones = [
        { w: wEnd, a: 0.085, c: '255,170,90' },
        { w: wEnd * 0.45, a: 0.12, c: '255,205,140' }
      ];
      for (const cone of cones) {
        const grad = ctx.createLinearGradient(ox, oy, endX, endY);
        grad.addColorStop(0, `rgba(${cone.c},${cone.a * 1.6})`);
        grad.addColorStop(0.55, `rgba(${cone.c},${cone.a})`);
        grad.addColorStop(1, `rgba(${cone.c},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(ox - nx * 14, oy - ny * 14);
        ctx.lineTo(ox + nx * 14, oy + ny * 14);
        ctx.lineTo(endX + nx * cone.w, endY + ny * cone.w);
        ctx.lineTo(endX - nx * cone.w, endY - ny * cone.w);
        ctx.closePath();
        ctx.fill();
      }
      const pool = ctx.createRadialGradient(ax, ay, 0, ax, ay, Math.min(W, H) * 0.3);
      pool.addColorStop(0, 'rgba(255,190,110,0.16)');
      pool.addColorStop(1, 'rgba(255,190,110,0)');
      ctx.fillStyle = pool;
      ctx.beginPath();
      ctx.arc(ax, ay, Math.min(W, H) * 0.3, 0, TAU);
      ctx.fill();

      for (const p of dust) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) { p.y = H + 4; p.x = rand(0, W); }
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
        const inBeam = beamFactor(p.x, p.y, ox, oy, ax, ay, wEnd);
        const tw = 0.5 + Math.sin(time * 2 + p.tw) * 0.5;
        const alpha = 0.05 + inBeam * 0.75 * tw;
        ctx.fillStyle = `rgba(255,225,180,${alpha})`;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }

      if (ring) {
        ring.r += 14; ring.a *= 0.92;
        ctx.strokeStyle = `rgba(243,236,220,${ring.a})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, TAU);
        ctx.stroke();
        if (ring.a < 0.02) ring = null;
      }
      ctx.globalCompositeOperation = 'source-over';
      if (flash > 0.01) {
        ctx.fillStyle = `rgba(255,235,200,${flash})`;
        ctx.fillRect(0, 0, W, H);
        flash *= 0.85;
      }
    };

    this.pointerMove = () => {};
    this.pointerDown = (x, y) => { flash = 0.55; ring = { x, y, r: 10, a: 0.5 }; };
    this.warmup = () => { this.frame(0); };
  }

  // =========================================================================
  // Variant selection + loop
  // =========================================================================
  const ENGINES = { fluid: FluidEngine, particles: ParticleEngine, spotlight: SpotlightEngine };

  function pickVariant() {
    const forced = new URLSearchParams(location.search).get('hero');
    if (ENGINES[forced]) return forced;
    let names = Object.keys(ENGINES);
    try {
      const last = localStorage.getItem('hero-variant-last');
      if (last && names.includes(last) && names.length > 1) {
        names = names.filter(n => n !== last);
      }
    } catch (e) {}
    return names[Math.floor(Math.random() * names.length)];
  }

  const variant = pickVariant();
  try { localStorage.setItem('hero-variant-last', variant); } catch (e) {}

  const hero = canvas.closest('.hero') || canvas;
  hero.classList.add('hero-mode-' + variant);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    const scale = Math.min(window.devicePixelRatio || 1, variant === 'particles' ? 2 : 1.5);
    canvas.width = Math.round(W * scale);
    canvas.height = Math.round(H * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    engine = new ENGINES[variant]();
    if (reduced) {
      engine.warmup();
      engine.frame(0);
    }
  }

  function frame(now) {
    engine.frame(now / 1000);
    if (running) rafId = requestAnimationFrame(frame);
  }
  function start() {
    if (running || reduced) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  // --- Events ---------------------------------------------------------------
  let lastX = null, lastY = null;

  hero.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pointer.x = x; pointer.y = y; pointer.active = true;
    if (lastX !== null && engine) engine.pointerMove(x, y, x - lastX, y - lastY);
    lastX = x; lastY = y;
  });
  hero.addEventListener('pointerleave', () => { lastX = lastY = null; pointer.active = false; });
  hero.addEventListener('pointercancel', () => { lastX = lastY = null; pointer.active = false; });

  hero.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    const rect = canvas.getBoundingClientRect();
    if (engine) engine.pointerDown(e.clientX - rect.left, e.clientY - rect.top);
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  if ('IntersectionObserver' in window && !reduced) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.isIntersecting ? start() : stop());
    }, { threshold: 0.02 }).observe(canvas);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!reduced) start();
  });

  // --- Init -------------------------------------------------------------------
  resize();
  if (!reduced) start();
})();
