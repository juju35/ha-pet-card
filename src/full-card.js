// ---------------------------------------------------------------------------
// Full card
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { KIND_ICONS, batteryLevel, desiccantLevel, esc, filterLevel, findDevices, fmtAgo, fmtNum, fmtPct, fmtUnit, known, num, svgIcon } from "./helpers.js";
import { BASE_STYLE, DIALOG_STYLE, MOTION_STYLE } from "./styles.js";
import { PetBase } from "./base-card.js";
import { STRINGS } from "./i18n/strings.js";

// The illustrated header (illustration: false keeps the classic one).
export const BANNER_STYLE = `
  /* The corner takes at most 200 px or 58 % of the banner, and narrows on a small card to leave the title its pill. */
  .banner { position: relative; overflow: hidden; height: 90px; --g: 10px; color: #0d2a45; background: #f6efe6;
            --scene-w: min(200px, 58%, max(100% - 190px, 40%)); }
  .banner.night { color: #fff; background: #2c2a36; }
  .banner .scene { position: absolute; right: 0; bottom: var(--g); height: calc(100% - var(--g)); width: var(--scene-w);
                   -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 14%); mask-image: linear-gradient(90deg, transparent 0, #000 14%); }
  .banner .pb-tail { transform-box: fill-box; transform-origin: 100% 100%; animation: pb-swing 2s ease-in-out infinite; }
  .banner .ground { position: absolute; left: 0; right: 0; bottom: 0; height: var(--g);
                    background: repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow: inset 0 2px 0 #a97c50; }
  .banner.night .ground { background: repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow: inset 0 2px 0 #3a2c20; }
  .banner .htext { position: absolute; z-index: 1; left: 0; top: 0; bottom: var(--g); right: var(--scene-w);
                   display: flex; align-items: center; gap: 10px; padding: 6px 4px 6px 14px; min-width: 0; }
  :host([mini]) .banner .htext { right: calc(var(--scene-w) - 8px); }
  /* The round icon on a white disc, in the status colour (accent, grey when idle or off, amber, red). */
  .banner .logo { position: relative; background: rgba(255,255,255,.72); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c, var(--pc-accent)) 28%, transparent); }
  .banner.night .logo { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner .titles { display: flex; flex-direction: column; gap: 1px; align-self: center !important; }
  .banner .sub { color: #3b5b78; font-size: 13px; }
  .banner.night .sub { color: rgba(255,255,255,.78); }
  .banner .titles { flex: 1 1 0; min-width: 0; overflow: visible; }
  .banner .chip.accent { --c: var(--pc-accent); }
  .banner .chip { color: color-mix(in srgb, var(--c) 45%, #0d2a45); background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); }
  .banner.night .chip { color: color-mix(in srgb, var(--c) 35%, #ffffff); background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); }
  .banner .chip .dot { width: 7px; height: 7px; background: var(--c); }
  /* Detail button (mini card): a small frosted round button in the banner's top right corner. */
  .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; width: 24px; height: 24px; color: #33506b;
                  background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner.night .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #fff; }
  @container (max-width: 219px) { .banner .scene { display: none; } .banner .htext { right: 30px; } }
  @keyframes pb-swing { 0%, 100% { transform: rotate(-14deg); } 50% { transform: rotate(14deg); } }
`;

