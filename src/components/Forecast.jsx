import React from 'react';
import WeatherCard from './WeatherCard';
import { cityDateKey, formatCityDate } from '../utils/cityTime';

const Forecast = ({ data, unit }) => {
  if (!data || !data.list) return null;

  const timezoneOffset = data.city?.timezone ?? 0;

  // Group forecasts by the city's own calendar day (not UTC's — for a
  // city far from UTC, local midnight can fall on a different date than
  // dt_txt's UTC-based date substring, which previously misgrouped
  // entries), and pick the reading closest to local noon to represent
  // each day rather than whichever happened to be seen first.
  const dailyForecasts = data.list.reduce((acc, forecast) => {
    const key = cityDateKey(forecast.dt, timezoneOffset);
    const hour = formatCityDate(forecast.dt, timezoneOffset).hour;

    if (hour === 12 || !acc[key]) {
      acc[key] = forecast;
    }
    return acc;
  }, {});

  const forecastArray = Object.values(dailyForecasts).slice(0, 5);

  return (
    <div className="panel p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--ink-900)' }}>5-Day Outlook</h2>
        <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--ink-500)' }}>daily</span>
      </div>
      <div className="space-y-2">
        {forecastArray.map((day, index) => (
          <WeatherCard key={index} day={day} unit={unit} timezone={timezoneOffset} />
        ))}
      </div>
    </div>
  );
};

export default Forecast;
