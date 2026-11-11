import { TARGETS, TOOLS, hitTarget } from './game.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const dialog = document.querySelector('#intro');
const start = document.querySelector('#start');
const helpButton = document.querySelector('#help-button');
const skipLink = document.querySelector('#skip-link');
const score = document.querySelector('#score');
const toolLabel = document.querySelector('#tool-label');
let targets = structuredClone(TARGETS);
let tool = 'bat';
let smashCount = 0;
let aim = { x: 0.51, y: 0.59 };
let particles = [];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let animationFrame = 0;
let hitEffect = null;
let lastFrame = 0;

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function drawTarget(t, w, h) {
  const x = t.x * w, y = t.y * h;
  const damage = 1 - t.hp / t.maxHp;
  const pulse = hitEffect?.id === t.id && !reducedMotion
    ? Math.max(0, 1 - (performance.now() - hitEffect.startedAt) / 170) : 0;
  ctx.save();
  ctx.translate(x, y);
  if (pulse) ctx.translate((Math.random() - .5) * pulse * 7, (Math.random() - .5) * pulse * 5);
  if (t.hp <= 0 && t.id === 'chair' && !reducedMotion) ctx.rotate(-.12);
  ctx.globalAlpha = t.hp <= 0 ? 0.3 : 1;
  if (pulse) { ctx.shadowColor = `hsla(${t.hue}, 90%, 70%, .85)`; ctx.shadowBlur = 18 * pulse; }
  if (t.id === 'monitor') {
    ctx.fillStyle = '#22252e'; ctx.fillRect(-50, -42, 100, 72);
    ctx.fillStyle = damage > .5 ? '#b8d9d6' : '#4bd8e4'; ctx.fillRect(-42, -34, 84, 56);
    ctx.fillStyle = '#555b68'; ctx.fillRect(-12, 30, 24, 12); ctx.fillRect(-28, 42, 56, 5);
    ctx.fillStyle = '#11151d'; ctx.fillRect(-38, -29, 76, 46);
    if (damage > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(-38, -29, 76, 46); ctx.clip();
      ctx.strokeStyle = `rgba(210,245,244,${.45 + damage * .45})`; ctx.lineWidth = 1.5;
      const marks = (t.fragments ?? []).slice(0, 5);
      for (const [i, mark] of marks.entries()) {
        const cx = (mark.x - t.x) * w, cy = (mark.y - t.y) * h;
        for (let ray = 0; ray < 5; ray++) {
          const angle = ray * Math.PI * 2 / 5 + i * .7;
          ctx.beginPath(); ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * (9 + damage * 24), cy + Math.sin(angle) * (8 + damage * 22)); ctx.stroke();
        }
      }
      ctx.restore();
    }
  } else if (t.id === 'chair') {
    ctx.fillStyle = damage > .55 ? '#753842' : '#a94757';
    ctx.fillRect(-34 - damage * 5, -49, 68 - damage * 7, 38); ctx.fillRect(-30, -6, 60, 12);
    ctx.fillStyle = '#6e3841'; ctx.fillRect(-5, 5, 10, 33); ctx.fillRect(-28, 38, 56, 6);
    ctx.strokeStyle = '#9598a2'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-25, 44); ctx.lineTo(-39, 53); ctx.moveTo(25,44); ctx.lineTo(39,53); ctx.stroke();
    if (damage > .2) {
      ctx.strokeStyle = '#d0a5a0'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(-29, -12); ctx.lineTo(-13, -9 - damage * 6); ctx.lineTo(-4, -15 - damage * 5);
      ctx.moveTo(18, -47); ctx.lineTo(11, -31); ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#b28e4b'; ctx.fillRect(-38, -48, 76, 95);
    ctx.fillStyle = '#d9b66f';
    ctx.fillRect(-31 - damage * 5, -40, 62, 34); ctx.fillRect(-31 + damage * 4, 1, 62, 36);
    ctx.fillStyle = '#38383c'; ctx.fillRect(-8, -23, 16, 4); ctx.fillRect(-8, 18, 16, 4);
    if (damage > .33) {
      ctx.strokeStyle = '#e2c785'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(-33, -4); ctx.lineTo(-18, -8); ctx.moveTo(30, 38); ctx.lineTo(20, 34); ctx.stroke();
    }
  }
  ctx.restore();
  if (t.hp > 0 && t.hp < t.maxHp) {
    ctx.fillStyle = '#1c1e25'; ctx.fillRect(x - 32, y + 60, 64, 5);
    ctx.fillStyle = '#f2b84b'; ctx.fillRect(x - 32, y + 60, 64 * t.hp / t.maxHp, 5);
  }
}

