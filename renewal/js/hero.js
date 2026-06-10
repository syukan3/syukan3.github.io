// Hero darkroom canvas — drifting light leaks, stirred by the pointer.
// Click / tap exposes a new bloom (an ink-drop of light) with a shutter ripple.
(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;

  // Render at a reduced resolution — everything drawn is a soft gradient,
  // so upscaling is invisible and fill-rate cost drops sharply.
  const RES = 0.5;

  let w = 0, h = 0, running = false, rafId = 0;
  let t = Math.random() * 1000;

  // Light-leak palette: amber core, with film-chemistry magenta / cyan fringes
  const LEAK_COLORS = [
    [255, 158, 64],   // amber
    [255, 120, 50],   // deep orange
    [246, 207, 134],  // pale gold
    [212, 96, 130],   // magenta fringe
    [96, 158, 178]    // cyan fringe
  ];

  const pointer = { x: 0.7, y: 0.45, tx: 0.7, ty: 0.45, active: false };
  let blobs = [];
  let blooms = [];   // click/tap blooms
  let ripples = [];  // shutter rings

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeBlobs() {
    const isMobile = w < 700;
    const count = isMobile ? 6 : 9;
    blobs = [];
    for (let i = 0; i < count; i++) {
      const chroma = i >= count - 2; // last two get the fringe colors
      const color = chroma
        ? LEAK_COLORS[3 + (i % 2)]
        : LEAK_COLORS[i % 3];
      blobs.push({
        // anchors biased to the right / lower half, away from the headline
        ax: isMobile ? rand(0.15, 0.85) : rand(0.45, 1.0),
        ay: rand(0.1, 0.95),
        r: rand(0.18, 0.34) * (chroma ? 0.6 : 1),
        alpha: chroma ? rand(0.05, 0.09) : rand(0.10, 0.17),
        color,
        f1: rand(0.16, 0.34), f2: rand(0.13, 0.3), f3: rand(0.09, 0.22),
        p1: rand(0, TAU), p2: rand(0, TAU), p3: rand(0, TAU),
        amp: rand(0.1, 0.22),
        px: 0, py: 0 // pointer-induced offset (eased)
      });
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2) * RES;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeBlobs();
  }

  function drawGlow(x, y, r, color, alpha) {
    if (r <= 0 || alpha <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + alpha + ')');
    g.addColorStop(1, 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }

  function frame() {
    t += 0.016;
    const minDim = Math.min(w, h);

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#0b0a08';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    // Ease pointer
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;

    for (const b of blobs) {
      // Organic drift: sum of slow sines
      let x = (b.ax + Math.sin(t * b.f1 + b.p1) * b.amp + Math.sin(t * b.f3 + b.p3) * b.amp * 0.5) * w;
      let y = (b.ay + Math.cos(t * b.f2 + b.p2) * b.amp + Math.cos(t * b.f3 + b.p3 * 1.7) * b.amp * 0.4) * h;

      // The pointer stirs nearby light toward itself
      if (pointer.active) {
        const dx = pointer.x * w - x;
        const dy = pointer.y * h - y;
        const dist = Math.hypot(dx, dy);
        const reach = minDim * 0.45;
        if (dist < reach && dist > 1) {
          const pull = (1 - dist / reach) * minDim * 0.07;
          b.px += ((dx / dist) * pull - b.px) * 0.05;
          b.py += ((dy / dist) * pull - b.py) * 0.05;
        } else {
          b.px *= 0.97; b.py *= 0.97;
        }
      } else {
        b.px *= 0.97; b.py *= 0.97;
      }

      const breathe = 1 + Math.sin(t * b.f2 * 1.6 + b.p1) * 0.12;
      drawGlow(x + b.px, y + b.py, b.r * minDim * 2.2 * breathe, b.color, b.alpha);
    }

    // Pointer ember — a faint halo following the cursor
    if (pointer.active) {
      drawGlow(pointer.x * w, pointer.y * h, minDim * 0.16, LEAK_COLORS[2], 0.05);
    }

    // Click blooms: light soaking into the frame like an ink drop
    for (let i = blooms.length - 1; i >= 0; i--) {
      const bl = blooms[i];
      bl.r += (bl.maxR - bl.r) * 0.045;
      bl.alpha *= 0.985;
      drawGlow(bl.x, bl.y, bl.r, bl.color, bl.alpha);
      if (bl.alpha < 0.004) blooms.splice(i, 1);
    }

    // Shutter ripples: a thin expanding ring
    ctx.globalCompositeOperation = 'screen';
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += rp.speed;
      rp.speed *= 0.985;
      rp.alpha *= 0.965;
      ctx.strokeStyle = 'rgba(243, 236, 220, ' + rp.alpha + ')';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, TAU);
      ctx.stroke();
      if (rp.alpha < 0.01) ripples.splice(i, 1);
    }

    if (running) rafId = requestAnimationFrame(frame);
  }

  function drawStatic() {
    // Reduced motion: a single, calm composition — no animation
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#0b0a08';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    const minDim = Math.min(w, h);
    for (const b of blobs) {
      drawGlow(b.ax * w, b.ay * h, b.r * minDim * 2.2, b.color, b.alpha);
    }
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

  // --- Events -------------------------------------------------------------
  const hero = canvas.closest('.hero') || canvas;

  hero.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.tx = (e.clientX - rect.left) / rect.width;
    pointer.ty = (e.clientY - rect.top) / rect.height;
    pointer.active = true;
  });
  hero.addEventListener('pointerleave', () => { pointer.active = false; });

  hero.addEventListener('pointerdown', (e) => {
    // Ignore presses on links / buttons
    if (e.target.closest('a, button')) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const minDim = Math.min(w, h);
    blooms.push({
      x, y, r: minDim * 0.02,
      maxR: minDim * rand(0.45, 0.7),
      alpha: rand(0.16, 0.24),
      color: LEAK_COLORS[Math.floor(Math.random() * LEAK_COLORS.length)]
    });
    ripples.push({ x, y, r: 6, speed: minDim * 0.014, alpha: 0.65 });
    if (blooms.length > 6) blooms.shift();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      if (reduced) drawStatic();
    }, 150);
  });

  // Pause when the hero scrolls out of view
  if ('IntersectionObserver' in window && !reduced) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.isIntersecting ? start() : stop());
    }, { threshold: 0.02 }).observe(canvas);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!reduced) start();
  });

  // --- Init ---------------------------------------------------------------
  resize();
  if (reduced) drawStatic();
  else start();
})();
