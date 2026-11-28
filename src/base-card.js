// ---------------------------------------------------------------------------
// Base card: state, status of each device, popups and actions
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { PLATFORMS, configEntityIds, deviceLabel, esc, feedDefault, feedDualSpec, feedListSpec, feedSpec, fmtLang, fmtNum, fmtUnit, known, listDefault, litterActivity, morph, num, pressService, resolve, robotActivity, svgIcon, t } from "./helpers.js";
import { FEED_ANIM_MS, PETKIT_LOGO, art, bannerSvg, hasCamera, isDual, isNight } from "./illustrations.js";
import { BASE_STYLE, CONFIRM_GUARD_MS, MOTION_STYLE, inDialog } from "./styles.js";
import { BANNER_STYLE } from "./full-card.js";

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. The handler runs when the press and the release are both outside the card (a slider dragged out of the
// card does not count, and a scroll cancels the pointer); keyboard clicks (no click count) still go through the click
// event. The handler keeps its own checks (dialogs opened from the card…). `tap(ev)` is for the tests.
export const watchOutside = (card, handler) => {
  let downOutside = false;
  const outside = (ev) => !ev.composedPath().includes(card);
  const onDown = (ev) => {
    downOutside = outside(ev);
  };
  const onUp = (ev) => {
    if (downOutside && outside(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
  };
};

export class PetBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    // Keeps the SVG ids of this card apart from the other cards' on the same page.
    this._uid = Math.random().toString(36).slice(2, 8);
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Keyboard access: Enter or Space on a focusable non-button element acts as a click.
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" || ev.key === " ") && ev.target.getAttribute?.("role") === "button") {
        ev.preventDefault();
        ev.target.click();
      }
    });
    // Escape closes the popup (as Cancel); Tab stays on the popup's buttons while it is open.
    this._onKey = (ev) => {
      if (!this._dialog) return;
      if (ev.key === "Tab") {
        const btns = [...(this.shadowRoot.querySelectorAll?.(".modal button") || [])];
        if (!btns.length) return;
        ev.preventDefault();
        const i = btns.indexOf(this.shadowRoot.activeElement);
        btns[(i + (ev.shiftKey ? -1 : 1) + btns.length) % btns.length].focus({ preventScroll: true });
        return;
      }
      if (ev.key !== "Escape") return;
      ev.stopPropagation();
      this._closeDialog();
    };
  }

  // Home Assistant pushes a new hass on every state change of the whole instance: the card is only drawn again when
  // something it shows changed (the registries, the language, the theme, the states of the supported devices).
  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    const deps = this._deps();
    const prev = this._lastDeps;
    if (prev && deps.length === prev.length && deps.every((d, i) => d === prev[i])) return;
    this._lastDeps = deps;
    this._update();
  }

  _deps() {
    const h = this._hass;
    const ids = [...(resolve(h) || []).flatMap((d) => Object.values(d.entities)), ...configEntityIds(this._config)];
    return [h.entities, h.devices, h.language, h.locale, h.themes?.darkMode, h.localize, ...ids.map((id) => h.states?.[id])];
  }

  get hass() {
    return this._hass;
  }

  connectedCallback() {
    // A click elsewhere on the page closes the popup without acting.
    this._onOutside ??= (ev) => {
      if (!this._dialog || ev.composedPath().includes(this) || inDialog(ev)) return;
      this._closeDialog(false);
    };
    (this._onOutsideWatch ??= watchOutside(this, (ev) => this._onOutside(ev))).on();
    // A new width (or the web font loaded): the status pill is fitted again, in the next frame.
    if (typeof ResizeObserver === "function") {
      this._resize ??= new ResizeObserver((entries) => {
        const w = Math.round(entries.at(-1).contentRect.width);
        if (w === this._fitWidth) return;
        this._fitWidth = w;
        cancelAnimationFrame(this._fitFrame);
        this._fitFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._resize.observe(this);
    }
    document.fonts?.ready?.then(() => this._fitPill());
    // Back on the page after leaving it: rendered again in its default state.
    this._update?.();
    if (this._dialog) window.addEventListener("keydown", this._onKey);
    // "2 hours ago" moves on with time: redraw every minute (only what changed is written).
    this._tick ??= setInterval(() => this._update(), 60000);
  }

  disconnectedCallback() {
    this._onOutsideWatch?.off();
    this._resize?.disconnect();
    if (this._fitFrame) cancelAnimationFrame(this._fitFrame);
    this._fitWidth = null;
    // Left (another dashboard view, a conditional card hidden): back to the default state, so that the card does
    // not come back unfolded or with its popup open.
    this._dialog = null;
    window.removeEventListener("keydown", this._onKey);
    clearInterval(this._tick);
    this._tick = null;
    clearTimeout(this._redrawTimer);
    this._redrawTimer = null;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._lastDeps = null;
    this._update();
  }

  getCardSize() {
    return 5;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _loc() {
    return fmtLang(this._hass, this._config);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  _update() {
    if (!this._hass || !this._config) return;
    let html = this._render();
    if (this._dialog)
      html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._dialogHtml()}</ha-card>`);
    if (html !== this._html) {
      this._html = html;
      morph(this.shadowRoot, html);
    }
    this._fitPill();
  }

  // The status pill goes right after the title only when the whole title and the whole label fit there; otherwise it
  // takes a line of its own under the subtitle (.below, the subtitle kept to one line, its whole text in its tooltip).
  // When the label does not fit that line either, or the banner has no room for the lines above its ground strip, the
  // pill keeps its dot only (.dot-only, back beside the title when the dot fits there). Measured after render, so that
  // it holds in every language.
  _fitPill() {
    const root = this.shadowRoot;
    if (!root?.querySelectorAll || typeof getComputedStyle !== "function") return;
    for (const t of root.querySelectorAll(".titles")) {
      const chip = t.querySelector(".trow > .chip");
      t.classList.remove("below", "dot-only");
      if (!chip?.getClientRects().length) continue;
      const row = chip.parentElement;
      const name = row.querySelector(".name");
      const fits = () => {
        let title = 0;
        if (name && getComputedStyle(name).display !== "none") {
          const range = document.createRange();
          range.selectNodeContents(name);
          const cs = getComputedStyle(name);
          title = Math.max(name.scrollWidth, range.getBoundingClientRect().width) + (parseFloat(cs.marginLeft) || 0) + (parseFloat(cs.marginRight) || 0) +
            (parseFloat(getComputedStyle(row).columnGap) || 0);
        }
        return title + chip.getBoundingClientRect().width <= row.getBoundingClientRect().width + 0.5;
      };
      if (fits()) continue;
      t.classList.add("below");
      for (const sub of t.querySelectorAll(".sub")) sub.title = sub.scrollWidth > sub.clientWidth ? sub.textContent.trim() : "";
      const text = chip.querySelector(".chip-label");
      const banner = t.closest(".banner");
      const tb = t.getBoundingClientRect();
      const bb = banner?.getBoundingClientRect();
      const ground = banner ? parseFloat(getComputedStyle(banner).getPropertyValue("--g")) || 0 : 0;
      const tall = !!bb && (tb.top < bb.top - 0.5 || tb.bottom > bb.bottom - ground + 0.5);
      if (!tall && !(text && text.scrollWidth > text.clientWidth + 0.5)) continue;
      t.classList.add("dot-only");
      t.classList.remove("below");
      if (!fits()) t.classList.add("below");
    }
  }

  _call(domain, service, data) {
    return Promise.resolve()
      .then(() => this._hass.callService(domain, service, data))
      .catch((err) => console.error(`pet-card: ${domain}.${service} failed`, err));
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  // Every entity of the device unavailable (cloud down, device removed): the device is unavailable.
  _unavailable(dev) {
    const states = Object.values(dev.entities).map((id) => this._s(id));
    return !states.some((s) => s && s.state !== "unavailable");
  }

  // { cls, key, title, alerts: [{ cls, key }] }: the device's status chip and what needs doing.
  // The food left in the tank as a share of a full one, from its weight (`food_weight` and the device's `capacity`).
  _foodPct(dev) {
    const w = num(this._s(dev.entities.food_weight));
    return w === null || !dev.capacity ? null : Math.max(0, Math.min(100, (w / dev.capacity) * 100));
  }

  _status(dev) {
    if (this._unavailable(dev)) return { cls: "idle", key: "unavailable", alerts: [] };
    const e = dev.entities;
    const alerts = [];
    if (dev.kind === "feeder") {
      // RobertD502: feeder_status (normal, offline, on_batteries), error (no_error), battery_status (low).
      // Jezza34000: device_status (offline, online_ac, online_battery), error_message ("No error"),
      // power_type (main_power, on_battery, on_battery_low).
      const status = known(this._s(e.status));
      const err = known(this._s(e.error));
      const power = known(this._s(e.power_type));
      if (status === "offline") alerts.push({ cls: "crit", key: "offline" });
      if (err && err.toLowerCase().replace(/\s+/g, "_") !== "no_error") alerts.push({ cls: "crit", key: "error", title: err });
      const left = this._foodPct(dev) ?? num(this._s(e.food_left));
      const hoppers = this._hasHoppers(dev);
      if ([e.food, e.food1, e.food2].some((id) => this._s(id)?.state === "on") || (!hoppers && left !== null && left <= 10))
        alerts.push({ cls: "warn", key: "food_low" });
      const desiccant = num(this._s(e.desiccant));
      if (desiccant !== null && desiccant <= 0) alerts.push({ cls: "warn", key: "replace_desiccant" });
      if (known(this._s(e.battery)) === "low" || power === "on_battery_low") alerts.push({ cls: "warn", key: "battery_low" });
      if (status === "on_batteries" || status === "online_battery" || power === "on_battery") alerts.push({ cls: "warn", key: "on_batteries" });
      return alerts.length ? { ...alerts[0], alerts } : { cls: "ok", key: "normal", alerts };
    }
    if (dev.kind === "litter") return this._litterStatus(dev);
    if (this._s(e.water)?.state === "on") alerts.push({ cls: "warn", key: "water_low" });
    const filter = num(this._s(e.filter));
    if ((filter !== null && filter <= 5) || this._s(e.filter_warning)?.state === "on") alerts.push({ cls: "warn", key: "replace_filter" });
    if (this._s(e.battery_low)?.state === "on") alerts.push({ cls: "warn", key: "battery_low" });
    if (this._s(e.power)?.state === "off") return { cls: "idle", key: "off", alerts };
    return alerts.length ? { ...alerts[0], alerts } : { cls: "ok", key: "running", alerts };
  }

  // A litter box, whatever its integration: { act, level, low, waste (%), binFull, binNear, occupied, offline,
  // error (null, or its message), night }.
  _litterInfo(dev) {
    const e = dev.entities;
    const level = num(this._s(e.litter));
    if (dev.platform === "litterrobot") {
      const code = known(this._s(e.status_code));
      const vac = known(this._s(e.vacuum));
      const act = code ? robotActivity(code) : ["cleaning", "error", "paused"].includes(vac) ? vac : "idle";
      const waste = num(this._s(e.waste));
      const night = this._s(e.night);
      return {
        act,
        level,
        low: false,
        waste,
        binFull: code === "dfs" || code === "sdf" || (waste !== null && waste >= 100),
        binNear: code === "df1" || code === "df2" || (waste !== null && waste >= 80),
        occupied: false,
        offline: code === "offline",
        error: act === "error" ? this._fmt(this._s(e.status_code)) || "" : null,
        // The night light lit: the light (LR5), the globe light set to on (LR4) or the night light mode (LR3).
        night: night?.state === "on",
      };
    }
    const act = litterActivity(known(this._s(e.state)));
    const err = known(this._s(e.error));
    const errOn = err && err.toLowerCase().replace(/\s+/g, "_") !== "no_error";
    return {
      act,
      level,
      low: this._s(e.litter_low)?.state === "on",
      waste: null,
      binFull: this._s(e.bin_full)?.state === "on",
      binNear: false,
      occupied: this._s(e.occupied)?.state === "on",
      offline: known(this._s(e.status)) === "offline",
      error: errOn ? err : act === "error" ? "" : null,
      night: false,
    };
  }

  // An entity's state as Home Assistant shows it (translated), else its raw state.
  _fmt(s) {
    if (!s) return "";
    try {
      return this._hass.formatEntityState?.(s) || s.state;
    } catch {
      return s.state;
    }
  }

  // A litter box: offline or an error first, then a full waste bin, low litter and a spent deodorizer; else what
  // it does (cleaning, a cat inside, paused, maintenance, off) or ready.
  _litterStatus(dev) {
    const i = this._litterInfo(dev);
    const alerts = [];
    if (i.offline) alerts.push({ cls: "crit", key: "offline" });
    if (i.error !== null) alerts.push({ cls: "crit", key: "error", ...(i.error ? { title: i.error } : {}) });
    if (i.binFull) alerts.push({ cls: "warn", key: "bin_full" });
    else if (i.binNear) alerts.push({ cls: "warn", key: "bin_almost_full" });
    if (i.low || (i.level !== null && i.level <= 20)) alerts.push({ cls: "warn", key: "litter_low" });
    const deodorizer = num(this._s(dev.entities.deodorizer));
    if (deodorizer !== null && deodorizer <= 0) alerts.push({ cls: "warn", key: "replace_deodorizer" });
    if (alerts.length) return { ...alerts[0], alerts };
    if (i.act === "cleaning") return { cls: "ok", key: "cleaning", alerts };
    if (i.act === "cat" || i.occupied) return { cls: "ok", key: "cat_inside", alerts };
    if (i.act === "paused") return { cls: "idle", key: "paused", alerts };
    if (i.act === "maintenance") return { cls: "idle", key: "maintenance", alerts };
    if (i.act === "off") return { cls: "idle", key: "off", alerts };
    return { cls: "ok", key: "ready", alerts };
  }

  // A feeder dispensing: Jezza34000's `feeding` sensor, else for a while after a manual feed sent from the card or
  // a rise of its meals or amounts dispensed today (the first values read only set the reference).
  _feeding(dev) {
    const e = dev.entities;
    if (this._s(e.feeding)?.state === "on") return true;
    this._counts ??= new Map();
    this._feedUntil ??= new Map();
    const now = Date.now();
    const values = ["times", "dispensed", "dispensed1", "dispensed2"].map((r) => num(this._s(e[r]))).filter((v) => v !== null);
    if (values.length) {
      const total = values.reduce((a, b) => a + b, 0);
      const prev = this._counts.get(dev.id);
      if (prev !== undefined && total > prev) this._feedUntil.set(dev.id, now + FEED_ANIM_MS);
      this._counts.set(dev.id, total);
    }
    const until = this._feedUntil.get(dev.id) ?? 0;
    if (now >= until) return false;
    this._redrawIn(until - now);
    return true;
  }

  _feedStarted(id) {
    (this._feedUntil ??= new Map()).set(id, Date.now() + FEED_ANIM_MS);
    this._update();
  }

  // One timer for the next redraw a timed state needs (the end of a dispensing): the earliest one is kept.
  _redrawIn(ms) {
    const at = Date.now() + ms;
    if (this._redrawTimer && this._redrawAt <= at) return;
    clearTimeout(this._redrawTimer);
    this._redrawAt = at;
    this._redrawTimer = setTimeout(() => {
      this._redrawTimer = null;
      this._update();
    }, ms + 50);
    this._redrawTimer?.unref?.();
  }

  // The device's illustration and its animation classes; "" with show_illustration: false.
  _art(dev, st) {
    if (this._config.show_illustration === false) return "";
    const a = this._artSpec(dev, st);
    return art(a.kind, a.o, a.cls, `${this._uid}-${Math.max(0, this._devices?.indexOf(dev) ?? 0)}`);
  }

  // What the device's picture shows: { kind, o (its drawing options), cls (its animation and LED classes) }, for
  // the device's own illustration and the header's.
  _artSpec(dev, st) {
    const e = dev.entities;
    const live = st.key !== "unavailable";
    const led = ["crit", "warn", "idle"].includes(st.cls) ? st.cls : "ok";
    if (dev.kind === "feeder") {
      // A food level sensor: on when low; no state yet draws a hopper half full.
      const level = (id) => {
        const s = this._s(id);
        if (!known(s)) return [0.6, false];
        return s.state === "on" ? [0.15, true] : [0.85, false];
      };
      const dual = isDual(dev);
      let hoppers;
      if (this._hasHoppers(dev)) hoppers = [level(e.food1), level(e.food2)];
      else {
        const left = num(this._s(e.food_left));
        const one = left !== null ? [left / 100, left <= 10] : level(e.food);
        hoppers = dual ? [one, one] : [one];
      }
      const bowl = num(this._s(e.bowl)) ?? num(this._s(e.bowl_pct));
      const feeding = live && this._feeding(dev);
      const o = { dual, camera: hasCamera(dev), levels: hoppers.map((h) => h[0]), lows: hoppers.map((h) => h[1]), bowl: bowl === null || bowl > 0 };
      return { kind: "feeder", o, cls: feeding && led !== "crit" ? "feeding busy" : led };
    }
    if (dev.kind === "fountain") {
      const dry = this._s(e.water)?.state === "on";
      const pump = this._s(e.pump);
      const flowing = pump
        ? pump.state === "on"
        : this._s(e.power)?.state !== "off" && this._s(e.dnd_state)?.state !== "on" && !/pause/i.test(known(this._s(e.mode)) || "");
      return { kind: "fountain", o: {}, cls: [led, live && !dry && flowing ? "on" : "", dry ? "dry" : ""].filter(Boolean).join(" ") };
    }
    const i = this._litterInfo(dev);
    const cleaning = live && i.act === "cleaning";
    const cat = live && !cleaning && (i.act === "cat" || i.occupied);
    const cls = [cleaning && led !== "crit" ? "cleaning busy" : cat && led === "ok" ? "warn" : led, cat ? "cat" : "", i.binFull ? "full" : "", live && i.night ? "night" : ""];
    const level = i.level !== null ? i.level / 100 : i.low ? 0.15 : 0.7;
    if (dev.platform === "litterrobot") {
      // The colour of a Litter-Robot 4 / 5 is not reported: black unless illustration_color says white.
      const o = { lr3: /\b3\b|lr3/i.test(dev.model), color: this._config.illustration_color === "white" ? "white" : "black", level, waste: i.waste };
      return { kind: "robot", o, cls: cls.filter(Boolean).join(" ") };
    }
    return { kind: "litter", o: { camera: hasCamera(dev), level }, cls: cls.filter(Boolean).join(" ") };
  }

  // A feeder with two hoppers shows each of them (and not food_left, which is one level for the whole feeder).
  _hasHoppers(dev) {
    return !!(this._s(dev.entities.food1) || this._s(dev.entities.food2));
  }

  // Overall status of the shown devices: the header chip and icon.
  _overall(devices) {
    const st = devices.map((d) => this._status(d));
    if (st.some((s) => s.alerts.some((a) => a.cls === "crit"))) return { cls: "crit", key: "attention" };
    if (st.some((s) => s.alerts.length)) return { cls: "warn", key: "attention" };
    if (st.every((s) => s.key === "unavailable")) return { cls: "idle", key: "unavailable" };
    return { cls: "ok", key: "all_good" };
  }

  _chip(cls, text, title) {
    return `<span class="chip ${cls}" title="${esc(title || text)}"><span class="dot"></span><span class="chip-label">${esc(text)}</span></span>`;
  }

  // The colour of the header icon: red or amber with an alert, grey when every device is idle, off or
  // unavailable, else the accent (devices at work).
  _iconCls(devices) {
    const st = devices.map((d) => this._status(d));
    if (st.some((s) => s.alerts.some((a) => a.cls === "crit"))) return "crit";
    if (st.some((s) => s.alerts.length)) return "warn";
    if (st.every((s) => s.cls === "idle")) return "idle";
    return "";
  }

  // The brand's logo in a badge on the header icon (PetKit; no logo for the other integrations).
  _badge(devices) {
    const p = devices[0]?.platform;
    return p === "petkit" && PETKIT_LOGO.startsWith("data:") ? `<span class="badge" title="${esc(PLATFORMS[p].name)}"><img src="${PETKIT_LOGO}" alt=""></span>` : "";
  }

  _bannerStyle() {
    return this._config.illustration === false ? "" : BANNER_STYLE;
  }

  // The header: the illustrated banner (title on the left, the devices in their corner on the right), or the
  // classic header with illustration: false.
  _header(devices) {
    const c = this._config;
    const all = this._overall(devices);
    const sub = devices.map((d) => d.name).join(" · ");
    const icon = `<div class="logo ${this._iconCls(devices)}" title="${esc(PLATFORMS[devices[0].platform]?.name ?? "")}">${svgIcon(ICONS.paw)}${this._badge(devices)}</div>`;
    if (c.illustration === false)
      return `
      <div class="header">
        ${icon}
        <div class="titles">
          <div class="trow"><div class="name">${esc(c.title || this._t("title"))}</div>${this._chip(all.cls, this._t(all.key))}</div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
        </div>
        ${this._zoomButton()}
      </div>`;
    const night = isNight(this._hass, c);
    const items = devices.map((d) => this._artSpec(d, this._status(d)));
    // The status pill right after the title, in the header icon's colour.
    const chip = this._chip(this._iconCls(devices) || "accent", this._t(all.key));
    return `
      <div class="banner${night ? " night" : ""}">
        ${bannerSvg(items, night, this._uid, this._zoomButton() ? 168 : 192)}<div class="ground"></div>
        <div class="htext">${icon}<div class="titles">
          <div class="trow"><div class="name">${esc(c.title || this._t("title"))}</div>${chip}</div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}</div></div>
        ${this._zoomButton()}
      </div>`;
  }

  // Button at the far right of the header: only the mini card has one.
  _zoomButton() {
    return "";
  }

  _error(key) {
    return `<style>${BASE_STYLE}${MOTION_STYLE}</style><ha-card><div class="warning">${esc(
      key === "unknown_device" ? `${this._t(key)}: ${[].concat(this._config.devices ?? []).map(deviceLabel).join(", ")}` : this._t(key)
    )}</div></ha-card>`;
  }

  // ---- Actions ------------------------------------------------------------

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    if (!this._dialog && Date.now() - (this._dialogClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    if (this._dialog) {
      ev.stopPropagation();
      this._dialogClick(el, path);
      return;
    }
    if (!el) return;
    ev.stopPropagation();
    const { action, entity, device } = el.dataset;
    if (!action) return this._moreInfo(entity);
    if (el.getAttribute("aria-disabled") === "true") return;
    const dev = this._devices?.find((d) => d.id === device);
    const name = dev?.name ?? "";
    const from = { action, device };
    switch (action) {
      case "feed":
        return this._openFeed(dev, from);
      case "reset_filter":
      case "reset_desiccant":
      case "reset_food":
        return this._openDialog(
          { text: this._t(`confirm_${action}`, { name }), ok: this._t("reset"), run: () => this._press(entity) },
          from
        );
      case "power":
        if (this._s(entity)?.state === "off") return this._call("switch", "turn_on", { entity_id: entity });
        return this._openDialog(
          { text: this._t("confirm_off", { name }), ok: this._t("turn_off"), run: () => this._call("switch", "turn_off", { entity_id: entity }) },
          from
        );
      case "toggle":
        return this._call("switch", "toggle", { entity_id: entity });
      case "press":
        return this._press(entity);
      case "start":
        return this._call("vacuum", "start", { entity_id: entity });
      case "mode":
        return this._call("select", "select_option", { entity_id: entity, option: el.dataset.option });
    }
  }

  // Presses a button, an input_button or a script.
  _press(entity) {
    const [domain, service] = pressService(entity);
    return this._call(domain, service, { entity_id: entity });
  }

  _dialogClick(el, path) {
    const action = el?.dataset.action;
    const f = this._dialog?.feed;
    if (action === "confirm_ok") {
      const { run } = this._dialog;
      this._closeDialog();
      run();
    } else if (action === "confirm_cancel" || (action === "confirm_backdrop" && path[0] === el)) {
      this._closeDialog();
    } else if (f && action === "feed_pick") {
      f.option = el.dataset.option;
      this._update();
    } else if (f && action === "feed_step") {
      const i = Number(el.dataset.index || 0);
      const d = Number(el.dataset.delta);
      const { min, max } = f.spec;
      f.values[i] = Math.min(max, Math.max(min, Math.round((f.values[i] + d) * 1000) / 1000));
      this._update();
    }
  }

  // The manual feed of a device and its entities' states: RobertD502's one entity (select, number or "a,b" text),
  // or Jezza34000's text of amounts (one hopper) or one text per hopper.
  _feedOf(dev) {
    const e = dev?.entities || {};
    if (e.feed1 || e.feed2) return { spec: feedDualSpec(this._s(e.feed1), this._s(e.feed2)), states: [this._s(e.feed1), this._s(e.feed2)] };
    if (e.feed) return { spec: feedSpec(this._s(e.feed)), states: [this._s(e.feed)] };
    if (e.feed_one) return { spec: feedListSpec(this._s(e.feed_one)), states: [this._s(e.feed_one)] };
    return { spec: null, states: [] };
  }

  // Manual feed popup: the amount to dispense, then Feed. Built from the entity: options (select), a gram
  // stepper (number), one portion stepper per hopper (text "a,b", or one text per hopper) or a list of amounts.
  _openFeed(dev, from) {
    const { spec, states } = this._feedOf(dev);
    if (!spec) return;
    // A feed button dispenses at once, with no amount to pick.
    if (spec.domain === "press") {
      this._feedStarted(dev.id);
      return this._press(states[0].entity_id);
    }
    const feed = { entity: states[0]?.entity_id, spec };
    if (spec.domain === "select") feed.option = spec.options[0];
    else if (spec.domain === "number") feed.values = [feedDefault(spec.min, spec.max, spec.step)];
    else if (spec.domain === "list") feed.values = [listDefault(spec)];
    else feed.values = spec.entities && !spec.entities[0] ? [0, 1] : [1, 0];
    this._openDialog(
      {
        feed,
        text: this._t("feed_title", { name: dev.name }),
        ok: this._t("feed"),
        run: () => {
          this._feedStarted(dev.id);
          if (spec.domain === "select") return this._call("select", "select_option", { entity_id: feed.entity, option: feed.option });
          if (spec.domain === "number") return this._call(spec.service || "number", "set_value", { entity_id: feed.entity, value: feed.values[0] });
          if (spec.domain === "list") return this._call("text", "set_value", { entity_id: spec.entity, value: String(spec.values[feed.values[0]]) });
          // One feed per hopper, each with its own entity (the integration sends the other hopper's amount as 0).
          if (spec.domain === "dual")
            return Promise.all(
              feed.values.map((v, i) => (v > 0 && spec.entities[i] ? this._call("text", "set_value", { entity_id: spec.entities[i], value: String(v) }) : null))
            );
          return this._call("text", "set_value", { entity_id: feed.entity, value: feed.values.join(",") });
        },
      },
      from
    );
  }

  _openDialog(dialog, from) {
    this._dialog = { ...dialog, from };
    window.addEventListener("keydown", this._onKey);
    this._update();
    this.shadowRoot.querySelector?.(".modal .primary")?.focus({ preventScroll: true });
  }

  _closeDialog(restoreFocus = true) {
    const from = this._dialog?.from;
    this._dialog = null;
    this._dialogClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
    if (restoreFocus && from)
      this.shadowRoot.querySelector?.(`[data-action="${from.action}"][data-device="${from.device}"]`)?.focus({ preventScroll: true });
  }

  _stepper(label, i, step, text) {
    return `<div class="stepper"><span class="lbl">${esc(label)}</span><span class="ctl">
      <button type="button" class="act round" data-action="feed_step" data-index="${i}" data-delta="${-step}" aria-label="−">${svgIcon(ICONS.minus)}</button>
      <span class="val">${esc(text)}</span>
      <button type="button" class="act round" data-action="feed_step" data-index="${i}" data-delta="${step}" aria-label="+">${svgIcon(ICONS.plus)}</button>
    </span></div>`;
  }

  _feedBody(f) {
    const { spec } = f;
    if (spec.domain === "select")
      return `<div class="picks" role="radiogroup">${spec.options
        .map(
          (o) =>
            `<button type="button" class="act" role="radio" aria-checked="${o === f.option}" aria-pressed="${o === f.option}" data-action="feed_pick" data-option="${esc(o)}">${esc(o)}</button>`
        )
        .join("")}</div>`;
    const loc = this._loc();
    if (spec.domain === "number")
      return this._stepper(this._t("food"), 0, spec.step, spec.unit === "g" ? fmtUnit(f.values[0], "gram", loc) : `${fmtNum(f.values[0], loc, 1)} ${spec.unit}`);
    if (spec.domain === "list") {
      const v = spec.values[f.values[0]];
      return spec.unit === "gram"
        ? this._stepper(this._t("food"), 0, 1, fmtUnit(v, "gram", loc))
        : this._stepper(`${this._t("food")} · ${this._t("portions")}`, 0, 1, fmtNum(v, loc));
    }
    // A hopper without its own feed entity keeps its stepper out.
    return f.values
      .map((v, i) => (spec.entities && !spec.entities[i] ? "" : this._stepper(`${this._t("hopper", { n: i + 1 })} · ${this._t("portions")}`, i, 1, fmtNum(v, loc))))
      .join("");
  }

  _dialogHtml() {
    const c = this._dialog;
    // Nothing to dispense (every hopper at 0); a list always holds an amount.
    const blocked = c.feed && c.feed.spec.domain !== "list" && c.feed.values?.every((v) => v <= 0);
    return `<div class="backdrop" data-action="confirm_backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-msg">
        <div class="msg" id="confirm-msg">${esc(c.text)}</div>
        ${c.feed ? this._feedBody(c.feed) : ""}
        <div class="modal-actions">
          <button type="button" class="btn" data-action="confirm_cancel">${esc(this._t("cancel"))}</button>
          <button type="button" class="btn primary" data-action="${blocked ? "" : "confirm_ok"}"${blocked ? ' aria-disabled="true"' : ""}>${esc(c.ok)}</button>
        </div>
      </div>
    </div>`;
  }
}
