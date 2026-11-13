/*
 * Pet Card for Home Assistant
 * https://github.com/juju35/ha-pet-card
 *
 * Lovelace cards for smart pet devices: feeders and water fountains of the PetKit integration
 * (https://github.com/RobertD502/home-assistant-petkit). Entities are found through the entity and device
 * registries (platform, translation_key, device), so they work whatever the Home Assistant language or entity
 * ids. Each integration is an adapter (PLATFORMS below): its device kinds and the entity of each role.
 */

const VERSION = "__VERSION__";

const ICONS = {
  paw: "M8.35,3C9.53,2.83 10.78,4.12 11.14,5.9C11.5,7.67 10.85,9.25 9.67,9.43C8.5,9.61 7.24,8.32 6.87,6.54C6.5,4.77 7.17,3.19 8.35,3M15.5,3C16.69,3.19 17.35,4.77 17,6.54C16.62,8.32 15.37,9.61 14.19,9.43C13,9.25 12.35,7.67 12.72,5.9C13.08,4.12 14.33,2.83 15.5,3M3,7.6C4.14,7.11 5.69,8 6.5,9.55C7.26,11.13 7,12.79 5.87,13.28C4.74,13.77 3.2,12.89 2.41,11.32C1.62,9.75 1.9,8.08 3,7.6M21,7.6C22.1,8.08 22.38,9.75 21.59,11.32C20.8,12.89 19.26,13.77 18.13,13.28C17,12.79 16.74,11.13 17.5,9.55C18.31,8 19.86,7.11 21,7.6M19.33,18.38C19.37,19.32 18.65,20.36 17.79,20.75C16,21.57 13.88,19.87 11.89,19.87C9.9,19.87 7.76,21.64 6,20.75C5,20.26 4.31,18.96 4.44,17.88C4.62,16.39 6.41,15.59 7.47,14.5C8.88,13.09 9.88,10.44 11.89,10.44C13.89,10.44 14.95,13.05 16.3,14.5C17.41,15.72 19.26,16.75 19.33,18.38Z",
  bowl: "M16.2 11L20.3 4.5L22 5.5L18.6 11H16.2M15.6 12H2V15C2 18.9 5.1 22 9 22H15C18.9 22 22 18.9 22 15V12H15.6Z",
  food: "M20.16 12.73C22.93 9.96 22.57 5.26 19.09 3C17.08 1.67 14.39 1.66 12.36 2.97C10.6 4.1 9.63 5.86 9.46 7.68C9.33 9 8.83 10.23 7.91 11.15L7.88 11.18C6.72 12.34 6.72 14.11 7.81 15.19L8.8 16.18C9.89 17.27 11.66 17.27 12.75 16.18C13.72 15.21 15 14.68 16.39 14.53C17.76 14.38 19.1 13.78 20.16 12.73M6.26 19.86C6.53 20.42 6.44 21.1 5.97 21.56C5.39 22.15 4.44 22.15 3.85 21.56C3.58 21.29 3.44 20.94 3.42 20.58C3.06 20.56 2.71 20.42 2.44 20.15C1.85 19.56 1.85 18.61 2.44 18.03C2.9 17.57 3.59 17.47 4.14 17.74L6.62 15.31C6.76 15.5 6.92 15.72 7.1 15.9L8.09 16.89C8.3 17.09 8.5 17.26 8.76 17.41L6.26 19.86Z",
  fountain: "M7.5,2C4.47,2 2,4.46 2,7.5V7.5L2,8H4V7.5A3.5,3.5 0 0,1 7.5,4C9,4 10.26,4.93 10.76,6.24C10.37,6.08 9.95,6 9.5,6C8.11,6 6.9,6.82 6.34,8L8.08,9C8.29,8.42 8.85,8 9.5,8A1.5,1.5 0 0,1 11,9.5V11H13V9.5A1.5,1.5 0 0,1 14.5,8C15.16,8 15.71,8.42 15.92,9L17.66,8C17.1,6.82 15.9,6 14.5,6C14.05,6 13.63,6.08 13.24,6.24C13.74,4.93 15,4 16.5,4A3.5,3.5 0 0,1 20,7.5V8H22V7.5H22A5.5,5.5 0 0,0 16.5,2C14.64,2 13,2.93 12,4.34C11,2.93 9.36,2 7.5,2M6,12V14H7.42C7.92,15.15 8.85,16.07 10,16.57C10,17.38 10,18.19 10,19H2C2,19 2.82,20.23 3.41,21.11C3.78,21.67 4.4,22 5.07,22H18.93C19.6,22 20.22,21.67 20.59,21.11L22,19H14C14,18.19 14,17.38 14,16.57C15.15,16.07 16.08,15.15 16.58,14H18V12H6Z",
  water: "M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z",
  waterAlert: "M10 3.25C10 3.25 16 10 16 14C16 17.31 13.31 20 10 20S4 17.31 4 14C4 10 10 3.25 10 3.25M20 7V13H18V7H20M18 17H20V15H18V17Z",
  filter: "M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z",
  power: "M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13",
  light: "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z",
  dnd: "M23,12H17V10L20.39,6H17V4H23V6L19.62,10H23V12M15,16H9V14L12.39,10H9V8H15V10L11.62,14H15V16M7,20H1V18L4.39,14H1V12H7V14L3.62,18H7V20Z",
  reset: "M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z",
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
  alert: "M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z",
  battery: "M14 20H6V6H14M14.67 4H13V2H7V4H5.33C4.6 4 4 4.6 4 5.33V20.67C4 21.4 4.6 22 5.33 22H14.67C15.4 22 16 21.4 16 20.67V5.33C16 4.6 15.4 4 14.67 4M21 7H19V13H21V8M21 15H19V17H21V15Z",
  desiccant: "M19,18.31V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V16.3C4.54,16.12 3.95,16 3,16A1,1 0 0,1 2,15A1,1 0 0,1 3,14C3.82,14 4.47,14.08 5,14.21V12.3C4.54,12.12 3.95,12 3,12A1,1 0 0,1 2,11A1,1 0 0,1 3,10C3.82,10 4.47,10.08 5,10.21V8.3C4.54,8.12 3.95,8 3,8A1,1 0 0,1 2,7A1,1 0 0,1 3,6C3.82,6 4.47,6.08 5,6.21V4A2,2 0 0,1 7,2H17A2,2 0 0,1 19,4V6.16C20.78,6.47 21.54,7.13 21.71,7.29C22.1,7.68 22.1,8.32 21.71,8.71C21.32,9.1 20.8,9.09 20.29,8.71V8.71C20.29,8.71 19.25,8 17,8C15.74,8 14.91,8.41 13.95,8.9C12.91,9.41 11.74,10 10,10C9.64,10 9.31,10 9,9.96V7.95C9.3,8 9.63,8 10,8C11.26,8 12.09,7.59 13.05,7.11C14.09,6.59 15.27,6 17,6V4H7V20H17V18C18.5,18 18.97,18.29 19,18.31M17,10C15.27,10 14.09,10.59 13.05,11.11C12.09,11.59 11.26,12 10,12C9.63,12 9.3,12 9,11.95V13.96C9.31,14 9.64,14 10,14C11.74,14 12.91,13.41 13.95,12.9C14.91,12.42 15.74,12 17,12C19.25,12 20.29,12.71 20.29,12.71V12.71C20.8,13.1 21.32,13.1 21.71,12.71C22.1,12.32 22.1,11.69 21.71,11.29C21.5,11.08 20.25,10 17,10M17,14C15.27,14 14.09,14.59 13.05,15.11C12.09,15.59 11.26,16 10,16C9.63,16 9.3,16 9,15.95V17.96C9.31,18 9.64,18 10,18C11.74,18 12.91,17.41 13.95,16.9C14.91,16.42 15.74,16 17,16C19.25,16 20.29,16.71 20.29,16.71V16.71C20.8,17.1 21.32,17.1 21.71,16.71C22.1,16.32 22.1,15.69 21.71,15.29C21.5,15.08 20.25,14 17,14Z",
  clock: "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z",
  scale: "M12,3C10.73,3 9.6,3.8 9.18,5H3V7H4.95L2,14C1.53,16 3,17 5.5,17C8,17 9.56,16 9,14L6.05,7H9.17C9.5,7.85 10.15,8.5 11,8.83V20H2V22H22V20H13V8.82C13.85,8.5 14.5,7.85 14.82,7H17.95L15,14C14.53,16 16,17 18.5,17C21,17 22.56,16 22,14L19.05,7H21V5H14.83C14.4,3.8 13.27,3 12,3M12,5A1,1 0 0,1 13,6A1,1 0 0,1 12,7A1,1 0 0,1 11,6A1,1 0 0,1 12,5M5.5,10.25L7,14H4L5.5,10.25M18.5,10.25L20,14H17L18.5,10.25Z",
  pump: "M19,14.5C19,14.5 21,16.67 21,18A2,2 0 0,1 19,20A2,2 0 0,1 17,18C17,16.67 19,14.5 19,14.5M5,18V9A2,2 0 0,1 3,7A2,2 0 0,1 5,5V4A2,2 0 0,1 7,2H9A2,2 0 0,1 11,4V5H19A2,2 0 0,1 21,7V9L21,11A1,1 0 0,1 22,12A1,1 0 0,1 21,13H17A1,1 0 0,1 16,12A1,1 0 0,1 17,11V9H11V18H12A2,2 0 0,1 14,20V22H2V20A2,2 0 0,1 4,18H5Z",
  energy: "M11 15H6L13 1V9H18L11 23V15Z",
  feed: "M11,9H9V2H7V9H5V2H3V9C3,11.12 4.66,12.84 6.75,12.97V22H9.25V12.97C11.34,12.84 13,11.12 13,9V2H11V9M16,6V14H18.5V22H21V2C18.24,2 16,4.24 16,6Z",
  minus: "M19,13H5V11H19V13Z",
  plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
  mode: "M21.33,12.91C21.42,14.46 20.71,15.95 19.44,16.86L20.21,18.35C20.44,18.8 20.47,19.33 20.27,19.8C20.08,20.27 19.69,20.64 19.21,20.8L18.42,21.05C18.25,21.11 18.06,21.14 17.88,21.14C17.37,21.14 16.89,20.91 16.56,20.5L14.44,18C13.55,17.85 12.71,17.47 12,16.9C11.5,17.05 11,17.13 10.5,17.13C9.62,17.13 8.74,16.86 8,16.34C7.47,16.5 6.93,16.57 6.38,16.56C5.59,16.57 4.81,16.41 4.08,16.11C2.65,15.47 1.7,14.07 1.65,12.5C1.57,11.78 1.69,11.05 2,10.39C1.71,9.64 1.68,8.82 1.93,8.06C2.3,7.11 3,6.32 3.87,5.82C4.45,4.13 6.08,3 7.87,3.12C9.47,1.62 11.92,1.46 13.7,2.75C14.12,2.64 14.56,2.58 15,2.58C16.36,2.55 17.65,3.15 18.5,4.22C20.54,4.75 22,6.57 22.08,8.69C22.13,9.8 21.83,10.89 21.22,11.82C21.29,12.18 21.33,12.54 21.33,12.91M16.33,11.5C16.9,11.57 17.35,12 17.35,12.57A1,1 0 0,1 16.35,13.57H15.72C15.4,14.47 14.84,15.26 14.1,15.86C14.35,15.95 14.61,16 14.87,16.07C20,16 19.4,12.87 19.4,12.82C19.34,11.39 18.14,10.27 16.71,10.33A1,1 0 0,1 15.71,9.33A1,1 0 0,1 16.71,8.33C17.94,8.36 19.12,8.82 20.04,9.63C20.09,9.34 20.12,9.04 20.12,8.74C20.06,7.5 19.5,6.42 17.25,6.21C16,3.25 12.85,4.89 12.85,5.81V5.81C12.82,6.04 13.06,6.53 13.1,6.56A1,1 0 0,1 14.1,7.56C14.1,8.11 13.65,8.56 13.1,8.56V8.56C12.57,8.54 12.07,8.34 11.67,8C11.19,8.31 10.64,8.5 10.07,8.56V8.56C9.5,8.61 9.03,8.21 9,7.66C8.92,7.1 9.33,6.61 9.88,6.56C10.04,6.54 10.82,6.42 10.82,5.79V5.79C10.82,5.13 11.07,4.5 11.5,4C10.58,3.75 9.59,4.08 8.59,5.29C6.75,5 6,5.25 5.45,7.2C4.5,7.67 4,8 3.78,9C4.86,8.78 5.97,8.87 7,9.25C7.5,9.44 7.78,10 7.59,10.54C7.4,11.06 6.82,11.32 6.3,11.13C5.57,10.81 4.75,10.79 4,11.07C3.68,11.34 3.68,11.9 3.68,12.34C3.68,13.08 4.05,13.77 4.68,14.17C5.21,14.44 5.8,14.58 6.39,14.57C6.24,14.31 6.11,14.04 6,13.76C5.81,13.22 6.1,12.63 6.64,12.44C7.18,12.25 7.77,12.54 7.96,13.08C8.36,14.22 9.38,15 10.58,15.13C11.95,15.06 13.17,14.25 13.77,13C14,11.62 15.11,11.5 16.33,11.5M18.33,18.97L17.71,17.67L17,17.83L18,19.08L18.33,18.97M13.68,10.36C13.7,9.83 13.3,9.38 12.77,9.33C12.06,9.29 11.37,9.53 10.84,10C10.27,10.58 9.97,11.38 10,12.19A1,1 0 0,0 11,13.19C11.57,13.19 12,12.74 12,12.19C12,11.92 12.07,11.65 12.23,11.43C12.35,11.33 12.5,11.28 12.66,11.28C13.21,11.31 13.68,10.9 13.68,10.36Z",
  cat: "M12,8L10.67,8.09C9.81,7.07 7.4,4.5 5,4.5C5,4.5 3.03,7.46 4.96,11.41C4.41,12.24 4.07,12.67 4,13.66L2.07,13.95L2.28,14.93L4.04,14.67L4.18,15.38L2.61,16.32L3.08,17.21L4.53,16.32C5.68,18.76 8.59,20 12,20C15.41,20 18.32,18.76 19.47,16.32L20.92,17.21L21.39,16.32L19.82,15.38L19.96,14.67L21.72,14.93L21.93,13.95L20,13.66C19.93,12.67 19.59,12.24 19.04,11.41C20.97,7.46 19,4.5 19,4.5C16.6,4.5 14.19,7.07 13.33,8.09L12,8M9,11A1,1 0 0,1 10,12A1,1 0 0,1 9,13A1,1 0 0,1 8,12A1,1 0 0,1 9,11M15,11A1,1 0 0,1 16,12A1,1 0 0,1 15,13A1,1 0 0,1 14,12A1,1 0 0,1 15,11M11,14H13L12.3,15.39C12.5,16.03 13.06,16.5 13.75,16.5A1.5,1.5 0 0,0 15.25,15H15.75A2,2 0 0,1 13.75,17C13,17 12.35,16.59 12,16V16H12C11.65,16.59 11,17 10.25,17A2,2 0 0,1 8.25,15H8.75A1.5,1.5 0 0,0 10.25,16.5C10.94,16.5 11.5,16.03 11.7,15.39L11,14Z",
  call: "M12,8H4A2,2 0 0,0 2,10V14A2,2 0 0,0 4,16H5V20A1,1 0 0,0 6,21H8A1,1 0 0,0 9,20V16H12L17,20V4L12,8M15,15.6L13,14H4V10H13L15,8.4V15.6M21.5,12C21.5,13.71 20.54,15.26 19,16V8C20.53,8.75 21.5,10.3 21.5,12Z",
};

