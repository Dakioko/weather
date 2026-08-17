/**
 * OpenWeather timestamps (`dt`, `sunrise`, `sunset`, etc.) are Unix UTC
 * seconds. Formatting them with `new Date(ts * 1000)` plus the browser's
 * local getters/toLocaleString shows the *viewer's* local time — correct
 * only when the viewer happens to share a timezone with the city being
 * displayed. For any other city (or a dev machine set to a different
 * zone) it's silently wrong.
 *
 * The fix: shift the timestamp by the city's own UTC offset in seconds
 * (the API's `timezone` field), then read it back using the UTC getters.
 * The Date object's "UTC" fields then report the city's local wall-clock
 * time, regardless of what timezone the browser itself is in.
 */
export function toCityDate(unixSeconds, timezoneOffsetSeconds = 0) {
  return new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
}

export function formatCityTime(unixSeconds, timezoneOffsetSeconds = 0) {
  const d = toCityDate(unixSeconds, timezoneOffsetSeconds);
  let hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

export function formatCityHour(unixSeconds, timezoneOffsetSeconds = 0) {
  const d = toCityDate(unixSeconds, timezoneOffsetSeconds);
  const hours = d.getUTCHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}${ampm}`;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatCityDate(unixSeconds, timezoneOffsetSeconds = 0) {
  const d = toCityDate(unixSeconds, timezoneOffsetSeconds);
  return {
    weekday: WEEKDAYS[d.getUTCDay()],
    weekdayLong: WEEKDAYS_LONG[d.getUTCDay()],
    day: d.getUTCDate(),
    month: MONTHS[d.getUTCMonth()],
    hour: d.getUTCHours(),
    year: d.getUTCFullYear(),
    monthIndex: d.getUTCMonth(),
  };
}

/** A stable per-day grouping key in the city's own calendar, not UTC's. */
export function cityDateKey(unixSeconds, timezoneOffsetSeconds = 0) {
  const { year, monthIndex, day } = formatCityDate(unixSeconds, timezoneOffsetSeconds);
  return `${year}-${monthIndex}-${day}`;
}
