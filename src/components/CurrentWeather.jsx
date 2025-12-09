import React, { useState } from 'react';

const CurrentWeather = ({ data, unit, onToggleUnit, isFavorite, onToggleFavorite }) => {
  const [isCelsius, setIsCelsius] = useState(unit === 'metric');

  const toggleUnit = () => {
    const newUnit = isCelsius ? 'imperial' : 'metric';
    setIsCelsius(!isCelsius);
    onToggleUnit(newUnit);
  };

  const formatTemperature = (temp) => {
    return isCelsius ? `${Math.round(temp)}°C` : `${Math.round((temp * 9/5) + 32)}°F`;
  };

  const formatWindSpeed = (speed) => {
    return isCelsius ? `${Math.round(speed)} m/s` : `${Math.round(speed * 2.237)} mph`;
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

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // SVG Icons
  const ThermometerIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const DropletsIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );

  const WindIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 14l-4-4m4 4l4-4" />
    </svg>
  );

  const CloudIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
    </svg>
  );

  const SunriseIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const SunsetIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  const VisibilityIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  if (!data) return null;

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 fade-in h-full">
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              {data.name}, {data.sys.country}
            </h1>
            <p className="text-gray-600 text-sm">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleUnit}
              className="px-3 py-1.5 rounded-full bg-linear-to-r from-blue-500 to-purple-600 text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-md"
            >
              Switch to {isCelsius ? '°F' : '°C'}
            </button>
            
            {/* Favorite star button */}
            <button
              onClick={onToggleFavorite}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? '⭐' : '☆'}
            </button>
          </div>
        </div>

        {/* Main Content - Takes remaining space */}
        <div className="flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 h-full">
            {/* Left Column */}
            <div className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="text-5xl md:text-6xl">
                    {getWeatherIcon(data.weather[0].icon)}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl md:text-5xl font-bold text-gray-800">
                        {formatTemperature(data.main.temp)}
                      </span>
                    </div>
                    <p className="text-md text-gray-600 capitalize">
                      {data.weather[0].description}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Feels like {formatTemperature(data.main.feels_like)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Temperature and Humidity - Bottom of left column */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-blue-50/50 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <ThermometerIcon />
                    <span className="font-medium text-gray-700 text-xs">High / Low</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatTemperature(data.main.temp_max)} / {formatTemperature(data.main.temp_min)}
                  </p>
                </div>

                <div className="bg-blue-50/50 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <DropletsIcon />
                    <span className="font-medium text-gray-700 text-xs">Humidity</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {data.main.humidity}%
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 h-full">
              {/* First two squares */}
              <div className="bg-linear-to-br from-blue-100 to-blue-50 rounded-lg p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <WindIcon />
                    <span className="font-medium text-gray-700 text-xs">Wind</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatWindSpeed(data.wind.speed)}
                  </p>
                </div>
                <p className="text-gray-600 text-xs mt-2">
                  Direction: {data.wind.deg}°
                </p>
              </div>

              <div className="bg-linear-to-br from-purple-100 to-purple-50 rounded-lg p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <CloudIcon />
                    <span className="font-medium text-gray-700 text-xs">Pressure</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {data.main.pressure} hPa
                  </p>
                </div>
              </div>

              {/* Next two squares */}
              <div className="bg-linear-to-br from-green-100 to-green-50 rounded-lg p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <VisibilityIcon />
                    <span className="font-medium text-gray-700 text-xs">Visibility</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {Math.round(data.visibility / 1000)} km
                  </p>
                </div>
              </div>

              <div className="bg-linear-to-br from-orange-100 to-orange-50 rounded-lg p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <CloudIcon />
                    <span className="font-medium text-gray-700 text-xs">Cloudiness</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {data.clouds.all}%
                  </p>
                </div>
              </div>

              {/* Sunrise & Sunset - Full width at bottom */}
              <div className="bg-linear-to-br from-yellow-100 to-yellow-50 rounded-lg p-3 col-span-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <SunriseIcon />
                      <span className="font-medium text-gray-700 text-xs">Sunrise</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatTime(data.sys.sunrise)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <SunsetIcon />
                      <span className="font-medium text-gray-700 text-xs">Sunset</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatTime(data.sys.sunset)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;