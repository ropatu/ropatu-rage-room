import test from 'node:test';
import assert from 'node:assert/strict';
import { TARGETS, damageTarget, hitTarget } from '../src/game.js';

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
