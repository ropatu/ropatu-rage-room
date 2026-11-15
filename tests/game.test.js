import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_DRAWER_Z,
  INITIAL_MONITOR_EMISSIVE,
  TARGETS,
  applyPropDamage,
  damageTarget,
  hitTarget,
  resetTargetProp,
  shouldHandleGlobalSmashKey,
} from '../src/game.js';

test('tools apply distinct bounded damage and preserve impact marks', () => {
  const hit = damageTarget(TARGETS[0], 'sledge', { x: .31, y: .55 });
  assert.equal(hit.hp, 1);
  assert.deepEqual(hit.fragments[0], { x: .31, y: .55, stage: 3 });
  assert.equal(damageTarget(hit, 'sledge').hp, 0);
  assert.equal(damageTarget(hit, 'bat').hp, 0);
});

test('aim hits the nearest target within tool reach and leaves other targets intact', () => {
  const { targets, hit } = hitTarget(TARGETS, { x: .51, y: .66 }, 'bat');
  assert.equal(hit.id, 'chair');
  assert.equal(targets[1].hp, 4);
  assert.equal(targets[0].hp, 4);
});

test('aim outside reach does not mutate the room', () => {
  const result = hitTarget(TARGETS, { x: .05, y: .05 }, 'bat');
  assert.equal(result.hit, null);
  assert.equal(result.targets, TARGETS);
});

test('shouldHandleGlobalSmashKey ignores focused buttons and interactive elements to prevent double activation', () => {
  const buttonTarget = { closest: (selector) => selector.includes('button') ? {} : null };
  const canvasTarget = { closest: () => null };

  assert.equal(
    shouldHandleGlobalSmashKey({ key: ' ', target: buttonTarget, defaultPrevented: false, repeat: false, altKey: false, ctrlKey: false, metaKey: false }),
    false
  );
  assert.equal(
    shouldHandleGlobalSmashKey({ key: 'Enter', target: buttonTarget, defaultPrevented: false, repeat: false, altKey: false, ctrlKey: false, metaKey: false }),
    false
  );
  assert.equal(
    shouldHandleGlobalSmashKey({ key: ' ', target: canvasTarget, defaultPrevented: false, repeat: false, altKey: false, ctrlKey: false, metaKey: false }),
    true
  );
  assert.equal(
    shouldHandleGlobalSmashKey({ key: 'Enter', target: canvasTarget, defaultPrevented: false, repeat: false, altKey: false, ctrlKey: false, metaKey: false }),
    true
  );
});

test('resetTargetProp restores cabinet drawer position, monitor emissive intensity, and chair tilt', () => {
  const makeRotation = () => ({
    x: 0,
    y: 0,
    z: 0,
    set(x, y, z) { this.x = x; this.y = y; this.z = z; },
  });

  const cabinet = {
    hp: 2,
    maxHp: 6,
    broken: true,
    baseMaterial: { id: 'cabinet-body' },
    group: {
      visible: false,
      rotation: makeRotation(),
      children: [
        { material: { id: 'hit-flash' } },
        { position: { z: INITIAL_DRAWER_Z } },
      ],
    },
  };
  applyPropDamage('cabinet', cabinet);
  assert.ok(cabinet.group.children[1].position.z > INITIAL_DRAWER_Z);

  resetTargetProp('cabinet', cabinet);
  assert.equal(cabinet.hp, 6);
  assert.equal(cabinet.broken, false);
  assert.equal(cabinet.group.visible, true);
  assert.equal(cabinet.group.children[0].material, cabinet.baseMaterial);
  assert.equal(cabinet.group.children[1].position.z, INITIAL_DRAWER_Z);

  const monitor = {
    hp: 1,
    maxHp: 4,
    broken: false,
    group: {
      visible: true,
      rotation: makeRotation(),
      children: [
        {},
        {},
        { material: { emissiveIntensity: INITIAL_MONITOR_EMISSIVE } },
      ],
    },
  };
  applyPropDamage('monitor', monitor);
  assert.ok(monitor.group.children[2].material.emissiveIntensity > INITIAL_MONITOR_EMISSIVE);

  resetTargetProp('monitor', monitor);
  assert.equal(monitor.hp, 4);
  assert.equal(monitor.group.children[2].material.emissiveIntensity, INITIAL_MONITOR_EMISSIVE);

  const chair = {
    hp: 1,
    maxHp: 5,
    broken: false,
    group: {
      visible: true,
      rotation: makeRotation(),
      children: [{}],
    },
  };
  applyPropDamage('chair', chair);
  assert.ok(chair.group.rotation.z > 0);

  resetTargetProp('chair', chair);
  assert.equal(chair.hp, 5);
  assert.equal(chair.group.rotation.z, 0);
});
