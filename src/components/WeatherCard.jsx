import React from 'react';

const WeatherCard = ({ day, isCelsius }) => {
  const formatTemperature = (temp) => {
    return isCelsius ? `${Math.round(temp)}°C` : `${Math.round((temp * 9/5) + 32)}°F`;
  };

  const getWeatherIcon = (condition) => {
    const iconMap = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '⛅',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌦️',
      '10n': '🌦️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '❄️',
      '13n': '❄️',
      '50d': '🌫️',
      '50n': '🌫️',
    };
    return iconMap[condition] || '🌤️';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    };
  };

  const date = formatDate(day.dt_txt);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm hover:shadow transition-all duration-300 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl">
            {getWeatherIcon(day.weather[0].icon)}
          </div>
          <div>
            <div className="font-semibold text-gray-800 text-sm">{date.weekday}</div>
            <div className="text-xs text-gray-500">{date.day} {date.month}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-gray-800">
                {formatTemperature(day.main.temp_max)}
              </span>
              <span className="text-gray-500 text-xs">
                {formatTemperature(day.main.temp_min)}
              </span>
            </div>
            <div className="text-xs text-gray-600 capitalize truncate max-w-[80px]">
              {day.weather[0].description}
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-500">Humidity</p>
              <p className="font-semibold text-gray-700 text-xs">{day.main.humidity}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Wind</p>
              <p className="font-semibold text-gray-700 text-xs">{Math.round(day.wind.speed)} m/s</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;