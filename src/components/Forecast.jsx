import React from 'react';
import WeatherCard from './WeatherCard';

const Forecast = ({ data, unit }) => {
  if (!data || !data.list) return null;

  const isCelsius = unit === 'metric';

  // Group forecasts by day and take one reading per day (around noon)
  const dailyForecasts = data.list.reduce((acc, forecast) => {
    const date = forecast.dt_txt.split(' ')[0];
    const hour = new Date(forecast.dt_txt).getHours();

    if (hour === 12 || !acc[date]) {
      acc[date] = forecast;
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
          <WeatherCard key={index} day={day} isCelsius={isCelsius} />
        ))}
      </div>
    </div>
  );
};

export default Forecast;
