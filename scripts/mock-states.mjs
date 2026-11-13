// Mock Home Assistant registries and states shaped like the PetKit integrations (RobertD502's
// https://github.com/RobertD502/home-assistant-petkit, then Jezza34000's), used to render the screenshots and in the tests.
// Entity ids are in French on purpose: the cards never rely on them, only on platform + translation_key.
// Neutral device names only (no pet or person names in the published screenshots).
export const mockRegistry = (platform) => {
  const r = { states: {}, entities: {}, devices: {} };
  r.device = (id, name, model) => (r.devices[id] = { id, name, model, name_by_user: null, manufacturer: "PetKit" });
  r.entity = (entity_id, device_id, translation_key, state, attributes = {}, ago = 0) => {
    r.entities[entity_id] = { entity_id, device_id, platform, translation_key };
    const at = new Date(Date.now() - ago * 1000).toISOString();
    r.states[entity_id] = { entity_id, state: String(state), attributes, last_changed: at, last_updated: at };
  };
  return r;
};

const { states, entities, devices, device, entity } = mockRegistry("petkit");
export { devices, entities, states };

export const FEEDER_OPTIONS = ["", "1/10th Cup (10g)", "1/5th Cup (20g)", "3/10th Cup (30g)", "2/5th Cup (40g)", "1/2 Cup (50g)"];

// Fresh Element Solo: one hopper, manual feed through a select of fixed amounts, call button.
device("solo", "Kitchen feeder", "Fresh Element Solo");
entity("binary_sensor.distributeur_cuisine_niveau", "solo", "food_level", "off", { device_class: "problem" });
entity("sensor.distributeur_cuisine_statut", "solo", "feeder_status", "normal");
entity("sensor.distributeur_cuisine_erreur", "solo", "error", "no_error");
entity("sensor.distributeur_cuisine_deshydratant", "solo", "desiccant_days_remaining", "23", { unit_of_measurement: "d" });
entity("sensor.distributeur_cuisine_piles", "solo", "battery_status", "normal");
entity("sensor.distributeur_cuisine_distribue", "solo", "dispensed", "40", { unit_of_measurement: "g" });
entity("sensor.distributeur_cuisine_prevu", "solo", "planned", "60", { unit_of_measurement: "g" });
entity("sensor.distributeur_cuisine_distributions", "solo", "times_dispensed", "2", {}, 2 * 3600 + 600);
entity("select.distributeur_cuisine_repas_manuel", "solo", "manual_feed", "", { options: FEEDER_OPTIONS });
entity("button.distributeur_cuisine_reinit_deshydratant", "solo", "reset_desiccant", "unknown");
entity("button.distributeur_cuisine_appel", "solo", "call_pet", "unknown");

// Fresh Element Gemini: two hoppers, manual feed as "portions1,portions2" text, eaten amounts.
device("gemini", "Twin feeder", "Fresh Element Gemini");
entity("binary_sensor.distributeur_double_reservoir_1", "gemini", "food_level_hopper_one", "off", { device_class: "problem" });
entity("binary_sensor.distributeur_double_reservoir_2", "gemini", "food_level_hopper_two", "on", { device_class: "problem" });
entity("sensor.distributeur_double_statut", "gemini", "feeder_status", "normal");
entity("sensor.distributeur_double_erreur", "gemini", "error", "no_error");
entity("sensor.distributeur_double_deshydratant", "gemini", "desiccant_days_remaining", "4", { unit_of_measurement: "d" });
entity("sensor.distributeur_double_distribue", "gemini", "dispensed", "55", { unit_of_measurement: "g" });
entity("sensor.distributeur_double_prevu", "gemini", "planned", "80", { unit_of_measurement: "g" });
entity("sensor.distributeur_double_distributions", "gemini", "times_dispensed", "3", {}, 45 * 60);
entity("sensor.distributeur_double_mange", "gemini", "amount_eaten", "48", { unit_of_measurement: "g" });
entity("sensor.distributeur_double_repas", "gemini", "times_eaten", "4");
entity("sensor.distributeur_double_gamelle", "gemini", "food_in_bowl", "12", { unit_of_measurement: "g" });
entity("text.distributeur_double_repas_manuel", "gemini", "manual_feed", "0,0", { pattern: "^([0-9]|10),([0-9]|10)$" });
entity("button.distributeur_double_reinit_deshydratant", "gemini", "reset_desiccant", "unknown");

