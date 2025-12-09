//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './index.css'

import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import BackgroundWrapper from './components/BackgroundWrapper';
import HourlyForecast from './components/HourlyForecast';
import AirQuality from './components/AirQuality';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [lastSearched, setLastSearched] = useState(() => {
    return localStorage.getItem('lastSearchedCity') || 'Nairobi';
  });

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('weatherFavorites');
    return saved ? JSON.parse(saved) : [];
  });

  // VITE uses import.meta.env, not process.env
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const fetchWeatherData = useCallback(async (city) => {
    if (!API_KEY) {
      setError('API key not configured. Please add VITE_WEATHER_API_KEY to your .env file');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setAirQualityData(null);

    try {
      // Fetch current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('City not found');
      }
      
      const weatherData = await weatherResponse.json();

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${unit}`
      );
      
      if (!forecastResponse.ok) {
        throw new Error('Forecast not available');
      }
      
      const forecastData = await forecastResponse.json();

      // Fetch air quality data
      try {
        const airQualityResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`
        );
        if (airQualityResponse.ok) {
          const airQualityData = await airQualityResponse.json();
          setAirQualityData(airQualityData);
        }
      } catch (aqiError) {
        console.log('Air quality data not available');
      }

      setWeatherData(weatherData);
      setForecastData(forecastData);
      setLastSearched(city);
      localStorage.setItem('lastSearchedCity', city);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  }, [API_KEY, unit]);

  const fetchWeatherByCoords = useCallback(async (lat, lon) => {
    if (!API_KEY) return;

    setLoading(true);
    setError(null);
    setAirQualityData(null);

    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
      );
      const weatherData = await weatherResponse.json();

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
      );
      const forecastData = await forecastResponse.json();

      // Fetch air quality data
      try {
        const airQualityResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        if (airQualityResponse.ok) {
          const airQualityData = await airQualityResponse.json();
          setAirQualityData(airQualityData);
        }
      } catch (aqiError) {
        console.log('Air quality data not available');
      }

      setWeatherData(weatherData);
      setForecastData(forecastData);
      setLastSearched(`${weatherData.name}, ${weatherData.sys.country}`);
      localStorage.setItem('lastSearchedCity', `${weatherData.name}, ${weatherData.sys.country}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_KEY, unit]);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError('Unable to retrieve your location');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const handleToggleUnit = (newUnit) => {
    setUnit(newUnit);
    if (lastSearched) {
      fetchWeatherData(lastSearched);
    }
  };

  const toggleFavorite = () => {
    if (!weatherData) return;
    
    const cityKey = `${weatherData.name},${weatherData.sys.country}`;
    const isFavorite = favorites.some(fav => fav.key === cityKey);
    
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav.key !== cityKey);
    } else {
      newFavorites = [
        ...favorites,
        {
          key: cityKey,
          name: weatherData.name,
          country: weatherData.sys.country,
          temp: weatherData.main.temp,
          condition: weatherData.weather[0].main,
          icon: weatherData.weather[0].icon
        }
      ];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('weatherFavorites', JSON.stringify(newFavorites));
  };

  useEffect(() => {
    // Load last searched city on initial render
    const lastCity = localStorage.getItem('lastSearchedCity') || 'Nairobi';
    fetchWeatherData(lastCity);
  }, []);

  useEffect(() => {
    if (lastSearched) {
      fetchWeatherData(lastSearched);
    }
  }, [unit]);

  // SVG Icons
  const LoadingIcon = () => (
    <svg className="w-12 h-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  const ErrorIcon = () => (
    <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <BackgroundWrapper weatherCondition={weatherData?.weather[0]?.main}>
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Header with proper z-index */}
          <header className="mb-6 fade-in relative z-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 relative">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Weather Dashboard
                </h1>
                <p className="text-gray-600 text-sm">Real-time weather intelligence</p>
              </div>
              
              {/* Search Bar - Has its own z-index */}
              <div className="w-full md:w-auto">
                <SearchBar 
                  onSearch={fetchWeatherData} 
                  onLocationClick={handleLocationClick}
                  favorites={favorites}
                  onFavoriteSelect={(city) => fetchWeatherData(city)}
                />
              </div>
            </div>

            {/* Slim Favorites Bar */}
            {favorites.length > 0 && (
              <div className="mb-4 fade-in relative z-40">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">⭐ Favorites</h3>
                  <span className="text-xs text-gray-500">{favorites.length} cities</span>
                </div>
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-1 px-1">
                  {favorites.map((fav, index) => (
                    <button
                      key={index}
                      onClick={() => fetchWeatherData(`${fav.name}, ${fav.country}`)}
                      className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 hover:bg-white hover:shadow transition-all duration-300 group min-w-[110px] relative z-10"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-lg">
                          {fav.condition === 'Clear' && '☀️'}
                          {fav.condition === 'Clouds' && '☁️'}
                          {fav.condition === 'Rain' && '🌧️'}
                          {fav.condition === 'Snow' && '❄️'}
                          {fav.condition === 'Thunderstorm' && '⛈️'}
                          {!['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm'].includes(fav.condition) && '🌤️'}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-800 text-sm truncate max-w-[65px]">{fav.name}</div>
                          <div className="font-bold text-gray-800 text-sm">
                            {unit === 'metric' ? `${Math.round(fav.temp)}°C` : `${Math.round((fav.temp * 9/5) + 32)}°F`}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </header>

          {/* Main content with lower z-index */}
          <main className="relative z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <LoadingIcon />
                <p className="text-gray-600 mt-4">Loading weather data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] fade-in">
                <ErrorIcon />
                <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchWeatherData('Nairobi')}
                  className="px-6 py-3 rounded-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Load Default Location
                </button>
              </div>
            ) : weatherData && forecastData ? (
              <div className="space-y-6">
                {/* Top Section: Current Weather + 5-Day Forecast - Same Height */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Current Weather */}
                  <div className="lg:col-span-2 h-full">
                    <CurrentWeather 
                      data={weatherData} 
                      unit={unit}
                      onToggleUnit={handleToggleUnit}
                      isFavorite={favorites.some(fav => fav.key === `${weatherData.name},${weatherData.sys.country}`)}
                      onToggleFavorite={toggleFavorite}
                    />
                  </div>
                  
                  {/* 5-Day Forecast - Compact vertical */}
                  <div className="lg:col-span-1">
                    <Forecast 
                      data={forecastData} 
                      unit={unit}
                    />
                  </div>
                </div>

                {/* Hourly Forecast - Full Width */}
                <div>
                  <HourlyForecast 
                    data={forecastData} 
                    unit={unit}
                  />
                </div>

                {/* Air Quality - Full Width */}
                <div>
                  {airQualityData ? (
                    <AirQuality 
                      data={airQualityData}
                    />
                  ) : (
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                      <div className="text-center">
                        <p className="text-gray-600">Air quality data not available</p>
                        <p className="text-gray-500 text-sm mt-2">Try another location</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </main>

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-gray-200/50 text-center relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-500 text-sm">
                <p>Powered by <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenWeatherMap API</a></p>
                <p className="mt-1">Data updates every 3 hours</p>
              </div>
              
              <div className="flex items-center gap-4">
                {weatherData && (
                  <button
                    onClick={() => {
                      const shareText = `🌤️ Weather in ${weatherData.name}: ${Math.round(weatherData.main.temp)}°C, ${weatherData.weather[0].description}`;
                      if (navigator.share) {
                        navigator.share({
                          title: `Weather in ${weatherData.name}`,
                          text: shareText,
                        });
                      } else {
                        navigator.clipboard.writeText(shareText);
                        alert('Weather info copied to clipboard!');
                      }
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                )}
                <div className="text-gray-400 text-xs">
                  <p>Last updated: {weatherData ? new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </BackgroundWrapper>
  );
}

export default App;