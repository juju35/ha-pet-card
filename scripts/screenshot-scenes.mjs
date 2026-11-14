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
  { file: "card-yumshare", type: "pet-card", theme: "light", width: 460, config: { devices: ["d4sh", "ctw3"] } },
  { file: "card-alerts", type: "pet-card", theme: "light", width: 460, config: { devices: pair }, states: alerts },
  { file: "card-feed", type: "pet-card", theme: "light", width: 460, config: { devices: pair }, clicks: ['[data-action="feed"]'] },
  { file: "card-feed-gemini", type: "pet-card", theme: "light", width: 460, config: { devices: ["gemini"] }, clicks: ['[data-action="feed"]'] },
  { file: "card-litter", type: "pet-card", theme: "light", width: 460, config: { devices: ["t4", "litter"] } },
  { file: "card-litter-robot", type: "pet-card", theme: "light", width: 460, config: { devices: ["lr4", "lr3"] } },
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
  // The illustrations' animations, driven by the integrations' own sensors: the YumShare dispensing (Jezza34000's
  // `feeding`), the Eversweet's pump stopping and starting again, the litter box cleaning then a cat coming in.
  {
    file: "card-dispense",
    type: "pet-card",
    theme: "light",
    width: 460,
    config: { devices: ["d4sh"], show_camera: false, show_stats: false },
    seconds: 4,
    events: [
      { at: 0.6, states: { "binary_sensor.distributeur_couloir_distribution": { state: "on" } } },
      { at: 3.2, states: { "binary_sensor.distributeur_couloir_distribution": { state: "off" }, "sensor.distributeur_couloir_distribue_1": { state: "4" } } },
    ],
  },
  {
    file: "card-fountain",
    type: "pet-card",
    theme: "light",
    width: 460,
    config: { devices: ["ctw3"], show_stats: false, show_controls: false },
    seconds: 4,
    events: [
      { at: 1.6, states: { "binary_sensor.fontaine_chambre_pompe": { state: "off" } } },
      { at: 2.8, states: { "binary_sensor.fontaine_chambre_pompe": { state: "on" } } },
    ],
  },
  {
    file: "card-litter-clean",
    type: "pet-card",
    theme: "light",
    width: 460,
    config: { devices: ["t4"], show_stats: false },
    seconds: 7,
    events: [
      { at: 0.5, states: { "sensor.litiere_sdb_etat": { state: "cleaning" } } },
      { at: 4.6, states: { "sensor.litiere_sdb_etat": { state: "idle" }, "binary_sensor.litiere_sdb_occupee": { state: "on" } } },
      { at: 6.4, states: { "binary_sensor.litiere_sdb_occupee": { state: "off" } } },
    ],
  },
  {
    file: "card-litter-robot-cycle",
    type: "pet-card",
    theme: "light",
    width: 460,
    config: { devices: ["lr4"], show_stats: false },
    seconds: 7,
    events: [
      { at: 0.5, states: { "sensor.litter_robot_buanderie_statut": { state: "ccp" }, "vacuum.litter_robot_buanderie": { state: "cleaning" } } },
      {
        at: 4.7,
        states: {
          "sensor.litter_robot_buanderie_statut": { state: "cd" },
          "vacuum.litter_robot_buanderie": { state: "docked" },
          "sensor.litter_robot_buanderie_tiroir": { state: "52" },
          "select.litter_robot_buanderie_veilleuse": { state: "on" },
        },
      },
      { at: 6.3, states: { "sensor.litter_robot_buanderie_statut": { state: "rdy" } } },
    ],
  },
];
export const gifs = withDarkTwins(lightGifs);
