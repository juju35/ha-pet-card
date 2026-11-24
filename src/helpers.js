// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { STRINGS } from "./i18n/strings.js";

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

export const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

// Locale of the numbers and dates: Home Assistant's own language when its base matches the card's language
// (keeps the region, e.g. de-CH or fr-CA), otherwise the card's language. Home Assistant's "pt" is European
// Portuguese, which Intl would format as Brazilian, so bare "pt" becomes "pt-PT".
export const fmtLang = (hass, config) => {
  const l = lang(hass, config);
  const ha = hass && (hass.locale?.language || hass.language);
  const loc = ha && ha.split("-")[0] === l ? ha : l;
  return loc === "pt" ? "pt-PT" : loc;
};

export const BAD = new Set(["unknown", "unavailable", "", undefined, null]);
export const known = (s) => (s && !BAD.has(s.state) ? s.state : null);

export const num = (s) => {
  const v = parseFloat(known(s));
  return Number.isFinite(v) ? v : null;
};

export const _formats = new Map();
export const cachedFormat = (key, make) => {
  if (!_formats.has(key)) {
    try {
      _formats.set(key, make());
    } catch (_err) {
      _formats.set(key, null);
    }
  }
  return _formats.get(key);
};

// Number in the card's language, at most `max` decimals.
export const fmtNum = (v, loc, max = 0) => {
  const f = cachedFormat(`n|${loc}|${max}`, () => new Intl.NumberFormat(loc, { maximumFractionDigits: max }));
  return f ? f.format(v) : String(v);
};

// A measure with its unit in the card's language ("45 g", "23 days"), via Intl's units.
export const fmtUnit = (v, unit, loc) => {
  const f = cachedFormat(`u|${loc}|${unit}`, () => new Intl.NumberFormat(loc, { style: "unit", unit, unitDisplay: "short", maximumFractionDigits: 1 }));
  return f ? f.format(v) : `${v} ${unit}`;
};

export const fmtPct = (v, loc) => `${fmtNum(Math.round(v), loc)}%`;

// "2 hours ago", "yesterday", in the card's language (Intl.RelativeTimeFormat): no translation needed.
export const fmtAgo = (iso, loc, now = Date.now()) => {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return null;
  const s = Math.max(0, (now - at) / 1000);
  const f = cachedFormat(`r|${loc}`, () => new Intl.RelativeTimeFormat(loc, { numeric: "auto", style: "short" }));
  const [v, unit] = s < 3600 ? [Math.floor(s / 60), "minute"] : s < 86400 ? [Math.floor(s / 3600), "hour"] : [Math.floor(s / 86400), "day"];
  return f ? f.format(-v, unit) : `${v} ${unit}`;
};

export const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

// Patch the shadow DOM in place from the new HTML (as in the other ha-* cards): nodes whose tag is unchanged are
// kept, so keyboard focus, hover and CSS transitions survive an update. Rows carry a data-key and are matched by it.
export const patchAttrs = (cur, next) => {
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
export const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
export const sameNode = (a, b) => !!a && a.nodeType === b.nodeType && a.nodeName === b.nodeName;
export const patchChildren = (cur, next) => {
  const old = [...cur.childNodes];
  const fresh = [...next.childNodes];
  const byKey = new Map();
  for (const o of old) {
    const k = keyOf(o);
    if (k !== null && !byKey.has(k)) byKey.set(k, o);
  }
  const used = new Set();
  fresh.forEach((n, i) => {
    const k = keyOf(n);
    let o = k !== null ? byKey.get(k) : old[i];
    if (!sameNode(o, n) || used.has(o) || (k === null && keyOf(o) !== null)) o = null;
    const ref = cur.childNodes[i] ?? null;
    if (!o) {
      cur.insertBefore(n, ref);
      return;
    }
    used.add(o);
    if (o !== ref) cur.insertBefore(o, ref);
    if (n.nodeType === 1) {
      patchAttrs(o, n);
      patchChildren(o, n);
    } else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
  });
  while (cur.childNodes.length > fresh.length) cur.removeChild(cur.lastChild);
};
export const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};