function draw() {
  if (!ctx) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  ctx.clearRect(0, 0, w, h);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#272a38'); sky.addColorStop(1, '#16181e');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#39313a'; ctx.fillRect(0, h * .78, w, h * .22);
  ctx.strokeStyle = 'rgba(255,255,255,.055)'; ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(w * i / 6, h * .78); ctx.lineTo(w * (i - 1) / 3, h); ctx.stroke(); }
  ctx.fillStyle = '#efbd68'; ctx.fillRect(w * .08, h * .16, w * .2, 5);
  ctx.fillStyle = 'rgba(239,189,104,.1)'; ctx.fillRect(w * .08, h * .16, w * .2, h * .34);
  targets.forEach((t) => drawTarget(t, w, h));
  for (const p of particles) {
    ctx.globalAlpha = p.life / p.maxLife; ctx.fillStyle = p.color;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * p.ratio); ctx.restore();
  }
  ctx.globalAlpha = 1;
  if (hitEffect && !reducedMotion) {
    const age = performance.now() - hitEffect.startedAt;
    if (age < 130) {
      const alpha = 1 - age / 130;
      const g = ctx.createRadialGradient(hitEffect.x * w, hitEffect.y * h, 2, hitEffect.x * w, hitEffect.y * h, 34);
      g.addColorStop(0, `hsla(${hitEffect.hue},100%,80%,${alpha * .65})`); g.addColorStop(1, `hsla(${hitEffect.hue},100%,65%,0)`);
      ctx.fillStyle = g; ctx.fillRect(hitEffect.x * w - 36, hitEffect.y * h - 36, 72, 72);
    }
  }
  const ax = aim.x * w, ay = aim.y * h;
  ctx.strokeStyle = '#f6c56c'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(ax, ay, 10, 0, Math.PI * 2); ctx.moveTo(ax - 15, ay); ctx.lineTo(ax + 15, ay); ctx.moveTo(ax, ay - 15); ctx.lineTo(ax, ay + 15); ctx.stroke();
}

function sparkle(x, y, hue) {
  if (reducedMotion) return;
  const rect = canvas.getBoundingClientRect();
  const count = tool === 'sledge' ? 18 : 11;
  for (let i = 0; i < count && particles.length < 90; i++) {
    const angle = Math.random() * Math.PI * 2, speed = 1 + Math.random() * (tool === 'sledge' ? 4.5 : 3);
    particles.push({ x: x * rect.width, y: y * rect.height, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2, life: 28 + Math.random() * 12, maxLife: 40, size: 2 + Math.random() * 4, ratio: .45 + Math.random() * 1.2, rotation: Math.random() * Math.PI, spin: (Math.random() - .5) * .18, color: `hsl(${hue} 85% ${55 + Math.random() * 25}%)` });
  }
}

function animate(now) {
  const dt = Math.min((now - (lastFrame || now)) / 16.67, 2);
  lastFrame = now;
  for (const p of particles) {
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += .15 * dt; p.vx *= Math.pow(.985, dt);
    p.rotation += p.spin * dt; p.life -= dt;
  }
  particles = particles.filter((p) => p.life > 0);
  if (hitEffect && now - hitEffect.startedAt > 190) hitEffect = null;
  draw();
  if (particles.length || hitEffect) animationFrame = requestAnimationFrame(animate);
  else { animationFrame = 0; lastFrame = 0; }
}

function startEffects() {
  if (!animationFrame && !reducedMotion) animationFrame = requestAnimationFrame(animate);
}

function smash() {
  if (dialog.open) return;
  const result = hitTarget(targets, aim, tool);
  if (!result.hit) return;
  targets = result.targets; smashCount += 1;
  score.textContent = `SMASHES: ${smashCount}`;
  hitEffect = reducedMotion ? null : { id: result.hit.id, x: aim.x, y: aim.y, hue: result.hit.hue, startedAt: performance.now() };
  sparkle(aim.x, aim.y, result.hit.hue);
  draw(); startEffects();
}

function openHelp() {
  dialog.showModal();
  start.focus();
}

function closeHelp() {
  if (dialog.open) dialog.close();
  canvas.focus();
}

skipLink.addEventListener('click', (event) => {
  event.preventDefault();
  closeHelp();
  history.replaceState(null, '', '#game');
});
start.addEventListener('click', closeHelp);
helpButton.addEventListener('click', openHelp);
dialog.addEventListener('close', () => { if (document.activeElement === document.body) canvas.focus(); });
canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect(); aim = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height }; draw();
});
canvas.addEventListener('pointerdown', (event) => { canvas.focus(); const rect = canvas.getBoundingClientRect(); aim = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height }; smash(); });
document.querySelectorAll('[data-tool]').forEach((button) => button.addEventListener('click', () => {
  tool = button.dataset.tool; toolLabel.textContent = `TOOL: ${TOOLS[tool].label}`;
  document.querySelectorAll('[data-tool]').forEach((b) => b.classList.toggle('active', b === button)); canvas.focus();
}));
document.querySelector('#reset').addEventListener('click', () => {
  targets = structuredClone(TARGETS); smashCount = 0; particles = []; hitEffect = null;
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = 0; lastFrame = 0; score.textContent = 'SMASHES: 0'; draw(); canvas.focus();
});
document.addEventListener('keydown', (event) => {
  if (dialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
  const move = 0.035;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
  if (event.key === 'ArrowUp') aim.y = Math.max(.15, aim.y - move);
  if (event.key === 'ArrowDown') aim.y = Math.min(.76, aim.y + move);
  if (event.key === 'ArrowLeft') aim.x = Math.max(.06, aim.x - move);
  if (event.key === 'ArrowRight') aim.x = Math.min(.94, aim.x + move);
  if (event.key === ' ' || event.key === 'Enter') smash();
  if (event.key.toLowerCase() === 'r') document.querySelector('#reset').click();
  if (/^[1-3]$/.test(event.key)) document.querySelector(`[data-tool="${['bat','crowbar','sledge'][Number(event.key)-1]}"]`).click();
  draw();
});
window.addEventListener('resize', resize);
const observer = new ResizeObserver(resize); observer.observe(canvas);
resize();
requestAnimationFrame(() => { dialog.showModal(); start.focus(); });
