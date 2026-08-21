import React from 'react';
import WeatherIcon from './WeatherIcon';
import { formatCityHour } from '../utils/cityTime';
import { celsiusToDisplay, msToDisplay, windUnitLabel } from '../utils/units';

const HourlyForecast = ({ data, unit }) => {
  if (!data || !data.list) return null;

  const hourlyData = data.list.slice(0, 8); // 8 readings = 24 hours
  const timezoneOffset = data.city?.timezone ?? 0;

  // Data is always fetched in metric — convert for display here. The
  // graph below still uses the raw Celsius values for its min/max
  // scaling, which is fine: a linear unit conversion doesn't change
  // relative positions, only the numbers printed on the cards need it.
  const formatTemperature = (temp) => `${Math.round(celsiusToDisplay(temp, unit))}°`;
  const windUnit = windUnitLabel(unit);

  // City's own local hour, not the viewer's device timezone.
  const formatTime = (timestamp) => formatCityHour(timestamp, timezoneOffset);

  const temps = hourlyData.map((h) => h.main.temp);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const tempRange = maxTemp - minTemp || 1;

  return (
    <div className="panel p-5 md:p-7">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl md:text-2xl font-semibold" style={{ color: 'var(--ink-900)' }}>
          24-Hour Forecast
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--ink-500)' }}>
          every 3h
        </span>
      </div>

      <div className="space-y-5">
        {/* Temperature graph */}
        <div className="relative h-20 mb-2">
          <div className="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ borderTop: '1px solid var(--line)' }}></div>
            ))}
          </div>

          <div className="absolute inset-0 flex items-end pb-1">
            {hourlyData.map((hour, index) => {
              const tempPosition = ((hour.main.temp - minTemp) / tempRange) * 80;
              return (
                <div key={index} className="flex-1 flex flex-col items-center" style={{ height: '100%' }}>
                  <div className="relative w-full flex justify-center h-full">
                    <div
                      className="w-2.5 h-2.5 rounded-full absolute z-10 shadow-sm"
                      style={{ bottom: `${tempPosition}%`, background: 'var(--amber)', border: '2px solid var(--paper-0)' }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }} aria-hidden="true">
            <polyline
              points={hourlyData
                .map((hour, index) => {
                  const x = (index / (hourlyData.length - 1)) * 100;
                  const y = 100 - ((hour.main.temp - minTemp) / tempRange) * 80;
                  return `${x}%,${y}%`;
                })
                .join(' ')}
              fill="none"
              stroke="var(--teal)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
            />
          </svg>
        </div>

        {/* Hourly cards — horizontal swipeable row on mobile (a hard
            2-column grid was forcing 4 rows for 8 cards, a lot of
            vertical scroll for one panel); full grid from sm: up where
            there's enough width to show them without scrolling. */}
        <div className="flex sm:grid overflow-x-auto sm:overflow-visible scrollbar-hide snap-x snap-mandatory sm:snap-none gap-2 md:gap-2.5 sm:grid-cols-4 md:grid-cols-8 pb-1 sm:pb-0">
          {hourlyData.map((hour, index) => (
            <div
              key={index}
              className="rounded-xl p-3 text-center transition-all duration-300 hover:-translate-y-0.5 shrink-0 w-[104px] sm:w-auto snap-start"
              style={{ background: 'var(--paper-50)', border: '1px solid var(--line)' }}
            >
              <div className="font-mono text-xs mb-1" style={{ color: 'var(--ink-500)' }}>
                {index === 0 ? 'Now' : formatTime(hour.dt)}
              </div>
              <div className="flex justify-center mb-1.5" style={{ color: 'var(--ink-700)' }}>
                <WeatherIcon code={hour.weather[0].icon} size={30} />
              </div>
              <div className="font-display font-semibold text-lg md:text-xl" style={{ color: 'var(--ink-900)' }}>
                {formatTemperature(hour.main.temp)}
              </div>
              <div className="text-[11px] mt-0.5 capitalize truncate" style={{ color: 'var(--ink-700)' }}>
                {hour.weather[0].description}
              </div>
              <div className="flex justify-center gap-2.5 mt-2 font-mono text-[10px]" style={{ color: 'var(--ink-500)' }}>
                <span>RH {hour.main.humidity}%</span>
                <span>{Math.round(msToDisplay(hour.wind.speed, unit))}{windUnit}</span>
              </div>
              {typeof hour.pop === 'number' && (
                <div className="mt-2" title={`${Math.round(hour.pop * 100)}% chance of precipitation`}>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.round(hour.pop * 100)}%`, background: 'var(--teal)' }}
                    />
                  </div>
                  <div className="font-mono text-[10px] mt-1" style={{ color: 'var(--teal-dark)' }}>
                    {Math.round(hour.pop * 100)}% rain
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;