// Texts of the cards and editors. English is the reference: a key missing in a language reads the English one.
// The build keeps English in the bundle and moves every other language to its own file (scripts/i18n-split.mjs).
const STRINGS = {
  en: {
    title: "Pets",
    all_good: "All good",
    attention: "Needs attention",
    normal: "Normal",
    offline: "Offline",
    on_batteries: "On batteries",
    error: "Error",
    food_low: "Food low",
    water_low: "Low water",
    replace_filter: "Replace filter",
    replace_desiccant: "Replace desiccant",
    battery_low: "Battery low",
    running: "Running",
    off: "Off",
    unavailable: "Unavailable",
    food: "Food",
    hopper: "Hopper {n}",
    enough: "Enough",
    low: "Low",
    water: "Water",
    filter: "Filter",
    dispensed: "Dispensed today",
    planned: "of {v} planned",
    meals: "Meals today",
    eaten: "Eaten today",
    in_bowl: "In the bowl",
    desiccant: "Desiccant",
    last_meal: "Last meal",
    mode: "Mode",
    mode_normal: "Normal",
    mode_smart: "Smart",
    purified: "Purified today",
    energy: "Energy today",
    light: "Light",
    dnd: "Do not disturb",
    power: "Power",
    feed: "Feed",
    feed_title: "Dispense food from {name}",
    portions: "portions",
    reset: "Reset",
    confirm_reset_filter: "Reset the filter of {name}? Do it once the filter is replaced.",
    confirm_reset_desiccant: "Reset the desiccant of {name}? Do it once the desiccant is replaced.",
    turn_off: "Turn off",
    confirm_off: "Turn off {name}?",
    cancel: "Cancel",
    call_pet: "Call pet",
    zoom_in: "Show the full card",
    zoom_out: "Back to the compact view",
    no_devices: "No pet device found. Is the PetKit integration installed?",
    unknown_device: "Device not found",
    no_registry: "This card needs Home Assistant 2024.8 or later.",
    devices: "Devices (all when none is picked)",
    title_label: "Title (optional)",
    show_title: "Show title",
    show_subtitle: "Show subtitle",
    show_stats: "Show today's figures",
    show_controls: "Show buttons (feed, power, resets)",
    zoom: "Detail button",
    zoom_helper: "Switches the mini card to the full card and back",
    language: "Language",
    lang_auto: "Automatic",
  },
  fr: {
    title: "Animaux",
    all_good: "Tout va bien",
    attention: "À surveiller",
    normal: "Normal",
    offline: "Hors ligne",
    on_batteries: "Sur piles",
    error: "Erreur",
    food_low: "Croquettes basses",
    water_low: "Eau basse",
    replace_filter: "Filtre à changer",
    replace_desiccant: "Déshydratant à changer",
    battery_low: "Piles faibles",
    running: "En marche",
    off: "Éteinte",
    unavailable: "Indisponible",
    food: "Croquettes",
    hopper: "Réservoir {n}",
    enough: "Suffisant",
    low: "Bas",
    water: "Eau",
    filter: "Filtre",
    dispensed: "Distribué aujourd'hui",
    planned: "sur {v} prévus",
    meals: "Repas aujourd'hui",
    eaten: "Mangé aujourd'hui",
    in_bowl: "Dans la gamelle",
    desiccant: "Déshydratant",
    last_meal: "Dernier repas",
    mode: "Mode",
    mode_normal: "Normal",
    mode_smart: "Intelligent",
    purified: "Purifications aujourd'hui",
    energy: "Énergie aujourd'hui",
    light: "Lumière",
    dnd: "Ne pas déranger",
    power: "Marche",
    feed: "Nourrir",
    feed_title: "Distribuer des croquettes avec {name}",
    portions: "portions",
    reset: "Réinitialiser",
    confirm_reset_filter: "Réinitialiser le filtre de {name} ? À faire une fois le filtre changé.",
    confirm_reset_desiccant: "Réinitialiser le déshydratant de {name} ? À faire une fois le déshydratant changé.",
    turn_off: "Éteindre",
    confirm_off: "Éteindre {name} ?",
    cancel: "Annuler",
    call_pet: "Appeler l'animal",
    zoom_in: "Afficher la carte complète",
    zoom_out: "Revenir à la vue compacte",
    no_devices: "Aucun appareil pour animaux trouvé. L'intégration PetKit est-elle installée ?",
    unknown_device: "Appareil introuvable",
    no_registry: "Cette carte nécessite Home Assistant 2024.8 ou plus récent.",
    devices: "Appareils (tous si aucun n'est choisi)",
    title_label: "Titre (facultatif)",
    show_title: "Afficher le titre",
    show_subtitle: "Afficher le sous-titre",
    show_stats: "Afficher les chiffres du jour",
    show_controls: "Afficher les boutons (nourrir, marche, réinitialisations)",
    zoom: "Bouton de détail",
    zoom_helper: "Bascule la mini-carte vers la carte complète et inversement",
    language: "Langue",
    lang_auto: "Automatique",
  },
  de: {
    title: "Haustiere",
    all_good: "Alles in Ordnung",
    attention: "Prüfen",
    normal: "Normal",
    offline: "Offline",
    on_batteries: "Batteriebetrieb",
    error: "Fehler",
    food_low: "Futter niedrig",
    water_low: "Wenig Wasser",
    replace_filter: "Filter wechseln",
    replace_desiccant: "Trockenmittel wechseln",
    battery_low: "Batterie schwach",
    running: "In Betrieb",
    off: "Aus",
    unavailable: "Nicht verfügbar",
    food: "Futter",
    hopper: "Behälter {n}",
    enough: "Ausreichend",
    low: "Niedrig",
    water: "Wasser",
    filter: "Filter",
    dispensed: "Heute ausgegeben",
    planned: "von {v} geplant",
    meals: "Mahlzeiten heute",
    eaten: "Heute gefressen",
    in_bowl: "Im Napf",
    desiccant: "Trockenmittel",
    last_meal: "Letzte Mahlzeit",
    mode: "Modus",
    mode_normal: "Normal",
    mode_smart: "Smart",
    purified: "Heute gereinigt",
    energy: "Energie heute",
    light: "Licht",
    dnd: "Nicht stören",
    power: "Ein/Aus",
    feed: "Füttern",
    feed_title: "Futter ausgeben mit {name}",
    portions: "Portionen",
    reset: "Zurücksetzen",
    confirm_reset_filter: "Filter von {name} zurücksetzen? Erst nach dem Filterwechsel.",
    confirm_reset_desiccant: "Trockenmittel von {name} zurücksetzen? Erst nach dem Wechsel des Trockenmittels.",
    turn_off: "Ausschalten",
    confirm_off: "{name} ausschalten?",
    cancel: "Abbrechen",
    call_pet: "Tier rufen",
    zoom_in: "Vollständige Karte anzeigen",
    zoom_out: "Zurück zur kompakten Ansicht",
    no_devices: "Kein Haustiergerät gefunden. Ist die PetKit-Integration installiert?",
    unknown_device: "Gerät nicht gefunden",
    no_registry: "Diese Karte benötigt Home Assistant 2024.8 oder neuer.",
    devices: "Geräte (alle, wenn keines gewählt ist)",
    title_label: "Titel (optional)",
    show_title: "Titel anzeigen",
    show_subtitle: "Untertitel anzeigen",
    show_stats: "Tageswerte anzeigen",
    show_controls: "Schaltflächen anzeigen (Füttern, Ein/Aus, Zurücksetzen)",
    zoom: "Detailschaltfläche",
    zoom_helper: "Schaltet die Mini-Karte auf die vollständige Karte um und zurück",
    language: "Sprache",
    lang_auto: "Automatisch",
  },
  es: {
    title: "Mascotas",
    all_good: "Todo bien",
    attention: "Requiere atención",
    normal: "Normal",
    offline: "Sin conexión",
    on_batteries: "Con pilas",
    error: "Error",
    food_low: "Poco pienso",
    water_low: "Poca agua",
    replace_filter: "Cambiar el filtro",
    replace_desiccant: "Cambiar el desecante",
    battery_low: "Pilas bajas",
    running: "En marcha",
    off: "Apagada",
    unavailable: "No disponible",
    food: "Pienso",
    hopper: "Depósito {n}",
    enough: "Suficiente",
    low: "Bajo",
    water: "Agua",
    filter: "Filtro",
    dispensed: "Dispensado hoy",
    planned: "de {v} previstos",
    meals: "Comidas hoy",
    eaten: "Comido hoy",
    in_bowl: "En el comedero",
    desiccant: "Desecante",
    last_meal: "Última comida",
    mode: "Modo",
    mode_normal: "Normal",
    mode_smart: "Inteligente",
    purified: "Purificaciones hoy",
    energy: "Energía hoy",
    light: "Luz",
    dnd: "No molestar",
    power: "Encendido",
    feed: "Dar de comer",
    feed_title: "Dispensar pienso con {name}",
    portions: "porciones",
    reset: "Restablecer",
    confirm_reset_filter: "¿Restablecer el filtro de {name}? Hazlo una vez cambiado el filtro.",
    confirm_reset_desiccant: "¿Restablecer el desecante de {name}? Hazlo una vez cambiado el desecante.",
    turn_off: "Apagar",
    confirm_off: "¿Apagar {name}?",
    cancel: "Cancelar",
    call_pet: "Llamar a la mascota",
    zoom_in: "Mostrar la tarjeta completa",
    zoom_out: "Volver a la vista compacta",
    no_devices: "No se ha encontrado ningún dispositivo para mascotas. ¿Está instalada la integración PetKit?",
    unknown_device: "Dispositivo no encontrado",
    no_registry: "Esta tarjeta necesita Home Assistant 2024.8 o posterior.",
    devices: "Dispositivos (todos si no se elige ninguno)",
    title_label: "Título (opcional)",
    show_title: "Mostrar el título",
    show_subtitle: "Mostrar el subtítulo",
    show_stats: "Mostrar las cifras del día",
    show_controls: "Mostrar los botones (comida, encendido, restablecimientos)",
    zoom: "Botón de detalle",
    zoom_helper: "Cambia la minitarjeta a la tarjeta completa y viceversa",
    language: "Idioma",
    lang_auto: "Automático",
  },
  sr: {
    title: "Љубимци",
    all_good: "Све је у реду",
    attention: "Захтева пажњу",
    normal: "Нормално",
    offline: "Ван мреже",
    on_batteries: "На батерије",
    error: "Грешка",
    food_low: "Мало хране",
    water_low: "Мало воде",
    replace_filter: "Замените филтер",
    replace_desiccant: "Замените сушач",
    battery_low: "Слаба батерија",
    running: "Ради",
    off: "Искључено",
    unavailable: "Недоступно",
    food: "Храна",
    hopper: "Посуда {n}",
    enough: "Довољно",
    low: "Мало",
    water: "Вода",
    filter: "Филтер",
    dispensed: "Издато данас",
    planned: "од {v} планирано",
    meals: "Оброци данас",
    eaten: "Поједено данас",
    in_bowl: "У чинији",
    desiccant: "Сушач",
    last_meal: "Последњи оброк",
    mode: "Режим",
    mode_normal: "Нормални",
    mode_smart: "Паметни",
    purified: "Пречишћавања данас",
    energy: "Енергија данас",
    light: "Светло",
    dnd: "Не узнемиравај",
    power: "Укључено",
    feed: "Нахрани",
    feed_title: "Издај храну уређајем {name}",
    portions: "порције",
    reset: "Ресетуј",
    confirm_reset_filter: "Ресетовати филтер уређаја {name}? Урадите то након замене филтера.",
    confirm_reset_desiccant: "Ресетовати сушач уређаја {name}? Урадите то након замене сушача.",
    turn_off: "Искључи",
    confirm_off: "Искључити {name}?",
    cancel: "Откажи",
    call_pet: "Позови љубимца",
    zoom_in: "Прикажи целу картицу",
    zoom_out: "Назад на сажети приказ",
    no_devices: "Није пронађен ниједан уређај за љубимце. Да ли је интеграција PetKit инсталирана?",
    unknown_device: "Уређај није пронађен",
    no_registry: "Ова картица захтева Home Assistant 2024.8 или новији.",
    devices: "Уређаји (сви ако ниједан није изабран)",
    title_label: "Наслов (опционо)",
    show_title: "Прикажи наслов",
    show_subtitle: "Прикажи поднаслов",
    show_stats: "Прикажи данашње вредности",
    show_controls: "Прикажи дугмад (храњење, укључивање, ресетовања)",
    zoom: "Дугме за детаље",
    zoom_helper: "Пребацује мини картицу на целу картицу и назад",
    language: "Језик",
    lang_auto: "Аутоматски",
  },
  "sr-Latn": {
    title: "Ljubimci",
    all_good: "Sve je u redu",
    attention: "Zahteva pažnju",
    normal: "Normalno",
    offline: "Van mreže",
    on_batteries: "Na baterije",
    error: "Greška",
    food_low: "Malo hrane",
    water_low: "Malo vode",
    replace_filter: "Zamenite filter",
    replace_desiccant: "Zamenite sušač",
    battery_low: "Slaba baterija",
    running: "Radi",
    off: "Isključeno",
    unavailable: "Nedostupno",
    food: "Hrana",
    hopper: "Posuda {n}",
    enough: "Dovoljno",
    low: "Malo",
    water: "Voda",
    filter: "Filter",
    dispensed: "Izdato danas",
    planned: "od {v} planirano",
    meals: "Obroci danas",
    eaten: "Pojedeno danas",
    in_bowl: "U činiji",
    desiccant: "Sušač",
    last_meal: "Poslednji obrok",
    mode: "Režim",
    mode_normal: "Normalni",
    mode_smart: "Pametni",
    purified: "Prečišćavanja danas",
    energy: "Energija danas",
    light: "Svetlo",
    dnd: "Ne uznemiravaj",
    power: "Uključeno",
    feed: "Nahrani",
    feed_title: "Izdaj hranu uređajem {name}",
    portions: "porcije",
    reset: "Resetuj",
    confirm_reset_filter: "Resetovati filter uređaja {name}? Uradite to nakon zamene filtera.",
    confirm_reset_desiccant: "Resetovati sušač uređaja {name}? Uradite to nakon zamene sušača.",
    turn_off: "Isključi",
    confirm_off: "Isključiti {name}?",
    cancel: "Otkaži",
    call_pet: "Pozovi ljubimca",
    zoom_in: "Prikaži celu karticu",
    zoom_out: "Nazad na sažeti prikaz",
    no_devices: "Nije pronađen nijedan uređaj za ljubimce. Da li je integracija PetKit instalirana?",
    unknown_device: "Uređaj nije pronađen",
    no_registry: "Ova kartica zahteva Home Assistant 2024.8 ili noviji.",
    devices: "Uređaji (svi ako nijedan nije izabran)",
    title_label: "Naslov (opciono)",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_stats: "Prikaži današnje vrednosti",
    show_controls: "Prikaži dugmad (hranjenje, uključivanje, resetovanja)",
    zoom: "Dugme za detalje",
    zoom_helper: "Prebacuje mini karticu na celu karticu i nazad",
    language: "Jezik",
    lang_auto: "Automatski",
  },
  it: {
    title: "Animali",
    all_good: "Tutto a posto",
    attention: "Richiede attenzione",
    normal: "Normale",
    offline: "Offline",
    on_batteries: "A batterie",
    error: "Errore",
    food_low: "Crocchette in esaurimento",
    water_low: "Acqua bassa",
    replace_filter: "Sostituire il filtro",
    replace_desiccant: "Sostituire l'essiccante",
    battery_low: "Batterie scariche",
    running: "In funzione",
    off: "Spenta",
    unavailable: "Non disponibile",
    food: "Crocchette",
    hopper: "Serbatoio {n}",
    enough: "Sufficiente",
    low: "Basso",
    water: "Acqua",
    filter: "Filtro",
    dispensed: "Erogato oggi",
    planned: "su {v} previsti",
    meals: "Pasti oggi",
    eaten: "Mangiato oggi",
    in_bowl: "Nella ciotola",
    desiccant: "Essiccante",
    last_meal: "Ultimo pasto",
    mode: "Modalità",
    mode_normal: "Normale",
    mode_smart: "Intelligente",
    purified: "Purificazioni oggi",
    energy: "Energia oggi",
    light: "Luce",
    dnd: "Non disturbare",
    power: "Accensione",
    feed: "Dai da mangiare",
    feed_title: "Eroga crocchette con {name}",
    portions: "porzioni",
    reset: "Azzera",
    confirm_reset_filter: "Azzerare il filtro di {name}? Fallo dopo aver sostituito il filtro.",
    confirm_reset_desiccant: "Azzerare l'essiccante di {name}? Fallo dopo aver sostituito l'essiccante.",
    turn_off: "Spegni",
    confirm_off: "Spegnere {name}?",
    cancel: "Annulla",
    call_pet: "Chiama l'animale",
    zoom_in: "Mostra la scheda completa",
    zoom_out: "Torna alla vista compatta",
    no_devices: "Nessun dispositivo per animali trovato. L'integrazione PetKit è installata?",
    unknown_device: "Dispositivo non trovato",
    no_registry: "Questa scheda richiede Home Assistant 2024.8 o successivo.",
    devices: "Dispositivi (tutti se nessuno è scelto)",
    title_label: "Titolo (facoltativo)",
    show_title: "Mostra il titolo",
    show_subtitle: "Mostra il sottotitolo",
    show_stats: "Mostra i valori di oggi",
    show_controls: "Mostra i pulsanti (pasto, accensione, azzeramenti)",
    zoom: "Pulsante dettagli",
    zoom_helper: "Passa dalla mini scheda alla scheda completa e viceversa",
    language: "Lingua",
    lang_auto: "Automatica",
  },
  nl: {
    title: "Huisdieren",
    all_good: "Alles in orde",
    attention: "Aandacht nodig",
    normal: "Normaal",
    offline: "Offline",
    on_batteries: "Op batterijen",
    error: "Fout",
    food_low: "Weinig voer",
    water_low: "Weinig water",
    replace_filter: "Filter vervangen",
    replace_desiccant: "Droogmiddel vervangen",
    battery_low: "Batterij bijna leeg",
    running: "In werking",
    off: "Uit",
    unavailable: "Niet beschikbaar",
    food: "Voer",
    hopper: "Reservoir {n}",
    enough: "Voldoende",
    low: "Laag",
    water: "Water",
    filter: "Filter",
    dispensed: "Vandaag uitgegeven",
    planned: "van {v} gepland",
    meals: "Maaltijden vandaag",
    eaten: "Vandaag gegeten",
    in_bowl: "In de bak",
    desiccant: "Droogmiddel",
    last_meal: "Laatste maaltijd",
    mode: "Modus",
    mode_normal: "Normaal",
    mode_smart: "Slim",
    purified: "Vandaag gezuiverd",
    energy: "Energie vandaag",
    light: "Licht",
    dnd: "Niet storen",
    power: "Aan/uit",
    feed: "Voeren",
    feed_title: "Voer uitgeven met {name}",
    portions: "porties",
    reset: "Resetten",
    confirm_reset_filter: "Filter van {name} resetten? Doe dit nadat het filter is vervangen.",
    confirm_reset_desiccant: "Droogmiddel van {name} resetten? Doe dit nadat het droogmiddel is vervangen.",
    turn_off: "Uitzetten",
    confirm_off: "{name} uitzetten?",
    cancel: "Annuleren",
    call_pet: "Huisdier roepen",
    zoom_in: "Volledige kaart tonen",
    zoom_out: "Terug naar de compacte weergave",
    no_devices: "Geen huisdierapparaat gevonden. Is de PetKit-integratie geïnstalleerd?",
    unknown_device: "Apparaat niet gevonden",
    no_registry: "Deze kaart vereist Home Assistant 2024.8 of nieuwer.",
    devices: "Apparaten (alle als er geen is gekozen)",
    title_label: "Titel (optioneel)",
    show_title: "Titel tonen",
    show_subtitle: "Ondertitel tonen",
    show_stats: "Cijfers van vandaag tonen",
    show_controls: "Knoppen tonen (voeren, aan/uit, resetten)",
    zoom: "Detailknop",
    zoom_helper: "Schakelt de minikaart naar de volledige kaart en terug",
    language: "Taal",
    lang_auto: "Automatisch",
  },
  pt: {
    title: "Animais",
    all_good: "Tudo bem",
    attention: "Requer atenção",
    normal: "Normal",
    offline: "Offline",
    on_batteries: "A pilhas",
    error: "Erro",
    food_low: "Pouca ração",
    water_low: "Pouca água",
    replace_filter: "Substituir o filtro",
    replace_desiccant: "Substituir o dessecante",
    battery_low: "Pilhas fracas",
    running: "A funcionar",
    off: "Desligada",
    unavailable: "Indisponível",
    food: "Ração",
    hopper: "Depósito {n}",
    enough: "Suficiente",
    low: "Baixo",
    water: "Água",
    filter: "Filtro",
    dispensed: "Distribuído hoje",
    planned: "de {v} previstos",
    meals: "Refeições hoje",
    eaten: "Comido hoje",
    in_bowl: "Na tigela",
    desiccant: "Dessecante",
    last_meal: "Última refeição",
    mode: "Modo",
    mode_normal: "Normal",
    mode_smart: "Inteligente",
    purified: "Purificações hoje",
    energy: "Energia hoje",
    light: "Luz",
    dnd: "Não incomodar",
    power: "Ligar/desligar",
    feed: "Alimentar",
    feed_title: "Distribuir ração com {name}",
    portions: "porções",
    reset: "Repor",
    confirm_reset_filter: "Repor o filtro de {name}? Faça-o depois de substituir o filtro.",
    confirm_reset_desiccant: "Repor o dessecante de {name}? Faça-o depois de substituir o dessecante.",
    turn_off: "Desligar",
    confirm_off: "Desligar {name}?",
    cancel: "Cancelar",
    call_pet: "Chamar o animal",
    zoom_in: "Mostrar o cartão completo",
    zoom_out: "Voltar à vista compacta",
    no_devices: "Nenhum dispositivo para animais encontrado. A integração PetKit está instalada?",
    unknown_device: "Dispositivo não encontrado",
    no_registry: "Este cartão requer o Home Assistant 2024.8 ou posterior.",
    devices: "Dispositivos (todos se nenhum for escolhido)",
    title_label: "Título (opcional)",
    show_title: "Mostrar o título",
    show_subtitle: "Mostrar o subtítulo",
    show_stats: "Mostrar os valores de hoje",
    show_controls: "Mostrar os botões (alimentar, ligar, reposições)",
    zoom: "Botão de detalhe",
    zoom_helper: "Alterna o minicartão para o cartão completo e vice-versa",
    language: "Idioma",
    lang_auto: "Automático",
  },
  pl: {
    title: "Zwierzęta",
    all_good: "Wszystko w porządku",
    attention: "Wymaga uwagi",
    normal: "Normalny",
    offline: "Offline",
    on_batteries: "Na bateriach",
    error: "Błąd",
    food_low: "Mało karmy",
    water_low: "Mało wody",
    replace_filter: "Wymień filtr",
    replace_desiccant: "Wymień pochłaniacz wilgoci",
    battery_low: "Słaba bateria",
    running: "Działa",
    off: "Wyłączona",
    unavailable: "Niedostępny",
    food: "Karma",
    hopper: "Pojemnik {n}",
    enough: "Wystarczająco",
    low: "Mało",
    water: "Woda",
    filter: "Filtr",
    dispensed: "Wydano dziś",
    planned: "z {v} zaplanowanych",
    meals: "Posiłki dziś",
    eaten: "Zjedzono dziś",
    in_bowl: "W misce",
    desiccant: "Pochłaniacz wilgoci",
    last_meal: "Ostatni posiłek",
    mode: "Tryb",
    mode_normal: "Normalny",
    mode_smart: "Inteligentny",
    purified: "Oczyszczania dziś",
    energy: "Energia dziś",
    light: "Światło",
    dnd: "Nie przeszkadzać",
    power: "Zasilanie",
    feed: "Nakarm",
    feed_title: "Wydaj karmę z {name}",
    portions: "porcje",
    reset: "Resetuj",
    confirm_reset_filter: "Zresetować filtr {name}? Zrób to po wymianie filtra.",
    confirm_reset_desiccant: "Zresetować pochłaniacz wilgoci {name}? Zrób to po jego wymianie.",
    turn_off: "Wyłącz",
    confirm_off: "Wyłączyć {name}?",
    cancel: "Anuluj",
    call_pet: "Zawołaj zwierzę",
    zoom_in: "Pokaż pełną kartę",
    zoom_out: "Wróć do widoku kompaktowego",
    no_devices: "Nie znaleziono urządzenia dla zwierząt. Czy integracja PetKit jest zainstalowana?",
    unknown_device: "Nie znaleziono urządzenia",
    no_registry: "Ta karta wymaga Home Assistant 2024.8 lub nowszego.",
    devices: "Urządzenia (wszystkie, jeśli żadne nie jest wybrane)",
    title_label: "Tytuł (opcjonalny)",
    show_title: "Pokaż tytuł",
    show_subtitle: "Pokaż podtytuł",
    show_stats: "Pokaż dzisiejsze wartości",
    show_controls: "Pokaż przyciski (karmienie, zasilanie, resety)",
    zoom: "Przycisk szczegółów",
    zoom_helper: "Przełącza minikartę na pełną kartę i z powrotem",
    language: "Język",
    lang_auto: "Automatyczny",
  },
  ro: {
    title: "Animale",
    all_good: "Totul e în regulă",
    attention: "Necesită atenție",
    normal: "Normal",
    offline: "Offline",
    on_batteries: "Pe baterii",
    error: "Eroare",
    food_low: "Hrană puțină",
    water_low: "Apă puțină",
    replace_filter: "Înlocuiți filtrul",
    replace_desiccant: "Înlocuiți desicantul",
    battery_low: "Baterii descărcate",
    running: "Pornită",
    off: "Oprită",
    unavailable: "Indisponibil",
    food: "Hrană",
    hopper: "Rezervor {n}",
    enough: "Suficient",
    low: "Puțin",
    water: "Apă",
    filter: "Filtru",
    dispensed: "Distribuit azi",
    planned: "din {v} planificate",
    meals: "Mese azi",
    eaten: "Mâncat azi",
    in_bowl: "În castron",
    desiccant: "Desicant",
    last_meal: "Ultima masă",
    mode: "Mod",
    mode_normal: "Normal",
    mode_smart: "Inteligent",
    purified: "Purificări azi",
    energy: "Energie azi",
    light: "Lumină",
    dnd: "Nu deranjați",
    power: "Pornire",
    feed: "Hrănește",
    feed_title: "Distribuie hrană cu {name}",
    portions: "porții",
    reset: "Resetează",
    confirm_reset_filter: "Resetați filtrul pentru {name}? Faceți-o după înlocuirea filtrului.",
    confirm_reset_desiccant: "Resetați desicantul pentru {name}? Faceți-o după înlocuirea desicantului.",
    turn_off: "Oprește",
    confirm_off: "Opriți {name}?",
    cancel: "Anulează",
    call_pet: "Cheamă animalul",
    zoom_in: "Afișează cardul complet",
    zoom_out: "Înapoi la vizualizarea compactă",
    no_devices: "Niciun dispozitiv pentru animale găsit. Este instalată integrarea PetKit?",
    unknown_device: "Dispozitiv negăsit",
    no_registry: "Acest card necesită Home Assistant 2024.8 sau mai nou.",
    devices: "Dispozitive (toate dacă nu e ales niciunul)",
    title_label: "Titlu (opțional)",
    show_title: "Afișează titlul",
    show_subtitle: "Afișează subtitlul",
    show_stats: "Afișează valorile de azi",
    show_controls: "Afișează butoanele (hrănire, pornire, resetări)",
    zoom: "Buton de detalii",
    zoom_helper: "Comută minicardul la cardul complet și înapoi",
    language: "Limbă",
    lang_auto: "Automat",
  },
  da: {
    title: "Kæledyr",
    all_good: "Alt er i orden",
    attention: "Kræver opmærksomhed",
    normal: "Normal",
    offline: "Offline",
    on_batteries: "På batterier",
    error: "Fejl",
    food_low: "Lidt foder",
    water_low: "Lidt vand",
    replace_filter: "Skift filteret",
    replace_desiccant: "Skift tørremidlet",
    battery_low: "Lavt batteri",
    running: "Kører",
    off: "Slukket",
    unavailable: "Utilgængelig",
    food: "Foder",
    hopper: "Beholder {n}",
    enough: "Tilstrækkeligt",
    low: "Lavt",
    water: "Vand",
    filter: "Filter",
    dispensed: "Udleveret i dag",
    planned: "af {v} planlagt",
    meals: "Måltider i dag",
    eaten: "Spist i dag",
    in_bowl: "I skålen",
    desiccant: "Tørremiddel",
    last_meal: "Seneste måltid",
    mode: "Tilstand",
    mode_normal: "Normal",
    mode_smart: "Smart",
    purified: "Renset i dag",
    energy: "Energi i dag",
    light: "Lys",
    dnd: "Forstyr ikke",
    power: "Tænd/sluk",
    feed: "Fodr",
    feed_title: "Udlever foder fra {name}",
    portions: "portioner",
    reset: "Nulstil",
    confirm_reset_filter: "Nulstil filteret på {name}? Gør det, når filteret er skiftet.",
    confirm_reset_desiccant: "Nulstil tørremidlet på {name}? Gør det, når tørremidlet er skiftet.",
    turn_off: "Sluk",
    confirm_off: "Sluk {name}?",
    cancel: "Annuller",
    call_pet: "Kald på kæledyret",
    zoom_in: "Vis hele kortet",
    zoom_out: "Tilbage til den kompakte visning",
    no_devices: "Ingen kæledyrsenhed fundet. Er PetKit-integrationen installeret?",
    unknown_device: "Enhed ikke fundet",
    no_registry: "Dette kort kræver Home Assistant 2024.8 eller nyere.",
    devices: "Enheder (alle, hvis ingen er valgt)",
    title_label: "Titel (valgfri)",
    show_title: "Vis titel",
    show_subtitle: "Vis undertitel",
    show_stats: "Vis dagens tal",
    show_controls: "Vis knapper (fodring, tænd/sluk, nulstillinger)",
    zoom: "Detaljeknap",
    zoom_helper: "Skifter minikortet til hele kortet og tilbage",
    language: "Sprog",
    lang_auto: "Automatisk",
  },
  sv: {
    title: "Husdjur",
    all_good: "Allt är bra",
    attention: "Kräver uppmärksamhet",
    normal: "Normal",
    offline: "Offline",
    on_batteries: "På batterier",
    error: "Fel",
    food_low: "Lite foder",
    water_low: "Lite vatten",
    replace_filter: "Byt filtret",
    replace_desiccant: "Byt torkmedlet",
    battery_low: "Svagt batteri",
    running: "I drift",
    off: "Av",
    unavailable: "Inte tillgänglig",
    food: "Foder",
    hopper: "Behållare {n}",
    enough: "Tillräckligt",
    low: "Lågt",
    water: "Vatten",
    filter: "Filter",
    dispensed: "Utmatat i dag",
    planned: "av {v} planerat",
    meals: "Måltider i dag",
    eaten: "Uppätet i dag",
    in_bowl: "I skålen",
    desiccant: "Torkmedel",
    last_meal: "Senaste måltid",
    mode: "Läge",
    mode_normal: "Normal",
    mode_smart: "Smart",
    purified: "Renat i dag",
    energy: "Energi i dag",
    light: "Ljus",
    dnd: "Stör ej",
    power: "Ström",
    feed: "Mata",
    feed_title: "Mata ut foder från {name}",
    portions: "portioner",
    reset: "Återställ",
    confirm_reset_filter: "Återställa filtret på {name}? Gör det när filtret är bytt.",
    confirm_reset_desiccant: "Återställa torkmedlet på {name}? Gör det när torkmedlet är bytt.",
    turn_off: "Stäng av",
    confirm_off: "Stänga av {name}?",
    cancel: "Avbryt",
    call_pet: "Kalla på husdjuret",
    zoom_in: "Visa hela kortet",
    zoom_out: "Tillbaka till kompakt vy",
    no_devices: "Ingen husdjursenhet hittades. Är PetKit-integrationen installerad?",
    unknown_device: "Enheten hittades inte",
    no_registry: "Det här kortet kräver Home Assistant 2024.8 eller senare.",
    devices: "Enheter (alla om ingen är vald)",
    title_label: "Titel (valfri)",
    show_title: "Visa titel",
    show_subtitle: "Visa undertitel",
    show_stats: "Visa dagens siffror",
    show_controls: "Visa knappar (matning, ström, återställningar)",
    zoom: "Detaljknapp",
    zoom_helper: "Växlar minikortet till hela kortet och tillbaka",
    language: "Språk",
    lang_auto: "Automatiskt",
  },
  bg: {
    title: "Любимци",
    all_good: "Всичко е наред",
    attention: "Изисква внимание",
    normal: "Нормално",
    offline: "Офлайн",
    on_batteries: "На батерии",
    error: "Грешка",
    food_low: "Малко храна",
    water_low: "Малко вода",
    replace_filter: "Сменете филтъра",
    replace_desiccant: "Сменете сушителя",
    battery_low: "Слаба батерия",
    running: "Работи",
    off: "Изключена",
    unavailable: "Недостъпно",
    food: "Храна",
    hopper: "Резервоар {n}",
    enough: "Достатъчно",
    low: "Малко",
    water: "Вода",
    filter: "Филтър",
    dispensed: "Подадено днес",
    planned: "от {v} планирани",
    meals: "Хранения днес",
    eaten: "Изядено днес",
    in_bowl: "В купата",
    desiccant: "Сушител",
    last_meal: "Последно хранене",
    mode: "Режим",
    mode_normal: "Нормален",
    mode_smart: "Интелигентен",
    purified: "Пречиствания днес",
    energy: "Енергия днес",
    light: "Светлина",
    dnd: "Не безпокойте",
    power: "Включване",
    feed: "Нахрани",
    feed_title: "Подай храна от {name}",
    portions: "порции",
    reset: "Нулирай",
    confirm_reset_filter: "Нулиране на филтъра на {name}? Направете го след смяна на филтъра.",
    confirm_reset_desiccant: "Нулиране на сушителя на {name}? Направете го след смяна на сушителя.",
    turn_off: "Изключи",
    confirm_off: "Изключване на {name}?",
    cancel: "Отказ",
    call_pet: "Повикай любимеца",
    zoom_in: "Покажи цялата карта",
    zoom_out: "Обратно към компактния изглед",
    no_devices: "Не е намерено устройство за любимци. Инсталирана ли е интеграцията PetKit?",
    unknown_device: "Устройството не е намерено",
    no_registry: "Тази карта изисква Home Assistant 2024.8 или по-нов.",
    devices: "Устройства (всички, ако няма избрано)",
    title_label: "Заглавие (по избор)",
    show_title: "Показвай заглавието",
    show_subtitle: "Показвай подзаглавието",
    show_stats: "Показвай днешните стойности",
    show_controls: "Показвай бутоните (хранене, включване, нулирания)",
    zoom: "Бутон за подробности",
    zoom_helper: "Превключва мини картата към цялата карта и обратно",
    language: "Език",
    lang_auto: "Автоматично",
  },
  ru: {
    title: "Питомцы",
    all_good: "Всё в порядке",
    attention: "Требует внимания",
    normal: "Норма",
    offline: "Не в сети",
    on_batteries: "От батарей",
    error: "Ошибка",
    food_low: "Мало корма",
    water_low: "Мало воды",
    replace_filter: "Замените фильтр",
    replace_desiccant: "Замените влагопоглотитель",
    battery_low: "Батарея разряжена",
    running: "Работает",
    off: "Выключен",
    unavailable: "Недоступно",
    food: "Корм",
    hopper: "Бункер {n}",
    enough: "Достаточно",
    low: "Мало",
    water: "Вода",
    filter: "Фильтр",
    dispensed: "Выдано сегодня",
    planned: "из {v} запланировано",
    meals: "Кормлений сегодня",
    eaten: "Съедено сегодня",
    in_bowl: "В миске",
    desiccant: "Влагопоглотитель",
    last_meal: "Последнее кормление",
    mode: "Режим",
    mode_normal: "Обычный",
    mode_smart: "Умный",
    purified: "Очисток сегодня",
    energy: "Энергия сегодня",
    light: "Подсветка",
    dnd: "Не беспокоить",
    power: "Питание",
    feed: "Покормить",
    feed_title: "Выдать корм через {name}",
    portions: "порции",
    reset: "Сбросить",
    confirm_reset_filter: "Сбросить фильтр {name}? Сделайте это после замены фильтра.",
    confirm_reset_desiccant: "Сбросить влагопоглотитель {name}? Сделайте это после его замены.",
    turn_off: "Выключить",
    confirm_off: "Выключить {name}?",
    cancel: "Отмена",
    call_pet: "Позвать питомца",
    zoom_in: "Показать полную карточку",
    zoom_out: "Назад к компактному виду",
    no_devices: "Устройства для питомцев не найдены. Установлена ли интеграция PetKit?",
    unknown_device: "Устройство не найдено",
    no_registry: "Для этой карточки нужен Home Assistant 2024.8 или новее.",
    devices: "Устройства (все, если ничего не выбрано)",
    title_label: "Заголовок (необязательно)",
    show_title: "Показывать заголовок",
    show_subtitle: "Показывать подзаголовок",
    show_stats: "Показывать данные за сегодня",
    show_controls: "Показывать кнопки (кормление, питание, сбросы)",
    zoom: "Кнопка подробностей",
    zoom_helper: "Переключает мини-карточку на полную и обратно",
    language: "Язык",
    lang_auto: "Автоматически",
  },
  uk: {
    title: "Улюбленці",
    all_good: "Усе гаразд",
    attention: "Потребує уваги",
    normal: "Норма",
    offline: "Не в мережі",
    on_batteries: "Від батарей",
    error: "Помилка",
    food_low: "Мало корму",
    water_low: "Мало води",
    replace_filter: "Замініть фільтр",
    replace_desiccant: "Замініть вологопоглинач",
    battery_low: "Батарея розряджена",
    running: "Працює",
    off: "Вимкнено",
    unavailable: "Недоступно",
    food: "Корм",
    hopper: "Бункер {n}",
    enough: "Достатньо",
    low: "Мало",
    water: "Вода",
    filter: "Фільтр",
    dispensed: "Видано сьогодні",
    planned: "з {v} заплановано",
    meals: "Годувань сьогодні",
    eaten: "З'їдено сьогодні",
    in_bowl: "У мисці",
    desiccant: "Вологопоглинач",
    last_meal: "Останнє годування",
    mode: "Режим",
    mode_normal: "Звичайний",
    mode_smart: "Розумний",
    purified: "Очищень сьогодні",
    energy: "Енергія сьогодні",
    light: "Підсвічування",
    dnd: "Не турбувати",
    power: "Живлення",
    feed: "Нагодувати",
    feed_title: "Видати корм через {name}",
    portions: "порції",
    reset: "Скинути",
    confirm_reset_filter: "Скинути фільтр {name}? Зробіть це після заміни фільтра.",
    confirm_reset_desiccant: "Скинути вологопоглинач {name}? Зробіть це після його заміни.",
    turn_off: "Вимкнути",
    confirm_off: "Вимкнути {name}?",
    cancel: "Скасувати",
    call_pet: "Покликати улюбленця",
    zoom_in: "Показати повну картку",
    zoom_out: "Назад до компактного вигляду",
    no_devices: "Пристроїв для улюбленців не знайдено. Чи встановлено інтеграцію PetKit?",
    unknown_device: "Пристрій не знайдено",
    no_registry: "Для цієї картки потрібен Home Assistant 2024.8 або новіший.",
    devices: "Пристрої (усі, якщо нічого не вибрано)",
    title_label: "Заголовок (необов'язково)",
    show_title: "Показувати заголовок",
    show_subtitle: "Показувати підзаголовок",
    show_stats: "Показувати дані за сьогодні",
    show_controls: "Показувати кнопки (годування, живлення, скидання)",
    zoom: "Кнопка деталей",
    zoom_helper: "Перемикає міні-картку на повну і назад",
    language: "Мова",
    lang_auto: "Автоматично",
  },
  hu: {
    title: "Háziállatok",
    all_good: "Minden rendben",
    attention: "Figyelmet igényel",
    normal: "Normál",
    offline: "Offline",
    on_batteries: "Elemről",
    error: "Hiba",
    food_low: "Kevés táp",
    water_low: "Kevés víz",
    replace_filter: "Cserélje a szűrőt",
    replace_desiccant: "Cserélje a nedvszívót",
    battery_low: "Gyenge elem",
    running: "Működik",
    off: "Kikapcsolva",
    unavailable: "Nem elérhető",
    food: "Táp",
    hopper: "Tartály {n}",
    enough: "Elegendő",
    low: "Kevés",
    water: "Víz",
    filter: "Szűrő",
    dispensed: "Ma kiadott",
    planned: "{v} tervezettből",
    meals: "Mai etetések",
    eaten: "Ma elfogyasztott",
    in_bowl: "A tálban",
    desiccant: "Nedvszívó",
    last_meal: "Utolsó etetés",
    mode: "Mód",
    mode_normal: "Normál",
    mode_smart: "Intelligens",
    purified: "Mai tisztítások",
    energy: "Mai energia",
    light: "Fény",
    dnd: "Ne zavarjanak",
    power: "Bekapcsolás",
    feed: "Etetés",
    feed_title: "Táp kiadása: {name}",
    portions: "adag",
    reset: "Visszaállítás",
    confirm_reset_filter: "Visszaállítja a(z) {name} szűrőjét? A szűrő cseréje után tegye.",
    confirm_reset_desiccant: "Visszaállítja a(z) {name} nedvszívóját? A nedvszívó cseréje után tegye.",
    turn_off: "Kikapcsolás",
    confirm_off: "Kikapcsolja: {name}?",
    cancel: "Mégse",
    call_pet: "Állat hívása",
    zoom_in: "Teljes kártya megjelenítése",
    zoom_out: "Vissza a kompakt nézethez",
    no_devices: "Nem található háziállat-eszköz. Telepítve van a PetKit integráció?",
    unknown_device: "Az eszköz nem található",
    no_registry: "Ehhez a kártyához Home Assistant 2024.8 vagy újabb szükséges.",
    devices: "Eszközök (mind, ha nincs kiválasztva)",
    title_label: "Cím (nem kötelező)",
    show_title: "Cím megjelenítése",
    show_subtitle: "Alcím megjelenítése",
    show_stats: "Mai értékek megjelenítése",
    show_controls: "Gombok megjelenítése (etetés, bekapcsolás, visszaállítások)",
    zoom: "Részletek gomb",
    zoom_helper: "A mini kártyát a teljes kártyára váltja és vissza",
    language: "Nyelv",
    lang_auto: "Automatikus",
  },
  sk: {
    title: "Zvieratá",
    all_good: "Všetko v poriadku",
    attention: "Vyžaduje pozornosť",
    normal: "Normálny",
    offline: "Offline",
    on_batteries: "Na batérie",
    error: "Chyba",
    food_low: "Málo krmiva",
    water_low: "Málo vody",
    replace_filter: "Vymeňte filter",
    replace_desiccant: "Vymeňte vysúšadlo",
    battery_low: "Slabá batéria",
    running: "V prevádzke",
    off: "Vypnutá",
    unavailable: "Nedostupné",
    food: "Krmivo",
    hopper: "Zásobník {n}",
    enough: "Dostatok",
    low: "Málo",
    water: "Voda",
    filter: "Filter",
    dispensed: "Vydané dnes",
    planned: "z {v} plánovaných",
    meals: "Kŕmenia dnes",
    eaten: "Zjedené dnes",
    in_bowl: "V miske",
    desiccant: "Vysúšadlo",
    last_meal: "Posledné kŕmenie",
    mode: "Režim",
    mode_normal: "Normálny",
    mode_smart: "Inteligentný",
    purified: "Čistenia dnes",
    energy: "Energia dnes",
    light: "Svetlo",
    dnd: "Nerušiť",
    power: "Napájanie",
    feed: "Nakŕmiť",
    feed_title: "Vydať krmivo z {name}",
    portions: "porcie",
    reset: "Resetovať",
    confirm_reset_filter: "Resetovať filter {name}? Urobte to po výmene filtra.",
    confirm_reset_desiccant: "Resetovať vysúšadlo {name}? Urobte to po výmene vysúšadla.",
    turn_off: "Vypnúť",
    confirm_off: "Vypnúť {name}?",
    cancel: "Zrušiť",
    call_pet: "Zavolať zviera",
    zoom_in: "Zobraziť celú kartu",
    zoom_out: "Späť na kompaktné zobrazenie",
    no_devices: "Nenašlo sa žiadne zariadenie pre zvieratá. Je nainštalovaná integrácia PetKit?",
    unknown_device: "Zariadenie sa nenašlo",
    no_registry: "Táto karta vyžaduje Home Assistant 2024.8 alebo novší.",
    devices: "Zariadenia (všetky, ak nie je vybrané žiadne)",
    title_label: "Názov (voliteľný)",
    show_title: "Zobraziť názov",
    show_subtitle: "Zobraziť podnadpis",
    show_stats: "Zobraziť dnešné hodnoty",
    show_controls: "Zobraziť tlačidlá (kŕmenie, napájanie, resety)",
    zoom: "Tlačidlo podrobností",
    zoom_helper: "Prepne minikartu na celú kartu a späť",
    language: "Jazyk",
    lang_auto: "Automaticky",
  },
  cs: {
    title: "Zvířata",
    all_good: "Vše v pořádku",
    attention: "Vyžaduje pozornost",
    normal: "Normální",
    offline: "Offline",
    on_batteries: "Na baterie",
    error: "Chyba",
    food_low: "Málo krmiva",
    water_low: "Málo vody",
    replace_filter: "Vyměňte filtr",
    replace_desiccant: "Vyměňte vysoušedlo",
    battery_low: "Slabá baterie",
    running: "V provozu",
    off: "Vypnuto",
    unavailable: "Nedostupné",
    food: "Krmivo",
    hopper: "Zásobník {n}",
    enough: "Dostatek",
    low: "Málo",
    water: "Voda",
    filter: "Filtr",
    dispensed: "Vydáno dnes",
    planned: "z {v} plánovaných",
    meals: "Krmení dnes",
    eaten: "Snědeno dnes",
    in_bowl: "V misce",
    desiccant: "Vysoušedlo",
    last_meal: "Poslední krmení",
    mode: "Režim",
    mode_normal: "Normální",
    mode_smart: "Chytrý",
    purified: "Čištění dnes",
    energy: "Energie dnes",
    light: "Světlo",
    dnd: "Nerušit",
    power: "Napájení",
    feed: "Nakrmit",
    feed_title: "Vydat krmivo z {name}",
    portions: "porce",
    reset: "Resetovat",
    confirm_reset_filter: "Resetovat filtr {name}? Udělejte to po výměně filtru.",
    confirm_reset_desiccant: "Resetovat vysoušedlo {name}? Udělejte to po výměně vysoušedla.",
    turn_off: "Vypnout",
    confirm_off: "Vypnout {name}?",
    cancel: "Zrušit",
    call_pet: "Zavolat zvíře",
    zoom_in: "Zobrazit celou kartu",
    zoom_out: "Zpět na kompaktní zobrazení",
    no_devices: "Nebylo nalezeno žádné zařízení pro zvířata. Je nainstalována integrace PetKit?",
    unknown_device: "Zařízení nenalezeno",
    no_registry: "Tato karta vyžaduje Home Assistant 2024.8 nebo novější.",
    devices: "Zařízení (všechna, pokud není vybráno žádné)",
    title_label: "Název (volitelný)",
    show_title: "Zobrazit název",
    show_subtitle: "Zobrazit podnadpis",
    show_stats: "Zobrazit dnešní hodnoty",
    show_controls: "Zobrazit tlačítka (krmení, napájení, resety)",
    zoom: "Tlačítko podrobností",
    zoom_helper: "Přepne minikartu na celou kartu a zpět",
    language: "Jazyk",
    lang_auto: "Automaticky",
  },
  sl: {
    title: "Ljubljenčki",
    all_good: "Vse je v redu",
    attention: "Zahteva pozornost",
    normal: "Normalno",
    offline: "Brez povezave",
    on_batteries: "Na baterije",
    error: "Napaka",
    food_low: "Malo hrane",
    water_low: "Malo vode",
    replace_filter: "Zamenjajte filter",
    replace_desiccant: "Zamenjajte sušilno sredstvo",
    battery_low: "Šibka baterija",
    running: "Deluje",
    off: "Izklopljeno",
    unavailable: "Ni na voljo",
    food: "Hrana",
    hopper: "Posoda {n}",
    enough: "Dovolj",
    low: "Malo",
    water: "Voda",
    filter: "Filter",
    dispensed: "Danes izdano",
    planned: "od {v} načrtovanih",
    meals: "Obroki danes",
    eaten: "Danes pojedeno",
    in_bowl: "V skledi",
    desiccant: "Sušilno sredstvo",
    last_meal: "Zadnji obrok",
    mode: "Način",
    mode_normal: "Običajni",
    mode_smart: "Pametni",
    purified: "Čiščenja danes",
    energy: "Energija danes",
    light: "Luč",
    dnd: "Ne moti",
    power: "Vklop",
    feed: "Nahrani",
    feed_title: "Izdaj hrano iz naprave {name}",
    portions: "porcije",
    reset: "Ponastavi",
    confirm_reset_filter: "Ponastavim filter naprave {name}? Storite to po zamenjavi filtra.",
    confirm_reset_desiccant: "Ponastavim sušilno sredstvo naprave {name}? Storite to po njegovi zamenjavi.",
    turn_off: "Izklopi",
    confirm_off: "Izklopim {name}?",
    cancel: "Prekliči",
    call_pet: "Pokliči ljubljenčka",
    zoom_in: "Prikaži celotno kartico",
    zoom_out: "Nazaj na strnjen prikaz",
    no_devices: "Ni najdene naprave za ljubljenčke. Ali je integracija PetKit nameščena?",
    unknown_device: "Naprave ni mogoče najti",
    no_registry: "Ta kartica zahteva Home Assistant 2024.8 ali novejši.",
    devices: "Naprave (vse, če ni izbrana nobena)",
    title_label: "Naslov (neobvezno)",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_stats: "Prikaži današnje vrednosti",
    show_controls: "Prikaži gumbe (hranjenje, vklop, ponastavitve)",
    zoom: "Gumb za podrobnosti",
    zoom_helper: "Preklopi mini kartico na celotno kartico in nazaj",
    language: "Jezik",
    lang_auto: "Samodejno",
  },
  lv: {
    title: "Mājdzīvnieki",
    all_good: "Viss kārtībā",
    attention: "Nepieciešama uzmanība",
    normal: "Normāls",
    offline: "Bezsaistē",
    on_batteries: "No baterijām",
    error: "Kļūda",
    food_low: "Maz barības",
    water_low: "Maz ūdens",
    replace_filter: "Nomainiet filtru",
    replace_desiccant: "Nomainiet mitruma absorbētāju",
    battery_low: "Vāja baterija",
    running: "Darbojas",
    off: "Izslēgta",
    unavailable: "Nav pieejams",
    food: "Barība",
    hopper: "Tvertne {n}",
    enough: "Pietiekami",
    low: "Maz",
    water: "Ūdens",
    filter: "Filtrs",
    dispensed: "Šodien izsniegts",
    planned: "no {v} plānotajiem",
    meals: "Ēdienreizes šodien",
    eaten: "Šodien apēsts",
    in_bowl: "Bļodā",
    desiccant: "Mitruma absorbētājs",
    last_meal: "Pēdējā ēdienreize",
    mode: "Režīms",
    mode_normal: "Parastais",
    mode_smart: "Viedais",
    purified: "Attīrīšanas šodien",
    energy: "Enerģija šodien",
    light: "Gaisma",
    dnd: "Netraucēt",
    power: "Ieslēgšana",
    feed: "Pabarot",
    feed_title: "Izsniegt barību no {name}",
    portions: "porcijas",
    reset: "Atiestatīt",
    confirm_reset_filter: "Atiestatīt {name} filtru? Dariet to pēc filtra nomaiņas.",
    confirm_reset_desiccant: "Atiestatīt {name} mitruma absorbētāju? Dariet to pēc tā nomaiņas.",
    turn_off: "Izslēgt",
    confirm_off: "Izslēgt {name}?",
    cancel: "Atcelt",
    call_pet: "Pasaukt mājdzīvnieku",
    zoom_in: "Rādīt pilno karti",
    zoom_out: "Atpakaļ uz kompakto skatu",
    no_devices: "Nav atrasta neviena mājdzīvnieku ierīce. Vai PetKit integrācija ir instalēta?",
    unknown_device: "Ierīce nav atrasta",
    no_registry: "Šai kartei nepieciešams Home Assistant 2024.8 vai jaunāks.",
    devices: "Ierīces (visas, ja nav izvēlēta neviena)",
    title_label: "Virsraksts (neobligāts)",
    show_title: "Rādīt virsrakstu",
    show_subtitle: "Rādīt apakšvirsrakstu",
    show_stats: "Rādīt šodienas vērtības",
    show_controls: "Rādīt pogas (barošana, ieslēgšana, atiestatīšana)",
    zoom: "Detaļu poga",
    zoom_helper: "Pārslēdz mini karti uz pilno karti un atpakaļ",
    language: "Valoda",
    lang_auto: "Automātiski",
  },
  el: {
    title: "Κατοικίδια",
    all_good: "Όλα καλά",
    attention: "Χρειάζεται προσοχή",
    normal: "Κανονική",
    offline: "Εκτός σύνδεσης",
    on_batteries: "Με μπαταρίες",
    error: "Σφάλμα",
    food_low: "Λίγη τροφή",
    water_low: "Λίγο νερό",
    replace_filter: "Αλλάξτε το φίλτρο",
    replace_desiccant: "Αλλάξτε το αφυγραντικό",
    battery_low: "Χαμηλή μπαταρία",
    running: "Σε λειτουργία",
    off: "Σβηστή",
    unavailable: "Μη διαθέσιμο",
    food: "Τροφή",
    hopper: "Δοχείο {n}",
    enough: "Αρκετή",
    low: "Λίγη",
    water: "Νερό",
    filter: "Φίλτρο",
    dispensed: "Σερβιρίστηκε σήμερα",
    planned: "από {v} προγραμματισμένα",
    meals: "Γεύματα σήμερα",
    eaten: "Φαγώθηκε σήμερα",
    in_bowl: "Στο μπολ",
    desiccant: "Αφυγραντικό",
    last_meal: "Τελευταίο γεύμα",
    mode: "Λειτουργία",
    mode_normal: "Κανονική",
    mode_smart: "Έξυπνη",
    purified: "Καθαρισμοί σήμερα",
    energy: "Ενέργεια σήμερα",
    light: "Φως",
    dnd: "Μην ενοχλείτε",
    power: "Ενεργοποίηση",
    feed: "Τάισμα",
    feed_title: "Σερβίρισμα τροφής από {name}",
    portions: "μερίδες",
    reset: "Επαναφορά",
    confirm_reset_filter: "Επαναφορά του φίλτρου του {name}; Κάντε το αφού αλλάξετε το φίλτρο.",
    confirm_reset_desiccant: "Επαναφορά του αφυγραντικού του {name}; Κάντε το αφού το αλλάξετε.",
    turn_off: "Απενεργοποίηση",
    confirm_off: "Απενεργοποίηση του {name};",
    cancel: "Άκυρο",
    call_pet: "Κάλεσμα κατοικιδίου",
    zoom_in: "Εμφάνιση πλήρους κάρτας",
    zoom_out: "Επιστροφή στη συμπαγή προβολή",
    no_devices: "Δεν βρέθηκε συσκευή για κατοικίδια. Είναι εγκατεστημένη η ενσωμάτωση PetKit;",
    unknown_device: "Η συσκευή δεν βρέθηκε",
    no_registry: "Αυτή η κάρτα απαιτεί Home Assistant 2024.8 ή νεότερο.",
    devices: "Συσκευές (όλες αν δεν επιλεγεί καμία)",
    title_label: "Τίτλος (προαιρετικός)",
    show_title: "Εμφάνιση τίτλου",
    show_subtitle: "Εμφάνιση υπότιτλου",
    show_stats: "Εμφάνιση σημερινών τιμών",
    show_controls: "Εμφάνιση κουμπιών (τάισμα, ενεργοποίηση, επαναφορές)",
    zoom: "Κουμπί λεπτομερειών",
    zoom_helper: "Εναλλάσσει τη μίνι κάρτα στην πλήρη κάρτα και πίσω",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα",
  },
};

