// ---------------------------------------------------------------------------
// Illustrations
// ---------------------------------------------------------------------------
import { esc } from "./helpers.js";

// Drawn pictures of the devices (no photos), animated by what the device does: kibbles fall into the bowl while a
// feeder dispenses, the fountain's water flows and ripples while its pump runs, the litter box's drum turns while it
// cleans and a cat peeks out while one is inside. The hoppers, the fountain's tank and the litter show their level;
// the status LED takes the device's status colour. The shape follows the model: one or two hoppers, a camera (YumShare
// feeders, camera litter boxes). Gradient and clip ids get a per-device suffix (several devices in one card).
export const ART_DEFS =
  '<linearGradient id="pa-b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d5dbe2"/><stop offset=".45" stop-color="#ffffff"/><stop offset="1" stop-color="#c9d0d8"/></linearGradient>' +
  '<linearGradient id="pa-st" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa4ae"/><stop offset=".5" stop-color="#f1f4f7"/><stop offset="1" stop-color="#8f9aa6"/></linearGradient>' +
  '<linearGradient id="pa-dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2129"/><stop offset="1" stop-color="#39424d"/></linearGradient>' +
  '<linearGradient id="pa-sd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6d3ad"/><stop offset="1" stop-color="#c9b083"/></linearGradient>' +
  '<radialGradient id="pa-fl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="pa-gw" cx=".5" cy=".5" r=".5"><stop offset=".6" stop-color="#7fb3ff" stop-opacity=".9"/><stop offset="1" stop-color="#7fb3ff" stop-opacity="0"/></radialGradient>';
export const KIBBLE = ["#a8662c", "#c27d3c"];

// Kibbles of a hopper window (x, width; y 12 to 44), up to its level (0 to 1).
export const kibbles = (x, w, level) => {
  const top = 44 - Math.max(0.06, Math.min(1, level)) * 32;
  let s = "";
  for (let row = 0, y = 41.4; y >= 14; row++, y -= 3.2) {
    if (y < top) break;
    for (let cx = x + 2.6 + (row % 2) * 1.6; cx < x + w - 1.4; cx += 3.2) s += `<circle cx="${cx.toFixed(1)}" cy="${y.toFixed(1)}" r="1.4" fill="${KIBBLE[(row + Math.round(cx)) % 2]}"/>`;
  }
  return s;
};

export const hopper = (x, w, level, low) =>
  `<rect class="win${low ? " low" : ""}" x="${x}" y="12" width="${w}" height="32" rx="6" fill="rgba(29,38,50,.08)" stroke="#c3cad2" stroke-width="1"/>` +
  `<clipPath id="pa-h${x}"><rect x="${x}" y="12" width="${w}" height="32" rx="6"/></clipPath><g clip-path="url(#pa-h${x})">${kibbles(x, w, level)}</g>` +
  `<path d="M${x + 3} 15v14" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;

export const drops = (cx) =>
  [0, 0.25, 0.5, 0.75].map((d, i) => `<circle class="drop" cx="${cx - 1.5 + (i % 2) * 3}" cy="63.5" r="1.8" fill="${KIBBLE[i % 2]}" style="animation-delay:${d}s"/>`).join("");

// o: { dual, camera, levels: [0..1, 0..1], lows: [bool, bool], bowl: bool }
export const feederArt = (o) => {
  const d = o.dual;
  let s = '<ellipse cx="40" cy="88" rx="32" ry="4" fill="url(#pa-fl)"/>';
  s += `<rect x="${d ? 9 : 17}" y="5" width="${d ? 62 : 46}" height="70" rx="12" fill="url(#pa-b)" stroke="#c3cad2" stroke-width="1.1"/>`;
  s += '<circle class="led" cx="40" cy="8.6" r="1.3"/>';
  s += d ? hopper(14, 24, o.levels[0], o.lows[0]) + hopper(42, 24, o.levels[1], o.lows[1]) : hopper(23, 34, o.levels[0], o.lows[0]);
  if (o.camera)
    s += '<circle cx="40" cy="51" r="4.2" fill="#1d2632" stroke="#8f9aa6" stroke-width=".8"/><circle cx="38.8" cy="49.8" r="1.1" fill="#7fa7d9"/><circle class="rec" cx="46" cy="49" r=".9" fill="#db4437"/>';
  s += d
    ? `<rect x="23" y="57" width="8" height="5" rx="2" fill="#3a434e"/><rect x="49" y="57" width="8" height="5" rx="2" fill="#3a434e"/>${drops(27)}${drops(53)}`
    : `<rect x="35" y="57" width="10" height="5" rx="2" fill="#3a434e"/>${drops(40)}`;
  s += '<ellipse cx="40" cy="79" rx="25" ry="7" fill="url(#pa-st)" stroke="#8f9aa6" stroke-width=".6"/><ellipse cx="40" cy="78" rx="19" ry="4.3" fill="#6b7682"/>';
  if (o.bowl)
    s += [35, 38.5, 42, 45].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 77.6 : 78.4}" r="1.3" fill="${KIBBLE[(i + 1) % 2]}"/>`).join("");
  return s;
};