// The devices' pictures: LED colours and animations (the full card's devices and the header).
export const ART_STYLE = `
  .art .led { fill: var(--pc-ok); }
  .art.warn .led { fill: var(--pc-warn); }
  .art.idle .led { fill: var(--pc-idle); }
  .art.busy .led { fill: var(--pc-water); animation: pc-blink 1s steps(2) infinite; }
  .art.crit .led { fill: var(--pc-crit); animation: pc-blink 1s steps(2) infinite; }
  .art .rec { animation: pc-blink 1.6s steps(2) infinite; }
  .art .win.low { stroke: var(--pc-warn); stroke-width: 1.4; animation: pc-blink 1.2s steps(2) infinite; }
  .art .drop, .art .stream, .art .rp, .art .grit, .art .cat { opacity: 0; }
  .art.feeding .drop { animation: pc-fall 1s ease-in infinite; }
  .art.on .stream { opacity: 1; stroke-dasharray: 3 2; animation: pc-flow .5s linear infinite; }
  .art.on .rp { transform-box: fill-box; transform-origin: center; animation: pc-ripple 1.8s ease-out infinite; }
  .art.on .wave { animation: pc-wave 1.4s ease-in-out infinite alternate; }
  .art .wl { transition: transform .6s ease; }
  .art.dry .wl { transform: translateY(20px); }
  .art .drum { transform-box: view-box; transform-origin: 40px 45px; }
  .art.cleaning .drum { animation: pc-turn 4s ease-in-out infinite; }
  .art.cleaning .grit { animation: pc-grit 4s ease-in infinite; }
  .art.cat .cat { opacity: 1; }
  .art .eye { transform-box: fill-box; transform-origin: center; animation: pc-wink 3.4s infinite; }
  .art .ear { transform-box: fill-box; transform-origin: bottom center; animation: pc-ear 3s infinite; }
  .art.full .bin { stroke: var(--pc-crit); stroke-width: 1.2; animation: pc-blink 1.2s steps(2) infinite; }
  .art .drum.lr4 { transform-origin: 40px 40px; }
  .art .drum.lr3 { transform-origin: 40px 37px; }
  .art .ring, .art .halo { opacity: 0; transition: opacity .4s ease; }
  .art.night .ring { opacity: 1; animation: pc-glow 2.4s ease-in-out infinite alternate; }
  .art.night .halo { opacity: .35; }
  @keyframes pc-blink { 50% { opacity: .25; } }
  @keyframes pc-glow { to { opacity: .55; } }
  @keyframes pc-fall { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(13px); opacity: 0; } }
  @keyframes pc-flow { to { stroke-dashoffset: -10; } }
  @keyframes pc-ripple { 0% { transform: scale(.3); opacity: .9; } 100% { transform: scale(1.15); opacity: 0; } }
  @keyframes pc-wave { to { transform: translateX(-3px); } }
  @keyframes pc-turn { 0%, 10% { transform: rotate(0); } 45%, 55% { transform: rotate(-135deg); } 90%, 100% { transform: rotate(0); } }
  @keyframes pc-grit { 0%, 40% { opacity: 0; transform: translateY(0); } 48% { opacity: 1; } 62% { opacity: 0; transform: translateY(12px); } 100% { opacity: 0; } }
  @keyframes pc-wink { 0%, 46%, 52%, 100% { transform: scaleY(1); } 49% { transform: scaleY(.1); } }
  @keyframes pc-ear { 0%, 78%, 100% { transform: rotate(0); } 84% { transform: rotate(-14deg); } 90% { transform: rotate(5deg); } }
`;

export const FULL_STYLE = `
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .dev { display: flex; flex-direction: column; gap: 10px; }
  .dev + .dev { border-top: 1px solid var(--divider-color, rgba(127,127,127,.2)); padding-top: 12px; }
  .dev-head { display: flex; align-items: center; gap: 10px; }
  .dicon { width: 32px; height: 32px; flex: none; border-radius: 50%; display: grid; place-items: center;
           color: var(--c, var(--pc-accent)); background: color-mix(in srgb, var(--c, var(--pc-accent)) 14%, transparent); }
  .dicon .icon { width: 18px; height: 18px; }
  .dtitles { flex: 1 1 0; min-width: 4ch; }
  .dname { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dsub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dev-head .chip { flex: 0 1 auto; }
  .acts { display: flex; gap: 6px; flex: none; }
  @container (max-width: 299px) {
    .dev-head .chip { padding: 6px; } .dev-head .chip .chip-label { display: none; }
    .acts .act:not(.round):not(.portion) .lbl { display: none; } .acts .act:not(.round):not(.portion) { width: 28px; padding: 0; }
  }
  .level { display: grid; grid-template-columns: 18px minmax(0, 96px) minmax(24px, 1fr) minmax(52px, auto); align-items: center; gap: 8px; font-size: 13px; }
  .level .icon { color: var(--c, var(--secondary-text-color)); }
  .level .lbl { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .level .v { text-align: right; font-weight: 500; white-space: nowrap; }
  .level .v.warn, .level .v.crit { color: var(--c); }
  .level.has-act { grid-template-columns: 18px minmax(0, 96px) minmax(24px, 1fr) minmax(52px, auto) 24px; }
  .level .act { height: 24px; width: 24px; }
  /* A weight with no tank capacity to compare it with: no bar. */
  .level.nobar .bar { visibility: hidden; }
  .level .act .icon { width: 14px; height: 14px; }
  .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 6px; }
  .tile { position: relative; display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border-radius: 10px; min-width: 0;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  /* Label and note may take two lines (long translations), the value stays on one. */
  .tile .tl, .tile .ts { font-size: 11px; color: var(--secondary-text-color); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.3; }
  .tile .tv { font-size: 15px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile.warn .tv, .tile.crit .tv { color: var(--c); }
  .tile:has(.act) .tl { padding-right: 22px; }
  .tile .act { position: absolute; top: 6px; right: 6px; height: 24px; width: 24px; }
  .tile .act .icon { width: 14px; height: 14px; }
  .toggles { display: flex; flex-wrap: wrap; gap: 6px; }
  .cam { border-radius: 10px; overflow: hidden; aspect-ratio: 16 / 9; background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .cam img { display: block; width: 100%; height: 100%; object-fit: cover; }
  /* Illustration on the left of the device's levels (show_illustration). */
  .hero { display: flex; gap: 12px; align-items: center; }
  .hero-rows { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
  .art { flex: none; width: 88px; height: 103px; }
  .art svg { display: block; width: 100%; height: 100%; overflow: visible; }
  @container (max-width: 299px) { .art { width: 64px; height: 75px; } .hero { gap: 8px; } }
`;