// Language names of the editor's list, in their own language.
const LANG_NAMES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

// Locale of the numbers and dates: Home Assistant's own language when its base matches the card's language
// (keeps the region, e.g. de-CH or fr-CA), otherwise the card's language. Home Assistant's "pt" is European
// Portuguese, which Intl would format as Brazilian, so bare "pt" becomes "pt-PT".
const fmtLang = (hass, config) => {
  const l = lang(hass, config);
  const ha = hass && (hass.locale?.language || hass.language);
  const loc = ha && ha.split("-")[0] === l ? ha : l;
  return loc === "pt" ? "pt-PT" : loc;
};

const BAD = new Set(["unknown", "unavailable", "", undefined, null]);
const known = (s) => (s && !BAD.has(s.state) ? s.state : null);

const num = (s) => {
  const v = parseFloat(known(s));
  return Number.isFinite(v) ? v : null;
};

const _formats = new Map();
const cachedFormat = (key, make) => {
  if (!_formats.has(key)) {
    try {
      _formats.set(key, make());
    } catch (_err) {
      _formats.set(key, null);
    }
  }
  return _formats.get(key);
};

// Number in the card's language, at most `max` decimals.
const fmtNum = (v, loc, max = 0) => {
  const f = cachedFormat(`n|${loc}|${max}`, () => new Intl.NumberFormat(loc, { maximumFractionDigits: max }));
  return f ? f.format(v) : String(v);
};