// ---------------------------------------------------------------------------
// Adapters: one per integration. A device kind is recognised by any of its `detect` entities; each role names
// the entity it reads, as "<domain>:<translation_key>" (a list: the first one present wins).
// The two PetKit integrations, RobertD502's (https://github.com/RobertD502/home-assistant-petkit) and
// Jezza34000's (https://github.com/Jezza34000/homeassistant_petkit), share the `petkit` domain: one adapter reads
// both, with each integration's own translation key for a role.
// ---------------------------------------------------------------------------

export const PLATFORMS = {
  petkit: {
    name: "PetKit",
    kinds: {
      feeder: {
        detect: [
          "binary_sensor:food_level",
          "binary_sensor:food_level_hopper_one",
          "binary_sensor:food_level_1",
          "sensor:feeder_status",
          "sensor:desiccant_days_remaining",
          "sensor:desiccant_left_days",
          "text:manual_feed_single",
          "text:manual_feed_dual_h1",
        ],
        roles: {
          food: "binary_sensor:food_level",
          food1: ["binary_sensor:food_level_hopper_one", "binary_sensor:food_level_1"],
          food2: ["binary_sensor:food_level_hopper_two", "binary_sensor:food_level_2"],
          food_left: "sensor:food_left",
          status: ["sensor:feeder_status", "sensor:device_status"],
          error: ["sensor:error", "sensor:error_message"],
          desiccant: ["sensor:desiccant_days_remaining", "sensor:desiccant_left_days"],
          battery: "sensor:battery_status",
          power_type: "sensor:power_type",
          battery_pct: "sensor:battery_level",
          dispensed: ["sensor:dispensed", "sensor:total_dispensed"],
          planned: ["sensor:planned", "sensor:total_planned"],
          dispensed1: "sensor:total_dispensed_hopper_1",
          dispensed2: "sensor:total_dispensed_hopper_2",
          planned1: "sensor:total_planned_hopper_1",
          planned2: "sensor:total_planned_hopper_2",
          times: "sensor:times_dispensed",
          eaten: "sensor:amount_eaten",
          times_eaten: "sensor:times_eaten",
          bowl: "sensor:food_in_bowl",
          bowl_pct: "sensor:food_bowl_percentage",
          feed: ["select:manual_feed", "number:manual_feed", "text:manual_feed"],
          feed_one: "text:manual_feed_single",
          feed1: "text:manual_feed_dual_h1",
          feed2: "text:manual_feed_dual_h2",
          reset_desiccant: "button:reset_desiccant",
          call_pet: "button:call_pet",
          camera: "camera:camera",
          camera_switch: "switch:camera",
          // Jezza34000: on while the feeder dispenses.
          feeding: "binary_sensor:feeding",
        },
      },
      fountain: {
        detect: ["binary_sensor:water_level", "binary_sensor:lack_warning", "sensor:filter", "sensor:filter_percent", "sensor:purified_water_today", "sensor:purified_water"],
        roles: {
          water: ["binary_sensor:water_level", "binary_sensor:lack_warning"],
          filter: ["sensor:filter", "sensor:filter_percent"],
          filter_days: "sensor:filter_left_days",
          filter_warning: "binary_sensor:replace_filter",
          mode: ["select:mode", "select:working_mode"],
          power: "switch:power",
          pump: "binary_sensor:pump_running",
          light: ["switch:light", "switch:indicator_light"],
          dnd: "switch:do_not_disturb",
          // Jezza34000: on while the do not disturb period runs (the switch only enables it).
          dnd_state: "binary_sensor:do_not_disturb_state",
          purified: ["sensor:purified_water_today", "sensor:purified_water"],
          energy: ["sensor:energy_usage", "sensor:today_pump_run_time"],
          battery_pct: "sensor:battery",
          battery_low: "binary_sensor:low_battery",
          reset_filter: "button:reset_filter",
        },
      },
      // Pura X / Pura MAX (RobertD502), every PetKit litter box (Jezza34000: Pura X, Pura MAX 1/2, Purobot…).
      litter: {
        detect: ["sensor:litter_level", "sensor:max_work_state", "sensor:litter_state", "binary_sensor:wastebin", "binary_sensor:waste_bin", "binary_sensor:sand_lack"],
        roles: {
          state: ["sensor:max_work_state", "sensor:litter_state"],
          status: "sensor:device_status",
          error: ["sensor:error", "sensor:error_message"],
          litter: "sensor:litter_level",
          litter_low: ["binary_sensor:litter", "binary_sensor:sand_lack"],
          litter_weight: "sensor:litter_weight",
          bin_full: ["binary_sensor:wastebin", "binary_sensor:waste_bin"],
          occupied: "binary_sensor:toilet_occupied",
          times_used: "sensor:times_used",
          last_used_by: "sensor:last_used_by",
          deodorizer: ["sensor:n50_odor_eliminator", "sensor:odor_eliminator_n50_left_days", "sensor:odor_eliminator_n60_left_days"],
          deodorizer_pct: "sensor:deodorizer_level",
          clean: ["button:start_cleaning", "button:start_scoop"],
          deodorize: ["button:odor_removal", "button:deodorize"],
          camera: "camera:camera",
        },
      },
    },
  },
  // Whisker's Litter-Robot integration (Home Assistant core): Litter-Robot 3 Connect, 4 and 5. Its Feeder-Robot
  // and pets are left out.
  litterrobot: {
    name: "Litter-Robot",
    kinds: {
      litter: {
        detect: ["vacuum:litter_box", "sensor:waste_drawer", "sensor:status_code"],
        roles: {
          vacuum: "vacuum:litter_box",
          status_code: "sensor:status_code",
          waste: "sensor:waste_drawer",
          litter: "sensor:litter_level",
          pet_weight: "sensor:pet_weight",
          cycles: "sensor:total_cycles",
          night: ["light:night_light", "select:globe_light", "switch:night_light_mode"],
        },
      },
    },
  },
};
export const KIND_ORDER = ["feeder", "fountain", "litter"];
export const KIND_ICONS = { feeder: ICONS.bowl, fountain: ICONS.fountain, litter: ICONS.cat };