// Drawn smaller than the others (y 27 to 92): scaled up to the same height.
export const fountainArt = () =>
  '<g transform="translate(-8 -24) scale(1.2)">' +
  '<ellipse cx="40" cy="88" rx="30" ry="4" fill="url(#pa-fl)"/>' +
  '<clipPath id="pa-tk"><rect x="15" y="42" width="50" height="40" rx="11"/></clipPath>' +
  '<rect x="15" y="42" width="50" height="40" rx="11" fill="rgba(205,222,236,.55)" stroke="#c3cad2" stroke-width="1"/>' +
  '<g clip-path="url(#pa-tk)"><g class="wl"><path class="wave" d="M8 56q5-2.5 10 0t10 0 10 0 10 0 10 0 10 0 10 0V84H8Z" fill="#2f8fd8" opacity=".45"/></g></g>' +
  '<path d="M19 47v26" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>' +
  '<ellipse cx="40" cy="42" rx="27" ry="6.5" fill="url(#pa-b)" stroke="#c3cad2" stroke-width="1"/>' +
  '<ellipse cx="40" cy="41.2" rx="21" ry="4.2" fill="#d8e8f5"/>' +
  '<ellipse class="rp" cx="40" cy="41.2" rx="20" ry="4" fill="none" stroke="#2f8fd8" stroke-width=".8"/>' +
  '<ellipse class="rp" cx="40" cy="41.2" rx="20" ry="4" fill="none" stroke="#2f8fd8" stroke-width=".8" style="animation-delay:.9s"/>' +
  '<path d="M35 40q0-8 5-8t5 8Z" fill="url(#pa-b)" stroke="#c3cad2" stroke-width=".8"/>' +
  '<path class="stream" d="M40 31q-1-5-5-4t-5 12" fill="none" stroke="#2f8fd8" stroke-width="1.5" stroke-linecap="round"/>' +
  '<path class="stream" d="M40 31q1-5 5-4t5 12" fill="none" stroke="#2f8fd8" stroke-width="1.5" stroke-linecap="round"/>' +
  '<path class="stream" d="M40 31v-3" fill="none" stroke="#2f8fd8" stroke-width="1.5" stroke-linecap="round"/>' +
  '<circle class="led" cx="40" cy="76" r="1.3"/></g>';

export const catHead = (cx, cy) =>
  `<g class="cat"><path class="ear" d="M${cx - 9} ${cy - 4}l1.5-9 6 5Z" fill="#6b5a4a"/><path d="M${cx + 9} ${cy - 4}l-1.5-9-6 5Z" fill="#6b5a4a"/>` +
  `<ellipse cx="${cx}" cy="${cy}" rx="10.5" ry="8.5" fill="#7d6a58"/><ellipse class="eye" cx="${cx - 4}" cy="${cy - 1}" rx="1.6" ry="2" fill="#e8d36a"/>` +
  `<ellipse class="eye" cx="${cx + 4}" cy="${cy - 1}" rx="1.6" ry="2" fill="#e8d36a"/><path d="M${cx - 1.2} ${cy + 3}h2.4L${cx} ${cy + 4.4}Z" fill="#f2b8b0"/>` +
  `<path d="M${cx - 13} ${cy + 3}h6M${cx + 13} ${cy + 3}h-6" stroke="#ddd" stroke-width=".6"/></g>`;