// A measure with its unit in the card's language ("45 g", "23 days"), via Intl's units.
const fmtUnit = (v, unit, loc) => {
  const f = cachedFormat(`u|${loc}|${unit}`, () => new Intl.NumberFormat(loc, { style: "unit", unit, unitDisplay: "short", maximumFractionDigits: 1 }));
  return f ? f.format(v) : `${v} ${unit}`;
};

const fmtPct = (v, loc) => `${fmtNum(Math.round(v), loc)}%`;

// "2 hours ago", "yesterday", in the card's language (Intl.RelativeTimeFormat): no translation needed.
const fmtAgo = (iso, loc, now = Date.now()) => {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return null;
  const s = Math.max(0, (now - at) / 1000);
  const f = cachedFormat(`r|${loc}`, () => new Intl.RelativeTimeFormat(loc, { numeric: "auto", style: "short" }));
  const [v, unit] = s < 3600 ? [Math.floor(s / 60), "minute"] : s < 86400 ? [Math.floor(s / 3600), "hour"] : [Math.floor(s / 86400), "day"];
  return f ? f.format(-v, unit) : `${v} ${unit}`;
};

const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

// Patch the shadow DOM in place from the new HTML (as in the other ha-* cards): nodes whose tag is unchanged are
// kept, so keyboard focus, hover and CSS transitions survive an update. Rows carry a data-key and are matched by it.
const patchAttrs = (cur, next) => {
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
const sameNode = (a, b) => !!a && a.nodeType === b.nodeType && a.nodeName === b.nodeName;
const patchChildren = (cur, next) => {
  const old = [...cur.childNodes];
  const fresh = [...next.childNodes];
  const byKey = new Map();
  for (const o of old) {
    const k = keyOf(o);
    if (k !== null && !byKey.has(k)) byKey.set(k, o);
  }
  const used = new Set();
  fresh.forEach((n, i) => {
    const k = keyOf(n);
    let o = k !== null ? byKey.get(k) : old[i];
    if (!sameNode(o, n) || used.has(o) || (k === null && keyOf(o) !== null)) o = null;
    const ref = cur.childNodes[i] ?? null;
    if (!o) {
      cur.insertBefore(n, ref);
      return;
    }
    used.add(o);
    if (o !== ref) cur.insertBefore(o, ref);
    if (n.nodeType === 1) {
      patchAttrs(o, n);
      patchChildren(o, n);
    } else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
  });
  while (cur.childNodes.length > fresh.length) cur.removeChild(cur.lastChild);
};
const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};

