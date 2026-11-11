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
let animationFrame;

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
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = t.hp <= 0 ? 0.18 : 1;
  if (t.id === 'monitor') {
    ctx.fillStyle = '#22252e'; ctx.fillRect(-50, -42, 100, 72);
    ctx.fillStyle = '#4bd8e4'; ctx.fillRect(-42, -34, 84, 56);
    ctx.fillStyle = '#555b68'; ctx.fillRect(-12, 30, 24, 12); ctx.fillRect(-28, 42, 56, 5);
    ctx.fillStyle = '#11151d'; ctx.fillRect(-38, -29, 76, 46);
  } else if (t.id === 'chair') {
    ctx.fillStyle = '#a94757'; ctx.fillRect(-34, -49, 68, 38); ctx.fillRect(-30, -6, 60, 12);
    ctx.fillStyle = '#6e3841'; ctx.fillRect(-5, 5, 10, 33); ctx.fillRect(-28, 38, 56, 6);
    ctx.strokeStyle = '#9598a2'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-25, 44); ctx.lineTo(-39, 53); ctx.moveTo(25,44); ctx.lineTo(39,53); ctx.stroke();
  } else {
    ctx.fillStyle = '#b28e4b'; ctx.fillRect(-38, -48, 76, 95);
    ctx.fillStyle = '#d9b66f'; ctx.fillRect(-31, -40, 62, 34); ctx.fillRect(-31, 1, 62, 36);
    ctx.fillStyle = '#38383c'; ctx.fillRect(-8, -23, 16, 4); ctx.fillRect(-8, 18, 16, 4);
  }
  for (const f of t.fragments ?? []) {
    ctx.strokeStyle = `hsla(${t.hue}, 80%, 75%, ${Math.max(.25, .85 - f.stage * .13)})`;
    ctx.lineWidth = 2;
    const fx = (f.x - t.x) * w, fy = (f.y - t.y) * h;
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + 18, fy - 12); ctx.lineTo(fx + 8, fy + 17); ctx.stroke();
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
  particles = particles.filter((p) => p.life > 0);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy; p.vy += .13; p.life -= 1;
    ctx.globalAlpha = p.life / 35; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  const ax = aim.x * w, ay = aim.y * h;
  ctx.strokeStyle = '#f6c56c'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(ax, ay, 10, 0, Math.PI * 2); ctx.moveTo(ax - 15, ay); ctx.lineTo(ax + 15, ay); ctx.moveTo(ax, ay - 15); ctx.lineTo(ax, ay + 15); ctx.stroke();
}

function sparkle(x, y, hue) {
  if (reducedMotion) return;
  const rect = canvas.getBoundingClientRect();
  for (let i = 0; i < 22; i++) {
    const angle = Math.random() * Math.PI * 2, speed = 1 + Math.random() * 4;
    particles.push({ x: x * rect.width, y: y * rect.height, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2, life: 35, size: 2 + Math.random() * 4, color: `hsl(${hue} 85% 68%)` });
  }
}

function smash() {
  if (dialog.open) return;
  const result = hitTarget(targets, aim, tool);
  if (!result.hit) return;
  targets = result.targets; smashCount += 1;
  score.textContent = `SMASHES: ${smashCount}`;
  sparkle(aim.x, aim.y, result.hit.hue);
  draw();
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
  targets = structuredClone(TARGETS); smashCount = 0; particles = []; score.textContent = 'SMASHES: 0'; draw(); canvas.focus();
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
