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
