import React, { useMemo } from 'react';

/**
 * Sky themes are keyed by condition AND time-of-day (derived from the
 * location's own sunrise/sunset when available). This is the app's one
 * real signature: the backdrop is a small honest simulation of what the
 * sky actually looks like right now at that place, not a decorative
 * gradient swap.
 */
const getSkyTheme = (condition, isNight) => {
  const c = (condition || '').toLowerCase();

  if (c.includes('thunderstorm')) {
    return {
      gradient: 'linear-gradient(180deg, #232733 0%, #3a3550 45%, #55476a 100%)',
      glow: '#8b7bb8',
      stars: false,
    };
  }
  if (c.includes('snow')) {
    return isNight
      ? { gradient: 'linear-gradient(180deg, #1c2b3a 0%, #33475a 55%, #5b7186 100%)', glow: '#cfe4f2', stars: true }
      : { gradient: 'linear-gradient(180deg, #b9d4e8 0%, #d9e9f2 55%, #f3f6f2 100%)', glow: '#ffffff', stars: false };
  }
  if (c.includes('rain') || c.includes('drizzle')) {
    return isNight
      ? { gradient: 'linear-gradient(180deg, #16222e 0%, #263646 55%, #3a4c5a 100%)', glow: '#7fa8bd', stars: true }
      : { gradient: 'linear-gradient(180deg, #7e97a8 0%, #a8bcc8 55%, #ccd8d6 100%)', glow: '#e8eef0', stars: false };
  }
  if (c.includes('mist') || c.includes('fog') || c.includes('haze')) {
    return isNight
      ? { gradient: 'linear-gradient(180deg, #232b30 0%, #3c464a 55%, #5c6669 100%)', glow: '#9fb0ae', stars: false }
      : { gradient: 'linear-gradient(180deg, #c7c4b8 0%, #dad6c8 55%, #ece8da 100%)', glow: '#fffef8', stars: false };
  }
  if (c.includes('cloud')) {
    return isNight
      ? { gradient: 'linear-gradient(180deg, #1a2530 0%, #2d3d4a 55%, #46586a 100%)', glow: '#9db4c4', stars: true }
      : { gradient: 'linear-gradient(180deg, #7fa3c4 0%, #a9c1d6 55%, #d8ddd8 100%)', glow: '#fff8e8', stars: false };
  }
  // clear
  return isNight
    ? { gradient: 'linear-gradient(180deg, #0d1524 0%, #1c2d47 45%, #38466b 100%)', glow: '#f0d999', stars: true }
    : { gradient: 'linear-gradient(180deg, #3f8fd6 0%, #7bb8e8 55%, #f6e3b4 100%)', glow: '#ffd27a', stars: false };
};

const BackgroundWrapper = ({ children, weatherCondition, sunrise, sunset, currentTime }) => {
  const theme = useMemo(() => {
    let isNight = false;
    const now = currentTime || Math.floor(Date.now() / 1000);
    if (sunrise && sunset) {
      isNight = now < sunrise || now > sunset;
    } else {
      const hour = new Date().getHours();
      isNight = hour < 6 || hour >= 19;
    }
    return getSkyTheme(weatherCondition, isNight);
  }, [weatherCondition, sunrise, sunset, currentTime]);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden transition-all duration-1000"
      style={{ background: theme.gradient }}
    >
      {/* Ambient glow layer — condition-tinted, slow drift */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40 drift-layer-slow"
        style={{
          background: `radial-gradient(60% 45% at 80% 8%, ${theme.glow}55, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-30 drift-layer"
        style={{
          background: `radial-gradient(45% 35% at 15% 85%, ${theme.glow}33, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Subtle grain — keeps the sky gradient from reading as a flat digital wallpaper */}
      <div className="pointer-events-none fixed inset-0 grain-overlay" aria-hidden="true" />

      {/* Stars for night skies */}
      {theme.stars && (
        <div className="pointer-events-none fixed inset-0" aria-hidden="true">
          {[...Array(28)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white twinkle"
              style={{
                width: `${1 + (i % 3)}px`,
                height: `${1 + (i % 3)}px`,
                top: `${(i * 37) % 55}%`,
                left: `${(i * 53) % 100}%`,
                animationDelay: `${(i % 7) * 0.5}s`,
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default BackgroundWrapper;
