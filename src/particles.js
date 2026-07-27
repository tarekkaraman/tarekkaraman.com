// Ambient neural-network background: drifting gold nodes with proximity
// links. Deliberately quiet (low alpha, capped count, DPR-capped canvas),
// paused when the tab is hidden, and skipped entirely for reduced-motion.

export function initParticles() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'ai-bg';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  let W = 0, H = 0, nodes = [];

  const themeAlpha = () => (document.documentElement.dataset.theme === 'dark' ? 1 : 0.75);

  const makeNode = () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    r: 1 + Math.random() * 1.8,
    tw: Math.random() * Math.PI * 2 // twinkle phase
  });

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // Keep the existing field and only top up or trim to the new target. On
    // mobile, scrolling collapses the URL bar and fires resize constantly;
    // rebuilding the array there made the whole background visibly jump.
    const target = Math.min(70, Math.round((W * H) / 26000));
    if (nodes.length > target) nodes.length = target;
    while (nodes.length < target) nodes.push(makeNode());
  }

  const LINK = 130;
  let running = true;
  let t = 0;

  function frame() {
    if (!running) return;
    t += 0.008;
    ctx.clearRect(0, 0, W, H);
    const a = themeAlpha();

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20;
    }
    // links
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          const o = (1 - Math.sqrt(d2) / LINK) * 0.14 * a;
          ctx.strokeStyle = `rgba(201,153,47,${o.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
        }
      }
    }
    // nodes (soft twinkle)
    for (const n of nodes) {
      const tw = 0.55 + 0.45 * Math.sin(t * 2 + n.tw);
      ctx.fillStyle = `rgba(201,153,47,${(0.32 * tw * a).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    const wasRunning = running;
    running = !document.hidden;
    if (running && !wasRunning) requestAnimationFrame(frame);
  });
  window.addEventListener('resize', resize);

  resize();
  requestAnimationFrame(frame);
}