// o: { camera, level: 0..1 }: the litter's surface in the drum rises with its level.
export const litterArt = (o) => {
  const top = 61 - Math.max(0.1, Math.min(1, o.level)) * 9;
  return (
    '<ellipse cx="40" cy="89" rx="34" ry="4" fill="url(#pa-fl)"/>' +
    '<rect x="6" y="12" width="68" height="72" rx="20" fill="url(#pa-b)" stroke="#c3cad2" stroke-width="1.1"/>' +
    '<rect x="30" y="16" width="20" height="5" rx="2.5" fill="#1d2632"/><circle class="led" cx="40" cy="18.5" r="1.2"/>' +
    (o.camera ? '<circle cx="62" cy="20" r="2.6" fill="#1d2632" stroke="#8f9aa6" stroke-width=".6"/><circle class="rec" cx="66" cy="18" r=".8" fill="#db4437"/>' : "") +
    '<clipPath id="pa-op"><ellipse cx="40" cy="45" rx="23" ry="20"/></clipPath>' +
    '<ellipse cx="40" cy="45" rx="24.5" ry="21.5" fill="#e3e8ed" stroke="#c3cad2" stroke-width=".8"/>' +
    '<g clip-path="url(#pa-op)"><rect x="14" y="22" width="52" height="46" fill="url(#pa-dk)"/>' +
    `<g class="drum"><path d="M17 44a23 20 0 0 0 46 0" fill="none" stroke="#4b5560" stroke-width="1"/>` +
    `<path d="M17 ${top.toFixed(1)}q23-5 46 0V68H17Z" fill="url(#pa-sd)"/><path d="M22 34l6 4M58 34l-6 4" stroke="#4b5560" stroke-width="1.2"/></g>` +
    `${catHead(40, 48)}</g>` +
    '<path d="M18 40a23 20 0 0 1 14-15" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".5"/>' +
    [0, 1, 2].map((i) => `<circle class="grit" cx="${37 + i * 3}" cy="68" r="1.1" fill="#9c8457" style="animation-delay:${(i * 0.12).toFixed(2)}s"/>`).join("") +
    '<rect class="bin" x="16" y="70" width="48" height="9" rx="3" fill="#eef1f4" stroke="#aab3bd" stroke-width=".8"/>' +
    '<rect x="34" y="73.5" width="12" height="2" rx="1" fill="#aab3bd"/>'
  );
};

// Litter-Robot: [body edge, body light, outline, details] of the black and white LR4 / LR5 and the LR3 Connect.
export const ROBOT_COLORS = {
  black: ["#2b3139", "#4c5560", "#1f252c", "#59636e"],
  white: ["#d5dbe2", "#ffffff", "#c3cad2", "#aab3bd"],
  lr3: ["#cfc9bb", "#ece8de", "#b8b1a1", "#9a9384"],
};

// The waste drawer's fill (%), on the drawer: green, orange from 80 %, red when full.
export const drawerGauge = (y, waste, track) =>
  waste === null
    ? ""
    : `<rect x="20" y="${y}" width="40" height="2.2" rx="1.1" fill="${track}" opacity=".5"/>` +
      `<rect x="20" y="${y}" width="${(40 * Math.max(0, Math.min(1, waste / 100))).toFixed(1)}" height="2.2" rx="1.1" style="fill:var(--pc-${waste >= 100 ? "crit" : waste >= 80 ? "warn" : "ok"})"/>`;

export const robotGrit = (y) => [0, 1, 2].map((i) => `<circle class="grit" cx="${37 + i * 3}" cy="${y}" r="1.2" fill="#9c8457" style="animation-delay:${(i * 0.12).toFixed(2)}s"/>`).join("");

