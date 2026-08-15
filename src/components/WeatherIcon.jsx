import React from 'react';

/**
 * Maps OpenWeather icon codes to a small custom icon family.
 * All icons are single-color line art driven by currentColor so they
 * inherit context (ink on light cards, white in headers, amber accents)
 * instead of the mismatched multi-platform look of emoji.
 */
const CODE_TO_TYPE = {
  '01d': 'clear-day', '01n': 'clear-night',
  '02d': 'partly-day', '02n': 'partly-night',
  '03d': 'cloudy', '03n': 'cloudy',
  '04d': 'cloudy', '04n': 'cloudy',
  '09d': 'drizzle', '09n': 'drizzle',
  '10d': 'rain', '10n': 'rain',
  '11d': 'storm', '11n': 'storm',
  '13d': 'snow', '13n': 'snow',
  '50d': 'mist', '50n': 'mist',
};

const Cloud = ({ y = 10 }) => (
  <path
    d={`M6 ${y + 8} a4 4 0 0 1 0.4 -7.98 5 5 0 0 1 9.5 -1.3 4.2 4.2 0 0 1 -0.9 9.28 z`}
    fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"
  />
);

const Sun = ({ cx = 12, cy = 12, r = 4 }) => (
  <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx={cx} cy={cy} r={r} fill="none" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const x1 = cx + (r + 2) * Math.cos(rad);
      const y1 = cy + (r + 2) * Math.sin(rad);
      const x2 = cx + (r + 4.5) * Math.cos(rad);
      const y2 = cy + (r + 4.5) * Math.sin(rad);
      return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} />;
    })}
  </g>
);

const Moon = ({ cx = 12, cy = 12, r = 4.5 }) => (
  <path
    d={`M ${cx + 2} ${cy - r} a ${r} ${r} 0 1 0 0 ${r * 2} a ${r * 0.72} ${r * 0.72} 0 0 1 0 -${r * 2} z`}
    fill="currentColor" opacity="0.9"
  />
);

const WeatherIcon = ({ code, size = 28, className = '' }) => {
  const type = CODE_TO_TYPE[code] || 'cloudy';
  const style = { width: size, height: size };

  const bodies = {
    'clear-day': (
      <svg viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
        <Sun />
      </svg>
    ),
    'clear-night': (
      <svg viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
        <Moon />
      </svg>
    ),
    'partly-day': (
      <svg viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
        <g opacity="0.9"><Sun cx="15" cy="8" r="3.2" /></g>
        <Cloud y={9} />
      </svg>
    ),
    'partly-night': (
      <svg viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
        <g opacity="0.9" transform="translate(2,-2) scale(0.85)"><Moon cx="15" cy="8" r="3.2" /></g>
        <Cloud y={9} />
      </svg>
    ),
    cloudy: (
      <svg viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
        <Cloud y={8} />
        <path d="M3 18a3.2 3.2 0 0 1 0.3 -6.38" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
    drizzle: (
      <svg viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
        <Cloud y={6} />
        {[7, 11, 15].map((x, i) => (
          <line key={i} x1={x} y1={16} x2={x - 1} y2={19} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity={0.85} />
        ))}
      </svg>
    ),
    rain: (
      <svg viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
        <Cloud y={5} />
        {[6.5, 11, 15.5].map((x, i) => (
          <line key={i} x1={x} y1={16} x2={x - 2} y2={21} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        ))}
      </svg>
    ),
    storm: (
      <svg viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
        <Cloud y={4} />
        <path d="M13 13.5 L9.5 18.5 L12.5 18.5 L10.5 22.5 L15.5 16.5 L12.3 16.5 Z" fill="currentColor" stroke="none" />
      </svg>
    ),
    snow: (
      <svg viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
        <Cloud y={5} />
        {[7, 12, 17].map((x, i) => (
          <g key={i} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <line x1={x} y1={15} x2={x} y2={21} />
            <line x1={x - 2.2} y1={16.5} x2={x + 2.2} y2={19.5} />
            <line x1={x + 2.2} y1={16.5} x2={x - 2.2} y2={19.5} />
          </g>
        ))}
      </svg>
    ),
    mist: (
      <svg viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
        {[7, 11, 15, 19].map((y, i) => (
          <line
            key={i}
            x1={i % 2 === 0 ? 3 : 5}
            y1={y}
            x2={i % 2 === 0 ? 21 : 19}
            y2={y}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity={0.55 + i * 0.1}
          />
        ))}
      </svg>
    ),
  };

  return bodies[type] || bodies.cloudy;
};

export default WeatherIcon;
