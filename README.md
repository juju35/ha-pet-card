# ha-pet-card

[![Marketplace](https://img.shields.io/badge/Marketplace-Custom-41BDF5.svg)](https://www.home-assistant.io/integrations/marketplace/)
[![HACS Validation](https://github.com/juju35/ha-pet-card/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-pet-card/actions/workflows/hacs.yml)
[![Validate](https://github.com/juju35/ha-pet-card/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-pet-card/actions/workflows/validate.yml)
[![Lint](https://github.com/juju35/ha-pet-card/actions/workflows/lint.yml/badge.svg)](https://github.com/juju35/ha-pet-card/actions/workflows/lint.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-pet-card)](https://github.com/juju35/ha-pet-card/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/juju35/ha-pet-card/blob/main/LICENSE)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/julienstep9)

<p align="center"><img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/images/icon.svg" alt="Pet Card" width="120"></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/images/petkit.png" alt="PetKit" width="64">
</p>

Lovelace cards for Home Assistant to keep an eye on smart pet devices: food and water levels, filter and desiccant, today's meals, and a manual feed in two taps.

Supported integrations:

- [PetKit](https://github.com/RobertD502/home-assistant-petkit) (RobertD502) — PetKit feeders (Fresh Element Infinity, Solo, Gemini, Mini Pro) and Eversweet water fountains.
- [Petkit](https://github.com/Jezza34000/homeassistant_petkit) (Jezza34000) — PetKit feeders, including the YumShare dual-hopper feeder with camera (D4SH), and Eversweet water fountains, including the Eversweet Max Cordless (CTW3).

Entities are **discovered automatically**, you don't have to pick them one by one, and it works whatever your Home Assistant language.

> [!IMPORTANT]
> **Not tested on real hardware yet.** The cards were built from the PetKit integrations' source code (their entities, translation keys and states) and checked against mock data only. If something shows wrong on your devices, please [open an issue](https://github.com/juju35/ha-pet-card/issues) with your device model and the entities the integration created.

[![Open your Home Assistant instance and open a repository inside the Marketplace.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=juju35&repository=ha-pet-card&category=plugin)

| Pet Card | Pet Mini Card |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card.png" alt="pet-card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/mini-card.png" alt="pet-mini-card" width="400"> |

## Features

- Two cards: a full **Pet Card** and a compact **Pet Mini Card**
- Automatic discovery of the PetKit feeders and water fountains (all of them by default, or the ones you pick)
- Feeders: food level (or each hopper of a dual-hopper feeder), status, errors, food dispensed today against the planned amount, meals today and the time of the last one, amount eaten and food left in the bowl when the feeder reports them, desiccant days left, battery level while on batteries
- Feeder camera (YumShare feeders): the latest picture, a click opens the live stream
- **Manual feed** in an in-card popup: the feeder's fixed amounts (Solo, Mini Pro, single-hopper feeders), a gram stepper (Infinity, Fresh Element) or one portion stepper per hopper (Gemini, YumShare dual-hopper)
- Water fountains: water level, filter left, mode (normal / smart), pump, water purified and energy used today, battery, power, light and do not disturb switches
- Filter and desiccant reset buttons, with a confirmation, once you have replaced them
- Status chip per device and for the whole card: *Food low*, *Low water*, *Replace filter*, *Replace desiccant*, *Battery low*, *Offline*, the feeder's own error message
- Click any value to open its Home Assistant history (more-info dialog)
- Detail button at the top right of the mini card: it switches to the full card and back; a click anywhere outside the card brings the compact view back (the full card's options, `show_stats`, `show_controls` and `show_camera`, are set on the mini card too, in its visual editor as well)
- Visual editor in the dashboard UI for both cards (no YAML needed)
- Light and dark mode; English, French, German, Spanish, Serbian (Cyrillic and Latin), Italian, Dutch, European Portuguese, Polish, Romanian, Danish, Swedish, Bulgarian, Russian, Ukrainian, Hungarian, Slovak, Czech, Slovenian, Latvian and Greek
- Single file, no external dependency

## Supported integrations

| Integration | What the cards show |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/images/petkit.png" alt="" width="16"> [PetKit](https://github.com/RobertD502/home-assistant-petkit) by RobertD502 (Marketplace) | Feeders: food level or hoppers, status, error, dispensed / planned today, meals, eaten, food in bowl, desiccant with reset, battery, manual feed, call pet. Fountains: water level, filter with reset, mode, purified water, energy, power, light and do not disturb. Details in [PetKit](#petkit) |
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/images/petkit.png" alt="" width="16"> [Petkit](https://github.com/Jezza34000/homeassistant_petkit) by Jezza34000 (Marketplace) | Feeders: food level or each hopper (YumShare dual-hopper D4SH, Gemini D4S), camera picture, status, error, power type and battery, dispensed / planned today (per hopper on dual-hopper feeders), meals, eaten, bowl fill, desiccant with reset, manual feed (one text per hopper, or the feeder's amounts). Fountains (Eversweet Max Cordless CTW3…): water shortage, filter (% and days) with reset, pump, purified water, energy, battery, power, indicator light and do not disturb. Details in [PetKit](#petkit) |

Both integrations use the `petkit` domain: install one of them, not both. PetKit litter boxes, purifiers and pets are left out for now: they are not shown, and do not get in the way.

## Prerequisites

Home Assistant 2024.8 or later, and one of the PetKit integrations (both available in the Marketplace), [RobertD502's](https://github.com/RobertD502/home-assistant-petkit) or [Jezza34000's](https://github.com/Jezza34000/homeassistant_petkit), installed and configured with your PetKit account.

## Installation

### Via the Marketplace (recommended)

Click the button below to add the repository directly:

[![Add to the Marketplace](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=juju35&repository=ha-pet-card&category=plugin)

Then click **Install**, and reload your browser when the Marketplace asks you to.

Or manually:

1. Open **Settings → Marketplace → Add from link** (top right; this needs a GitHub account connected)
2. Add `https://github.com/juju35/ha-pet-card` — Type: **Dashboard**
3. Open **Pet Card** and click **Install**
4. Clear your browser cache and refresh

### Manual

1. Download `pet-card.js` and the `pet-card.i18n.*.js` translation files from the [latest release](https://github.com/juju35/ha-pet-card/releases/latest)
2. Copy them all to `/config/www/` (without the translation files, the cards show in English)
3. Go to **Settings → Dashboards → ⋮ → Resources** → Add resource:
   - URL: `/local/pet-card.js`
   - Type: **JavaScript Module**
4. Clear your browser cache and refresh

## Configuration

### Visual editor

Edit a dashboard, click **Add card** and search for **Pet Card** or **Pet Mini Card**. Every feeder and fountain is shown by default; tick the ones you want to keep only those, set an optional title, choose what to display and the language. The preview updates live, and options left at their default are kept out of the generated YAML.

### Minimal

```yaml
type: custom:pet-card
```

```yaml
type: custom:pet-mini-card
```

### Full options

```yaml
type: custom:pet-card
devices:
  - Kitchen feeder
  - Living room fountain
title: Pets
show_title: true
show_subtitle: true
show_stats: true
show_controls: true
show_camera: true
language: fr
```

```yaml
type: custom:pet-mini-card
devices:
  - Kitchen feeder
  - Living room fountain
title: Pets
show_stats: true
show_controls: true
show_camera: true
zoom: true
language: fr
```

### Options reference

| Option | Card | Default | Description |
|---|---|---|---|
| `devices` | both | All | Devices to show, in this order: their name (as in Home Assistant) or their device id (set by the visual editor). Feeders first, then fountains, when left out |
| `title` | both | `Pets` (translated) | Card title |
| `show_title` | both | `true` | Show the title in the header (e.g. `false` under a section heading of your own) |
| `show_subtitle` | both | `true` | Show the subtitle (the devices' names) under the title |
| `show_stats` | both | `true` | Today's figures: dispensed, meals, eaten, in the bowl, desiccant; purified water and energy for the fountains |
| `show_controls` | both | `true` | Buttons: feed, call pet, power, mode, light, do not disturb, filter and desiccant resets |
| `show_camera` | both | `true` | The feeder camera's latest picture (YumShare feeders, Jezza34000's integration); a click opens the live stream |
| `zoom` | mini | `true` | Detail button at the top right: switches to the full card and back (`false` removes it). The full card shown follows `show_stats`, `show_controls` and `show_camera`, also set on the mini card |
| `language` | both | Auto | Force language: `en`, `fr`, `de`, `es`, `sr`, `sr-Latn`, `it`, `nl`, `pt`, `pl`, `ro`, `da`, `sv`, `bg`, `ru`, `uk`, `hu`, `sk`, `cs`, `sl`, `lv` or `el` (auto-detects from HA settings) |

## PetKit

The cards read the entities of the PetKit integrations, [RobertD502's](https://github.com/RobertD502/home-assistant-petkit) and [Jezza34000's](https://github.com/Jezza34000/homeassistant_petkit), through the Home Assistant registries (`platform: petkit`, the entity's `translation_key` and its device), whatever their entity ids or language. Both use the `petkit` domain; each role below lists RobertD502's key, then Jezza34000's. A device is a feeder when it has a food level, a feeder status, a desiccant sensor or a manual feed text, and a fountain when it has a water level or shortage, a filter or a purified water sensor.

| Card | RobertD502 (`translation_key`) | Jezza34000 (`translation_key`) |
|---|---|---|
| Food level | `food_left` (%) when the feeder reports it, else `food_level` (binary, *on* = low); `food_level_hopper_one` / `_two` on a Gemini | `food_left` (%), else `food_level` (binary, *on* = empty); `food_level_1` / `_2` on dual-hopper feeders (D4S, D4SH), shown instead of `food_left` |
| Camera | — | `camera` (camera entity, YumShare D4H / D4SH), hidden while the `camera` switch is off |
| Status chip | `feeder_status` (*offline*, *on_batteries*), `error` (any message but *no_error*), `battery_status` (*low*) | `device_status` (*offline*, *online_battery*), `error_message` (any message but *No error*), `power_type` (*on_battery*, *on_battery_low*) |
| Dispensed today | `dispensed`, against `planned` | `total_dispensed`, against `total_planned`; per hopper `total_dispensed_hopper_1` / `_2` against `total_planned_hopper_1` / `_2` (portions) |
| Meals today | `times_dispensed`; *last meal* is when that count last changed | `times_dispensed`, same |
| Eaten today / In the bowl | `amount_eaten`, `food_in_bowl` (feeders that weigh the bowl) | `amount_eaten`, `food_in_bowl`, else `food_bowl_percentage` (%) |
| Desiccant | `desiccant_days_remaining` (orange from 5 days, red at 0), reset with `reset_desiccant` | `desiccant_left_days`, reset with `reset_desiccant` |
| Battery (feeder) | — | `battery_level` (%, only while on batteries) |
| Manual feed | `manual_feed`: a `select` of amounts (Solo, Mini Pro), a `number` in grams (Infinity, Fresh Element) or a `text` of portions per hopper `a,b` (Gemini) | `manual_feed_dual_h1` / `_h2`: a `text` per hopper, in portions (D4S, D4SH: one feed per hopper with portions); `manual_feed_single`: a `text` taking one of the amounts of its pattern (grams above 10, else portions) |
| Call pet | `call_pet` (Solo) | `call_pet` (D3) |
| Water | `water_level` (binary, *on* = low) | `lack_warning` (binary, *on* = low) |
| Filter | `filter` (%, orange from 20 %, red from 5 %), reset with `reset_filter` | `filter_percent` (%), `filter_left_days`, `replace_filter` (binary), reset with `reset_filter` |
| Mode | `mode` (*normal*, *smart*) | `working_mode` (W5 only; the CTW3 has none) |
| Pump | — | `pump_running` (binary) |
| Purified today / Energy today | `purified_water_today`, `energy_usage` | `purified_water`, `today_pump_run_time` (kWh) |
| Battery (fountain) | — | `battery` (%), `low_battery` (binary) |
| Power, Light, Do not disturb | `power`, `light`, `do_not_disturb` switches | `power`, `indicator_light`, `do_not_disturb` switches |

Turning a fountain off and resetting a filter or a desiccant ask for a confirmation first; turning it on, the mode, the light and do not disturb act at once.

**Last meal**: PetKit has no "last meal" sensor, so the card shows when the count of meals of the day last changed. After a Home Assistant restart, that time is the restart until the next meal.

### Manual feed

The **Feed** button opens a popup at the top of the card with the amounts the feeder accepts, then **Feed** dispenses them:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-feed.png" alt="feed popup" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-feed-dark.png" alt="feed popup dark" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-feed-gemini.png" alt="feed popup, two hoppers" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-feed-gemini-dark.png" alt="feed popup, two hoppers dark" width="400"> |

## Screenshots

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card.png" alt="card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-dark.png" alt="card dark" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/mini-card.png" alt="mini card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/mini-card-dark.png" alt="mini card dark" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/mini-card-zoom.png" alt="mini card zoomed in" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/mini-card-zoom-dark.png" alt="mini card zoomed in dark" width="400"> |

YumShare Dual-hopper with Camera (D4SH) and Eversweet Max Cordless (CTW3), with Jezza34000's integration: the camera picture, each hopper, the portions dispensed per hopper, the fountain's pump, filter days and battery:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-yumshare.png" alt="YumShare feeder and Eversweet Max fountain" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-yumshare-dark.png" alt="YumShare feeder and Eversweet Max fountain dark" width="400"> |

Fresh Element Gemini, two hoppers (the second one low), with the amount eaten and the food left in the bowl:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-gemini.png" alt="Gemini feeder" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-gemini-dark.png" alt="Gemini feeder dark" width="400"> |

Things to do: food low, desiccant to replace, low water and filter to replace:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-alerts.png" alt="alerts" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-alerts-dark.png" alt="alerts dark" width="400"> |

### Animations

The feed popup: an amount is picked, then the popup is cancelled.

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-feed.gif" alt="feed popup animation" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-feed-dark.gif" alt="feed popup animation dark" width="400"> |

Levels: the water runs low and the filter runs out, the bars and colours follow, then both are back to normal.

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-levels.gif" alt="levels animation" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/card-levels-dark.gif" alt="levels animation dark" width="400"> |

The mini card's detail button: the full card, then back to the compact view.

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/mini-card-zoom.gif" alt="mini card zoom animation" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-pet-card/main/screenshots/mini-card-zoom-dark.gif" alt="mini card zoom animation dark" width="400"> |

## Status colours

| Item | Orange | Red |
|---|---|---|
| Food | low (or 10 % and less left) | — |
| Water | low | — |
| Filter | 20 % and less | 5 % and less |
| Desiccant | 5 days and less | 0 days |
| Feeder | on batteries, battery low | offline, error |
| Battery | 25 % and less | 10 % and less |

## Development

```bash
npm install
npm run build        # bundles src/pet-card.js into dist/pet-card.js
npm run check        # builds and checks the card (run in CI)
npm test             # unit tests, on the mock PetKit registries
npm run screenshots  # renders the cards with mock data (scripts/mock-states.mjs) into screenshots/, PNG and animated GIF (needs ffmpeg)
```

The **Screenshots** workflow re-renders `screenshots/` on every pull request touching `src/`, `scripts/` or `package-lock.json` (a Playwright/Chromium bump changes the rendering) and commits the refreshed captures onto the pull request's branch, so the README always matches the code.

`dist/` is not committed: `npm run build` creates it locally, CI builds it on every push, and the release workflow attaches the built file to the release, which is where the Marketplace installs it from.

Another integration (another brand of feeders or fountains) is an adapter in `PLATFORMS` (`src/pet-card.js`): its device kinds and the entity of each role.

### Releasing

1. Bump `version` in `package.json`
2. Add a `## <version>` section at the top of [CHANGELOG.md](https://github.com/juju35/ha-pet-card/blob/main/CHANGELOG.md)
3. Push to `main`: the **Release** workflow builds the card, creates the tag and the GitHub release with the changelog section as notes, and attaches `pet-card.js`

## Translations

The cards auto-detect the language from your Home Assistant settings. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |
| Deutsch | `de` |
| Español | `es` |
| Српски | `sr` |
| Srpski (latinica) | `sr-Latn` |
| Italiano | `it` |
| Nederlands | `nl` |
| Português (European) | `pt` |
| Polski | `pl` |
| Română | `ro` |
| Dansk | `da` |
| Svenska | `sv` |
| Български | `bg` |
| Русский | `ru` |
| Українська | `uk` |
| Magyar | `hu` |
| Slovenčina | `sk` |
| Čeština | `cs` |
| Slovenščina | `sl` |
| Latviešu | `lv` |
| Ελληνικά | `el` |

Contributions for additional languages are welcome!

## Credits

PetKit devices are made by [PetKit](https://www.petkit.com); their Home Assistant integrations are projects by [RobertD502](https://github.com/RobertD502/home-assistant-petkit) and [Jezza34000](https://github.com/Jezza34000/homeassistant_petkit). This card is not affiliated with PetKit.

## License

[MIT](https://github.com/juju35/ha-pet-card/blob/main/LICENSE)

## Support

If you find this project useful, you can support its development:

<a href="https://buymeacoffee.com/julienstep9"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50"></a>
