import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { STRINGS, LANG_NAMES } = load("pet-card.js", ["STRINGS", "LANG_NAMES"]);
const en = STRINGS.en;
const vars = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test("22 languages, the same as the editor's list", () => {
  assert.equal(Object.keys(STRINGS).length, 22);
  assert.deepEqual([...Object.keys(STRINGS)].sort(), [...LANG_NAMES.map(([code]) => code)].sort());
});

for (const [code, table] of Object.entries(STRINGS)) {
  test(`${code}: every key, same placeholders, nothing extra`, () => {
    assert.deepEqual([...Object.keys(table)].sort(), [...Object.keys(en)].sort());
    for (const k of Object.keys(en)) {
      assert.ok(String(table[k]).trim(), `${code}.${k} empty`);
      assert.deepEqual([...vars(table[k])], [...vars(en[k])], `${code}.${k} placeholders`);
    }
  });
}
