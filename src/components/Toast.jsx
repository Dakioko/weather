import React, { useEffect } from 'react';

const Toast = ({ message, visible, onDismiss, duration = 2800 }) => {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-[9999] transition-all duration-300 ease-out"
      style={{
        transform: `translateX(-50%) translateY(${visible ? '0' : '16px'})`,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        className="px-4 py-2.5 rounded-full font-mono text-sm flex items-center gap-2 shadow-lg"
        style={{ background: 'var(--ink-900)', color: 'var(--paper-0)' }}
      >
        <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--amber)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {message}
      </div>
    </div>
  );
};

export default Toast;
