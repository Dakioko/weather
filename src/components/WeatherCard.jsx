import React from 'react';
import WeatherIcon from './WeatherIcon';

const WeatherCard = ({ day, unit }) => {
  // Forecast data is fetched with units=<unit> already (Celsius/m/s for
  // metric, Fahrenheit/mph for imperial) — just round and label, no math.
  const formatTemperature = (temp) => `${Math.round(temp)}°`;
  const windUnit = unit === 'metric' ? 'm/s' : 'mph';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
    };
  };

  const date = formatDate(day.dt_txt);

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
            <span>{Math.round(day.wind.speed)}{windUnit}</span>
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