// ---------------------------------------------------------------------------
// Adapters: one per integration. A device kind is recognised by any of its `detect` entities; each role names
// the entity it reads, as "<domain>:<translation_key>" (a list: the first one present wins).
// ---------------------------------------------------------------------------

const PLATFORMS = {
  petkit: {
    name: "PetKit",
    kinds: {
      feeder: {
        detect: ["binary_sensor:food_level", "binary_sensor:food_level_hopper_one", "sensor:feeder_status", "sensor:desiccant_days_remaining"],
        roles: {
          food: "binary_sensor:food_level",
          food1: "binary_sensor:food_level_hopper_one",
          food2: "binary_sensor:food_level_hopper_two",
          food_left: "sensor:food_left",
          status: "sensor:feeder_status",
          error: "sensor:error",
          desiccant: "sensor:desiccant_days_remaining",
          battery: "sensor:battery_status",
          dispensed: "sensor:dispensed",
          planned: "sensor:planned",
          times: "sensor:times_dispensed",
          eaten: "sensor:amount_eaten",
          times_eaten: "sensor:times_eaten",
          bowl: "sensor:food_in_bowl",
          feed: ["select:manual_feed", "number:manual_feed", "text:manual_feed"],
          reset_desiccant: "button:reset_desiccant",
          call_pet: "button:call_pet",
        },
      },
      fountain: {
        detect: ["binary_sensor:water_level", "sensor:filter", "sensor:purified_water_today"],
        roles: {
          water: "binary_sensor:water_level",
          filter: "sensor:filter",
          mode: "select:mode",
          power: "switch:power",
          light: "switch:light",
          dnd: "switch:do_not_disturb",
          purified: "sensor:purified_water_today",
          energy: "sensor:energy_usage",
          reset_filter: "button:reset_filter",
        },
      },
    },
  },
};
const KIND_ORDER = ["feeder", "fountain"];

