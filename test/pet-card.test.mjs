// The cards' logic, run on the mock PetKit registries (scripts/mock-states.mjs) without a browser: discovery,
// device status, the actions and their service calls.
import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, FEEDER_OPTIONS, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const { resolve, findDevices, feedSpec, feedDefault, PetCard, PetMiniCard } = load("pet-card.js", [
  "resolve",
  "findDevices",
  "feedSpec",
  "feedDefault",
  "PetCard",
  "PetMiniCard",
]);

const hassWith = (overrides = {}) => {
  const next = { ...states };
  for (const [id, o] of Object.entries(overrides)) next[id] = { ...next[id], ...o };
  const calls = [];
  return { states: next, entities, devices, language: "en", locale: { language: "en" }, calls, callService: (d, s, data) => calls.push([d, s, data]) };
};

// A card with a config and hass, rendering to a string (no DOM in the tests).
const card = (Cls, config = {}, overrides) => {
  const c = new Cls();
  c._update = () => {};
  c.setConfig(config);
  c.hass = hassWith(overrides);
  return c;
};

// A click on an element of the rendered card, found by its data attributes.
// The guard after a popup closes (a double click on OK) is for a user's clicks: the tests click on purpose.
const click = (c, dataset, attrs = {}) => {
  c._dialogClosedAt = 0;
  c._onClick({ composedPath: () => [{ dataset, getAttribute: (n) => attrs[n] ?? null }], stopPropagation() {} });
};
// Service calls are made on the next microtask.
const settle = () => new Promise((r) => setImmediate(r));
// Values built in the card's own context (other Array / Object prototypes), as plain data.
const plain = (v) => JSON.parse(JSON.stringify(v));

test("discovery: feeders first, then fountains; unsupported PetKit devices left out", () => {
  const list = resolve(hassWith());
  assert.deepEqual(
    plain(list.map((d) => [d.id, d.kind])),
    [
      ["solo", "feeder"],
      ["gemini", "feeder"],
      ["fountain", "fountain"],
    ]
  );
  const solo = list[0];
  assert.equal(solo.name, "Kitchen feeder");
  assert.equal(solo.model, "Fresh Element Solo");
  assert.equal(solo.entities.feed, "select.distributeur_cuisine_repas_manuel");
  assert.equal(solo.entities.food, "binary_sensor.distributeur_cuisine_niveau");
  assert.equal(list[1].entities.feed, "text.distributeur_double_repas_manuel");
  assert.equal(list[2].entities.power, "switch.fontaine_salon_alimentation");
  assert.equal(list[2].entities.reset_filter, "button.fontaine_salon_reinit_filtre");
});

test("discovery follows the registries, not the entity ids", () => {
  const h = hassWith();
  const renamed = Object.fromEntries(Object.entries(h.entities).map(([id, e]) => [id, { ...e }]));
  renamed["sensor.fontaine_salon_filtre"] = { ...renamed["sensor.fontaine_salon_filtre"], translation_key: "something_else" };
  const list = resolve({ ...h, entities: renamed });
  assert.equal(list.find((d) => d.id === "fountain").entities.filter, undefined);
});

test("devices option: ids or names, unknown ones reported", () => {
  const h = hassWith();
  assert.equal(findDevices(h, {}).devices.length, 3);
  assert.deepEqual(
    plain(findDevices(h, { devices: ["fountain", "kitchen FEEDER"] }).devices.map((d) => d.id)),
    ["fountain", "solo"]
  );
  assert.equal(findDevices(h, { devices: ["nope"] }).error, "unknown_device");
  assert.equal(findDevices({ states: {} }, {}).error, "no_registry");
  assert.equal(findDevices({ states: {}, entities: {}, devices: {} }, {}).error, "no_devices");
});

test("status: normal, then alerts in order of importance", () => {
  const c = card(PetCard);
  const [solo, gemini, fountain] = resolve(c.hass);
  assert.equal(c._status(solo).key, "normal");
  assert.equal(c._status(gemini).key, "food_low");
  assert.equal(c._status(fountain).key, "running");
  const bad = card(PetCard, {}, {
    "sensor.distributeur_cuisine_erreur": { state: "Feeder jammed" },
    "sensor.distributeur_cuisine_deshydratant": { state: "0" },
    "binary_sensor.fontaine_salon_niveau_eau": { state: "on" },
    "switch.fontaine_salon_alimentation": { state: "off" },
  });
  const st = bad._status(solo);
  assert.equal(st.key, "error");
  assert.equal(st.title, "Feeder jammed");
  assert.deepEqual(plain(st.alerts.map((a) => a.key)), ["error", "replace_desiccant"]);
  const f = bad._status(fountain);
  assert.equal(f.key, "off");
  assert.deepEqual(plain(f.alerts.map((a) => a.key)), ["water_low"]);
  assert.equal(bad._overall([solo]).cls, "crit");
});

test("status: a device whose entities are all unavailable is unavailable", () => {
  const off = Object.fromEntries(Object.keys(states).filter((id) => id.includes("fontaine")).map((id) => [id, { state: "unavailable" }]));
  const c = card(PetCard, { devices: ["fountain"] }, off);
  assert.equal(c._status(resolve(c.hass)[2]).key, "unavailable");
  assert.equal(c._overall([resolve(c.hass)[2]]).key, "unavailable");
});

