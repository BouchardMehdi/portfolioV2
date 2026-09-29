import assert from "node:assert/strict";
import { test } from "node:test";
import {
  riverBeatIndex,
  riverBeats,
  riverSegment,
} from "../src/features/selected-work/river-story";

test("les phases retrouvent le même état à la descente et à la remontée", () => {
  const positions = [0, 0.16, 0.4, 0.59, 0.78, 0.9, 1];
  assert.deepEqual(
    positions.map(riverBeatIndex),
    riverBeats.map((_, index) => index),
  );
  assert.deepEqual(
    positions.toReversed().map(riverBeatIndex).toReversed(),
    positions.map(riverBeatIndex),
  );
  assert.equal(riverBeatIndex(-1), 0);
  assert.equal(riverBeatIndex(2), riverBeats.length - 1);
});

test("les mouvements sont bornés et immobiles pendant les plages de lecture", () => {
  assert.equal(riverSegment(0.1, 0.2, 0.3), 0);
  assert.equal(riverSegment(0.5, 0.2, 0.3), 1);
  assert.ok(Math.abs(riverSegment(0.25, 0.2, 0.3) - 0.5) < 0.00001);
  assert.equal(riverSegment(0.6, 0.49, 0.57), riverSegment(0.64, 0.49, 0.57));
});
