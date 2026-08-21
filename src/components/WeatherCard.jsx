import React from 'react';
import WeatherIcon from './WeatherIcon';
import { formatCityDate } from '../utils/cityTime';
import { celsiusToDisplay, msToDisplay, windUnitLabel } from '../utils/units';

const WeatherCard = ({ day, unit, timezone = 0 }) => {
  // Forecast data is always fetched in metric — convert for display here.
  // See utils/units.js for why this is the only place that math happens.
  const formatTemperature = (temp) => `${Math.round(celsiusToDisplay(temp, unit))}°`;
  const windUnit = windUnitLabel(unit);

  // day.dt_txt is a UTC string with no timezone marker, so parsing it
  // with `new Date()` gets silently interpreted in the browser's local
  // timezone — wrong for any city that isn't the viewer's own. day.dt is
  // an unambiguous unix timestamp; shift it by the city's own offset.
  const date = formatCityDate(day.dt, timezone);

  return (
    <div
      className="rounded-xl p-3 fade-in transition-colors hover:bg-white/60"
      style={{ background: 'var(--paper-50)', border: '1px solid var(--line)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0" style={{ color: 'var(--ink-700)' }}>
            <WeatherIcon code={day.weather[0].icon} size={30} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm" style={{ color: 'var(--ink-900)' }}>{date.weekday}</div>
            <div className="text-xs font-mono" style={{ color: 'var(--ink-500)' }}>{date.day} {date.month}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs capitalize truncate max-w-[90px]" style={{ color: 'var(--ink-700)' }}>
              {day.weather[0].description}
            </p>
          </div>
          <div className="flex gap-2 font-mono text-[11px]" style={{ color: 'var(--ink-500)' }}>
            <span>RH {day.main.humidity}%</span>
            <span>{Math.round(msToDisplay(day.wind.speed, unit))}{windUnit}</span>
          </div>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-base font-semibold" style={{ color: 'var(--ink-900)' }}>
              {formatTemperature(day.main.temp_max)}
            </span>
            <span className="text-xs" style={{ color: 'var(--ink-500)' }}>
              {formatTemperature(day.main.temp_min)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
