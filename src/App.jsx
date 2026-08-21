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
import ThemeToggle from './components/ThemeToggle';
import WelcomeState from './components/WelcomeState';
import usePullToRefresh from './hooks/usePullToRefresh';
import useOnlineStatus from './hooks/useOnlineStatus';
import { getWeather, getWeatherByCoords, getForecast, getForecastByCoords, getAirQuality } from './WeatherApi';
import { formatCityTime } from './utils/cityTime';
import { celsiusToDisplay } from './utils/units';

function App() {
  // Read once per mount: true only if a previous visit saved a city.
  // Used to decide both whether `loading` should start true (about to
  // auto-fetch) and whether this is a first-run visitor who should see
  // the welcome state instead — computed up front so `loading` never
  // has to flash true-then-false before the welcome state can render.
  const hasSavedCity = typeof window !== 'undefined' && !!localStorage.getItem('lastSearchedCity');

  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(hasSavedCity);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [lastSearched, setLastSearched] = useState(() => {
    return localStorage.getItem('lastSearchedCity') || 'Nairobi';
  });

  // Captured once, before the mount effect runs anything: true only for a
  // visitor who has never searched before. Used to show a welcome state
  // instead of silently loading Nairobi on their behalf — a default they
  // never asked for and might not realize is just a placeholder.
  const [isFirstRun] = useState(() => !hasSavedCity);

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('weatherFavorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState({ visible: false, message: '' });
  const showToast = (message) => setToast({ visible: true, message });
  const dismissToast = () => setToast((t) => ({ ...t, visible: false }));

  const isOnline = useOnlineStatus();

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('themePreference');
    if (saved) return saved;
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('themePreference', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

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

  // Shared across fetchWeatherData / fetchWeatherByCoords / silentRefresh:
  // each call claims the next id, and only the request still holding the
  // *latest* id is allowed to write its results to state. If you search a
  // new city before a previous lookup resolves, the older response is
  // discarded instead of racing the newer one and possibly winning.
  const requestIdRef = useRef(0);

  const fetchWeatherData = useCallback(async (city) => {
    // A new city was explicitly requested (search, favorite, quick-pick,
    // error retry) — scroll back to the top rather than leaving the
    // visitor stranded wherever they'd scrolled to on the previous city
    // (e.g. deep in the AQI section) while the new one loads in above
    // them. Not called from silentRefresh, which intentionally leaves
    // scroll untouched since it's refreshing the same city in place.
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });

    if (!API_KEY) {
      setError('API key not configured. Please add VITE_WEATHER_API_KEY to your .env file');
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setAirQualityData(null);

    try {
      // Always fetched in metric — `unit` is now a pure display
      // preference (see toggleUnit below), never a network parameter, so
      // switching units doesn't require a refetch at all.
      const weather = await getWeather(city, 'metric');
      const forecast = await getForecast(city, 'metric');
      if (requestId !== requestIdRef.current) return; // superseded — drop silently

      try {
        const aqi = await getAirQuality(weather.coord.lat, weather.coord.lon);
        if (requestId === requestIdRef.current) setAirQualityData(aqi);
      } catch {
        console.log('Air quality data not available');
      }

      if (requestId !== requestIdRef.current) return;
      setWeatherData(weather);
      setForecastData(forecast);
      setLastSearched(city);
      localStorage.setItem('lastSearchedCity', city);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(
        !navigator.onLine
          ? "You're offline. Reconnect to search for a new city — previously viewed cities may still load from cache."
          : err.message
      );
      console.error('Error fetching weather data:', err);
      setLoading(false);
      return;
    }
    if (requestId === requestIdRef.current) finishLoading();
  }, [API_KEY, finishLoading]);

  const fetchWeatherByCoords = useCallback(async (lat, lon) => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
    if (!API_KEY) return;

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setAirQualityData(null);

    try {
      const weather = await getWeatherByCoords(lat, lon, 'metric');
      const forecast = await getForecastByCoords(lat, lon, 'metric');
      if (requestId !== requestIdRef.current) return;

      try {
        const aqi = await getAirQuality(lat, lon);
        if (requestId === requestIdRef.current) setAirQualityData(aqi);
      } catch {
        console.log('Air quality data not available');
      }

      if (requestId !== requestIdRef.current) return;
      setWeatherData(weather);
      setForecastData(forecast);
      setLastSearched(`${weather.name}, ${weather.sys.country}`);
      localStorage.setItem('lastSearchedCity', `${weather.name}, ${weather.sys.country}`);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(
        !navigator.onLine
          ? "You're offline. Reconnect to use your current location."
          : err.message
      );
      console.error('Error fetching weather by coords:', err);
      setLoading(false);
      return;
    }
    if (requestId === requestIdRef.current) finishLoading();
  }, [API_KEY, finishLoading]);

  // Used by pull-to-refresh only: re-fetches quietly without toggling the
  // global `loading` flag, so existing content stays on screen instead of
  // being replaced by the skeleton mid-gesture. Also respects requestIdRef
  // so a manual search started mid-pull isn't clobbered by this resolving late.
  const silentRefresh = useCallback(async () => {
    if (!API_KEY || !lastSearched) return;
    const requestId = ++requestIdRef.current;
    try {
      const weather = await getWeather(lastSearched, 'metric');
      const forecast = await getForecast(lastSearched, 'metric');
      if (requestId !== requestIdRef.current) return;
      try {
        const aqi = await getAirQuality(weather.coord.lat, weather.coord.lon);
        if (requestId === requestIdRef.current) setAirQualityData(aqi);
      } catch {
        console.log('Air quality data not available');
      }
      if (requestId !== requestIdRef.current) return;
      setWeatherData(weather);
      setForecastData(forecast);
      showToast('Weather updated');
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      showToast(!navigator.onLine ? "You're offline" : "Couldn't refresh — try again");
      console.error('Pull-to-refresh error:', err);
    }
  }, [API_KEY, lastSearched]);

  const { pullDistance, isRefreshing, threshold: pullThreshold } = usePullToRefresh(silentRefresh);

  // When connectivity comes back after being lost, quietly refresh the
  // current city so the view doesn't keep showing stale cached data
  // longer than necessary.
  const wasOfflineRef = useRef(false);
  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
    } else if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      showToast('Back online — refreshing weather');
      silentRefresh();
    }
  }, [isOnline, silentRefresh]);

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
    // Purely a display preference now — data is always fetched in
    // metric, so this no longer needs to trigger a refetch. See
    // fetchWeatherData/fetchWeatherByCoords/silentRefresh above.
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
          // weatherData.main.temp is always Celsius now (data is fetched
          // in metric unconditionally — see fetchWeatherData). Previously
          // this recorded the *display* unit selected at favorite-time,
          // which broke once fetching stopped following that same unit:
          // the tag would say "imperial" while the stored value was
          // actually still Celsius, causing Favorites to convert it
          // backwards. Always metric now, by construction.
          tempUnit: 'metric',
          condition: weatherData.weather[0].main,
          icon: weatherData.weather[0].icon,
        },
      ];
    }

    setFavorites(newFavorites);
    localStorage.setItem('weatherFavorites', JSON.stringify(newFavorites));
  };

  // Initial load — the only place the very first fetch happens. A
  // brand-new visitor (no saved city) sees the welcome state instead of
  // an unannounced Nairobi; loading only starts once they act.
  useEffect(() => {
    if (isFirstRun) {
      setLoading(false);
      return;
    }
    const lastCity = localStorage.getItem('lastSearchedCity') || 'Nairobi';
    fetchWeatherData(lastCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div
        className="min-h-screen p-4 md:p-6"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 || isRefreshing ? 'transform 0.25s ease-out' : 'none',
          paddingTop: isOnline ? undefined : '3.25rem',
        }}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium focus:text-sm"
          style={{ background: 'var(--ink-900)', color: '#fff' }}
        >
          Skip to main content
        </a>

        {/* Offline banner */}
        <div
          className="fixed top-0 inset-x-0 z-[60] transition-transform duration-300 ease-out"
          style={{ transform: isOnline ? 'translateY(-100%)' : 'translateY(0)' }}
          aria-hidden={isOnline}
        >
          <div
            className="flex items-center justify-center gap-2 py-2 px-4 font-mono text-xs md:text-sm"
            style={{ background: 'var(--rose)', color: '#fff' }}
            role="status"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
            You're offline — showing saved data
          </div>
        </div>

        {/* Pull-to-refresh indicator */}
        <div
          className="fixed top-3 left-1/2 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-150"
          style={{
            transform: 'translateX(-50%)',
            opacity: pullDistance > 4 || isRefreshing ? 1 : 0,
          }}
          aria-hidden="true"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--paper-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)' }}
          >
            {isRefreshing ? (
              <svg className="w-4 h-4 animate-spin" style={{ color: 'var(--amber)' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 transition-transform duration-150"
                style={{
                  color: pullDistance >= pullThreshold ? 'var(--teal)' : 'var(--ink-500)',
                  transform: `rotate(${pullDistance >= pullThreshold ? 180 : 0}deg)`,
                }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <header className="mb-6 fade-in relative z-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div
                className="px-4 py-2.5 rounded-2xl inline-block"
                style={{
                  background: 'color-mix(in srgb, var(--ink-900) 60%, transparent)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <h1 className="font-display text-2xl md:text-3xl font-semibold text-white">
                  Weather Dashboard
                </h1>
                <p className="text-sm mt-0.5 text-white/90">Real-time weather intelligence</p>
              </div>

              <div className="w-full md:w-auto flex items-center gap-3">
                <div className="flex-1 min-w-0 md:flex-initial">
                  <SearchBar
                    onSearch={fetchWeatherData}
                    onLocationClick={handleLocationClick}
                    favorites={favorites}
                    onFavoriteSelect={(city) => fetchWeatherData(city)}
                    unit={unit}
                  />
                </div>
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
              </div>
            </div>

            <Favorites
              favorites={favorites}
              unit={unit}
              onSelect={(city) => fetchWeatherData(city)}
            />
          </header>

          <main className="relative z-10" id="main-content" tabIndex={-1}>
            {loading ? (
              <SkeletonPanels />
            ) : error ? (
              <div role="alert" className="flex flex-col items-center justify-center min-h-[50vh] fade-in panel p-10 max-w-md mx-auto text-center">
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
            ) : (
              <WelcomeState onSelectCity={fetchWeatherData} onUseLocation={handleLocationClick} />
            )}
          </main>

          <footer className="mt-8 relative z-10">
            <div
              className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 py-4 rounded-2xl"
              style={{
                background: 'color-mix(in srgb, var(--ink-900) 60%, transparent)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <div className="text-white/90 text-sm text-center md:text-left">
                <p>
                  Powered by{' '}
                  <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                    OpenWeatherMap
                  </a>
                </p>
                <p className="mt-0.5 text-xs text-white/75">
                  Built by{' '}
                  <a href="https://skioko.netlify.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                    Stephen Kioko
                  </a>
                </p>
              </div>

              <div className="flex items-center gap-4">
                {weatherData && (
                  <button
                    onClick={() => {
                      const shareText = `Weather in ${weatherData.name}: ${Math.round(celsiusToDisplay(weatherData.main.temp, unit))}°${unit === 'metric' ? 'C' : 'F'}, ${weatherData.weather[0].description}`;
                      if (navigator.share) {
                        navigator.share({ title: `Weather in ${weatherData.name}`, text: shareText });
                      } else {
                        navigator.clipboard.writeText(shareText);
                        showToast('Weather info copied to clipboard');
                      }
                    }}
                    className="text-white/90 hover:text-white text-sm font-medium flex items-center gap-1.5 p-2 -m-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                )}
                <p className="text-white/75 text-xs font-mono">
                  {weatherData ? formatCityTime(weatherData.dt, weatherData.timezone ?? 0) : '--:--'}
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
