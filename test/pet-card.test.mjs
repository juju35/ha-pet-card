// The cards' logic, run on the mock PetKit registries (scripts/mock-states.mjs) without a browser: discovery,
// device status, the actions and their service calls.
import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, FEEDER_OPTIONS, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const { resolve, findDevices, feedSpec, feedDefault, feedListSpec, feedDualSpec, PetCard, PetMiniCard, PetCardEditor, PetMiniCardEditor, STRINGS } = load("pet-card.js", [
  "resolve",
  "findDevices",
  "feedSpec",
  "feedDefault",
  "feedListSpec",
  "feedDualSpec",
  "PetCard",
  "PetMiniCard",
  "PetCardEditor",
  "PetMiniCardEditor",
  "STRINGS",
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

test("discovery: feeders first, then fountains, then litter boxes; unsupported PetKit devices left out", () => {
  const list = resolve(hassWith());
  assert.deepEqual(
    plain(list.map((d) => [d.id, d.kind])),
    [
      ["d4sh", "feeder"],
      ["solo", "feeder"],
      ["gemini", "feeder"],
      ["ctw3", "fountain"],
      ["fountain", "fountain"],
      ["t4", "litter"],
      ["litter", "litter"],
    ]
  );
  const solo = list[1];
  assert.equal(solo.name, "Kitchen feeder");
  assert.equal(solo.model, "Fresh Element Solo");
  assert.equal(solo.entities.feed, "select.distributeur_cuisine_repas_manuel");
  assert.equal(solo.entities.food, "binary_sensor.distributeur_cuisine_niveau");
  assert.equal(list[2].entities.feed, "text.distributeur_double_repas_manuel");
  assert.equal(list[4].entities.power, "switch.fontaine_salon_alimentation");
  assert.equal(list[4].entities.reset_filter, "button.fontaine_salon_reinit_filtre");
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
  assert.equal(findDevices(h, {}).devices.length, 7);
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
  const [, solo, gemini, , fountain] = resolve(c.hass);
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
  const fountain = resolve(c.hass).find((d) => d.id === "fountain");
  assert.equal(c._status(fountain).key, "unavailable");
  assert.equal(c._overall([fountain]).key, "unavailable");
});

test("render: full card shows the devices, the mini card one row each and the alerts", () => {
  const full = card(PetCard)._render();
  for (const text of ["Kitchen feeder", "Twin feeder", "Living room fountain", "Hopper 2", "Dispensed today", "of 60 g planned", "72%"]) assert.ok(full.includes(text), text);
  assert.ok(full.includes("Litter box") && !full.includes("Purifier"));
  const mini = card(PetMiniCard)._render();
  assert.equal((mini.match(/class="row /g) || []).length, 7);
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

test("editor: the mini card offers the full card's options its detail view uses, labelled in every language", () => {
  const mini = PetMiniCardEditor.toggles.map(([name]) => name);
  for (const [name, def] of PetCardEditor.toggles) {
    assert.ok(mini.includes(name), name);
    assert.equal(PetMiniCardEditor.toggles.find(([n]) => n === name)[1], def, name);
  }
  assert.ok(mini.includes("zoom"));
  for (const [code, strings] of Object.entries(STRINGS)) for (const name of mini) assert.ok(strings[name], `${code}: ${name}`);
  const zoomed = card(PetMiniCard, { show_stats: false, show_controls: false });
  zoomed._zoomed = true;
  const html = zoomed._render();
  assert.ok(!html.includes('class="tiles"'));
  assert.ok(!html.includes('data-action="feed"'));
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

test("folding: a tap elsewhere (pointer) closes the popup, not a press in the card released outside; leaving the page closes it too", () => {
  const c = card(PetCard, { devices: ["fountain"] });
  c._render();
  c.connectedCallback();
  const outside = { composedPath: () => [{ tagName: "DIV" }] };
  click(c, { action: "power", device: "fountain", entity: "switch.fontaine_salon_alimentation" });
  assert.ok(c._dialog);
  // Pressed in the card and released outside: the popup stays.
  c._onOutsideWatch.tap({ composedPath: () => [c] });
  assert.ok(c._dialog);
  // A tap on a spot that sends no click (iOS): the pointer alone closes it.
  c._onOutsideWatch.tap(outside);
  assert.equal(c._dialog, null);
  // Left with the popup open and back on the page: closed.
  click(c, { action: "power", device: "fountain", entity: "switch.fontaine_salon_alimentation" });
  c.disconnectedCallback();
  c.connectedCallback();
  assert.equal(c._dialog, null);
  c.disconnectedCallback();
  // The mini card comes back compact.
  const m = card(PetMiniCard);
  m.connectedCallback();
  m._setZoom(true);
  m._onUnzoomWatch.tap(outside);
  assert.equal(m._zoomed, false);
  m._setZoom(true);
  m.disconnectedCallback();
  m.connectedCallback();
  assert.equal(m._zoomed, false);
  m.disconnectedCallback();
});

// Jezza34000's integration (same `petkit` domain, its own translation keys): YumShare Dual-hopper with Camera (D4SH)
// and Eversweet Max Cordless (CTW3) in the mocks.
const byId = (h, id) => resolve(h).find((d) => d.id === id);

test("Jezza34000: discovery of the D4SH and the CTW3 by their own translation keys", () => {
  const h = hassWith();
  const d4sh = byId(h, "d4sh");
  assert.equal(d4sh.kind, "feeder");
  assert.equal(d4sh.model, "YumShare Dual-hopper with Camera");
  const e = d4sh.entities;
  assert.equal(e.food1, "binary_sensor.distributeur_couloir_niveau_1");
  assert.equal(e.food2, "binary_sensor.distributeur_couloir_niveau_2");
  assert.equal(e.status, "sensor.distributeur_couloir_statut");
  assert.equal(e.error, "sensor.distributeur_couloir_erreur");
  assert.equal(e.desiccant, "sensor.distributeur_couloir_deshydratant");
  assert.equal(e.feed, undefined);
  assert.equal(e.feed1, "text.distributeur_couloir_repas_manuel_1");
  assert.equal(e.feed2, "text.distributeur_couloir_repas_manuel_2");
  assert.equal(e.dispensed1, "sensor.distributeur_couloir_distribue_1");
  assert.equal(e.camera, "camera.distributeur_couloir");
  assert.equal(e.camera_switch, "switch.distributeur_couloir_camera");
  const ctw3 = byId(h, "ctw3");
  assert.equal(ctw3.kind, "fountain");
  assert.equal(ctw3.entities.water, "binary_sensor.fontaine_chambre_manque_eau");
  assert.equal(ctw3.entities.filter, "sensor.fontaine_chambre_filtre");
  assert.equal(ctw3.entities.light, "switch.fontaine_chambre_voyant");
  assert.equal(ctw3.entities.purified, "sensor.fontaine_chambre_eau_purifiee");
  assert.equal(ctw3.entities.energy, "sensor.fontaine_chambre_energie");
  assert.equal(ctw3.entities.mode, undefined);
  // The purifier shares device_status and error_message with the feeders: still left out.
  assert.equal(byId(h, "k2"), undefined);
});

test("Jezza34000: feeder status from device_status, error_message and power_type", () => {
  const c = card(PetCard);
  const d4sh = byId(c.hass, "d4sh");
  assert.equal(c._status(d4sh).key, "normal");
  const bad = card(PetCard, {}, {
    "sensor.distributeur_couloir_statut": { state: "offline" },
    "sensor.distributeur_couloir_erreur": { state: "Food jammed" },
    "binary_sensor.distributeur_couloir_niveau_2": { state: "on" },
  });
  assert.deepEqual(plain(bad._status(d4sh).alerts.map((a) => a.key)), ["offline", "error", "food_low"]);
  const battery = card(PetCard, {}, {
    "sensor.distributeur_couloir_statut": { state: "online_battery" },
    "sensor.distributeur_couloir_alimentation": { state: "on_battery_low" },
  });
  assert.deepEqual(plain(battery._status(d4sh).alerts.map((a) => a.key)), ["battery_low", "on_batteries"]);
  assert.equal(c._hasHoppers(d4sh), true);
});

test("Jezza34000: fountain alerts from replace_filter and low_battery", () => {
  const c = card(PetCard);
  const ctw3 = byId(c.hass, "ctw3");
  assert.equal(c._status(ctw3).key, "running");
  const bad = card(PetCard, {}, {
    "binary_sensor.fontaine_chambre_manque_eau": { state: "on" },
    "binary_sensor.fontaine_chambre_filtre_a_changer": { state: "on" },
    "binary_sensor.fontaine_chambre_piles_faibles": { state: "on" },
  });
  assert.deepEqual(plain(bad._status(ctw3).alerts.map((a) => a.key)), ["water_low", "replace_filter", "battery_low"]);
});

test("Jezza34000: the full card shows the hoppers, the camera, per-hopper amounts, battery and pump", () => {
  const html = card(PetCard, { devices: ["d4sh", "ctw3"] })._render();
  for (const text of [
    "Hallway feeder",
    "Hopper 1",
    "Hopper 2",
    'class="cam clickable"',
    "data:image/svg+xml;base64,",
    "3 portions",
    "of 4 portions planned",
    "35%",
    "17 days",
    "Bedroom fountain",
    "64%",
    "19 days",
    "Pump",
    "Running",
    "82%",
    "0.007 kWh",
    'data-entity="switch.fontaine_chambre_voyant"',
  ])
    assert.ok(html.includes(text), text);
  // No battery level while on mains (unknown): no battery tile on the feeder.
  assert.equal((html.match(/>Battery</g) || []).length, 1);
  assert.ok(!card(PetCard, { devices: ["d4sh"], show_camera: false })._render().includes('class="cam'));
  assert.ok(!card(PetCard, { devices: ["d4sh"] }, { "switch.distributeur_couloir_camera": { state: "off" } })._render().includes('class="cam'));
  assert.ok(!card(PetCard, { devices: ["d4sh"] }, { "camera.distributeur_couloir": { state: "unavailable" } })._render().includes('class="cam'));
  const mini = card(PetMiniCard, { devices: ["d4sh", "ctw3"] })._render();
  assert.ok(mini.includes("Enough"));
  assert.ok(mini.includes("Filter 64%"));
});

test("Jezza34000: dual-hopper feed, one text per hopper and only the hoppers with portions", async () => {
  const c = card(PetCard, { devices: ["d4sh"] });
  c._render();
  click(c, { action: "feed", device: "d4sh" });
  assert.equal(c._dialog.feed.spec.domain, "dual");
  assert.equal(c._dialog.feed.spec.max, 10);
  assert.deepEqual(plain(c._dialog.feed.values), [1, 0]);
  click(c, { action: "feed_step", index: "0", delta: "1" });
  click(c, { action: "confirm_ok" });
  await settle();
  assert.deepEqual(plain(c.hass.calls), [["text", "set_value", { entity_id: "text.distributeur_couloir_repas_manuel_1", value: "2" }]]);
  const both = card(PetCard, { devices: ["d4sh"] });
  both._render();
  click(both, { action: "feed", device: "d4sh" });
  click(both, { action: "feed_step", index: "1", delta: "1" });
  click(both, { action: "feed_step", index: "1", delta: "1" });
  click(both, { action: "confirm_ok" });
  await settle();
  assert.deepEqual(plain(both.hass.calls), [
    ["text", "set_value", { entity_id: "text.distributeur_couloir_repas_manuel_1", value: "1" }],
    ["text", "set_value", { entity_id: "text.distributeur_couloir_repas_manuel_2", value: "2" }],
  ]);
  // Unavailable (feeder offline): the Feed button is disabled.
  const off = card(PetCard, { devices: ["d4sh"] }, {
    "text.distributeur_couloir_repas_manuel_1": { state: "unavailable" },
    "text.distributeur_couloir_repas_manuel_2": { state: "unavailable" },
  })._render();
  assert.match(off, /data-action="feed"[^>]*aria-disabled="true"/);
});

test("Jezza34000: single-hopper feed through the amounts of its pattern (grams above 10, else portions)", async () => {
  const pattern = "^(10|20|30|40|50|0)$";
  const single = {
    "text.distributeur_couloir_repas_manuel_1": { state: "unavailable" },
    "text.distributeur_couloir_repas_manuel_2": { state: "unavailable" },
  };
  // A D4H-like feeder: the D4SH mock without its dual feed, with a manual_feed_single text.
  const h = hassWith(single);
  const ents = { ...h.entities };
  delete ents["text.distributeur_couloir_repas_manuel_1"];
  delete ents["text.distributeur_couloir_repas_manuel_2"];
  ents["text.distributeur_couloir_repas_manuel"] = { entity_id: "text.distributeur_couloir_repas_manuel", device_id: "d4sh", platform: "petkit", translation_key: "manual_feed_single" };
  h.entities = ents;
  h.states["text.distributeur_couloir_repas_manuel"] = { entity_id: "text.distributeur_couloir_repas_manuel", state: "0", attributes: { pattern } };
  const c = new PetCard();
  c._update = () => {};
  c.setConfig({ devices: ["d4sh"] });
  c.hass = h;
  c._render();
  click(c, { action: "feed", device: "d4sh" });
  const f = c._dialog.feed;
  assert.deepEqual(plain(f.spec.values), [10, 20, 30, 40, 50]);
  assert.equal(f.spec.unit, "gram");
  assert.ok(c._feedBody(f).includes("10 g"));
  click(c, { action: "feed_step", index: "0", delta: "1" });
  click(c, { action: "feed_step", index: "0", delta: "1" });
  click(c, { action: "confirm_ok" });
  await settle();
  assert.deepEqual(plain(h.calls), [["text", "set_value", { entity_id: "text.distributeur_couloir_repas_manuel", value: "30" }]]);
  // Without a pattern: the integration's default list, 1 to 10 portions, starting at one portion.
  const spec = feedListSpec({ entity_id: "text.x_manual_feed_single", state: "0", attributes: {} });
  assert.deepEqual(plain(spec.values), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(spec.unit, "portion");
  assert.equal(feedDualSpec(undefined, undefined), null);
});

test("fountain mode labels: RobertD502's lower case and Jezza34000's capitalised options", () => {
  const c = card(PetCard);
  assert.equal(c._mode("smart"), "Smart");
  assert.equal(c._mode("Normal"), "Normal");
  assert.equal(c._mode("Pause"), "Pause");
  const fr = card(PetCard, { language: "fr" });
  assert.equal(fr._mode("Smart"), "Intelligent");
});

// Litter boxes: Pura MAX with RobertD502's integration ("litter") and Pura MAX 2 with Jezza34000's ("t4").
test("litter boxes: discovered by both integrations' keys", () => {
  const h = hassWith();
  const robert = byId(h, "litter").entities;
  assert.equal(robert.state, "sensor.litiere_etat");
  assert.equal(robert.litter, "sensor.litiere_niveau");
  assert.equal(robert.litter_low, "binary_sensor.litiere_manque");
  assert.equal(robert.bin_full, "binary_sensor.litiere_bac_plein");
  assert.equal(robert.deodorizer, "sensor.litiere_desodorisant");
  assert.equal(robert.clean, "button.litiere_nettoyer");
  assert.equal(robert.deodorize, "button.litiere_desodoriser");
  const jezza = byId(h, "t4").entities;
  assert.equal(jezza.state, "sensor.litiere_sdb_etat");
  assert.equal(jezza.status, "sensor.litiere_sdb_statut");
  assert.equal(jezza.litter_low, "binary_sensor.litiere_sdb_manque");
  assert.equal(jezza.bin_full, "binary_sensor.litiere_sdb_bac_plein");
  assert.equal(jezza.occupied, "binary_sensor.litiere_sdb_occupee");
  assert.equal(jezza.deodorizer, "sensor.litiere_sdb_desodorisant");
  assert.equal(jezza.clean, "button.litiere_sdb_nettoyer");
  assert.equal(jezza.deodorize, "button.litiere_sdb_desodoriser");
});

test("litter boxes: ready, then alerts first, then what the box does", () => {
  const st = (overrides, id = "litter") => {
    const c = card(PetCard, {}, overrides);
    return c._status(byId(c.hass, id));
  };
  assert.equal(st({}).key, "ready");
  assert.equal(st({}, "t4").key, "ready");
  assert.equal(st({ "sensor.litiere_etat": { state: "cleaning_litter_box" } }).key, "cleaning");
  assert.equal(st({ "sensor.litiere_sdb_etat": { state: "dumping" } }, "t4").key, "cleaning");
  assert.equal(st({ "binary_sensor.litiere_sdb_occupee": { state: "on" } }, "t4").key, "cat_inside");
  assert.equal(st({ "sensor.litiere_etat": { state: "cleaning_paused_pet_using" } }).key, "cat_inside");
  assert.equal(st({ "sensor.litiere_sdb_etat": { state: "paused" } }, "t4").cls, "idle");
  assert.equal(st({ "sensor.litiere_sdb_etat": { state: "maintenance" } }, "t4").key, "maintenance");
  const alerts = st({
    "binary_sensor.litiere_bac_plein": { state: "on" },
    "sensor.litiere_niveau": { state: "12" },
    "sensor.litiere_desodorisant": { state: "0" },
    "sensor.litiere_etat": { state: "cleaning_litter_box" },
  });
  assert.equal(alerts.key, "bin_full");
  assert.deepEqual(plain(alerts.alerts.map((a) => a.key)), ["bin_full", "litter_low", "replace_deodorizer"]);
  assert.equal(st({ "binary_sensor.litiere_sdb_manque": { state: "on" } }, "t4").key, "litter_low");
  assert.equal(st({ "sensor.litiere_sdb_etat": { state: "cleaning_paused_system_error" } }, "t4").cls, "crit");
  assert.equal(st({ "sensor.litiere_sdb_statut": { state: "offline" } }, "t4").key, "offline");
  const err = st({ "sensor.litiere_erreur": { state: "Motor stalled" } });
  assert.equal(err.key, "error");
  assert.equal(err.title, "Motor stalled");
});

test("litter boxes: levels, today's figures and the clean / deodorize buttons", async () => {
  const c = card(PetCard, { devices: ["litter"] });
  const html = c._render();
  for (const text of ["Litter box", "Ready", "Litter", "80%", "Waste bin", "Not full", "Uses today", "Last use", "Cat", "Deodorizer", "Clean"])
    assert.ok(html.includes(text), text);
  assert.ok(html.includes('data-entity="button.litiere_nettoyer"') && html.includes('data-entity="button.litiere_desodoriser"'));
  click(c, { action: "press", device: "litter", entity: "button.litiere_nettoyer" });
  await settle();
  assert.deepEqual(plain(c.hass.calls), [["button", "press", { entity_id: "button.litiere_nettoyer" }]]);
  const full = card(PetCard, { devices: ["t4"] }, { "binary_sensor.litiere_sdb_bac_plein": { state: "on" } })._render();
  assert.ok(full.includes("Full") && full.includes("Waste bin full"));
  const mini = card(PetMiniCard, { devices: ["litter", "t4"] }, { "binary_sensor.litiere_sdb_bac_plein": { state: "on" } })._render();
  assert.ok(mini.includes("Litter 80%"));
  assert.ok(mini.includes("Bathroom litter box: Waste bin full"));
});

// Illustrations: the art's classes drive its animations.
const artOf = (html, key) => {
  const at = html.indexOf(`data-key="${key}"`);
  const m = /<div class="art ([^"]*)"/.exec(html.slice(at));
  return m ? m[1].split(" ") : null;
};

test("illustrations: one per device with its own ids, none with show_illustration: false", () => {
  const html = card(PetCard)._render();
  assert.equal((html.match(/<div class="art /g) || []).length, 7);
  const clips = [...html.matchAll(/<clipPath id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(clips).size, clips.length);
  assert.ok(!card(PetCard, { show_illustration: false })._render().includes('class="art '));
  // The mini card only draws them in its detail view.
  assert.ok(!card(PetMiniCard)._render().includes('class="art '));
  // Two hoppers on the Gemini and the YumShare, one on the Solo; a camera on the YumShare.
  const dual = (key) => (html.slice(html.indexOf(`data-key="${key}"`)).split('<div class="dev"')[0].match(/class="win/g) || []).length;
  assert.equal(dual("gemini"), 2);
  assert.equal(dual("solo"), 1);
  assert.equal(dual("d4sh"), 2);
});

test("illustrations: a feeder dispenses on Jezza34000's sensor, after a manual feed and when its meals rise", async () => {
  assert.ok(!artOf(card(PetCard)._render(), "d4sh").includes("feeding"));
  assert.ok(artOf(card(PetCard, {}, { "binary_sensor.distributeur_couloir_distribution": { state: "on" } })._render(), "d4sh").includes("feeding"));
  // A rise of the meals counted today (the first value read is only the reference).
  const c = card(PetCard, { devices: ["solo"] });
  assert.ok(!artOf(c._render(), "solo").includes("feeding"));
  c.hass = { ...c.hass, states: { ...c.hass.states, "sensor.distributeur_cuisine_distributions": { ...c.hass.states["sensor.distributeur_cuisine_distributions"], state: "3" } } };
  assert.ok(artOf(c._render(), "solo").includes("feeding"));
  clearTimeout(c._redrawTimer);
  // A manual feed sent from the card.
  const f = card(PetCard, { devices: ["solo"] });
  f._render();
  click(f, { action: "feed", device: "solo", entity: "select.distributeur_cuisine_repas_manuel" });
  f._dialogClick({ dataset: { action: "confirm_ok" } }, []);
  await settle();
  assert.ok(artOf(f._render(), "solo").includes("feeding"));
  clearTimeout(f._redrawTimer);
  // Low food: the hopper blinks.
  const low = card(PetCard, { devices: ["solo"] }, { "binary_sensor.distributeur_cuisine_niveau": { state: "on" } })._render();
  assert.ok(low.includes('class="win low"'));
});

test("illustrations: the fountain flows while its pump runs, not when off, dry or in do not disturb", () => {
  const cls = (overrides, key = "fountain") => artOf(card(PetCard, {}, overrides)._render(), key);
  assert.ok(cls({}).includes("on"));
  assert.ok(!cls({ "switch.fontaine_salon_alimentation": { state: "off" } }).includes("on"));
  const dry = cls({ "binary_sensor.fontaine_salon_niveau_eau": { state: "on" } });
  assert.ok(dry.includes("dry") && !dry.includes("on"));
  assert.ok(cls({}, "ctw3").includes("on"));
  assert.ok(!cls({ "binary_sensor.fontaine_chambre_pompe": { state: "off" } }, "ctw3").includes("on"));
  assert.ok(!cls({ "binary_sensor.fontaine_chambre_ne_pas_deranger_actif": { state: "on" }, "binary_sensor.fontaine_chambre_pompe": { state: "off" } }, "ctw3").includes("on"));
});

test("illustrations: the litter box turns while cleaning, shows a cat inside and a full waste bin", () => {
  const cls = (overrides, key = "t4") => artOf(card(PetCard, {}, overrides)._render(), key);
  assert.deepEqual(plain(cls({})), ["ok"]);
  assert.ok(cls({ "sensor.litiere_sdb_etat": { state: "cleaning" } }).includes("cleaning"));
  const cat = cls({ "binary_sensor.litiere_sdb_occupee": { state: "on" } });
  assert.ok(cat.includes("cat") && cat.includes("warn"));
  assert.ok(cls({ "sensor.litiere_etat": { state: "cleaning_paused_pet_approach" } }, "litter").includes("cat"));
  const full = cls({ "binary_sensor.litiere_sdb_bac_plein": { state: "on" } });
  assert.ok(full.includes("full") && full.includes("warn"));
});