// o: { lr3, color: "black" | "white", level: 0..1, waste: % or null }. The LR4 / LR5: a hood with an arched entry
// on its base, the panel on top, the step and the waste drawer below; the LR3 Connect: a round globe on its base.
// The globe turns while it cycles; the night light rings the entry.
export const robotArt = (o) => {
  const c = ROBOT_COLORS[o.lr3 ? "lr3" : o.color];
  const body = `<linearGradient id="pa-rb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c[0]}"/><stop offset=".45" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[0]}"/></linearGradient>`;
  const sand = (top, x, w) => `<path d="M${x} ${top.toFixed(1)}q${w / 2}-5 ${w} 0V70H${x}Z" fill="url(#pa-sd)"/>`;
  if (o.lr3)
    return (
      `${body}<ellipse cx="40" cy="89" rx="34" ry="4" fill="url(#pa-fl)"/>` +
      '<path d="M8 58h64l-3 24a5 5 0 0 1-5 4H16a5 5 0 0 1-5-4Z" fill="#5b5e63" stroke="#46494d" stroke-width=".8"/>' +
      `<circle cx="40" cy="37" r="30" fill="url(#pa-rb)" stroke="${c[2]}" stroke-width=".9"/>` +
      '<ellipse class="halo" cx="40" cy="40" rx="22" ry="20" fill="url(#pa-gw)"/>' +
      '<clipPath id="pa-op"><ellipse cx="40" cy="41" rx="17" ry="16"/></clipPath>' +
      '<g clip-path="url(#pa-op)"><rect x="20" y="22" width="40" height="38" fill="url(#pa-dk)"/>' +
      `<g class="drum lr3"><circle cx="40" cy="37" r="22" fill="none" stroke="#3f4852" stroke-width="1"/>${sand(52 - o.level * 8, 16, 48)}</g>${catHead(40, 46)}</g>` +
      '<ellipse class="ring" cx="40" cy="41" rx="18" ry="17" fill="none" stroke="#7fb3ff" stroke-width="1.6"/>' +
      `<ellipse cx="40" cy="41" rx="18.5" ry="17.5" fill="none" stroke="${c[2]}" stroke-width="1"/>` +
      '<path d="M18 26a30 30 0 0 1 16-14" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".5"/>' +
      '<rect x="28" y="60" width="24" height="5" rx="2" fill="#3f4246"/><circle class="led" cx="33" cy="62.5" r="1.1"/><circle cx="40" cy="62.5" r=".9" fill="#7c8086"/><circle cx="46" cy="62.5" r=".9" fill="#7c8086"/>' +
      robotGrit(66) +
      '<rect class="bin" x="17" y="68" width="46" height="13" rx="3" fill="#4b4e53" stroke="#6c7076" stroke-width=".7"/>' +
      drawerGauge(76, o.waste, "#6c7076")
    );
  return (
    `${body}<ellipse cx="40" cy="89" rx="34" ry="4" fill="url(#pa-fl)"/>` +
    `<rect x="9" y="52" width="62" height="34" rx="9" fill="url(#pa-rb)" stroke="${c[2]}" stroke-width=".9"/>` +
    `<path d="M9 54V33a31 31 0 0 1 62 0v21Z" fill="url(#pa-rb)" stroke="${c[2]}" stroke-width=".9"/>` +
    `<rect x="31" y="5.5" width="18" height="4.5" rx="2.2" fill="${c[2]}"/><circle cx="35" cy="7.7" r=".9" fill="${c[3]}"/><circle class="led" cx="40" cy="7.7" r="1.1"/><circle cx="45" cy="7.7" r=".9" fill="${c[3]}"/>` +
    '<ellipse class="halo" cx="40" cy="38" rx="25" ry="24" fill="url(#pa-gw)"/>' +
    '<clipPath id="pa-op"><path d="M22 54V36a18 18 0 0 1 36 0v18Z"/></clipPath>' +
    `<path d="M20.5 55V36a19.5 19.5 0 0 1 39 0v19Z" fill="${c[2]}" opacity=".6"/>` +
    '<g clip-path="url(#pa-op)"><rect x="18" y="14" width="44" height="42" fill="url(#pa-dk)"/>' +
    `<g class="drum lr4"><circle cx="40" cy="40" r="24" fill="none" stroke="#3f4852" stroke-width="1"/>${sand(54 - o.level * 8, 14, 52)}<path d="M27 26l5 4M53 26l-5 4" stroke="#4b5560" stroke-width="1.2"/></g>${catHead(40, 45)}</g>` +
    '<path class="ring" d="M20.5 55V36a19.5 19.5 0 0 1 39 0v19" fill="none" stroke="#7fb3ff" stroke-width="1.6"/>' +
    '<path d="M24 34a16 16 0 0 1 9-11" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".35"/>' +
    `<path d="M21 56h38l-2.5 6h-33Z" fill="${c[2]}" stroke="${c[3]}" stroke-width=".5"/>` +
    robotGrit(64) +
    `<rect class="bin" x="15" y="66" width="50" height="14" rx="3" fill="${c[0]}" stroke="${c[3]}" stroke-width=".7"/>` +
    `<rect x="34" y="68.5" width="12" height="2" rx="1" fill="${c[3]}"/>` +
    drawerGauge(75, o.waste, c[3])
  );
};