export class PetCard extends PetBase {
  static getConfigElement() {
    return document.createElement("pet-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  // A level row: icon, label, bar and value.
  _level(id, icon, label, pct, value, cls, act = "") {
    return `<div class="level clickable ${cls}${act ? " has-act" : ""}" role="button" tabindex="0" data-key="${esc(id)}" data-entity="${esc(id)}" aria-label="${esc(`${label} ${value}`)}">
      ${svgIcon(icon)}<span class="lbl">${esc(label)}</span>
      <div class="bar"><div style="width:${pct === null ? 0 : Math.max(0, Math.min(100, pct))}%"></div></div>
      <span class="v ${cls}">${esc(value)}</span>${act}
    </div>`;
  }

  // Food row of a feeder without a percentage: a binary "enough / low" shown as a full or short bar.
  _foodRow(id, label, act = "") {
    const s = this._s(id);
    if (!s) return "";
    const low = s.state === "on";
    const unknown = !known(s);
    return this._level(id, ICONS.bowl, label, unknown ? null : low ? 15 : 100, unknown ? "—" : this._t(low ? "low" : "enough"), unknown ? "idle" : low ? "warn" : "ok", act);
  }

  _tile(id, label, value, { cls = "", sub = "", act = "" } = {}) {
    if (!id) return "";
    return `<div class="tile clickable ${cls}" role="button" tabindex="0" data-key="${esc(id)}" data-entity="${esc(id)}" aria-label="${esc(`${label} ${value}`)}">
      <span class="tl">${esc(label)}</span><span class="tv">${esc(value)}</span>${sub ? `<span class="ts">${esc(sub)}</span>` : ""}${act}
    </div>`;
  }

  // A weight in its entity's unit: kg or lb.
  _weight(s) {
    const v = num(s);
    if (v === null) return "—";
    const unit = String(s.attributes?.unit_of_measurement || "kg");
    const named = { kg: "kilogram", g: "gram", lb: "pound", lbs: "pound" }[unit.toLowerCase()];
    return named ? fmtUnit(v, named, this._loc()) : `${fmtNum(v, this._loc(), 1)} ${unit}`;
  }

  _grams(s) {
    const v = num(s);
    return v === null ? "—" : fmtUnit(v, "gram", this._loc());
  }

  // An amount of food: grams, or portions when the entity has no unit (Jezza34000's per-hopper sensors).
  _amount(s) {
    const v = num(s);
    if (v === null) return "—";
    const unit = s.attributes?.unit_of_measurement;
    return unit === "g" ? fmtUnit(v, "gram", this._loc()) : `${fmtNum(v, this._loc())} ${unit || this._t("portions")}`;
  }

  _dispensedTile(id, plannedId, label) {
    const planned = this._s(plannedId);
    return this._tile(id, label, this._amount(this._s(id)), { sub: num(planned) ? this._t("planned", { v: this._amount(planned) }) : label === this._t("dispensed") ? "" : this._t("dispensed") });
  }

  // The feeder's camera (Jezza34000's integration, YumShare feeders): its latest picture, a click opens the stream.
  // Left out while the camera is switched off or unavailable, and with show_camera: false.
  _camera(dev) {
    const e = dev.entities;
    const s = this._s(e.camera);
    const pic = s?.attributes?.entity_picture;
    if (this._config.show_camera === false || !pic || !known(s) || this._s(e.camera_switch)?.state === "off") return "";
    return `<div class="cam clickable" role="button" tabindex="0" data-key="${esc(e.camera)}" data-entity="${esc(e.camera)}" aria-label="${esc(`${this._t("camera")} ${dev.name}`)}">
      <img src="${esc(pic)}" alt="">
    </div>`;
  }

  _devHead(dev, st, acts) {
    const icon = KIND_ICONS[dev.kind];
    const title = st.alerts.map((a) => a.title || this._t(a.key)).join(" · ");
    return `<div class="dev-head">
      <span class="dicon ${st.cls === "ok" ? "" : st.cls}">${svgIcon(icon)}</span>
      <div class="dtitles"><div class="dname">${esc(dev.name)}</div>${dev.model ? `<div class="dsub">${esc(dev.model)}</div>` : ""}</div>
      ${this._chip(st.cls, this._t(st.key), title)}
      ${acts ? `<div class="acts">${acts}</div>` : ""}
    </div>`;
  }

  // A device: its head, the camera picture, its levels next to its illustration, its figures and its toggles.
  _devBlock(dev, st, acts, rows, tiles, extra = "") {
    return `<div class="dev" data-key="${esc(dev.id)}">
      ${this._devHead(dev, st, acts)}
      ${this._camera(dev)}
      ${this._hero(dev, st, rows)}
      ${tiles ? `<div class="tiles">${tiles}</div>` : ""}
      ${extra}
    </div>`;
  }

  // The device's levels, with its illustration on their left (show_illustration).
  _hero(dev, st, rows) {
    const body = rows.filter(Boolean).join("");
    const pic = this._art(dev, st);
    return pic ? `<div class="hero">${pic}<div class="hero-rows">${body}</div></div>` : body;
  }

  _feeder(dev) {
    const c = this._config;
    const e = dev.entities;
    const st = this._status(dev);
    const loc = this._loc();
    const controls = c.show_controls !== false;
    // A PetKit manual feed always reads "" or "0" (nothing picked): only an unavailable entity blocks it.
    const { spec: feedSpecOf, states: feedStates } = this._feedOf(dev);
    const feedEntity = e.feed || e.feed_one || e.feed1 || e.feed2;
    const feedable = feedSpecOf && feedStates.some((s) => s && s.state !== "unavailable");
    const acts = controls
      ? [
          e.call_pet
            ? `<button type="button" class="act round" data-action="press" data-entity="${esc(e.call_pet)}" data-device="${esc(dev.id)}" title="${esc(this._t("call_pet"))}" aria-label="${esc(this._t("call_pet"))}">${svgIcon(ICONS.call)}</button>`
            : "",
          feedEntity
            ? `<button type="button" class="act" data-action="feed" data-device="${esc(dev.id)}" data-entity="${esc(feedEntity)}" title="${esc(this._t("feed"))}"${feedable ? "" : ' aria-disabled="true"'}>${svgIcon(ICONS.feed)}<span class="lbl">${esc(this._t("feed"))}</span></button>`
            : "",
          // Feed buttons (#29): each dispenses at once (1, 2, 3 portions…), labelled with its name.
          ...(dev.feedButtons || []).map((b) => {
            const s = this._s(b.entity);
            const label = b.name ?? s?.attributes?.friendly_name ?? b.entity;
            return `<button type="button" class="act portion" data-action="press" data-entity="${esc(b.entity)}" data-device="${esc(dev.id)}" title="${esc(`${this._t("feed")} · ${label}`)}"${!s || s.state === "unavailable" ? ' aria-disabled="true"' : ""}>${svgIcon(ICONS.feed)}<span class="lbl">${esc(label)}</span></button>`;
          }),
        ].join("")
      : "";
    const rows = [];
    const left = num(this._s(e.food_left));
    // Reset of the food tank once refilled (#29), on its food row.
    const resetFood =
      controls && e.reset_food
        ? `<button type="button" class="act round" data-action="reset_food" data-entity="${esc(e.reset_food)}" data-device="${esc(dev.id)}" title="${esc(this._t("reset"))}" aria-label="${esc(this._t("reset"))}">${svgIcon(ICONS.reset)}</button>`
        : "";
    const weight = this._s(e.food_weight);
    if (this._hasHoppers(dev)) {
      rows.push(this._foodRow(e.food1, this._t("hopper", { n: 1 })));
      rows.push(this._foodRow(e.food2, this._t("hopper", { n: 2 })));
    } else if (weight) {
      // The food left by its weight (a sensor or an input_number): a bar with the tank's capacity, the weight alone without.
      const pct = this._foodPct(dev);
      const w = num(weight);
      const cls = w === null ? "idle" : pct !== null && pct <= 10 ? "warn" : "ok";
      rows.push(this._level(e.food_weight, ICONS.bowl, this._t("food"), pct, w === null ? "—" : this._amount(weight), pct === null ? `${cls} nobar` : cls, resetFood));
    } else if (left !== null) rows.push(this._level(e.food_left, ICONS.bowl, this._t("food"), left, fmtPct(left, loc), left <= 10 ? "warn" : "ok", resetFood));
    else rows.push(this._foodRow(e.food, this._t("food"), resetFood));
    let tiles = "";
    if (c.show_stats !== false) {
      const times = this._s(e.times);
      const last = num(times) ? fmtAgo(times.last_changed, loc) : null;
      const desiccant = num(this._s(e.desiccant));
      const battery = num(this._s(e.battery_pct));
      const reset =
        controls && e.reset_desiccant
          ? `<button type="button" class="act round" data-action="reset_desiccant" data-entity="${esc(e.reset_desiccant)}" data-device="${esc(dev.id)}" title="${esc(this._t("reset"))}" aria-label="${esc(this._t("reset"))}">${svgIcon(ICONS.reset)}</button>`
          : "";
      // Dispensed today: in grams for the whole feeder, else per hopper (Jezza34000's dual-hopper feeders: "Hopper 1",
      // "3 portions", "of 4 portions planned").
      const dispensed = e.dispensed
        ? [this._dispensedTile(e.dispensed, e.planned, this._t("dispensed"))]
        : [1, 2].map((n) => this._dispensedTile(e[`dispensed${n}`], e[`planned${n}`], this._t("hopper", { n })));
      const bowlPct = num(this._s(e.bowl_pct));
      tiles = [
        ...dispensed,
        this._tile(e.times, this._t("meals"), num(times) === null ? "—" : fmtNum(num(times), loc), { sub: last ? `${this._t("last_meal")} ${last}` : "" }),
        this._tile(e.eaten, this._t("eaten"), this._grams(this._s(e.eaten))),
        e.bowl
          ? this._tile(e.bowl, this._t("in_bowl"), this._grams(this._s(e.bowl)))
          : this._tile(e.bowl_pct, this._t("in_bowl"), bowlPct === null ? "—" : fmtPct(bowlPct, loc)),
        this._tile(e.desiccant, this._t("desiccant"), desiccant === null ? "—" : fmtUnit(desiccant, "day", loc), {
          cls: desiccantLevel(desiccant),
          act: reset,
        }),
        // Battery level: only reported while the feeder runs on its batteries.
        battery === null ? "" : this._tile(e.battery_pct, this._t("battery"), fmtPct(battery, loc), { cls: batteryLevel(battery) }),
      ].join("");
    }
    return this._devBlock(dev, st, acts, rows, tiles);
  }

  // A fountain mode in the card's language: "normal" / "smart" (RobertD502), "Normal" / "Smart" (Jezza34000's
  // W5); any other one (Pause…) as the integration names it.
  _mode(o) {
    const k = `mode_${String(o).toLowerCase()}`;
    return STRINGS.en[k] ? this._t(k) : o;
  }

  _fountain(dev) {
    const c = this._config;
    const e = dev.entities;
    const st = this._status(dev);
    const loc = this._loc();
    const controls = c.show_controls !== false;
    const power = this._s(e.power);
    const acts =
      controls && power
        ? `<button type="button" class="act round" data-action="power" data-entity="${esc(e.power)}" data-device="${esc(dev.id)}" aria-pressed="${power.state === "on"}" title="${esc(this._t("power"))}" aria-label="${esc(this._t("power"))}"${known(power) ? "" : ' aria-disabled="true"'}>${svgIcon(ICONS.power)}</button>`
        : "";
    const rows = [];
    const water = this._s(e.water);
    if (water) {
      const low = water.state === "on";
      const unknown = !known(water);
      rows.push(this._level(e.water, ICONS.water, this._t("water"), unknown ? null : low ? 15 : 100, unknown ? "—" : this._t(low ? "low" : "enough"), unknown ? "idle" : low ? "warn" : "ok"));
    }
    const filter = num(this._s(e.filter));
    const reset =
      controls && e.reset_filter
        ? `<button type="button" class="act round" data-action="reset_filter" data-entity="${esc(e.reset_filter)}" data-device="${esc(dev.id)}" title="${esc(this._t("reset"))}" aria-label="${esc(this._t("reset"))}">${svgIcon(ICONS.reset)}</button>`
        : "";
    if (e.filter)
      rows.push(this._level(e.filter, ICONS.filter, this._t("filter"), filter, filter === null ? "—" : fmtPct(filter, loc), filter === null ? "idle" : filterLevel(filter), reset));
    let tiles = "";
    if (c.show_stats !== false) {
      const mode = known(this._s(e.mode));
      const purified = num(this._s(e.purified));
      const energy = num(this._s(e.energy));
      const days = num(this._s(e.filter_days));
      const battery = num(this._s(e.battery_pct));
      const pump = this._s(e.pump);
      tiles = [
        // With the buttons, the mode is shown (and picked) by the mode buttons below.
        controls ? "" : this._tile(e.mode, this._t("mode"), mode ? this._mode(mode) : "—"),
        this._tile(e.pump, this._t("pump"), known(pump) ? this._t(pump.state === "on" ? "running" : "off") : "—"),
        this._tile(e.filter_days, this._t("filter"), days === null ? "—" : fmtUnit(days, "day", loc), { cls: days === null ? "" : days <= 3 ? "warn" : "" }),
        this._tile(e.purified, this._t("purified"), purified === null ? "—" : `${fmtNum(purified, loc)}×`),
        this._tile(e.energy, this._t("energy"), energy === null ? "—" : `${fmtNum(energy, loc, 3)} kWh`),
        this._tile(e.battery_pct, this._t("battery"), battery === null ? "—" : fmtPct(battery, loc), { cls: batteryLevel(battery) }),
      ].join("");
    }
    const toggles = [];
    if (controls) {
      const modeS = this._s(e.mode);
      for (const o of modeS?.attributes?.options || [])
        toggles.push(
          `<button type="button" class="act" data-action="mode" data-entity="${esc(e.mode)}" data-device="${esc(dev.id)}" data-option="${esc(o)}" aria-pressed="${modeS.state === o}">${svgIcon(ICONS.mode)}${esc(this._mode(o))}</button>`
        );
      for (const [role, icon] of [
        ["light", ICONS.light],
        ["dnd", ICONS.dnd],
      ]) {
        const s = this._s(e[role]);
        if (s)
          toggles.push(
            `<button type="button" class="act" data-action="toggle" data-entity="${esc(e[role])}" data-device="${esc(dev.id)}" aria-pressed="${s.state === "on"}"${known(s) ? "" : ' aria-disabled="true"'}>${svgIcon(icon)}${esc(this._t(role))}</button>`
          );
      }
    }
    return this._devBlock(dev, st, acts, rows, tiles, toggles.length ? `<div class="toggles">${toggles.join("")}</div>` : "");
  }

  // A litter box: litter level and waste bin, then today's uses, the last one, the litter weight and the
  // deodorizer; buttons to clean now and to deodorize.
  _litter(dev) {
    const c = this._config;
    const e = dev.entities;
    const st = this._status(dev);
    const loc = this._loc();
    const controls = c.show_controls !== false;
    const press = (id, icon, key, round) =>
      id
        ? `<button type="button" class="act${round ? " round" : ""}" data-action="press" data-entity="${esc(id)}" data-device="${esc(dev.id)}" title="${esc(this._t(key))}"${round ? ` aria-label="${esc(this._t(key))}"` : ""}${!this._s(id) || this._s(id).state === "unavailable" ? ' aria-disabled="true"' : ""}>${svgIcon(icon)}${round ? "" : `<span class="lbl">${esc(this._t(key))}</span>`}</button>`
        : "";
    // A Litter-Robot cleans through its vacuum entity (vacuum.start runs a clean cycle).
    const start = e.vacuum
      ? `<button type="button" class="act" data-action="start" data-entity="${esc(e.vacuum)}" data-device="${esc(dev.id)}" title="${esc(this._t("clean"))}"${known(this._s(e.vacuum)) ? "" : ' aria-disabled="true"'}>${svgIcon(ICONS.broom)}<span class="lbl">${esc(this._t("clean"))}</span></button>`
      : "";
    const acts = controls ? press(e.deodorize, ICONS.spray, "deodorize", true) + press(e.clean, ICONS.broom, "clean", false) + start : "";
    const rows = [];
    const level = num(this._s(e.litter));
    const lowS = this._s(e.litter_low);
    if (level !== null) rows.push(this._level(e.litter, ICONS.litter, this._t("litter"), level, fmtPct(level, loc), level <= 20 || lowS?.state === "on" ? "warn" : "ok"));
    else if (lowS) {
      const low = lowS.state === "on";
      rows.push(this._level(e.litter_low, ICONS.litter, this._t("litter"), known(lowS) ? (low ? 15 : 100) : null, known(lowS) ? this._t(low ? "low" : "enough") : "—", known(lowS) ? (low ? "warn" : "ok") : "idle"));
    }
    const waste = num(this._s(e.waste));
    if (waste !== null) rows.push(this._level(e.waste, ICONS.bin, this._t("waste_bin"), waste, fmtPct(waste, loc), waste >= 100 ? "crit" : waste >= 80 ? "warn" : "ok"));
    const bin = this._s(e.bin_full);
    if (bin) {
      const full = bin.state === "on";
      rows.push(this._level(e.bin_full, ICONS.bin, this._t("waste_bin"), known(bin) ? (full ? 100 : 25) : null, known(bin) ? this._t(full ? "full" : "not_full") : "—", known(bin) ? (full ? "crit" : "ok") : "idle"));
    }
    let tiles = "";
    if (c.show_stats !== false) {
      const times = this._s(e.times_used);
      const who = known(this._s(e.last_used_by));
      const last = num(times) ? fmtAgo(times.last_changed, loc) : null;
      const weight = num(this._s(e.litter_weight));
      const deodorizer = num(this._s(e.deodorizer));
      const deodorizerPct = num(this._s(e.deodorizer_pct));
      tiles = [
        this._tile(e.times_used, this._t("uses"), num(times) === null ? "—" : fmtNum(num(times), loc), { sub: last ? `${this._t("last_use")} ${last}` : "" }),
        // RobertD502 reads "no_record_yet" / "unknown_pet" before any visit or for a pet it does not know.
        this._tile(e.last_used_by, this._t("last_cat"), who && !/^(no_record_yet|unknown_pet)$/.test(who) ? who : "—"),
        this._tile(e.litter_weight, this._t("litter_weight"), weight === null ? "—" : fmtUnit(weight, "kilogram", loc)),
        e.deodorizer
          ? this._tile(e.deodorizer, this._t("deodorizer"), deodorizer === null ? "—" : fmtUnit(deodorizer, "day", loc), { cls: desiccantLevel(deodorizer) })
          : this._tile(e.deodorizer_pct, this._t("deodorizer"), deodorizerPct === null ? "—" : fmtPct(deodorizerPct, loc), { cls: filterLevel(deodorizerPct) }),
        // Litter-Robot: the cat's last weight (in the unit system's unit) and the cycles since the drawer was reset.
        this._tile(e.pet_weight, this._t("cat_weight"), this._weight(this._s(e.pet_weight))),
        this._tile(e.cycles, this._t("cycles"), num(this._s(e.cycles)) === null ? "—" : fmtNum(num(this._s(e.cycles)), loc)),
      ].join("");
    }
    return this._devBlock(dev, st, acts, rows, tiles);
  }

  _render() {
    const { devices, error } = findDevices(this._hass, this._config);
    if (error) return this._error(error);
    this._devices = devices;
    const body = { feeder: (d) => this._feeder(d), fountain: (d) => this._fountain(d), litter: (d) => this._litter(d) };
    return `<style>${BASE_STYLE}${DIALOG_STYLE}${FULL_STYLE}${ART_STYLE}${this._bannerStyle()}${MOTION_STYLE}</style>
      <ha-card>
        ${this._header(devices)}
        <div class="content">${devices.map((d) => body[d.kind](d)).join("")}</div>
      </ha-card>`;
  }
}
