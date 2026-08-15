import './index.css'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import BackgroundWrapper from './components/BackgroundWrapper';
import HourlyForecast from './components/HourlyForecast';
import AirQuality from './components/AirQuality';
import Favorites from './components/Favorites';
import Toast from './components/Toast';
import { getWeather, getWeatherByCoords, getForecast, getForecastByCoords, getAirQuality } from './WeatherApi';

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

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('weatherFavorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState({ visible: false, message: '' });
  const showToast = (message) => setToast({ visible: true, message });
  const dismissToast = () => setToast((t) => ({ ...t, visible: false }));

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // Wraps the loading->content swap in a View Transition so the skeleton
  // crossfades into real content instead of hard-cutting. Falls back to
  // an instant swap in browsers that don't support the API yet.
  const finishLoading = useCallback(() => {
    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.startViewTransition(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Guards the [unit] effect below so it only runs on unit *changes*,
  // not on the initial mount — the mount effect already does that fetch.
  // (Previously both effects fired on load, racing two fetches against
  // each other and occasionally leaving stale data on screen.)
  const hasMountedRef = useRef(false);

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
      const weather = await getWeather(city, unit);
      const forecast = await getForecast(city, unit);

      try {
        const aqi = await getAirQuality(weather.coord.lat, weather.coord.lon);
        setAirQualityData(aqi);
      } catch {
        console.log('Air quality data not available');
      }

      setWeatherData(weather);
      setForecastData(forecast);
      setLastSearched(city);
      localStorage.setItem('lastSearchedCity', city);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching weather data:', err);
      setLoading(false);
      return;
    }
    finishLoading();
  }, [API_KEY, unit, finishLoading]);

  const fetchWeatherByCoords = useCallback(async (lat, lon) => {
    if (!API_KEY) return;

    setLoading(true);
    setError(null);
    setAirQualityData(null);

    try {
      const weather = await getWeatherByCoords(lat, lon, unit);
      const forecast = await getForecastByCoords(lat, lon, unit);

      try {
        const aqi = await getAirQuality(lat, lon);
        setAirQualityData(aqi);
      } catch {
        console.log('Air quality data not available');
      }

      setWeatherData(weather);
      setForecastData(forecast);
      setLastSearched(`${weather.name}, ${weather.sys.country}`);
      localStorage.setItem('lastSearchedCity', `${weather.name}, ${weather.sys.country}`);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching weather by coords:', err);
      setLoading(false);
      return;
    }
    finishLoading();
  }, [API_KEY, unit, finishLoading]);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeatherByCoords(position.coords.latitude, position.coords.longitude),
        () => {
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
  };

  const toggleFavorite = () => {
    if (!weatherData) return;

    const cityKey = `${weatherData.name},${weatherData.sys.country}`;
    const isFavorite = favorites.some((fav) => fav.key === cityKey);

    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter((fav) => fav.key !== cityKey);
    } else {
      newFavorites = [
        ...favorites,
        {
          key: cityKey,
          name: weatherData.name,
          country: weatherData.sys.country,
          temp: weatherData.main.temp,
          condition: weatherData.weather[0].main,
          icon: weatherData.weather[0].icon,
        },
      ];
    }

    setFavorites(newFavorites);
    localStorage.setItem('weatherFavorites', JSON.stringify(newFavorites));
  };

  // Initial load — the only place the very first fetch happens.
  useEffect(() => {
    const lastCity = localStorage.getItem('lastSearchedCity') || 'Nairobi';
    fetchWeatherData(lastCity);
    hasMountedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch only when the unit actually changes after mount.
  useEffect(() => {
    if (!hasMountedRef.current) return;
    if (lastSearched) fetchWeatherData(lastSearched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  const LoadingIcon = () => (
    <svg className="w-10 h-10 animate-spin" style={{ color: 'var(--amber)' }} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  const ErrorIcon = () => (
    <svg className="w-14 h-14" style={{ color: 'var(--rose)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const SkeletonPanels = () => (
    <div className="space-y-6" aria-busy="true" aria-label="Loading weather data">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 panel p-6 h-72"><div className="skeleton h-full w-full" /></div>
        <div className="lg:col-span-1 panel p-6 h-72"><div className="skeleton h-full w-full" /></div>
      </div>
      <div className="panel p-6 h-56"><div className="skeleton h-full w-full" /></div>
      <div className="panel p-6 h-64"><div className="skeleton h-full w-full" /></div>
    </div>
  );

  return (
    <BackgroundWrapper
      weatherCondition={weatherData?.weather[0]?.main}
      sunrise={weatherData?.sys?.sunrise}
      sunset={weatherData?.sys?.sunset}
      currentTime={weatherData?.dt}
    >
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto relative">
          <header className="mb-6 fade-in relative z-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-semibold text-white drop-shadow-sm">
                  Weather Dashboard
                </h1>
                <p className="text-sm mt-0.5 text-white/80">Real-time weather intelligence</p>
              </div>

              <div className="w-full md:w-auto">
                <SearchBar
                  onSearch={fetchWeatherData}
                  onLocationClick={handleLocationClick}
                  favorites={favorites}
                  onFavoriteSelect={(city) => fetchWeatherData(city)}
                />
              </div>
            </div>

            <Favorites
              favorites={favorites}
              unit={unit}
              onSelect={(city) => fetchWeatherData(city)}
            />
          </header>

          <main className="relative z-10">
            {loading ? (
              <SkeletonPanels />
            ) : error ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] fade-in panel p-10 max-w-md mx-auto text-center">
                <ErrorIcon />
                <h3 className="font-display text-xl font-semibold mt-4 mb-1" style={{ color: 'var(--ink-900)' }}>
                  Couldn't load that
                </h3>
                <p className="text-sm mb-5" style={{ color: 'var(--ink-500)' }}>{error}</p>
                <button
                  onClick={() => fetchWeatherData('Nairobi')}
                  className="px-6 py-3 rounded-full text-white font-medium hover:opacity-90 active:scale-95 transition-all"
                  style={{ background: 'var(--ink-700)' }}
                >
                  Load Nairobi instead
                </button>
              </div>
            ) : weatherData && forecastData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 h-full fade-in stagger-1">
                    <CurrentWeather
                      data={weatherData}
                      unit={unit}
                      onToggleUnit={handleToggleUnit}
                      isFavorite={favorites.some((fav) => fav.key === `${weatherData.name},${weatherData.sys.country}`)}
                      onToggleFavorite={toggleFavorite}
                    />
                  </div>
                  <div className="lg:col-span-1 fade-in stagger-2">
                    <Forecast data={forecastData} unit={unit} />
                  </div>
                </div>

                <div className="fade-in stagger-3">
                  <HourlyForecast data={forecastData} unit={unit} />
                </div>

                <div className="fade-in stagger-4">
                  {airQualityData ? (
                    <AirQuality data={airQualityData} />
                  ) : (
                    <div className="panel p-8 text-center">
                      <p style={{ color: 'var(--ink-700)' }}>Air quality data not available for this location</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--ink-500)' }}>Try another city</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </main>

          <footer className="mt-8 pt-6 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-white/80 text-sm text-center md:text-left">
                <p>
                  Powered by{' '}
                  <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                    OpenWeatherMap
                  </a>
                </p>
                <p className="mt-0.5 text-xs">Data updates every 3 hours</p>
              </div>

              <div className="flex items-center gap-4">
                {weatherData && (
                  <button
                    onClick={() => {
                      const shareText = `Weather in ${weatherData.name}: ${Math.round(weatherData.main.temp)}°C, ${weatherData.weather[0].description}`;
                      if (navigator.share) {
                        navigator.share({ title: `Weather in ${weatherData.name}`, text: shareText });
                      } else {
                        navigator.clipboard.writeText(shareText);
                        showToast('Weather info copied to clipboard');
                      }
                    }}
                    className="text-white/90 hover:text-white text-sm font-medium flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                )}
                <p className="text-white/60 text-xs font-mono">
                  {weatherData ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} onDismiss={dismissToast} />
    </BackgroundWrapper>
  );
}

export default App;