// Supported devices, from the registries: { id, kind, platform, name, model, entities: { role: entity_id } }.
export const _cache = new WeakMap();
export const resolve = (hass) => {
  const ents = hass?.entities;
  if (!ents) return null;
  const hit = _cache.get(ents);
  if (hit && hit.devices === hass.devices) return hit.list;
  const byDev = new Map();
  for (const e of Object.values(ents)) {
    if (!PLATFORMS[e.platform] || !e.device_id || !e.translation_key) continue;
    let d = byDev.get(e.device_id);
    if (!d) byDev.set(e.device_id, (d = { platform: e.platform, keys: {} }));
    d.keys[`${e.entity_id.split(".")[0]}:${e.translation_key}`] ??= e.entity_id;
  }
  const list = [];
  for (const [id, d] of byDev) {
    const kinds = PLATFORMS[d.platform].kinds;
    const kind = KIND_ORDER.find((k) => kinds[k]?.detect.some((key) => d.keys[key]));
    if (!kind) continue;
    const entities = {};
    for (const [role, keys] of Object.entries(kinds[kind].roles)) {
      const found = [].concat(keys).find((key) => d.keys[key]);
      if (found) entities[role] = d.keys[found];
    }
    const dev = hass.devices?.[id] || {};
    list.push({ id, kind, platform: d.platform, name: dev.name_by_user || dev.name || id, model: dev.model || "", entities });
  }
  list.sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name));
  _cache.set(ents, { devices: hass.devices, list });
  return list;
};

// The devices a card shows: `devices` (ids or names, as listed) or every supported device.
export const findDevices = (hass, config) => {
  const all = resolve(hass);
  if (!all) return { error: "no_registry" };
  if (!all.length) return { error: "no_devices" };
  const wanted = [].concat(config?.devices ?? []).filter(Boolean);
  if (!wanted.length) return { devices: all };
  const low = (v) => String(v).toLowerCase();
  const devices = wanted.map((w) => all.find((d) => d.id === w || low(d.name) === low(w))).filter(Boolean);
  return devices.length ? { devices } : { error: "unknown_device" };
};

// Filter and desiccant levels: orange then red as they run out.
export const filterLevel = (v) => (v === null ? "" : v <= 5 ? "crit" : v <= 20 ? "warn" : "ok");
export const desiccantLevel = (v) => (v === null ? "" : v <= 0 ? "crit" : v <= 5 ? "warn" : "ok");
export const batteryLevel = (v) => (v === null ? "" : v <= 10 ? "crit" : v <= 25 ? "warn" : "");

