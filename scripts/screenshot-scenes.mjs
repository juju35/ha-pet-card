// The README captures rendered by scripts/screenshots.mjs: one entry per PNG (`shots`) and per GIF (`gifs`).
// Kept apart from the renderer so the tests can check them without a browser.
// `states` overrides mock states of the scene; `clicks` are clicked once the card is mounted.

const pair = ["solo", "fountain"];
const alerts = {
  "binary_sensor.distributeur_cuisine_niveau": { state: "on" },
  "sensor.distributeur_cuisine_deshydratant": { state: "0" },
  "binary_sensor.fontaine_salon_niveau_eau": { state: "on" },
  "sensor.fontaine_salon_filtre": { state: "4" },
};

// Every capture is rendered in both themes: each light shot gets a `-dark` twin with the exact same setup.
const lightShots = [
  { file: "card", type: "pet-card", theme: "light", width: 460, config: { devices: pair } },
  { file: "card-gemini", type: "pet-card", theme: "light", width: 460, config: { devices: ["gemini"] } },
  { file: "card-alerts", type: "pet-card", theme: "light", width: 460, config: { devices: pair }, states: alerts },
  { file: "card-feed", type: "pet-card", theme: "light", width: 460, config: { devices: pair }, clicks: ['[data-action="feed"]'] },
  { file: "card-feed-gemini", type: "pet-card", theme: "light", width: 460, config: { devices: ["gemini"] }, clicks: ['[data-action="feed"]'] },
  { file: "mini-card", type: "pet-mini-card", theme: "light", width: 380, config: {} },
  { file: "mini-card-zoom", type: "pet-mini-card", theme: "light", width: 460, config: { devices: pair }, clicks: [".zoom"] },
];
const withDarkTwins = (light) => [...light, ...light.map((s) => ({ ...s, file: `${s.file}-dark`, theme: "dark" }))];
export const shots = withDarkTwins(lightShots);

// One looping GIF per animation: each scenario replays `events` (a click on a card element, or a state update)
// at fixed times; every animation is paused and stepped frame by frame, so the GIF is identical whatever the
// machine's speed. `measure` is clicked once beforehand to size the frame on the tallest state of the card.
const lightGifs = [
  {
    file: "mini-card-zoom",
    type: "pet-mini-card",
    theme: "light",
    width: 460,
    config: { devices: pair },
    seconds: 4,
    measure: [".zoom"],
    events: [
      { at: 0.6, click: ".zoom" },
      { at: 2.9, click: ".zoom" },
    ],
  },
  {
    file: "card-feed",
    type: "pet-card",
    theme: "light",
    width: 460,
    config: { devices: ["solo"] },
    seconds: 5,
    events: [
      { at: 0.5, click: '[data-action="feed"]' },
      { at: 1.6, click: '[data-option="3/10th Cup (30g)"]' },
      { at: 2.6, click: '[data-option="1/2 Cup (50g)"]' },
      { at: 3.8, click: '[data-action="confirm_cancel"]' },
    ],
  },
  {
    file: "card-levels",
    type: "pet-card",
    theme: "light",
    width: 460,
    config: { devices: ["fountain"] },
    seconds: 4,
    events: [
      { at: 0.5, states: { "binary_sensor.fontaine_salon_niveau_eau": { state: "on" }, "sensor.fontaine_salon_filtre": { state: "4" } } },
      { at: 2.3, states: { "binary_sensor.fontaine_salon_niveau_eau": { state: "off" }, "sensor.fontaine_salon_filtre": { state: "100" } } },
    ],
  },
];
export const gifs = withDarkTwins(lightGifs);