// Eversweet 3 Pro water fountain.
device("fountain", "Living room fountain", "Eversweet 3 Pro");
entity("binary_sensor.fontaine_salon_niveau_eau", "fountain", "water_level", "off", { device_class: "problem" });
entity("sensor.fontaine_salon_filtre", "fountain", "filter", "72", { unit_of_measurement: "%" });
entity("select.fontaine_salon_mode", "fountain", "mode", "smart", { options: ["normal", "smart"] });
entity("switch.fontaine_salon_alimentation", "fountain", "power", "on");
entity("switch.fontaine_salon_lumiere", "fountain", "light", "on");
entity("switch.fontaine_salon_ne_pas_deranger", "fountain", "do_not_disturb", "off");
entity("sensor.fontaine_salon_eau_purifiee", "fountain", "purified_water_today", "14");
entity("sensor.fontaine_salon_energie", "fountain", "energy_usage", "0.012", { unit_of_measurement: "kWh" });
entity("sensor.fontaine_salon_derniere_maj", "fountain", "last_data_update", new Date(Date.now() - 300000).toISOString());
entity("button.fontaine_salon_reinit_filtre", "fountain", "reset_filter", "unknown");

// Jezza34000's integration (https://github.com/Jezza34000/homeassistant_petkit), same `petkit` domain, its own
// translation keys. YumShare Dual-Hopper with Camera (D4SH): two hoppers, one manual feed text per hopper (portions),
// per-hopper amounts without a unit, camera.
const CAMERA_PICTURE = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a9aa8"/><stop offset="1" stop-color="#4f5d68"/></linearGradient></defs><rect width="320" height="180" fill="url(#f)"/><rect y="118" width="320" height="62" fill="#6b5a4a"/><ellipse cx="160" cy="132" rx="70" ry="18" fill="#d7dde2"/><ellipse cx="160" cy="128" rx="54" ry="11" fill="#9c6b3f"/><circle cx="140" cy="126" r="4" fill="#7a4f2a"/><circle cx="168" cy="129" r="4" fill="#7a4f2a"/><circle cx="182" cy="125" r="3.5" fill="#7a4f2a"/><text x="10" y="20" font-family="monospace" font-size="11" fill="#fff" opacity=".8">2026-11-13 08:12</text></svg>`
).toString("base64")}`;
device("d4sh", "Hallway feeder", "YumShare Dual-hopper with Camera");
entity("binary_sensor.distributeur_couloir_niveau_1", "d4sh", "food_level_1", "off", { device_class: "problem" });
entity("binary_sensor.distributeur_couloir_niveau_2", "d4sh", "food_level_2", "off", { device_class: "problem" });
entity("sensor.distributeur_couloir_statut", "d4sh", "device_status", "online_ac", { options: ["offline", "online_ac", "online_battery", "unknown"] });
entity("sensor.distributeur_couloir_erreur", "d4sh", "error_message", "No error");
entity("sensor.distributeur_couloir_alimentation", "d4sh", "power_type", "main_power");
entity("sensor.distributeur_couloir_batterie", "d4sh", "battery_level", "unknown", { unit_of_measurement: "%" });
entity("sensor.distributeur_couloir_deshydratant", "d4sh", "desiccant_left_days", "17", { unit_of_measurement: "d" });
entity("sensor.distributeur_couloir_distributions", "d4sh", "times_dispensed", "2", {}, 3 * 3600 + 900);
entity("sensor.distributeur_couloir_distribue_1", "d4sh", "total_dispensed_hopper_1", "3");
entity("sensor.distributeur_couloir_distribue_2", "d4sh", "total_dispensed_hopper_2", "2");
entity("sensor.distributeur_couloir_prevu_1", "d4sh", "total_planned_hopper_1", "4");
entity("sensor.distributeur_couloir_prevu_2", "d4sh", "total_planned_hopper_2", "4");
entity("sensor.distributeur_couloir_repas", "d4sh", "times_eaten", "3");
entity("sensor.distributeur_couloir_gamelle", "d4sh", "food_bowl_percentage", "35", { unit_of_measurement: "%" });
entity("text.distributeur_couloir_repas_manuel_1", "d4sh", "manual_feed_dual_h1", "0", { min: 1, max: 2, mode: "text", pattern: "^(1|2|3|4|5|6|7|8|9|10|0)$" });
entity("text.distributeur_couloir_repas_manuel_2", "d4sh", "manual_feed_dual_h2", "0", { min: 1, max: 2, mode: "text", pattern: "^(1|2|3|4|5|6|7|8|9|10|0)$" });
entity("button.distributeur_couloir_reinit_deshydratant", "d4sh", "reset_desiccant", "unknown");
entity("button.distributeur_couloir_croquettes_remplies", "d4sh", "food_replenished", "unknown");
entity("button.distributeur_couloir_annuler_repas", "d4sh", "cancel_manual_feed", "unknown");
entity("switch.distributeur_couloir_camera", "d4sh", "camera", "on");
entity("camera.distributeur_couloir", "d4sh", "camera", "idle", { entity_picture: CAMERA_PICTURE });

// Eversweet Max (Cordless) (CTW3), Jezza34000's integration: battery, pump, no mode select.
device("ctw3", "Bedroom fountain", "Eversweet Max (Cordless)");
entity("binary_sensor.fontaine_chambre_manque_eau", "ctw3", "lack_warning", "off", { device_class: "problem" });
entity("binary_sensor.fontaine_chambre_filtre_a_changer", "ctw3", "replace_filter", "off", { device_class: "problem" });
entity("binary_sensor.fontaine_chambre_piles_faibles", "ctw3", "low_battery", "off", { device_class: "problem" });
entity("binary_sensor.fontaine_chambre_pompe", "ctw3", "pump_running", "on", { device_class: "running" });
entity("sensor.fontaine_chambre_filtre", "ctw3", "filter_percent", "64", { unit_of_measurement: "%" });
entity("sensor.fontaine_chambre_filtre_jours", "ctw3", "filter_left_days", "19", { unit_of_measurement: "d" });
entity("sensor.fontaine_chambre_eau_purifiee", "ctw3", "purified_water", "9");
entity("sensor.fontaine_chambre_energie", "ctw3", "today_pump_run_time", "0.0071", { unit_of_measurement: "kWh" });
entity("sensor.fontaine_chambre_batterie", "ctw3", "battery", "82", { unit_of_measurement: "%" });
entity("switch.fontaine_chambre_alimentation", "ctw3", "power", "on");
entity("switch.fontaine_chambre_voyant", "ctw3", "indicator_light", "on");
entity("switch.fontaine_chambre_ne_pas_deranger", "ctw3", "do_not_disturb", "off");
entity("button.fontaine_chambre_reinit_filtre", "ctw3", "reset_filter", "unknown");
entity("button.fontaine_chambre_pause", "ctw3", "pause", "unknown");

// A PetKit litter box: not supported yet, the cards leave it out.
device("litter", "Litter box", "PURA MAX / PURA MAX 2");
entity("sensor.litiere_niveau", "litter", "litter_level", "80", { unit_of_measurement: "%" });
entity("binary_sensor.litiere_bac_plein", "litter", "wastebin", "off");
// Entities every device of Jezza34000's integration has: they do not make a feeder or a fountain.
entity("sensor.litiere_statut", "litter", "device_status", "online_ac");
entity("sensor.litiere_erreur", "litter", "error_message", "No error");
