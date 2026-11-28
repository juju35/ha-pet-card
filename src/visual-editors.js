// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------
import { LANG_NAMES } from "./core.js";
import { lang, resolve, t } from "./helpers.js";
import { STRINGS } from "./i18n/strings.js";

// The `devices` option as device ids: names (any case) are mapped to their device, unknown entries kept as given.
export const deviceIds = (all, wanted) => {
  const low = (v) => String(v ?? "").toLowerCase();
  return [].concat(wanted ?? []).filter((w) => w && typeof w !== "object").map((w) => (all.find((d) => d.id === w) || all.find((d) => low(d.name) === low(w)))?.id ?? w);
};

// Editor fields whose label is another key than their name.
// The `devices` written as objects in YAML (entities of a device set by hand, #29): not in the select, kept as they are.
export const yamlDevices = (config) => [].concat(config?.devices ?? []).filter((w) => w && typeof w === "object");

// The edited config gets the previous one's object devices back, after the devices picked in the select.
export const withYamlDevices = (config, prev) => {
  const kept = yamlDevices(prev);
  if (kept.length) config.devices = [...[].concat(config.devices ?? []), ...kept];
  return config;
};

export const LABEL_KEYS = { title: "title_label" };

export class PetEditorBase extends HTMLElement {
  // [name, default]
  static get toggles() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema(devices) {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      {
        name: "devices",
        selector: { select: { multiple: true, mode: "list", options: devices.map((d) => ({ value: d.id, label: d.model ? `${d.name} (${d.model})` : d.name })) } },
      },
      { name: "title", selector: { text: {} } },
      { type: "grid", name: "", schema: this.constructor.toggles.map(([name]) => ({ name, selector: { boolean: {} } })) },
      {
        name: "illustration_theme",
        selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((value) => ({ value, label: tr(`theme_${value}`) })) } },
      },
      {
        name: "illustration_color",
        selector: { select: { mode: "dropdown", options: ["auto", "black", "white"].map((value) => ({ value, label: tr(`color_${value}`) })) } },
      },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANG_NAMES.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const devices = resolve(this._hass) || [];
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, LABEL_KEYS[s.name] || s.name);
      this._form.computeHelper = (s) => STRINGS[lang(this._hass, this._config)][`${s.name}_helper`] ?? STRINGS.en[`${s.name}_helper`];
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        withYamlDevices(config, this._config);
        const defaults = Object.fromEntries(this.constructor.toggles);
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: drop empty values and toggles left at their default.
          if (v === "" || v === undefined || v === null || (Array.isArray(v) && !v.length) || (k in defaults && v === defaults[k]) || (k === "illustration_color" && v === "auto") || (k === "illustration_theme" && v === "auto"))
            delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { ...this._config };
    // `devices` may be written by name in YAML: show them as the ids the select lists, so they appear ticked.
    if (data.devices !== undefined) data.devices = deviceIds(devices, data.devices);
    for (const [name, def] of this.constructor.toggles) if (data[name] === undefined) data[name] = def;
    data.illustration_color ??= "auto";
    data.illustration_theme ??= "auto";
    this._form.hass = this._hass;
    // hass is pushed on every state change while the editor is open: reassign only what changed.
    const dataKey = JSON.stringify(data);
    if (dataKey !== this._dataKey) {
      this._dataKey = dataKey;
      this._form.data = data;
    }
    const schemaKey = JSON.stringify([devices.map((d) => [d.id, d.name, d.model]), lang(this._hass, this._config)]);
    if (schemaKey !== this._schemaKey) {
      this._schemaKey = schemaKey;
      this._form.schema = this._schema(devices);
    }
  }
}

export class PetCardEditor extends PetEditorBase {
  static get toggles() {
    return [
      ["illustration", true],
      ["show_title", true],
      ["show_subtitle", true],
      ["show_stats", true],
      ["show_controls", true],
      ["show_camera", true],
      ["show_illustration", true],
    ];
  }
}

export class PetMiniCardEditor extends PetEditorBase {
  // The full card's options (used by the full card the detail button switches to), then the detail button.
  static get toggles() {
    return [...PetCardEditor.toggles, ["zoom", true]];
  }
}
