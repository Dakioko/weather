import React from 'react';
import WeatherIcon from './WeatherIcon';
import useCountUp from '../hooks/useCountUp';
import { formatCityTime, formatCityDate } from '../utils/cityTime';
import { celsiusToDisplay, msToDisplay, windUnitLabel } from '../utils/units';

const CurrentWeather = ({ data, unit, onToggleUnit, isFavorite, onToggleFavorite }) => {
  const animatedTemp = useCountUp(data?.main?.temp ?? 0);

  // Data is always fetched in metric — `unit` only affects how it's
  // displayed, converted fresh on every render via utils/units.js. This
  // is what makes the °C/°F toggle instant: no refetch, just reformatting
  // the same underlying Celsius value already in memory.
  const formatTemperature = (temp) => `${toDisplayValue(temp)}°`;

  // The hero number gets the unit letter explicitly — it's the one value
  // on screen someone might read in isolation (e.g. a screenshot), so it
  // shouldn't depend on noticing the segmented toggle nearby to know
  // which scale it's in.
  const formatHeroTemperature = (temp) => `${toDisplayValue(temp)}°${unit === 'metric' ? 'C' : 'F'}`;

  const toDisplayValue = (temp) => Math.round(celsiusToDisplay(temp, unit));

  const formatWindSpeed = (speed) => `${Math.round(msToDisplay(speed, unit))} ${windUnitLabel(unit)}`;

  // Sunrise/sunset and "today's date" must reflect the searched city's
  // own clock, not the viewer's device timezone — see utils/cityTime.js.
  const formatTime = (timestamp) => formatCityTime(timestamp, data?.timezone ?? 0);

  // ---- Icons ----
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
  const VisibilityIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
  const StarIcon = ({ filled }) => (
    <svg className="w-4 h-4" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  if (!data) return null;

  // ---- Sun arc math (the signature element) ----
  const now = data.dt || Math.floor(Date.now() / 1000);
  const { sunrise, sunset } = data.sys;
  const dayLength = Math.max(sunset - sunrise, 1);
  const rawProgress = (now - sunrise) / dayLength;
  const progress = Math.min(Math.max(rawProgress, 0), 1);
  const isDaytime = now >= sunrise && now <= sunset;
  // Semicircle parametrization: angle 0 at sunrise (left), PI at sunset (right)
  const theta = Math.PI * progress;
  const cx = 100, cy = 74, r = 82;
  const sunX = cx - r * Math.cos(theta);
  const sunY = cy - r * Math.sin(theta);

  return (
    <div className="panel p-5 md:p-7 h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold" style={{ color: 'var(--ink-900)' }}>
              {data.name}, {data.sys.country}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--ink-500)' }}>
              {(() => {
                const { weekdayLong, month, day } = formatCityDate(data.dt, data?.timezone ?? 0);
                return `${weekdayLong}, ${month} ${day}`;
              })()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              role="group"
              aria-label="Temperature unit"
              className="flex items-center rounded-full p-0.5 gap-0.5"
              style={{ background: 'var(--paper-100)', border: '1px solid var(--line)' }}
            >
              <button
                onClick={() => unit !== 'metric' && onToggleUnit('metric')}
                aria-pressed={unit === 'metric'}
                aria-label="Celsius"
                className="px-3 py-2.5 rounded-full text-xs font-mono font-medium transition-all active:scale-95"
                style={{
                  background: unit === 'metric' ? 'var(--ink-700)' : 'transparent',
                  color: unit === 'metric' ? '#fff' : 'var(--ink-500)',
                }}
              >
                °C
              </button>
              <button
                onClick={() => unit !== 'imperial' && onToggleUnit('imperial')}
                aria-pressed={unit === 'imperial'}
                aria-label="Fahrenheit"
                className="px-3 py-2.5 rounded-full text-xs font-mono font-medium transition-all active:scale-95"
                style={{
                  background: unit === 'imperial' ? 'var(--ink-700)' : 'transparent',
                  color: unit === 'imperial' ? '#fff' : 'var(--ink-500)',
                }}
              >
                °F
              </button>
            </div>
            <button
              onClick={onToggleFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFavorite}
              className="p-3 rounded-full transition-colors"
              style={{
                background: isFavorite ? 'var(--amber)' : 'var(--paper-100)',
                color: isFavorite ? '#fff' : 'var(--ink-500)',
              }}
            >
              <StarIcon filled={isFavorite} />
            </button>
          </div>
        </div>

        {/* Main readout */}
        <div className="flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Left: temperature + sun arc */}
            <div className="flex flex-col justify-between">
              <div className="flex items-center gap-4">
                <div style={{ color: 'var(--amber-dark)' }}>
                  <WeatherIcon code={data.weather[0].icon} size={76} />
                </div>
                <div>
                  <div className="flex items-start gap-2">
                    <div
                      className="font-display font-semibold text-6xl md:text-7xl leading-none tabular-nums flex items-start"
                      style={{ color: 'var(--ink-900)' }}
                      aria-label={formatHeroTemperature(animatedTemp)}
                    >
                      {formatTemperature(animatedTemp)}
                      <span className="text-xl md:text-2xl font-medium mt-1 md:mt-2 ml-0.5" style={{ color: 'var(--ink-500)' }} aria-hidden="true">
                        {unit === 'metric' ? 'C' : 'F'}
                      </span>
                    </div>
                    {(() => {
                      const delta = toDisplayValue(data.main.feels_like) - toDisplayValue(data.main.temp);
                      if (delta === 0) return null;
                      const warmer = delta > 0;
                      return (
                        <span
                          className="mt-2 md:mt-3 inline-flex items-center font-mono text-xs px-1.5 py-0.5 rounded-full shrink-0"
                          style={{
                            background: warmer ? 'color-mix(in srgb, var(--rose) 12%, transparent)' : 'color-mix(in srgb, var(--teal) 14%, transparent)',
                            color: warmer ? 'var(--rose)' : 'var(--teal-dark)',
                          }}
                          title={`Feels like ${formatTemperature(data.main.feels_like)}`}
                          aria-label={`Feels ${Math.abs(delta)} degrees ${warmer ? 'warmer' : 'cooler'} than actual, at ${formatTemperature(data.main.feels_like)}`}
                        >
                          {warmer ? '+' : ''}{delta}°
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-base capitalize mt-1" style={{ color: 'var(--ink-700)' }}>
                    {data.weather[0].description}
                  </p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--ink-500)' }}>
                    H{formatTemperature(data.main.temp_max)} · L{formatTemperature(data.main.temp_min)}
                  </p>
                </div>
              </div>

              {/* Sun arc — sunrise to sunset, real position marker */}
              <div className="mt-6 rounded-xl p-4" style={{ background: 'var(--paper-50)', border: '1px solid var(--line)' }}>
                <svg viewBox="0 0 200 90" className="w-full h-auto" role="img" aria-label={`Sun path: rise ${formatTime(sunrise)}, currently ${isDaytime ? Math.round(progress * 100) + '% through the day' : 'nighttime'}, set ${formatTime(sunset)}`}>
                  <path
                    d="M 18 74 A 82 82 0 0 1 182 74"
                    fill="none"
                    stroke="var(--line)"
                    strokeWidth="2"
                    strokeDasharray="1 6"
                    strokeLinecap="round"
                  />
                  {isDaytime && (
                    <path
                      d={`M 18 74 A 82 82 0 0 1 182 74`}
                      fill="none"
                      stroke="var(--amber)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 258} 258`}
                      opacity="0.6"
                    />
                  )}
                  <line x1="18" y1="74" x2="182" y2="74" stroke="var(--line)" strokeWidth="1.5" />
                  {isDaytime && (
                    <circle cx={sunX} cy={sunY} r="6" fill="var(--amber)" stroke="var(--paper-0)" strokeWidth="2" />
                  )}
                  <text x="18" y="88" fontSize="9" fill="var(--ink-500)" fontFamily="var(--font-mono)">{formatTime(sunrise)}</text>
                  <text x="182" y="88" textAnchor="end" fontSize="9" fill="var(--ink-500)" fontFamily="var(--font-mono)">{formatTime(sunset)}</text>
                </svg>
                <p className="text-center text-xs font-mono mt-1" style={{ color: 'var(--ink-500)' }}>
                  {isDaytime ? `sun up for ${Math.round((sunset - now) / 3600)}h more` : 'sun is down'}
                </p>
              </div>
            </div>

            {/* Right: instrument grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <StatTile icon={<WindIcon />} label="Wind" value={formatWindSpeed(data.wind.speed)} sub={`${data.wind.deg}°`} />
              <StatTile icon={<CloudIcon />} label="Pressure" value={`${data.main.pressure}`} sub="hPa" />
              <StatTile icon={<DropletsIcon />} label="Humidity" value={`${data.main.humidity}%`} />
              <StatTile icon={<VisibilityIcon />} label="Visibility" value={`${Math.round(data.visibility / 1000)}`} sub="km" />
              <div className="col-span-2 rounded-xl p-3.5" style={{ background: 'var(--paper-50)', border: '1px solid var(--line)' }}>
                <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--ink-500)' }}>
                  <ThermometerIcon />
                  <span className="font-mono text-xs uppercase tracking-wide">Cloud cover</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${data.clouds.all}%`, background: 'var(--ink-700)' }}
                  />
                </div>
                <p className="text-right font-mono text-xs mt-1" style={{ color: 'var(--ink-500)' }}>{data.clouds.all}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatTile = ({ icon, label, value, sub }) => (
  <div className="rounded-xl p-3.5" style={{ background: 'var(--paper-50)', border: '1px solid var(--line)' }}>
    <div className="flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--ink-500)' }}>
      {icon}
      <span className="font-mono text-xs uppercase tracking-wide">{label}</span>
    </div>
    <p className="font-mono text-lg font-medium" style={{ color: 'var(--ink-900)' }}>
      {value}
      {sub && <span className="text-xs font-normal ml-1" style={{ color: 'var(--ink-500)' }}>{sub}</span>}
    </p>
  </div>
);

export default CurrentWeather;
