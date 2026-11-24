// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { VERSION } from "./core.js";
import { PetCard } from "./full-card.js";
import { PetMiniCard } from "./mini-card.js";
import { PetCardEditor, PetMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
};
define("pet-card", PetCard);
define("pet-mini-card", PetMiniCard);
define("pet-card-editor", PetCardEditor);
define("pet-mini-card-editor", PetMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  { type: "pet-card", name: "Pet Card", description: "Smart pet devices (PetKit feeders, water fountains and litter boxes, Litter-Robot): food, water, filter, litter, waste bin, manual feed." },
  { type: "pet-mini-card", name: "Pet Mini Card", description: "Compact overview of smart pet devices (PetKit feeders, water fountains and litter boxes, Litter-Robot)." },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-pet-card" });
}

console.info(`%c PET-CARD %c v${VERSION} `, "color: white; background: #ef8f3a; font-weight: 700;", "color: #ef8f3a; background: white; font-weight: 700;");
