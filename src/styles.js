// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const BASE_STYLE = `
  :host { --pc-accent: #ef8f3a; --pc-ok: var(--success-color, #43a047); --pc-warn: var(--warning-color, #ffa600);
          --pc-crit: var(--error-color, #db4437); --pc-idle: var(--secondary-text-color, #9e9e9e); --pc-water: #2f8fd8; }
  :host { display: block; }
  ha-card { overflow: hidden; container-type: inline-size; container-name: pc-card; }
  /* A size container has no content width: this empty grid gives the card a natural width of 300 px with no
     minimum, so it still shrinks to its track in a grid or a flex row (as in the other ha-* cards). */
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, 300px); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible, button:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .ok { --c: var(--pc-ok); } .warn { --c: var(--pc-warn); } .crit { --c: var(--pc-crit); } .idle { --c: var(--pc-idle); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--pc-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
          line-height: 16px; white-space: nowrap; min-width: 0; overflow: hidden; box-sizing: border-box;
          background: color-mix(in srgb, var(--c, var(--pc-ok)) 15%, transparent); color: var(--c, var(--pc-ok)); }
  .chip.idle { color: var(--primary-text-color); }
  .chip-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .bar { height: 6px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); overflow: hidden; }
  .bar > div { height: 100%; border-radius: 3px; background: var(--c, var(--pc-accent)); transition: width .6s ease; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 8px; }
  /* Tinted round icon, in the overall status colour like the chip. */
  .logo { position: relative; height: 40px; width: 40px; flex: none; border-radius: 50%; display: grid; place-items: center;
          color: var(--c, var(--pc-accent)); background: color-mix(in srgb, var(--c, var(--pc-accent)) 16%, transparent); }
  .logo .icon { width: 24px; height: 24px; }
  /* Brand badge on the icon: the logo on a white tile, readable on any theme (both headers). */
  .badge { position: absolute; right: -4px; bottom: -4px; width: 18px; height: 18px; border-radius: 5px; padding: 2px; box-sizing: border-box;
           display: grid; place-items: center; background: #fff; box-shadow: 0 0 0 1px rgba(13,42,69,.16), 0 1px 3px rgba(13,42,69,.18); }
  .badge img { width: 100%; height: 100%; object-fit: contain; }
  .titles { flex: 1 1 0; min-width: 5ch; }
  :host([hide-title]) .titles .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  /* Title row (both headers): the name, then the status pill right after it, only when the whole name and the whole
     label fit there (measured by the card, see _fitPill); else the pill takes a line of its own under the subtitle,
     and when even that does not fit, only its dot stays (its label in its title). */
  .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .trow > .name { flex: 0 1 auto; min-width: 4ch; }
  .trow > .chip { flex: none; max-width: none; }
  .titles.below { display: flex; flex-direction: column; }
  .titles.below .trow { display: contents; }
  .titles.below > .sub { order: 1; }
  .titles.below .trow > .chip { order: 2; align-self: flex-start; max-width: 100%; margin-top: 2px; }
  .titles.dot-only .chip { padding: 0; width: 16px; height: 16px; justify-content: center; }
  .titles.dot-only .chip .chip-label { display: none; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  @container (max-width: 239px) { .header { gap: 6px; } }
  @container (max-width: 200px) {
    .trow > .chip { padding: 0; width: 16px; height: 16px; justify-content: center; }
    .trow > .chip .chip-label { display: none; }
  }
  .warning { padding: 16px; color: var(--pc-warn); }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px;
          border-radius: 50%; display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  /* Classic header: the detail button in the card's top right corner, out of the title row. */
  .header:has(> .zoom) { position: relative; padding-right: 44px; }
  .header > .zoom { position: absolute; top: 12px; right: 12px; margin: 0; box-shadow: inset 0 0 0 1px var(--divider-color, rgba(127,127,127,.3)); }
  /* Outlined buttons only (no filled button in the ha-* cards): the accent colour names the action. */
  .act { all: unset; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer;
         height: 28px; padding: 0 10px; border-radius: 14px; font-size: 12px; font-weight: 500; white-space: nowrap;
         border: 1px solid color-mix(in srgb, var(--c, var(--pc-accent)) 45%, transparent); color: var(--c, var(--pc-accent)); }
  .act .icon { width: 16px; height: 16px; }
  .act.round { width: 28px; padding: 0; }
  .act:hover { background: color-mix(in srgb, var(--c, var(--pc-accent)) 10%, transparent); }
  .act[aria-pressed="false"] { --c: var(--secondary-text-color); }
  .act[aria-pressed="true"] { background: color-mix(in srgb, var(--c, var(--pc-accent)) 12%, transparent); }
  .act[aria-disabled="true"] { opacity: .45; cursor: default; }
`;

// Reduce motion: bars jump to their new value instead of sliding.
export const MOTION_STYLE = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition: none !important; animation: none !important; }
  }
`;

// In-card popup, at the top of the card (as in the other ha-* cards): confirmations and the feed amount.
export const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 190px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           overflow: auto; box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4);
           display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 14px; line-height: 1.4; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
  .modal-actions .btn { border: none; border-radius: 8px; padding: 8px 14px; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer;
                        background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--primary-text-color); }
  .modal-actions .btn.primary { background: color-mix(in srgb, var(--primary-color, #03a9f4) 15%, transparent); color: var(--primary-color, #03a9f4); }
  .modal-actions .btn:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .picks { display: flex; flex-wrap: wrap; gap: 6px; }
  .stepper { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .stepper .lbl { font-size: 13px; color: var(--secondary-text-color); }
  .stepper .val { min-width: 64px; text-align: center; font-size: 18px; font-weight: 500; }
  .stepper .ctl { display: flex; align-items: center; gap: 8px; }
`;

// After a popup closes, clicks on the card are ignored for this long: the second click of a double click on OK
// would otherwise land on what lies under the button.
export const CONFIRM_GUARD_MS = 400;

// A click inside a dialog (more-info opened from the card) is not a click outside the card.
export const inDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));