export const ARTS = { feeder: feederArt, fountain: fountainArt, litter: litterArt, robot: robotArt };

// The picture of a device: `cls` are its animation classes (feeding, on, dry, cleaning, cat, full) and the LED's
// colour (ok, warn, crit, idle, busy); `uid` keeps its ids apart from the other devices' in the same card.
export const art = (kind, o, cls, uid) =>
  `<div class="art ${esc(cls)}" aria-hidden="true"><svg viewBox="0 0 80 94"><defs>${ART_DEFS}</defs>${ARTS[kind](o)}</svg></div>`.replace(
    /(id="|url\(#)(pa-[a-z0-9]+)/g,
    `$1$2-${uid}`
  );

// Camera models: the YumShare feeders (D4H, D4SH) and the camera litter boxes (Purobot Ultra / Max Pro, T5 to T7).
export const hasCamera = (dev) => !!dev.entities.camera || /yumshare|camera|cam\b|d4h|d4sh|ultra|max pro|\bt[567]\b/i.test(dev.model);
// Dual-hopper feeders: the Gemini (D4S) and the YumShare Dual-hopper (D4SH).
export const isDual = (dev) => !!(dev.entities.food1 || dev.entities.food2) || /gemini|dual|d4sh?\b/i.test(dev.model);

// ---------------------------------------------------------------------------
// Illustrated header: a pet corner (wall, window with a cat on its sill, paw prints, a pink bowl) drawn at the
// right of a 90 px banner, over a 10 px parquet strip edge to edge, with the card's devices standing on it (their
// own pictures and animations). The left of the banner holds the icon and the title.
// ---------------------------------------------------------------------------

// PetKit's logo, embedded by the build from images/petkit.png (left as is in the source).
export const PETKIT_LOGO = "__PETKIT_LOGO__";

// The scene's 200 × 80 background, day or night; `bowl`: the pink bowl's x (null: no bowl).
export const petCornerSvg = (n, bowl) =>
  `<rect width="200" height="80" fill="${n ? "#2c2a36" : "#f6efe6"}"/><rect x="0" y="50" width="200" height="1.4" fill="${n ? "#3a3848" : "#e6d8c4"}"/>` +
  `<rect x="20" y="8" width="34" height="30" rx="1.5" fill="${n ? "#1b2f52" : "#bfe0f7"}" stroke="${n ? "#4a5568" : "#fff"}" stroke-width="1.6"/>` +
  (n ? '<circle cx="45" cy="16" r="2.4" fill="#f3eed2"/><g fill="#fff" opacity=".8"><circle cx="27" cy="14" r=".5"/><circle cx="34" cy="24" r=".4"/><circle cx="48" cy="28" r=".4"/></g>' : "") +
  `<rect x="16" y="38" width="42" height="3" fill="${n ? "#4a4860" : "#e2d2bc"}"/>` +
  `<g transform="translate(30 38)" fill="${n ? "#5c5a70" : "#7d6b5a"}"><ellipse cx="6" cy="-4" rx="7" ry="4.5"/><circle cx="12" cy="-9" r="3.4"/>` +
  `<path d="M10 -12 l1 -3 l2 2.4z M13 -12 l1.6 -3 l1 3z"/><path class="pb-tail" d="M-1 -3 q-6 -2 -5 -9" stroke="${n ? "#5c5a70" : "#7d6b5a"}" stroke-width="1.6" fill="none"/></g>` +
  `<g fill="${n ? "#4a4860" : "#e6d8c4"}" opacity=".9"><circle cx="40" cy="62" r="1.6"/><circle cx="46" cy="58" r="1.6"/><circle cx="52" cy="62" r="1.6"/><ellipse cx="46" cy="66" rx="3" ry="2.4"/></g>` +
  (bowl === null
    ? ""
    : `<ellipse cx="${bowl.toFixed(1)}" cy="76" rx="26" ry="5" fill="${n ? "#4a3a50" : "#d4537e"}" opacity=".9"/><ellipse cx="${bowl.toFixed(1)}" cy="74" rx="20" ry="3" fill="${n ? "#5a4a60" : "#f4c0d1"}"/>`);

// Each picture's drawn area in its 80 × 94 box (its floor at the bottom) and its largest size in the scene.
export const BANNER_ART = {
  feeder: { vb: [14, 4, 52, 83], box: [62, 76] },
  dual: { vb: [7, 4, 66, 83], box: [70, 76] },
  fountain: { vb: [7, 7, 66, 70], box: [56, 58] },
  litter: { vb: [4, 11, 72, 74], box: [96, 72] },
  robot: { vb: [6, 4, 68, 83], box: [96, 72] },
};

// The devices side by side up to `right` (x 192, or left of the mini card's detail button): up to three, drawn
// smaller when they would not fit; the pink bowl stays on the floor left of them when there is room.
export const bannerLayout = (items, right = 192) => {
  const gap = 3;
  const sized = items.slice(0, 3).map((it) => {
    const a = BANNER_ART[it.kind === "feeder" && it.o.dual ? "dual" : it.kind];
    let h = a.box[1];
    let w = (h * a.vb[2]) / a.vb[3];
    if (w > a.box[0]) {
      w = a.box[0];
      h = (w * a.vb[3]) / a.vb[2];
    }
    return { ...it, vb: a.vb, w, h };
  });
  const gaps = gap * (sized.length - 1);
  const natural = sized.reduce((t, it) => t + it.w, 0);
  const k = Math.min(sized.length > 2 ? 0.8 : 1, (right - 40 - gaps) / natural);
  let x = right - natural * k - gaps;
  const start = x;
  for (const it of sized) {
    it.w *= k;
    it.h *= k;
    it.x = x;
    x += it.w + gap;
  }
  const bowl = Math.min(74, start - 28);
  return { items: sized, bowl: bowl >= 44 ? bowl : null };
};

// The banner's picture: the corner and the devices (`items`: { kind, o, cls }), ids suffixed with `uid`.
export const bannerSvg = (items, night, uid, right) => {
  const l = bannerLayout(items, right);
  const devs = l.items
    .map((it, i) => {
      const svg = `<svg viewBox="${it.vb.join(" ")}" x="${it.x.toFixed(1)}" y="${(80 - it.h).toFixed(1)}" width="${it.w.toFixed(1)}" height="${it.h.toFixed(1)}" style="width:${it.w.toFixed(1)}px;height:${it.h.toFixed(1)}px" preserveAspectRatio="xMidYMax meet" overflow="visible"><defs>${ART_DEFS}</defs>${ARTS[it.kind](it.o)}</svg>`;
      return `<g class="art ${esc(it.cls)}">${svg.replace(/(id="|url\(#)(pa-[a-z0-9]+)/g, `$1$2-${uid}-h${i}`)}</g>`;
    })
    .join("");
  return `<svg class="scene" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">${petCornerSvg(night, l.bowl)}${devs}</svg>`;
};

// Night picture: forced by illustration_theme, else Home Assistant's dark mode alone (a light theme keeps the day
// picture after sunset).
export const isNight = (hass, config) => {
  const theme = config.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

// How long a feeder shows its dispensing after a manual feed or a meal counted (no integration reports the
// dispensing itself, but Jezza34000's `feeding` sensor).
export const FEED_ANIM_MS = 15000;
