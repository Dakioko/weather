import React from 'react';
import WeatherCard from './WeatherCard';

const Forecast = ({ data, unit }) => {
  if (!data || !data.list) return null;

  const isCelsius = unit === 'metric';

  // Group forecasts by day and take one reading per day (around noon)
  const dailyForecasts = data.list.reduce((acc, forecast) => {
    const date = forecast.dt_txt.split(' ')[0];
    const hour = new Date(forecast.dt_txt).getHours();
    
    // Take forecast around noon (12:00:00)
    if (hour === 12 || !acc[date]) {
      acc[date] = forecast;
    }
    return acc;
  }, {});

  // Convert to array and take next 5 days
  const forecastArray = Object.values(dailyForecasts).slice(0, 5);

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 fade-in h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-3">5-Day Forecast</h2>
      <div className="space-y-2">
        {forecastArray.map((day, index) => (
          <WeatherCard key={index} day={day} isCelsius={isCelsius} />
        ))}
      </div>
    </div>
  );
};

export default Forecast;