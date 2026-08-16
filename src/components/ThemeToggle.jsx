import React from 'react';

const SunIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4.2" strokeWidth={1.8} />
    <g strokeWidth={1.8} strokeLinecap="round">
      <line x1="12" y1="2.5" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21.5" />
      <line x1="4.2" y1="4.2" x2="6" y2="6" />
      <line x1="18" y1="18" x2="19.8" y2="19.8" />
      <line x1="2.5" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21.5" y2="12" />
      <line x1="4.2" y1="19.8" x2="6" y2="18" />
      <line x1="18" y1="6" x2="19.8" y2="4.2" />
    </g>
  </svg>
);

const MoonIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 14.5a8.5 8.5 0 01-11-11 8.5 8.5 0 1011 11z" />
  </svg>
);

const ThemeToggle = ({ theme, onToggle }) => (
  <button
    onClick={onToggle}
    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    className="p-2.5 rounded-full transition-all hover:scale-105 active:scale-95"
    style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', backdropFilter: 'blur(8px)' }}
  >
    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
  </button>
);

export default ThemeToggle;
