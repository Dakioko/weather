import React from 'react';

const Favorites = ({ favorites, unit, onSelect }) => {
  if (!favorites.length) return null;

  const getWeatherIcon = (condition) => {
    const iconMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️',
      'Drizzle': '🌦️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️',
    };
    return iconMap[condition] || '🌤️';
  };

  const formatTemperature = (temp) => {
    return unit === 'metric' ? `${Math.round(temp)}°C` : `${Math.round((temp * 9/5) + 32)}°F`;
  };

  return (
    <div className="mb-4 fade-in">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">⭐ Favorite Cities</h3>
        <span className="text-xs text-gray-500">{favorites.length} saved</span>
      </div>
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {favorites.map((fav, index) => (
          <button
            key={index}
            onClick={() => onSelect(`${fav.name}, ${fav.country}`)}
            className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-white hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="text-xl">
                {getWeatherIcon(fav.condition)}
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800 text-sm">{fav.name}</div>
                <div className="text-xs text-gray-600">{fav.country}</div>
                <div className="font-bold text-gray-800 mt-1">
                  {formatTemperature(fav.temp)}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Favorites;