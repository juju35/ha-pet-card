// ---------------------------------------------------------------------------
// Mini card
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { KIND_ICONS, esc, filterLevel, findDevices, fmtPct, known, num, svgIcon } from "./helpers.js";
import { BASE_STYLE, DIALOG_STYLE, MOTION_STYLE, inDialog } from "./styles.js";
import { watchOutside } from "./base-card.js";
import { ART_STYLE, PetCard } from "./full-card.js";

export const MINI_STYLE = `
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
  .row { display: grid; grid-template-columns: 18px minmax(0, 1fr) minmax(24px, 72px) minmax(52px, auto); align-items: center; gap: 8px; font-size: 13px; }
  .row .icon { color: var(--c, var(--secondary-text-color)); }
  .row .lbl { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row .v { text-align: right; font-weight: 500; white-space: nowrap; }
  .row .v.warn, .row .v.crit { color: var(--c); }
  .foot { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12px; color: var(--pc-warn); }
  .foot span { display: inline-flex; align-items: center; gap: 4px; }
  .foot .icon { width: 14px; height: 14px; }
  .foot .crit { color: var(--pc-crit); }
`;

// The mini card extends the full card: its detail button (top right, `zoom: false` removes it) switches it to the
// full card's content and back; a click anywhere outside the card brings the compact view back too.
export class PetMiniCard extends PetCard {
  static getConfigElement() {
    return document.createElement("pet-mini-card-editor");
  }

  constructor() {
    super();
    this._zoomed = false;
    this.shadowRoot.addEventListener("click", (ev) => this._zoomClick(ev));
    this._onUnzoom = (ev) => {
      if (this._zoomed && !this._dialog && !ev.composedPath().includes(this) && !inDialog(ev)) this._setZoom(false);
    };
  }

  connectedCallback() {
    super.connectedCallback();
    (this._onUnzoomWatch ??= watchOutside(this, (ev) => this._onUnzoom(ev))).on();
    // Back on the page after leaving it: rendered again in its default state.
    this._update?.();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._onUnzoomWatch?.off();
    // Left (another dashboard view, a conditional card hidden): back to the default state, so that the card does
    // not come back unfolded or with its popup open.
    this._zoomed = false;
  }

  setConfig(config) {
    this._zoomed = false;
    this.setAttribute?.("mini", "");
    super.setConfig(config);
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 2;
  }

  getGridOptions() {
    return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
  }

  _setZoom(zoomed) {
    this._zoomed = zoomed;
    this._update();
  }

  _zoomClick(ev) {
    if (!ev.target?.closest?.(".zoom")) return;
    ev.stopPropagation();
    this._setZoom(!this._zoomed);
    if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    const label = this._t(z ? "zoom_out" : "zoom_in");
    return `<button type="button" class="zoom" title="${esc(label)}" aria-label="${esc(label)}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  // One row per device: its main level (food left or food state; the fountain's filter, or its water when low).
  _row(dev) {
    const e = dev.entities;
    const st = this._status(dev);
    const loc = this._loc();
    let id;
    let pct = null;
    let value = "—";
    let cls = st.cls === "ok" ? "ok" : st.cls;
    if (dev.kind === "feeder") {
      const left = this._hasHoppers(dev) ? null : num(this._s(e.food_left));
      const foods = [e.food, e.food1, e.food2].filter((x) => this._s(x));
      id = left !== null ? e.food_left : foods[0];
      const weight = this._hasHoppers(dev) ? null : this._s(e.food_weight);
      if (weight && num(weight) !== null) {
        // The food left by its weight (#29): its share of the tank's capacity, else the weight alone.
        id = e.food_weight;
        pct = this._foodPct(dev);
        value = this._amount(weight);
        if (pct !== null && pct <= 10) cls = "warn";
      } else if (left !== null) {
        pct = left;
        value = fmtPct(left, loc);
      } else if (foods.some((x) => known(this._s(x)))) {
        const low = foods.some((x) => this._s(x).state === "on");
        pct = low ? 15 : 100;
        value = this._t(low ? "low" : "enough");
      }
    } else if (dev.kind === "litter") {
      const i = this._litterInfo(dev);
      const binId = e.waste || e.bin_full;
      if (i.binFull || i.binNear) {
        id = binId;
        pct = i.waste ?? 100;
        value = this._t(i.binFull ? "bin_full" : "bin_almost_full");
      } else if (i.level !== null) {
        id = e.litter;
        pct = i.level;
        value = `${this._t("litter")} ${fmtPct(i.level, loc)}`;
      } else if (i.waste !== null) {
        id = e.waste;
        pct = i.waste;
        value = `${this._t("waste_bin")} ${fmtPct(i.waste, loc)}`;
      } else {
        id = e.litter_low || binId || e.vacuum;
        pct = known(this._s(e.litter_low)) ? (i.low ? 15 : 100) : null;
        value = i.low ? this._t("litter_low") : this._t(st.key);
      }
    } else {
      const filter = num(this._s(e.filter));
      const waterLow = this._s(e.water)?.state === "on";
      id = waterLow ? e.water : e.filter || e.water;
      pct = waterLow ? 15 : filter;
      value = waterLow ? this._t("water_low") : filter === null ? "—" : `${this._t("filter")} ${fmtPct(filter, loc)}`;
      if (!waterLow && st.cls === "ok") cls = filterLevel(filter) || "ok";
    }
    if (st.key === "unavailable") value = this._t("unavailable");
    const icon = KIND_ICONS[dev.kind];
    return `<div class="row clickable ${cls}" role="button" tabindex="0" data-key="${esc(dev.id)}" data-entity="${esc(id || "")}" aria-label="${esc(`${dev.name} ${value}`)}">
      ${svgIcon(icon)}<span class="lbl">${esc(dev.name)}</span>
      <div class="bar"><div style="width:${pct === null ? 0 : Math.max(0, Math.min(100, pct))}%"></div></div>
      <span class="v ${cls}">${esc(value)}</span>
    </div>`;
  }

  _render() {
    if (this._zoomed) return super._render();
    const { devices, error } = findDevices(this._hass, this._config);
    if (error) return this._error(error);
    this._devices = devices;
    const alerts = devices.flatMap((d) => this._status(d).alerts.map((a) => ({ ...a, dev: d })));
    const foot = alerts.length
      ? `<div class="foot">${alerts
          .map((a) => `<span class="${a.cls}" title="${esc(a.title || "")}">${svgIcon(ICONS.alert)}${esc(`${a.dev.name}: ${this._t(a.key)}`)}</span>`)
          .join("")}</div>`
      : "";
    return `<style>${BASE_STYLE}${DIALOG_STYLE}${MINI_STYLE}${ART_STYLE}${this._bannerStyle()}${MOTION_STYLE}</style>
      <ha-card>
        ${this._header(devices)}
        <div class="content">${devices.map((d) => this._row(d)).join("")}${foot}</div>
      </ha-card>`;
  }
}
