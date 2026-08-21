/**
 * Weather data is always fetched from the API in metric (Celsius, m/s) —
 * see WeatherApi.js and App.jsx's fetch functions. `unit` is a pure
 * display preference from here on, so toggling it is instant (no
 * refetch). These are the only two places the actual conversion math
 * should happen, to avoid the double-conversion bugs that came from
 * having both the fetch *and* the display layer converting independently.
 */
export function celsiusToDisplay(celsius, unit) {
  return unit === 'metric' ? celsius : (celsius * 9) / 5 + 32;
}

export function msToDisplay(metersPerSecond, unit) {
  return unit === 'metric' ? metersPerSecond : metersPerSecond * 2.23694;
}

export function windUnitLabel(unit) {
  return unit === 'metric' ? 'm/s' : 'mph';
}
