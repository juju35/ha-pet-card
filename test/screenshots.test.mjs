// The screenshot scenes name real devices, entities and files: a renamed mock entity fails here, not in CI.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { devices, states } from "../scripts/mock-states.mjs";
import { gifs, shots } from "../scripts/screenshot-scenes.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const readme = readFileSync(`${root}README.md`, "utf8");

test("every scene uses known devices and states", () => {
  for (const s of [...shots, ...gifs]) {
    for (const d of s.config.devices ?? []) assert.ok(devices[d], `${s.file}: ${d}`);
    for (const id of Object.keys(s.states ?? {})) assert.ok(states[id], `${s.file}: ${id}`);
    for (const e of s.events ?? []) for (const id of Object.keys(e.states ?? {})) assert.ok(states[id], `${s.file}: ${id}`);
  }
});

test("every capture has a light and a dark twin, and the README shows each one", () => {
  for (const s of shots) {
    const ext = s.file.endsWith("-dark") ? s.file.replace(/-dark$/, "") : `${s.file}-dark`;
    assert.ok(shots.some((o) => o.file === ext), ext);
    assert.ok(readme.includes(`screenshots/${s.file}.png`), `README misses ${s.file}.png`);
    assert.ok(existsSync(`${root}screenshots/${s.file}.png`), `${s.file}.png not rendered`);
  }
  for (const g of gifs) {
    assert.ok(readme.includes(`screenshots/${g.file}.gif`), `README misses ${g.file}.gif`);
    assert.ok(existsSync(`${root}screenshots/${g.file}.gif`), `${g.file}.gif not rendered`);
  }
});
