export const TOOLS = {
  bat: { label: 'BAT', damage: 1, reach: 0.19 },
  crowbar: { label: 'CROWBAR', damage: 2, reach: 0.24 },
  sledge: { label: 'SLEDGE', damage: 3, reach: 0.29 },
};

export const TARGETS = [
  { id: 'monitor', name: 'CRT monitor', x: 0.28, y: 0.56, kind: 'glass', hp: 4, maxHp: 4, hue: 188 },
  { id: 'chair', name: 'Office chair', x: 0.52, y: 0.66, kind: 'metal', hp: 5, maxHp: 5, hue: 350 },
  { id: 'cabinet', name: 'Filing cabinet', x: 0.75, y: 0.57, kind: 'metal', hp: 6, maxHp: 6, hue: 43 },
];

export const INITIAL_DRAWER_Z = 0.45;
export const INITIAL_MONITOR_EMISSIVE = 0.65;

export function applyPropDamage(id, target) {
  const lost = Math.max(0, target.maxHp - target.hp);
  if (id === 'chair') {
    target.group.rotation.z = Math.min(0.18, lost * 0.035);
  } else if (id === 'cabinet') {
    const drawer = target.group.children[1];
    if (drawer) drawer.position.z = INITIAL_DRAWER_Z + lost * 0.07;
  } else if (id === 'monitor') {
    const glow = target.group.children[2];
    if (glow?.material) {
      glow.material.emissiveIntensity = lost > 0 ? Math.min(1.4, INITIAL_MONITOR_EMISSIVE + lost * 0.18) : INITIAL_MONITOR_EMISSIVE;
    }
  }
}

export function resetTargetProp(id, target) {
  target.hp = target.maxHp;
  target.broken = false;
  target.group.visible = true;
  target.group.rotation.set(0, 0, 0);
  const mesh = target.group.children[0];
  if (target.baseMaterial && mesh?.material) {
    mesh.material = target.baseMaterial;
  }
  applyPropDamage(id, target);
}

export function isInteractiveTarget(target) {
  if (!target || typeof target.closest !== 'function') return false;
  return Boolean(target.closest('button, a[href], input, select, textarea, summary, [role="button"]'));
}

export function shouldHandleGlobalSmashKey(event) {
  if (event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return false;
  if (event.key !== ' ' && event.key !== 'Enter') return false;
  return !isInteractiveTarget(event.target);
}

export function damageTarget(target, tool, at = { x: 0.5, y: 0.5 }) {
  if (target.hp <= 0) return { ...target, fragments: target.fragments ?? [], hit: false };
  const hp = Math.max(0, target.hp - TOOLS[tool].damage);
  const fragments = [...(target.fragments ?? []), { x: at.x, y: at.y, stage: target.maxHp - hp }];
  return { ...target, hp, fragments, hit: true };
}

export function hitTarget(targets, aim, tool) {
  const candidate = targets
    .map((target) => ({ target, distance: Math.hypot(target.x - aim.x, target.y - aim.y) }))
    .filter(({ target, distance }) => target.hp > 0 && distance <= TOOLS[tool].reach)
    .sort((a, b) => a.distance - b.distance)[0];
  if (!candidate) return { targets, hit: null };
  const updated = damageTarget(candidate.target, tool, { x: aim.x, y: aim.y });
  return { targets: targets.map((target) => target.id === updated.id ? updated : target), hit: updated };
}