test("render: full card shows the devices, the mini card one row each and the alerts", () => {
  const full = card(PetCard)._render();
  for (const text of ["Kitchen feeder", "Twin feeder", "Living room fountain", "Hopper 2", "Dispensed today", "of 60 g planned", "72%"]) assert.ok(full.includes(text), text);
  assert.ok(!full.includes("Litter box"));
  const mini = card(PetMiniCard)._render();
  assert.equal((mini.match(/class="row /g) || []).length, 3);
  assert.ok(mini.includes("Twin feeder: Food low"));
  assert.ok(mini.includes('class="zoom"'));
  assert.ok(!card(PetMiniCard, { zoom: false })._render().includes('class="zoom"'));
});

test("render: options hide the figures and the buttons", () => {
  const html = card(PetCard, { show_stats: false, show_controls: false })._render();
  assert.ok(!html.includes('class="tiles"'));
  assert.ok(!html.includes('data-action="feed"'));
  assert.ok(!html.includes('data-action="power"'));
});

test("feed: select options, picked then dispensed", async () => {
  const c = card(PetCard, { devices: ["solo"] });
  c._render();
  click(c, { action: "feed", device: "solo" });
  assert.deepEqual(plain(c._dialog.feed.spec.options), FEEDER_OPTIONS.slice(1));
  click(c, { action: "feed_pick", option: "1/2 Cup (50g)" });
  click(c, { action: "confirm_ok" });
  await settle();
  assert.deepEqual(plain(c.hass.calls), [["select", "select_option", { entity_id: "select.distributeur_cuisine_repas_manuel", option: "1/2 Cup (50g)" }]]);
  assert.equal(c._dialog, null);
});

test("feed: two hoppers as portions, sent as text", async () => {
  const c = card(PetCard, { devices: ["gemini"] });
  c._render();
  click(c, { action: "feed", device: "gemini" });
  assert.deepEqual(plain(c._dialog.feed.values), [1, 0]);
  click(c, { action: "feed_step", index: "1", delta: "1" });
  click(c, { action: "feed_step", index: "1", delta: "1" });
  click(c, { action: "feed_step", index: "0", delta: "-1" });
  click(c, { action: "feed_step", index: "0", delta: "-1" });
  click(c, { action: "confirm_ok" });
  await settle();
  assert.deepEqual(plain(c.hass.calls), [["text", "set_value", { entity_id: "text.distributeur_double_repas_manuel", value: "0,2" }]]);
});

test("feed: a gram range, on the entity's steps", async () => {
  assert.equal(feedDefault(4, 200, 1), 10);
  assert.equal(feedDefault(0, 400, 20), 20);
  assert.equal(feedDefault(0, 5, 1), 5);
  const spec = feedSpec({ entity_id: "number.x_manual_feed", state: "0", attributes: { min: 4, max: 200, step: 1, unit_of_measurement: "g" } });
  assert.deepEqual(plain(spec), { domain: "number", min: 4, max: 200, step: 1, unit: "g" });
  const c = card(PetCard, { devices: ["solo"] }, {
    "select.distributeur_cuisine_repas_manuel": { entity_id: "number.distributeur_cuisine_repas_manuel", state: "0", attributes: { min: 4, max: 200, step: 1 } },
  });
  c._render();
  click(c, { action: "feed", device: "solo" });
  click(c, { action: "feed_step", index: "0", delta: "5" });
  click(c, { action: "confirm_ok" });
  await settle();
  assert.deepEqual(plain(c.hass.calls), [["number", "set_value", { entity_id: "number.distributeur_cuisine_repas_manuel", value: 15 }]]);
});

test("cancel and Escape close the popup without acting", async () => {
  const c = card(PetCard, { devices: ["solo"] });
  c._render();
  click(c, { action: "feed", device: "solo" });
  click(c, { action: "confirm_cancel" });
  assert.equal(c._dialog, null);
  await settle();
  assert.deepEqual(plain(c.hass.calls), []);
});

test("fountain: power off asks first, power on and toggles do not; resets ask first", async () => {
  const c = card(PetCard, { devices: ["fountain"] });
  c._render();
  click(c, { action: "power", device: "fountain", entity: "switch.fontaine_salon_alimentation" });
  assert.ok(c._dialog);
  await settle();
  assert.deepEqual(plain(c.hass.calls), []);
  click(c, { action: "confirm_ok" });
  click(c, { action: "toggle", device: "fountain", entity: "switch.fontaine_salon_lumiere" });
  click(c, { action: "mode", device: "fountain", entity: "select.fontaine_salon_mode", option: "normal" });
  click(c, { action: "reset_filter", device: "fountain", entity: "button.fontaine_salon_reinit_filtre" });
  click(c, { action: "confirm_ok" });
  await settle();
  assert.deepEqual(plain(c.hass.calls), [
    ["switch", "turn_off", { entity_id: "switch.fontaine_salon_alimentation" }],
    ["switch", "toggle", { entity_id: "switch.fontaine_salon_lumiere" }],
    ["select", "select_option", { entity_id: "select.fontaine_salon_mode", option: "normal" }],
    ["button", "press", { entity_id: "button.fontaine_salon_reinit_filtre" }],
  ]);
  const off = card(PetCard, { devices: ["fountain"] }, { "switch.fontaine_salon_alimentation": { state: "off" } });
  off._render();
  click(off, { action: "power", device: "fountain", entity: "switch.fontaine_salon_alimentation" });
  assert.equal(off._dialog, undefined);
  await settle();
  assert.deepEqual(plain(off.hass.calls), [["switch", "turn_on", { entity_id: "switch.fontaine_salon_alimentation" }]]);
});

test("a value without an action opens more-info", () => {
  const c = card(PetCard);
  const events = [];
  c.dispatchEvent = (e) => events.push(e);
  click(c, { entity: "sensor.fontaine_salon_filtre" });
  assert.equal(events.length, 1);
});