// Supported devices, from the registries: { id, kind, platform, name, model, entities: { role: entity_id } }.
const _cache = new WeakMap();
const resolve = (hass) => {
  const ents = hass?.entities;
  if (!ents) return null;
  const hit = _cache.get(ents);
  if (hit && hit.devices === hass.devices) return hit.list;
  const byDev = new Map();
  for (const e of Object.values(ents)) {
    if (!PLATFORMS[e.platform] || !e.device_id || !e.translation_key) continue;
    let d = byDev.get(e.device_id);
    if (!d) byDev.set(e.device_id, (d = { platform: e.platform, keys: {} }));
    d.keys[`${e.entity_id.split(".")[0]}:${e.translation_key}`] ??= e.entity_id;
  }
  const list = [];
  for (const [id, d] of byDev) {
    const kinds = PLATFORMS[d.platform].kinds;
    const kind = KIND_ORDER.find((k) => kinds[k]?.detect.some((key) => d.keys[key]));
    if (!kind) continue;
    const entities = {};
    for (const [role, keys] of Object.entries(kinds[kind].roles)) {
      const found = [].concat(keys).find((key) => d.keys[key]);
      if (found) entities[role] = d.keys[found];
    }
    const dev = hass.devices?.[id] || {};
    list.push({ id, kind, platform: d.platform, name: dev.name_by_user || dev.name || id, model: dev.model || "", entities });
  }
  list.sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name));
  _cache.set(ents, { devices: hass.devices, list });
  return list;
};

// The devices a card shows: `devices` (ids or names, as listed) or every supported device.
const findDevices = (hass, config) => {
  const all = resolve(hass);
  if (!all) return { error: "no_registry" };
  if (!all.length) return { error: "no_devices" };
  const wanted = [].concat(config?.devices ?? []).filter(Boolean);
  if (!wanted.length) return { devices: all };
  const low = (v) => String(v).toLowerCase();
  const devices = wanted.map((w) => all.find((d) => d.id === w || low(d.name) === low(w))).filter(Boolean);
  return devices.length ? { devices } : { error: "unknown_device" };
};

// Filter and desiccant levels: orange then red as they run out.
const filterLevel = (v) => (v === null ? "" : v <= 5 ? "crit" : v <= 20 ? "warn" : "ok");
const desiccantLevel = (v) => (v === null ? "" : v <= 0 ? "crit" : v <= 5 ? "warn" : "ok");

// Default amount of a manual feed: about 10 g, on the entity's own steps.
const feedDefault = (min, max, step) => {
  const s = step > 0 ? step : 1;
  let v = Math.max(min, s);
  if (v < 10) v = min + Math.ceil((10 - min) / s) * s;
  return Math.min(max, v);
};

