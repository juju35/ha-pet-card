# Changelog

## 1.0.0 - 2026-11-13

First release: **Pet Card** and **Pet Mini Card**, for the feeders and water fountains of the [PetKit integration](https://github.com/RobertD502/home-assistant-petkit). Built from the integration's source and checked on mock data only: not tested on real devices yet.

### Features
- Automatic discovery of the PetKit feeders and fountains through the Home Assistant registries (platform, translation key, device), whatever the entity ids or the language; `devices` picks some of them, by name or device id.
- Feeders: food level (each hopper on a Gemini), status and errors, dispensed today against the planned amount, meals today and the last one, eaten and in the bowl when reported, desiccant days with a reset button.
- Manual feed in an in-card popup at the top of the card: the feeder's fixed amounts, a gram stepper or a portion stepper per hopper, depending on the model.
- Fountains: water level, filter with a reset button, mode, purified water and energy today, power, light and do not disturb.
- Status chip per device and for the whole card; the mini card lists one row per device and what needs doing.
- Mini card detail button switching to the full card and back.
- Visual editors for both cards; 22 languages, English in the bundle and the others loaded on demand.
