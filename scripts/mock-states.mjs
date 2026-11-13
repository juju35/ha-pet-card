// Mock Home Assistant registries and states shaped like the PetKit integration
// (https://github.com/RobertD502/home-assistant-petkit), used to render the screenshots and in the tests.
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

// A PetKit litter box: not supported yet, the cards leave it out.
device("litter", "Litter box", "PURA MAX / PURA MAX 2");
entity("sensor.litiere_niveau", "litter", "litter_level", "80", { unit_of_measurement: "%" });
entity("binary_sensor.litiere_bac_plein", "litter", "wastebin", "off");
