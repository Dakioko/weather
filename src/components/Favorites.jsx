import React from 'react';
import WeatherIcon from './WeatherIcon';

const Favorites = ({ favorites, unit, onSelect }) => {
  if (!favorites.length) return null;

  // fav.temp was captured whenever the city was favorited, in whichever
  // unit was active then (fav.tempUnit). Only convert if that differs
  // from the currently selected unit — and only in the correct direction.
  // Favorites saved before this fix have no tempUnit; metric is assumed
  // as a best-effort default rather than silently mis-converting them.
  const formatTemperature = (fav) => {
    const sourceUnit = fav.tempUnit || 'metric';
    let value = fav.temp;
    if (sourceUnit !== unit) {
      value = sourceUnit === 'metric' ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9;
    }
    return `${Math.round(value)}°`;
  };

  return (
    <div className="mb-4 fade-in">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--ink-700)' }}>
          ⭐ Favorites
        </h3>
        <span className="font-mono text-[11px]" style={{ color: 'var(--ink-500)' }}>{favorites.length} saved</span>
      </div>
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-1 px-1">
        {favorites.map((fav, index) => (
          <button
            key={index}
            onClick={() => onSelect(`${fav.name}, ${fav.country}`)}
            className="shrink-0 rounded-xl px-3.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'var(--paper-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center gap-2.5">
              <div style={{ color: 'var(--ink-700)' }}>
                <WeatherIcon code={fav.icon} size={22} />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm truncate max-w-[80px]" style={{ color: 'var(--ink-900)' }}>{fav.name}</div>
                <div className="font-mono font-semibold text-sm" style={{ color: 'var(--ink-900)' }}>
                  {formatTemperature(fav)}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
