import React from 'react';
import WeatherIcon from './WeatherIcon';

const QUICK_CITIES = ['London', 'Tokyo', 'New York', 'Nairobi', 'Sydney'];

const WelcomeState = ({ onSelectCity, onUseLocation }) => {
  return (
    <div className="panel p-8 md:p-12 max-w-xl mx-auto text-center fade-in">
      <div className="flex justify-center mb-4" style={{ color: 'var(--amber-dark)' }}>
        <WeatherIcon code="01d" size={56} />
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-semibold mb-2" style={{ color: 'var(--ink-900)' }}>
        Let's check the sky
      </h2>
      <p className="text-sm mb-8" style={{ color: 'var(--ink-500)' }}>
        Search for a city above, or use your current location — nothing's loaded yet.
      </p>

      <button
        onClick={onUseLocation}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-white font-medium mb-8 hover:opacity-90 active:scale-95 transition-all"
        style={{ background: 'var(--teal)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Use my location
      </button>

      <div>
        <p className="font-mono text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--ink-500)' }}>
          Or try
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => onSelectCity(city)}
              className="px-4 py-3 rounded-full text-sm font-medium transition-colors"
              style={{ background: 'var(--paper-100)', color: 'var(--ink-700)', border: '1px solid var(--line)' }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeState;
