import React from 'react';

const HourlyForecast = ({ data, unit }) => {
  if (!data || !data.list) return null;

  const isCelsius = unit === 'metric';

  // Get 24 hours of forecast (8 * 3-hour intervals = 24 hours)
  // Let's get 8 data points for a full day
  const hourlyData = data.list.slice(0, 8); // 8 readings = 24 hours

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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}${ampm}`;
  };

  // Calculate temperature range for the scale
  const temps = hourlyData.map(h => h.main.temp);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const tempRange = maxTemp - minTemp || 1;

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 md:p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">24-Hour Forecast</h2>
        <span className="text-sm text-gray-500">Every 3 hours</span>
      </div>
      
      <div className="space-y-6">
        {/* Temperature Graph - Simplified, no temperature labels */}
        <div className="relative h-24 mb-2">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="border-t border-gray-100"></div>
            ))}
          </div>
          
          {/* Time labels at bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
            {hourlyData.map((hour, index) => (
              <div key={index} className="text-xs text-gray-500">
                {index === 0 ? 'Now' : formatTime(hour.dt)}
              </div>
            ))}
          </div>
          
          {/* Temperature line */}
          <div className="absolute inset-0 flex items-end pb-6">
            {hourlyData.map((hour, index) => {
              const tempPosition = ((hour.main.temp - minTemp) / tempRange) * 80;
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center"
                  style={{ height: '100%' }}
                >
                  <div className="relative w-full flex justify-center">
                    {/* Temperature point */}
                    <div 
                      className="w-3 h-3 rounded-full bg-linear-to-r from-blue-500 to-purple-600 absolute z-10 shadow-md border-2 border-white"
                      style={{ bottom: `${tempPosition}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Connect temperature points with line */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
            <polyline
              points={hourlyData.map((hour, index) => {
                const x = (index / (hourlyData.length - 1)) * 100;
                const y = 100 - ((hour.main.temp - minTemp) / tempRange) * 80;
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke="url(#tempGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Hourly forecast cards - Grid layout to fill width */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
          {hourlyData.map((hour, index) => (
            <div
              key={index}
              className="bg-white/50 rounded-xl p-3 text-center hover:bg-white/80 transition-all duration-300 hover:scale-105"
            >
              <div className="font-medium text-gray-700 mb-1 text-sm">
                {index === 0 ? 'Now' : formatTime(hour.dt)}
              </div>
              <div className="text-3xl md:text-4xl mb-2">
                {getWeatherIcon(hour.weather[0].icon)}
              </div>
              <div className="font-bold text-gray-800 text-lg md:text-xl">
                {formatTemperature(hour.main.temp)}
              </div>
              <div className="text-xs text-gray-500 mt-1 capitalize truncate">
                {hour.weather[0].description}
              </div>
              <div className="grid grid-cols-2 gap-1 mt-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-700">{hour.main.humidity}%</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 14l-4-4m4 4l4-4" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-700">{Math.round(hour.wind.speed)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;