// What a litter box is doing, from its work state (RobertD502's max_work_state, Jezza34000's litter_state): idle,
// cleaning (also dumping, levelling, resetting, calibrating), cat (a pet approaching, using it or inside while it
// works), paused, maintenance or error (a system error stopped it).
export const litterActivity = (state) => {
  const s = String(state ?? "").toLowerCase();
  if (!s || s === "idle" || BAD.has(state)) return "idle";
  if (/system_error/.test(s)) return "error";
  if (/pet_(using|entered|approach)/.test(s)) return "cat";
  if (/paus/.test(s)) return "paused";
  if (/maint/.test(s)) return "maintenance";
  if (/clean|dump|level|reset|calibrat/.test(s)) return "cleaning";
  return "idle";
};

// What a Litter-Robot is doing, from its status code: a clean or empty cycle (powering up runs one), a cat detected
// or the cat sensor timing / interrupted, paused, off, a fault (bonnet removed, pinch, position or sensor fault).
export const LR_FAULTS = new Set(["br", "csf", "scf", "dhf", "dpf", "hpf", "otf", "pd", "spf"]);
export const robotActivity = (code) => {
  if (!code) return "idle";
  if (LR_FAULTS.has(code)) return "error";
  if (["ccp", "ec", "pwru"].includes(code)) return "cleaning";
  if (["cd", "cst", "csi"].includes(code)) return "cat";
  if (code === "p") return "paused";
  if (code === "off" || code === "pwrd") return "off";
  return "idle";
};

// Default amount of a manual feed: about 10 g, on the entity's own steps.
export const feedDefault = (min, max, step) => {
  const s = step > 0 ? step : 1;
  let v = Math.max(min, s);
  if (v < 10) v = min + Math.ceil((10 - min) / s) * s;
  return Math.min(max, v);
};

// What a manual feed needs, by the domain of its entity: options (select), a range (number) or two hoppers (text).
export const feedSpec = (s) => {
  if (!s) return null;
  const domain = s.entity_id.split(".")[0];
  const a = s.attributes || {};
  if (domain === "select") {
    const options = (a.options || []).filter((o) => o !== "");
    return options.length ? { domain, options } : null;
  }
  if (domain === "number") {
    const min = Number(a.min ?? 0);
    const max = Number(a.max ?? 100);
    const step = Number(a.step ?? 1);
    return { domain, min, max, step, unit: a.unit_of_measurement || "g" };
  }
  if (domain === "text") return { domain, hoppers: 2, min: 0, max: 10 };
  return null;
};

// Amounts a text manual feed of Jezza34000's integration accepts, from its pattern "^(10|20|30|0)$" (0 left out).
export const patternValues = (s) => {
  const m = /^\^\((.*)\)\$$/.exec(String(s?.attributes?.pattern ?? ""));
  const values = m ? m[1].split("|").map(Number).filter((v) => Number.isInteger(v) && v > 0) : [];
  return [...new Set(values)].sort((a, b) => a - b);
};
export const PORTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Jezza34000's single-hopper feeders: one text entity taking one of its amounts. Up to 10 they are portions
// (the integration's default list), above they are grams (Fresh Element, Mini, D3, D4, D4H).
export const feedListSpec = (s) => {
  if (!s) return null;
  const values = patternValues(s);
  const list = values.length ? values : PORTIONS;
  const unit = list[list.length - 1] <= 10 ? "portion" : "gram";
  return { domain: "list", entity: s.entity_id, values: list, unit, min: 0, max: list.length - 1 };
};

// Jezza34000's dual-hopper feeders (D4S, D4SH): one text entity per hopper, each taking portions.
export const feedDualSpec = (s1, s2) => {
  if (!s1 && !s2) return null;
  const max = Math.max(...[s1, s2].map((s) => patternValues(s).at(-1) ?? 0), 0) || 10;
  return { domain: "dual", entities: [s1?.entity_id ?? null, s2?.entity_id ?? null], hoppers: 2, min: 0, max };
};

// The default amount of a list: about 10 g, or one portion.
export const listDefault = (spec) => {
  if (spec.unit !== "gram") return 0;
  const i = spec.values.findIndex((v) => v >= 10);
  return i < 0 ? spec.values.length - 1 : i;
};
