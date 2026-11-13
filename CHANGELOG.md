# Changelog

## 1.1.0 - 2026-11-13

### Features
- Support for [Jezza34000's PetKit integration](https://github.com/Jezza34000/homeassistant_petkit), next to RobertD502's: both use the `petkit` domain, and the cards read each one's own translation keys. Built from the integration's source, not tested on real devices yet ([#4](https://github.com/juju35/ha-pet-card/issues/4), suggested by @mielikki33).
- Dual-hopper feeders (YumShare Dual-hopper with Camera D4SH, Fresh Element Gemini D4S): each hopper's food level, food dispensed today against the plan per hopper (in portions), and a manual feed with one portion stepper per hopper, sent to each hopper's own entity.
- Single-hopper feeders of that integration: manual feed through the amounts the feeder accepts (grams, or portions up to 10).
- Feeder camera (YumShare feeders): its latest picture at the top of the feeder, a click opens the live stream; hidden while the camera is switched off, or with the new `show_camera: false` option (also in the visual editor).
- Feeder status from that integration's device status, error message and power type (offline, on batteries, battery low), the bowl fill and the battery level while on batteries.
- Fountains of that integration (Eversweet Max Cordless CTW3 and its other Eversweet fountains): water shortage, filter left (% and days) with its own *replace filter* warning, pump running, purified water and energy today, battery level and low battery, power, indicator light and do not disturb; the working mode of the W5 when it has one.

## 1.0.1 - 2026-11-13

### Fixes
- Folding back on a tap elsewhere now works on iOS (Safari and the companion app): a tap on something that is not clickable sent no click to the page, so the popups (manual meal, confirmations) and the detail view of the mini card stayed open. The press and the release are caught instead; a slider dragged out of the card and a scroll do not fold anything, and keyboard clicks still work.
- Leaving the card (another dashboard view, a conditional card hidden) brings it back in its default state, instead of coming back unfolded or with its popup open.

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
