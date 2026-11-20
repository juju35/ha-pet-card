# Changelog

## 1.3.2 - 2026-11-20

### Fixes
- Visual editor: devices written by name in YAML now show up ticked in the device list (the editor reads them as their device ids), instead of looking unpicked and being replaced at the first change.

### Performance
- The cards are drawn again only when something they show changed (the registries, the language, the theme, the states of the pet devices), instead of on every state change of Home Assistant.

### Maintenance
- The commit-msg hook works again (the commitlint config is an ES module, as `package.json` declares).
- The pending status pill frame is cancelled when the card leaves the page.

## 1.3.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.3.0 - 2026-11-17

### Features
- **Illustrated header** on both cards (90 px): the devices (up to three, with their own drawings and animations) stand in a pet corner (window with a cat on its sill, paw prints, a pink bowl left of them) over an edge-to-edge parquet strip, the title on the left. Night picture with `sun.sun` below the horizon or in dark mode, forced with the new `illustration_theme` option (`auto`, `day`, `night`); `illustration: false` keeps the classic header. Both options are in the visual editors.
- The header's round icon always takes the status colour: the accent while the devices work, grey when they are all idle, off or unavailable, orange with a warning, red with an error; PetKit devices get the PetKit badge on it.
- **Status pill back on the illustrated header**, always shown (all good included): in the header icon's colour, right after the title only when the whole title and its whole label fit there (the title is never cut for it), else on a line of its own under the subtitle (kept to one line); when even that does not fit in the header, and on cards 200 px wide or less, only its dot stays (the status in its tooltip). Measured on the rendered header, so it holds in every language, in both headers. The mini card's detail button is a small frosted round button in the banner's top right corner (in the card's corner with the classic header).

### Fixes
- `show_title: false` hides the title again in the illustrated header, where it sits in the title row with the status pill.
- With `illustration: false`, the PetKit logo badge on the header icon was drawn at full size over the card: it keeps its small tile in both headers.
- Night picture with the dark theme even while the sun is up (`illustration_theme: auto`): the header is night when `sun.sun` is below the horizon or Home Assistant's theme is dark; `day` / `night` still force it.

## 1.2.0 - 2026-11-14

### Features
- **Animated illustrations** of the devices, next to their levels (new `show_illustration` option, on by default, also in both visual editors): kibbles fall into the bowl while a feeder dispenses, the fountain's water flows and ripples while its pump runs, the litter box's drum turns while it cleans and a cat peeks out while one is inside. The hoppers, the fountain's tank and the litter show their level, a low hopper or a full waste bin blinks and the status LED takes the device's status colour. The drawing follows the model: one or two hoppers, a camera (YumShare feeders, camera litter boxes).
- **Litter boxes**, with both PetKit integrations (Pura X and Pura MAX with RobertD502's; Pura X, Pura MAX 1 and 2 and Purobot with Jezza34000's): litter level, waste bin, what the box does (cleaning, a cat inside, paused, maintenance), uses today and the last one, the last cat, litter weight, deodorizer days left, the camera picture, and **Clean** and deodorize buttons. Status chip: *Waste bin full*, *Litter low*, *Replace deodorizer*, offline and errors. In the mini card, one row per litter box.
- **Litter-Robot** (Home Assistant's core integration): Litter-Robot 3 Connect, 4 and 5, with their own drawing (LR4 / LR5 in black or white with the new `illustration_color` option, also in the visual editors; LR3 Connect), the waste drawer gauge and the night light. State from the status code (clean cycle, cat detected, paused, off, faults, drawer almost full / full), waste drawer and litter level in %, cat weight, cycles, and **Clean** starting a clean cycle.
- Jezza34000's integration: the feeder's `feeding` sensor shows its dispensing, and the fountain's `do_not_disturb_state` stops the illustration's flowing water while the period runs. With RobertD502's, a dispensing is shown for 15 s after a manual feed from the card or when the meals or the amount dispensed today rise.

## 1.1.1 - 2026-11-14

### Fixes
- The mini card's visual editor now offers `show_stats`, `show_controls` and `show_camera`: the full card its detail button switches to reads them, and they could only be set in YAML.

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