// What a manual feed needs, by the domain of its entity: options (select), a range (number) or two hoppers (text).
const feedSpec = (s) => {
  if (!s) return null;
  const domain = s.entity_id.split(".")[0];
  const a = s.attributes || {};
  if (domain === "select") {
    const options = (a.options || []).filter((o) => o !== "");
    return options.length ? { domain, options } : null;
  }
  if (domain === "number") {
    const min = Number(a.min ?? 0);
    const max = Number(a.max ?? 100);
    const step = Number(a.step ?? 1);
    return { domain, min, max, step, unit: a.unit_of_measurement || "g" };
  }
  if (domain === "text") return { domain, hoppers: 2, min: 0, max: 10 };
  return null;
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --pc-accent: #ef8f3a; --pc-ok: var(--success-color, #43a047); --pc-warn: var(--warning-color, #ffa600);
          --pc-crit: var(--error-color, #db4437); --pc-idle: var(--disabled-text-color, #9e9e9e); --pc-water: #2f8fd8; }
  :host { display: block; }
  ha-card { overflow: hidden; container-type: inline-size; }
  /* A size container has no content width: this empty grid gives the card a natural width of 300 px with no
     minimum, so it still shrinks to its track in a grid or a flex row (as in the other ha-* cards). */
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, 300px); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible, button:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .ok { --c: var(--pc-ok); } .warn { --c: var(--pc-warn); } .crit { --c: var(--pc-crit); } .idle { --c: var(--pc-idle); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--pc-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
          line-height: 16px; white-space: nowrap; min-width: 0; overflow: hidden; box-sizing: border-box;
          background: color-mix(in srgb, var(--c, var(--pc-ok)) 15%, transparent); color: var(--c, var(--pc-ok)); }
  .chip.idle { color: var(--primary-text-color); }
  .chip-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .bar { height: 6px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); overflow: hidden; }
  .bar > div { height: 100%; border-radius: 3px; background: var(--c, var(--pc-accent)); transition: width .6s ease; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 8px; }
  /* Tinted round icon, in the overall status colour like the chip. */
  .logo { height: 40px; width: 40px; flex: none; border-radius: 50%; display: grid; place-items: center;
          color: var(--c, var(--pc-accent)); background: color-mix(in srgb, var(--c, var(--pc-accent)) 16%, transparent); }
  .logo .icon { width: 24px; height: 24px; }
  .titles { flex: 1 1 0; min-width: 5ch; }
  :host([hide-title]) .titles > .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .header > .chip { flex: 0 1 auto; }
  .header:has(.sub) .titles { align-self: flex-start; }
  .header:has(.sub) > .chip { align-self: flex-start; margin-top: 1px; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  @container (max-width: 239px) {
    .header { gap: 6px; }
    .header > .chip { flex: none; padding: 6px; }
    .header > .chip .chip-label { display: none; }
  }
  .warning { padding: 16px; color: var(--pc-warn); }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px;
          border-radius: 50%; display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  /* Outlined buttons only (no filled button in the ha-* cards): the accent colour names the action. */
  .act { all: unset; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer;
         height: 28px; padding: 0 10px; border-radius: 14px; font-size: 12px; font-weight: 500; white-space: nowrap;
         border: 1px solid color-mix(in srgb, var(--c, var(--pc-accent)) 45%, transparent); color: var(--c, var(--pc-accent)); }
  .act .icon { width: 16px; height: 16px; }
  .act.round { width: 28px; padding: 0; }
  .act:hover { background: color-mix(in srgb, var(--c, var(--pc-accent)) 10%, transparent); }
  .act[aria-pressed="false"] { --c: var(--secondary-text-color); }
  .act[aria-pressed="true"] { background: color-mix(in srgb, var(--c, var(--pc-accent)) 12%, transparent); }
  .act[aria-disabled="true"] { opacity: .45; cursor: default; }
`;

// Reduce motion: bars jump to their new value instead of sliding.
const MOTION_STYLE = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition: none !important; animation: none !important; }
  }
`;

// In-card popup, at the top of the card (as in the other ha-* cards): confirmations and the feed amount.
const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 190px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           overflow: auto; box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4);
           display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 14px; line-height: 1.4; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
  .modal-actions .btn { border: none; border-radius: 8px; padding: 8px 14px; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer;
                        background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--primary-text-color); }
  .modal-actions .btn.primary { background: color-mix(in srgb, var(--primary-color, #03a9f4) 15%, transparent); color: var(--primary-color, #03a9f4); }
  .modal-actions .btn:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .picks { display: flex; flex-wrap: wrap; gap: 6px; }
  .stepper { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .stepper .lbl { font-size: 13px; color: var(--secondary-text-color); }
  .stepper .val { min-width: 64px; text-align: center; font-size: 18px; font-weight: 500; }
  .stepper .ctl { display: flex; align-items: center; gap: 8px; }
`;

// After a popup closes, clicks on the card are ignored for this long: the second click of a double click on OK
// would otherwise land on what lies under the button.
const CONFIRM_GUARD_MS = 400;

// A click inside a dialog (more-info opened from the card) is not a click outside the card.
const inDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));

// ---------------------------------------------------------------------------
// Base card: state, status of each device, popups and actions
// ---------------------------------------------------------------------------

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. The handler runs when the press and the release are both outside the card (a slider dragged out of the
// card does not count, and a scroll cancels the pointer); keyboard clicks (no click count) still go through the click
// event. The handler keeps its own checks (dialogs opened from the card…). `tap(ev)` is for the tests.
const watchOutside = (card, handler) => {
  let downOutside = false;
  const outside = (ev) => !ev.composedPath().includes(card);
  const onDown = (ev) => {
    downOutside = outside(ev);
  };
  const onUp = (ev) => {
    if (downOutside && outside(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
  };
};

class PetBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Keyboard access: Enter or Space on a focusable non-button element acts as a click.
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" || ev.key === " ") && ev.target.getAttribute?.("role") === "button") {
        ev.preventDefault();
        ev.target.click();
      }
    });
    // Escape closes the popup (as Cancel); Tab stays on the popup's buttons while it is open.
    this._onKey = (ev) => {
      if (!this._dialog) return;
      if (ev.key === "Tab") {
        const btns = [...(this.shadowRoot.querySelectorAll?.(".modal button") || [])];
        if (!btns.length) return;
        ev.preventDefault();
        const i = btns.indexOf(this.shadowRoot.activeElement);
        btns[(i + (ev.shiftKey ? -1 : 1) + btns.length) % btns.length].focus({ preventScroll: true });
        return;
      }
      if (ev.key !== "Escape") return;
      ev.stopPropagation();
      this._closeDialog();
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  connectedCallback() {
    // A click elsewhere on the page closes the popup without acting.
    this._onOutside ??= (ev) => {
      if (!this._dialog || ev.composedPath().includes(this) || inDialog(ev)) return;
      this._closeDialog(false);
    };
    (this._onOutsideWatch ??= watchOutside(this, (ev) => this._onOutside(ev))).on();
    // Back on the page after leaving it: rendered again in its default state.
    this._update?.();
    if (this._dialog) window.addEventListener("keydown", this._onKey);
    // "2 hours ago" moves on with time: redraw every minute (only what changed is written).
    this._tick ??= setInterval(() => this._update(), 60000);
  }

  disconnectedCallback() {
    this._onOutsideWatch?.off();
    // Left (another dashboard view, a conditional card hidden): back to the default state, so that the card does
    // not come back unfolded or with its popup open.
    this._dialog = null;
    window.removeEventListener("keydown", this._onKey);
    clearInterval(this._tick);
    this._tick = null;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._update();
  }

  getCardSize() {
    return 5;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _loc() {
    return fmtLang(this._hass, this._config);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  _update() {
    if (!this._hass || !this._config) return;
    let html = this._render();
    if (this._dialog)
      html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._dialogHtml()}</ha-card>`);
    if (html !== this._html) {
      this._html = html;
      morph(this.shadowRoot, html);
    }
  }

  _call(domain, service, data) {
    return Promise.resolve()
      .then(() => this._hass.callService(domain, service, data))
      .catch((err) => console.error(`pet-card: ${domain}.${service} failed`, err));
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  // Every entity of the device unavailable (cloud down, device removed): the device is unavailable.
  _unavailable(dev) {
    const states = Object.values(dev.entities).map((id) => this._s(id));
    return !states.some((s) => s && s.state !== "unavailable");
  }

  // { cls, key, title, alerts: [{ cls, key }] }: the device's status chip and what needs doing.
  _status(dev) {
    if (this._unavailable(dev)) return { cls: "idle", key: "unavailable", alerts: [] };
    const e = dev.entities;
    const alerts = [];
    if (dev.kind === "feeder") {
      const status = known(this._s(e.status));
      const err = known(this._s(e.error));
      if (status === "offline") alerts.push({ cls: "crit", key: "offline" });
      if (err && err !== "no_error") alerts.push({ cls: "crit", key: "error", title: err });
      const left = num(this._s(e.food_left));
      if ([e.food, e.food1, e.food2].some((id) => this._s(id)?.state === "on") || (left !== null && left <= 10))
        alerts.push({ cls: "warn", key: "food_low" });
      const desiccant = num(this._s(e.desiccant));
      if (desiccant !== null && desiccant <= 0) alerts.push({ cls: "warn", key: "replace_desiccant" });
      if (known(this._s(e.battery)) === "low") alerts.push({ cls: "warn", key: "battery_low" });
      if (status === "on_batteries") alerts.push({ cls: "warn", key: "on_batteries" });
      return alerts.length ? { ...alerts[0], alerts } : { cls: "ok", key: "normal", alerts };
    }
    if (this._s(e.water)?.state === "on") alerts.push({ cls: "warn", key: "water_low" });
    const filter = num(this._s(e.filter));
    if (filter !== null && filter <= 5) alerts.push({ cls: "warn", key: "replace_filter" });
    if (this._s(e.power)?.state === "off") return { cls: "idle", key: "off", alerts };
    return alerts.length ? { ...alerts[0], alerts } : { cls: "ok", key: "running", alerts };
  }

  // Overall status of the shown devices: the header chip and icon.
  _overall(devices) {
    const st = devices.map((d) => this._status(d));
    if (st.some((s) => s.alerts.some((a) => a.cls === "crit"))) return { cls: "crit", key: "attention" };
    if (st.some((s) => s.alerts.length)) return { cls: "warn", key: "attention" };
    if (st.every((s) => s.key === "unavailable")) return { cls: "idle", key: "unavailable" };
    return { cls: "ok", key: "all_good" };
  }

  _chip(cls, text, title) {
    return `<span class="chip ${cls}" title="${esc(title || text)}"><span class="dot"></span><span class="chip-label">${esc(text)}</span></span>`;
  }

  _header(devices) {
    const c = this._config;
    const all = this._overall(devices);
    const text = this._t(all.key);
    const sub = devices.map((d) => d.name).join(" · ");
    return `
      <div class="header">
        <div class="logo ${all.cls === "ok" ? "" : all.cls}" title="${esc(PLATFORMS[devices[0].platform].name)}">${svgIcon(ICONS.paw)}</div>
        <div class="titles">
          <div class="name">${esc(c.title || this._t("title"))}</div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
        </div>
        ${this._chip(all.cls, text)}
        ${this._zoomButton()}
      </div>`;
  }

  // Button at the far right of the header: only the mini card has one.
  _zoomButton() {
    return "";
  }

  _error(key) {
    return `<style>${BASE_STYLE}${MOTION_STYLE}</style><ha-card><div class="warning">${esc(
      key === "unknown_device" ? `${this._t(key)}: ${[].concat(this._config.devices ?? []).join(", ")}` : this._t(key)
    )}</div></ha-card>`;
  }

  // ---- Actions ------------------------------------------------------------

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    if (!this._dialog && Date.now() - (this._dialogClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    if (this._dialog) {
      ev.stopPropagation();
      this._dialogClick(el, path);
      return;
    }
    if (!el) return;
    ev.stopPropagation();
    const { action, entity, device } = el.dataset;
    if (!action) return this._moreInfo(entity);
    if (el.getAttribute("aria-disabled") === "true") return;
    const dev = this._devices?.find((d) => d.id === device);
    const name = dev?.name ?? "";
    const from = { action, device };
    switch (action) {
      case "feed":
        return this._openFeed(dev, from);
      case "reset_filter":
      case "reset_desiccant":
        return this._openDialog(
          { text: this._t(`confirm_${action}`, { name }), ok: this._t("reset"), run: () => this._call("button", "press", { entity_id: entity }) },
          from
        );
      case "power":
        if (this._s(entity)?.state === "off") return this._call("switch", "turn_on", { entity_id: entity });
        return this._openDialog(
          { text: this._t("confirm_off", { name }), ok: this._t("turn_off"), run: () => this._call("switch", "turn_off", { entity_id: entity }) },
          from
        );
      case "toggle":
        return this._call("switch", "toggle", { entity_id: entity });
      case "press":
        return this._call("button", "press", { entity_id: entity });
      case "mode":
        return this._call("select", "select_option", { entity_id: entity, option: el.dataset.option });
    }
  }

  _dialogClick(el, path) {
    const action = el?.dataset.action;
    const f = this._dialog?.feed;
    if (action === "confirm_ok") {
      const { run } = this._dialog;
      this._closeDialog();
      run();
    } else if (action === "confirm_cancel" || (action === "confirm_backdrop" && path[0] === el)) {
      this._closeDialog();
    } else if (f && action === "feed_pick") {
      f.option = el.dataset.option;
      this._update();
    } else if (f && action === "feed_step") {
      const i = Number(el.dataset.index || 0);
      const d = Number(el.dataset.delta);
      const { min, max } = f.spec;
      f.values[i] = Math.min(max, Math.max(min, Math.round((f.values[i] + d) * 1000) / 1000));
      this._update();
    }
  }

  // Manual feed popup: the amount to dispense, then Feed. Built from the entity: options (select), a gram
  // stepper (number) or one portion stepper per hopper (text, "a,b").
  _openFeed(dev, from) {
    const s = this._s(dev?.entities.feed);
    const spec = feedSpec(s);
    if (!spec) return;
    const feed = { entity: s.entity_id, spec };
    if (spec.domain === "select") feed.option = spec.options[0];
    else if (spec.domain === "number") feed.values = [feedDefault(spec.min, spec.max, spec.step)];
    else feed.values = [1, 0];
    this._openDialog(
      {
        feed,
        text: this._t("feed_title", { name: dev.name }),
        ok: this._t("feed"),
        run: () => {
          if (spec.domain === "select") return this._call("select", "select_option", { entity_id: feed.entity, option: feed.option });
          if (spec.domain === "number") return this._call("number", "set_value", { entity_id: feed.entity, value: feed.values[0] });
          return this._call("text", "set_value", { entity_id: feed.entity, value: feed.values.join(",") });
        },
      },
      from
    );
  }

  _openDialog(dialog, from) {
    this._dialog = { ...dialog, from };
    window.addEventListener("keydown", this._onKey);
    this._update();
    this.shadowRoot.querySelector?.(".modal .primary")?.focus({ preventScroll: true });
  }

  _closeDialog(restoreFocus = true) {
    const from = this._dialog?.from;
    this._dialog = null;
    this._dialogClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
    if (restoreFocus && from)
      this.shadowRoot.querySelector?.(`[data-action="${from.action}"][data-device="${from.device}"]`)?.focus({ preventScroll: true });
  }

  _stepper(label, i, step, text) {
    return `<div class="stepper"><span class="lbl">${esc(label)}</span><span class="ctl">
      <button type="button" class="act round" data-action="feed_step" data-index="${i}" data-delta="${-step}" aria-label="−">${svgIcon(ICONS.minus)}</button>
      <span class="val">${esc(text)}</span>
      <button type="button" class="act round" data-action="feed_step" data-index="${i}" data-delta="${step}" aria-label="+">${svgIcon(ICONS.plus)}</button>
    </span></div>`;
  }

  _feedBody(f) {
    const { spec } = f;
    if (spec.domain === "select")
      return `<div class="picks" role="radiogroup">${spec.options
        .map(
          (o) =>
            `<button type="button" class="act" role="radio" aria-checked="${o === f.option}" aria-pressed="${o === f.option}" data-action="feed_pick" data-option="${esc(o)}">${esc(o)}</button>`
        )
        .join("")}</div>`;
    const loc = this._loc();
    if (spec.domain === "number")
      return this._stepper(this._t("food"), 0, spec.step, spec.unit === "g" ? fmtUnit(f.values[0], "gram", loc) : `${fmtNum(f.values[0], loc, 1)} ${spec.unit}`);
    return f.values.map((v, i) => this._stepper(`${this._t("hopper", { n: i + 1 })} · ${this._t("portions")}`, i, 1, fmtNum(v, loc))).join("");
  }

  _dialogHtml() {
    const c = this._dialog;
    const blocked = c.feed?.values?.every((v) => v <= 0);
    return `<div class="backdrop" data-action="confirm_backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-msg">
        <div class="msg" id="confirm-msg">${esc(c.text)}</div>
        ${c.feed ? this._feedBody(c.feed) : ""}
        <div class="modal-actions">
          <button type="button" class="btn" data-action="confirm_cancel">${esc(this._t("cancel"))}</button>
          <button type="button" class="btn primary" data-action="${blocked ? "" : "confirm_ok"}"${blocked ? ' aria-disabled="true"' : ""}>${esc(c.ok)}</button>
        </div>
      </div>
    </div>`;
  }
}

// ---------------------------------------------------------------------------
// Full card
// ---------------------------------------------------------------------------

const FULL_STYLE = `
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .dev { display: flex; flex-direction: column; gap: 10px; }
  .dev + .dev { border-top: 1px solid var(--divider-color, rgba(127,127,127,.2)); padding-top: 12px; }
  .dev-head { display: flex; align-items: center; gap: 10px; }
  .dicon { width: 32px; height: 32px; flex: none; border-radius: 50%; display: grid; place-items: center;
           color: var(--c, var(--pc-accent)); background: color-mix(in srgb, var(--c, var(--pc-accent)) 14%, transparent); }
  .dicon .icon { width: 18px; height: 18px; }
  .dtitles { flex: 1 1 0; min-width: 4ch; }
  .dname { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dsub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dev-head .chip { flex: 0 1 auto; }
  .acts { display: flex; gap: 6px; flex: none; }
  @container (max-width: 299px) {
    .dev-head .chip { padding: 6px; } .dev-head .chip .chip-label { display: none; }
    .acts .act:not(.round) .lbl { display: none; } .acts .act:not(.round) { width: 28px; padding: 0; }
  }
  .level { display: grid; grid-template-columns: 18px minmax(0, 96px) minmax(24px, 1fr) minmax(52px, auto); align-items: center; gap: 8px; font-size: 13px; }
  .level .icon { color: var(--c, var(--secondary-text-color)); }
  .level .lbl { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .level .v { text-align: right; font-weight: 500; white-space: nowrap; }
  .level .v.warn, .level .v.crit { color: var(--c); }
  .level.has-act { grid-template-columns: 18px minmax(0, 96px) minmax(24px, 1fr) minmax(52px, auto) 24px; }
  .level .act { height: 24px; width: 24px; }
  .level .act .icon { width: 14px; height: 14px; }
  .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 6px; }
  .tile { position: relative; display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border-radius: 10px; min-width: 0;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  /* Label and note may take two lines (long translations), the value stays on one. */
  .tile .tl, .tile .ts { font-size: 11px; color: var(--secondary-text-color); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.3; }
  .tile .tv { font-size: 15px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile.warn .tv, .tile.crit .tv { color: var(--c); }
  .tile:has(.act) .tl { padding-right: 22px; }
  .tile .act { position: absolute; top: 6px; right: 6px; height: 24px; width: 24px; }
  .tile .act .icon { width: 14px; height: 14px; }
  .toggles { display: flex; flex-wrap: wrap; gap: 6px; }
`;

class PetCard extends PetBase {
  static getConfigElement() {
    return document.createElement("pet-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  // A level row: icon, label, bar and value.
  _level(id, icon, label, pct, value, cls, act = "") {
    return `<div class="level clickable ${cls}${act ? " has-act" : ""}" role="button" tabindex="0" data-key="${esc(id)}" data-entity="${esc(id)}" aria-label="${esc(`${label} ${value}`)}">
      ${svgIcon(icon)}<span class="lbl">${esc(label)}</span>
      <div class="bar"><div style="width:${pct === null ? 0 : Math.max(0, Math.min(100, pct))}%"></div></div>
      <span class="v ${cls}">${esc(value)}</span>${act}
    </div>`;
  }

  // Food row of a feeder without a percentage: a binary "enough / low" shown as a full or short bar.
  _foodRow(id, label) {
    const s = this._s(id);
    if (!s) return "";
    const low = s.state === "on";
    const unknown = !known(s);
    return this._level(id, ICONS.bowl, label, unknown ? null : low ? 15 : 100, unknown ? "—" : this._t(low ? "low" : "enough"), unknown ? "idle" : low ? "warn" : "ok");
  }

  _tile(id, label, value, { cls = "", sub = "", act = "" } = {}) {
    if (!id) return "";
    return `<div class="tile clickable ${cls}" role="button" tabindex="0" data-key="${esc(id)}" data-entity="${esc(id)}" aria-label="${esc(`${label} ${value}`)}">
      <span class="tl">${esc(label)}</span><span class="tv">${esc(value)}</span>${sub ? `<span class="ts">${esc(sub)}</span>` : ""}${act}
    </div>`;
  }

  _grams(s) {
    const v = num(s);
    return v === null ? "—" : fmtUnit(v, "gram", this._loc());
  }

  _devHead(dev, st, acts) {
    const icon = dev.kind === "feeder" ? ICONS.bowl : ICONS.fountain;
    const title = st.alerts.map((a) => a.title || this._t(a.key)).join(" · ");
    return `<div class="dev-head">
      <span class="dicon ${st.cls === "ok" ? "" : st.cls}">${svgIcon(icon)}</span>
      <div class="dtitles"><div class="dname">${esc(dev.name)}</div>${dev.model ? `<div class="dsub">${esc(dev.model)}</div>` : ""}</div>
      ${this._chip(st.cls, this._t(st.key), title)}
      ${acts ? `<div class="acts">${acts}</div>` : ""}
    </div>`;
  }

  _feeder(dev) {
    const c = this._config;
    const e = dev.entities;
    const st = this._status(dev);
    const loc = this._loc();
    const controls = c.show_controls !== false;
    // A PetKit manual feed select always reads "" (nothing picked): only an unavailable entity blocks it.
    const feedState = this._s(e.feed);
    const feedable = feedSpec(feedState) && feedState.state !== "unavailable";
    const acts = controls
      ? [
          e.call_pet
            ? `<button type="button" class="act round" data-action="press" data-entity="${esc(e.call_pet)}" data-device="${esc(dev.id)}" title="${esc(this._t("call_pet"))}" aria-label="${esc(this._t("call_pet"))}">${svgIcon(ICONS.call)}</button>`
            : "",
          e.feed
            ? `<button type="button" class="act" data-action="feed" data-device="${esc(dev.id)}" data-entity="${esc(e.feed)}" title="${esc(this._t("feed"))}"${feedable ? "" : ' aria-disabled="true"'}>${svgIcon(ICONS.feed)}<span class="lbl">${esc(this._t("feed"))}</span></button>`
            : "",
        ].join("")
      : "";
    const rows = [];
    const left = num(this._s(e.food_left));
    if (left !== null) rows.push(this._level(e.food_left, ICONS.bowl, this._t("food"), left, fmtPct(left, loc), left <= 10 ? "warn" : "ok"));
    else if (e.food1 || e.food2) {
      rows.push(this._foodRow(e.food1, this._t("hopper", { n: 1 })));
      rows.push(this._foodRow(e.food2, this._t("hopper", { n: 2 })));
    } else rows.push(this._foodRow(e.food, this._t("food")));
    let tiles = "";
    if (c.show_stats !== false) {
      const planned = num(this._s(e.planned));
      const times = this._s(e.times);
      const last = num(times) ? fmtAgo(times.last_changed, loc) : null;
      const desiccant = num(this._s(e.desiccant));
      const reset =
        controls && e.reset_desiccant
          ? `<button type="button" class="act round" data-action="reset_desiccant" data-entity="${esc(e.reset_desiccant)}" data-device="${esc(dev.id)}" title="${esc(this._t("reset"))}" aria-label="${esc(this._t("reset"))}">${svgIcon(ICONS.reset)}</button>`
          : "";
      tiles = [
        this._tile(e.dispensed, this._t("dispensed"), this._grams(this._s(e.dispensed)), {
          sub: planned ? this._t("planned", { v: fmtUnit(planned, "gram", loc) }) : "",
        }),
        this._tile(e.times, this._t("meals"), num(times) === null ? "—" : fmtNum(num(times), loc), { sub: last ? `${this._t("last_meal")} ${last}` : "" }),
        this._tile(e.eaten, this._t("eaten"), this._grams(this._s(e.eaten))),
        this._tile(e.bowl, this._t("in_bowl"), this._grams(this._s(e.bowl))),
        this._tile(e.desiccant, this._t("desiccant"), desiccant === null ? "—" : fmtUnit(desiccant, "day", loc), {
          cls: desiccantLevel(desiccant),
          act: reset,
        }),
      ].join("");
    }
    return `<div class="dev" data-key="${esc(dev.id)}">
      ${this._devHead(dev, st, acts)}
      ${rows.join("")}
      ${tiles ? `<div class="tiles">${tiles}</div>` : ""}
    </div>`;
  }

  _fountain(dev) {
    const c = this._config;
    const e = dev.entities;
    const st = this._status(dev);
    const loc = this._loc();
    const controls = c.show_controls !== false;
    const power = this._s(e.power);
    const acts =
      controls && power
        ? `<button type="button" class="act round" data-action="power" data-entity="${esc(e.power)}" data-device="${esc(dev.id)}" aria-pressed="${power.state === "on"}" title="${esc(this._t("power"))}" aria-label="${esc(this._t("power"))}"${known(power) ? "" : ' aria-disabled="true"'}>${svgIcon(ICONS.power)}</button>`
        : "";
    const rows = [];
    const water = this._s(e.water);
    if (water) {
      const low = water.state === "on";
      const unknown = !known(water);
      rows.push(this._level(e.water, ICONS.water, this._t("water"), unknown ? null : low ? 15 : 100, unknown ? "—" : this._t(low ? "low" : "enough"), unknown ? "idle" : low ? "warn" : "ok"));
    }
    const filter = num(this._s(e.filter));
    const reset =
      controls && e.reset_filter
        ? `<button type="button" class="act round" data-action="reset_filter" data-entity="${esc(e.reset_filter)}" data-device="${esc(dev.id)}" title="${esc(this._t("reset"))}" aria-label="${esc(this._t("reset"))}">${svgIcon(ICONS.reset)}</button>`
        : "";
    if (e.filter)
      rows.push(this._level(e.filter, ICONS.filter, this._t("filter"), filter, filter === null ? "—" : fmtPct(filter, loc), filter === null ? "idle" : filterLevel(filter), reset));
    let tiles = "";
    if (c.show_stats !== false) {
      const mode = known(this._s(e.mode));
      const purified = num(this._s(e.purified));
      const energy = num(this._s(e.energy));
      tiles = [
        // With the buttons, the mode is shown (and picked) by the mode buttons below.
        controls ? "" : this._tile(e.mode, this._t("mode"), mode ? (STRINGS.en[`mode_${mode}`] ? this._t(`mode_${mode}`) : mode) : "—"),
        this._tile(e.purified, this._t("purified"), purified === null ? "—" : `${fmtNum(purified, loc)}×`),
        this._tile(e.energy, this._t("energy"), energy === null ? "—" : `${fmtNum(energy, loc, 3)} kWh`),
      ].join("");
    }
    const toggles = [];
    if (controls) {
      const modeS = this._s(e.mode);
      for (const o of modeS?.attributes?.options || [])
        toggles.push(
          `<button type="button" class="act" data-action="mode" data-entity="${esc(e.mode)}" data-device="${esc(dev.id)}" data-option="${esc(o)}" aria-pressed="${modeS.state === o}">${svgIcon(ICONS.mode)}${esc(STRINGS.en[`mode_${o}`] ? this._t(`mode_${o}`) : o)}</button>`
        );
      for (const [role, icon] of [
        ["light", ICONS.light],
        ["dnd", ICONS.dnd],
      ]) {
        const s = this._s(e[role]);
        if (s)
          toggles.push(
            `<button type="button" class="act" data-action="toggle" data-entity="${esc(e[role])}" data-device="${esc(dev.id)}" aria-pressed="${s.state === "on"}"${known(s) ? "" : ' aria-disabled="true"'}>${svgIcon(icon)}${esc(this._t(role))}</button>`
          );
      }
    }
    return `<div class="dev" data-key="${esc(dev.id)}">
      ${this._devHead(dev, st, acts)}
      ${rows.join("")}
      ${tiles ? `<div class="tiles">${tiles}</div>` : ""}
      ${toggles.length ? `<div class="toggles">${toggles.join("")}</div>` : ""}
    </div>`;
  }

  _render() {
    const { devices, error } = findDevices(this._hass, this._config);
    if (error) return this._error(error);
    this._devices = devices;
    return `<style>${BASE_STYLE}${DIALOG_STYLE}${FULL_STYLE}${MOTION_STYLE}</style>
      <ha-card>
        ${this._header(devices)}
        <div class="content">${devices.map((d) => (d.kind === "feeder" ? this._feeder(d) : this._fountain(d))).join("")}</div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Mini card
// ---------------------------------------------------------------------------

const MINI_STYLE = `
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
  .row { display: grid; grid-template-columns: 18px minmax(0, 1fr) minmax(24px, 72px) minmax(52px, auto); align-items: center; gap: 8px; font-size: 13px; }
  .row .icon { color: var(--c, var(--secondary-text-color)); }
  .row .lbl { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row .v { text-align: right; font-weight: 500; white-space: nowrap; }
  .row .v.warn, .row .v.crit { color: var(--c); }
  .foot { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12px; color: var(--pc-warn); }
  .foot span { display: inline-flex; align-items: center; gap: 4px; }
  .foot .icon { width: 14px; height: 14px; }
  .foot .crit { color: var(--pc-crit); }
`;

// The mini card extends the full card: its detail button (top right, `zoom: false` removes it) switches it to the
// full card's content and back; a click anywhere outside the card brings the compact view back too.
class PetMiniCard extends PetCard {
  static getConfigElement() {
    return document.createElement("pet-mini-card-editor");
  }

  constructor() {
    super();
    this._zoomed = false;
    this.shadowRoot.addEventListener("click", (ev) => this._zoomClick(ev));
    this._onUnzoom = (ev) => {
      if (this._zoomed && !this._dialog && !ev.composedPath().includes(this) && !inDialog(ev)) this._setZoom(false);
    };
  }

  connectedCallback() {
    super.connectedCallback();
    (this._onUnzoomWatch ??= watchOutside(this, (ev) => this._onUnzoom(ev))).on();
    // Back on the page after leaving it: rendered again in its default state.
    this._update?.();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._onUnzoomWatch?.off();
    // Left (another dashboard view, a conditional card hidden): back to the default state, so that the card does
    // not come back unfolded or with its popup open.
    this._zoomed = false;
  }

  setConfig(config) {
    this._zoomed = false;
    this.setAttribute?.("mini", "");
    super.setConfig(config);
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 2;
  }

  getGridOptions() {
    return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
  }

  _setZoom(zoomed) {
    this._zoomed = zoomed;
    this._update();
  }

  _zoomClick(ev) {
    if (!ev.target?.closest?.(".zoom")) return;
    ev.stopPropagation();
    this._setZoom(!this._zoomed);
    if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    const label = this._t(z ? "zoom_out" : "zoom_in");
    return `<button type="button" class="zoom" title="${esc(label)}" aria-label="${esc(label)}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  // One row per device: its main level (food left or food state; the fountain's filter, or its water when low).
  _row(dev) {
    const e = dev.entities;
    const st = this._status(dev);
    const loc = this._loc();
    let id;
    let pct = null;
    let value = "—";
    let cls = st.cls === "ok" ? "ok" : st.cls;
    if (dev.kind === "feeder") {
      const left = num(this._s(e.food_left));
      const foods = [e.food, e.food1, e.food2].filter((x) => this._s(x));
      id = left !== null ? e.food_left : foods[0];
      if (left !== null) {
        pct = left;
        value = fmtPct(left, loc);
      } else if (foods.some((x) => known(this._s(x)))) {
        const low = foods.some((x) => this._s(x).state === "on");
        pct = low ? 15 : 100;
        value = this._t(low ? "low" : "enough");
      }
    } else {
      const filter = num(this._s(e.filter));
      const waterLow = this._s(e.water)?.state === "on";
      id = waterLow ? e.water : e.filter || e.water;
      pct = waterLow ? 15 : filter;
      value = waterLow ? this._t("water_low") : filter === null ? "—" : `${this._t("filter")} ${fmtPct(filter, loc)}`;
      if (!waterLow && st.cls === "ok") cls = filterLevel(filter) || "ok";
    }
    if (st.key === "unavailable") value = this._t("unavailable");
    const icon = dev.kind === "feeder" ? ICONS.bowl : ICONS.fountain;
    return `<div class="row clickable ${cls}" role="button" tabindex="0" data-key="${esc(dev.id)}" data-entity="${esc(id || "")}" aria-label="${esc(`${dev.name} ${value}`)}">
      ${svgIcon(icon)}<span class="lbl">${esc(dev.name)}</span>
      <div class="bar"><div style="width:${pct === null ? 0 : Math.max(0, Math.min(100, pct))}%"></div></div>
      <span class="v ${cls}">${esc(value)}</span>
    </div>`;
  }

  _render() {
    if (this._zoomed) return super._render();
    const { devices, error } = findDevices(this._hass, this._config);
    if (error) return this._error(error);
    this._devices = devices;
    const alerts = devices.flatMap((d) => this._status(d).alerts.map((a) => ({ ...a, dev: d })));
    const foot = alerts.length
      ? `<div class="foot">${alerts
          .map((a) => `<span class="${a.cls}" title="${esc(a.title || "")}">${svgIcon(ICONS.alert)}${esc(`${a.dev.name}: ${this._t(a.key)}`)}</span>`)
          .join("")}</div>`
      : "";
    return `<style>${BASE_STYLE}${DIALOG_STYLE}${MINI_STYLE}${MOTION_STYLE}</style>
      <ha-card>
        ${this._header(devices)}
        <div class="content">${devices.map((d) => this._row(d)).join("")}${foot}</div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

// Editor fields whose label is another key than their name.
const LABEL_KEYS = { title: "title_label" };

class PetEditorBase extends HTMLElement {
  // [name, default]
  static get toggles() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema(devices) {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      {
        name: "devices",
        selector: { select: { multiple: true, mode: "list", options: devices.map((d) => ({ value: d.id, label: d.model ? `${d.name} (${d.model})` : d.name })) } },
      },
      { name: "title", selector: { text: {} } },
      { type: "grid", name: "", schema: this.constructor.toggles.map(([name]) => ({ name, selector: { boolean: {} } })) },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANG_NAMES.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const devices = resolve(this._hass) || [];
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, LABEL_KEYS[s.name] || s.name);
      this._form.computeHelper = (s) => STRINGS[lang(this._hass, this._config)][`${s.name}_helper`] ?? STRINGS.en[`${s.name}_helper`];
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        const defaults = Object.fromEntries(this.constructor.toggles);
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: drop empty values and toggles left at their default.
          if (v === "" || v === undefined || v === null || (Array.isArray(v) && !v.length) || (k in defaults && v === defaults[k])) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { ...this._config };
    for (const [name, def] of this.constructor.toggles) if (data[name] === undefined) data[name] = def;
    this._form.hass = this._hass;
    // hass is pushed on every state change while the editor is open: reassign only what changed.
    const dataKey = JSON.stringify(data);
    if (dataKey !== this._dataKey) {
      this._dataKey = dataKey;
      this._form.data = data;
    }
    const schemaKey = JSON.stringify([devices.map((d) => [d.id, d.name, d.model]), lang(this._hass, this._config)]);
    if (schemaKey !== this._schemaKey) {
      this._schemaKey = schemaKey;
      this._form.schema = this._schema(devices);
    }
  }
}

class PetCardEditor extends PetEditorBase {
  static get toggles() {
    return [
      ["show_title", true],
      ["show_subtitle", true],
      ["show_stats", true],
      ["show_controls", true],
    ];
  }
}

class PetMiniCardEditor extends PetEditorBase {
  static get toggles() {
    return [
      ["show_title", true],
      ["show_subtitle", true],
      ["zoom", true],
    ];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("pet-card", PetCard);
define("pet-mini-card", PetMiniCard);
define("pet-card-editor", PetCardEditor);
define("pet-mini-card-editor", PetMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  { type: "pet-card", name: "Pet Card", description: "Smart pet devices (PetKit feeders and water fountains): food, water, filter, desiccant, manual feed." },
  { type: "pet-mini-card", name: "Pet Mini Card", description: "Compact overview of smart pet devices (PetKit feeders and water fountains)." },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-pet-card" });
}

console.info(`%c PET-CARD %c v${VERSION} `, "color: white; background: #ef8f3a; font-weight: 700;", "color: #ef8f3a; background: white; font-weight: 700;");
