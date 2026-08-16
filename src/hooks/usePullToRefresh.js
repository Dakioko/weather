import { useEffect, useRef, useState } from 'react';

/**
 * Attaches a pull-to-refresh gesture to the window. Only engages when
 * the touch starts at scrollY === 0, so normal scrolling is untouched.
 * `onRefresh` should be a stable (useCallback'd) async function.
 */
export default function usePullToRefresh(onRefresh, { threshold = 70, maxPull = 120 } = {}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef(null);
  const pulling = useRef(false);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0 && !refreshingRef.current) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!pulling.current || startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && window.scrollY === 0) {
        const capped = Math.min(delta * 0.5, maxPull);
        pullRef.current = capped;
        setPullDistance(capped);
        if (delta > 10 && e.cancelable) e.preventDefault();
      } else {
        pulling.current = false;
      }
    };

    const handleTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;
      startY.current = null;

      if (pullRef.current >= threshold) {
        refreshingRef.current = true;
        setIsRefreshing(true);
        setPullDistance(threshold);
        try {
          await onRefresh();
        } finally {
          refreshingRef.current = false;
          setIsRefreshing(false);
          setPullDistance(0);
          pullRef.current = 0;
        }
      } else {
        setPullDistance(0);
        pullRef.current = 0;
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [threshold, maxPull, onRefresh]);

  return { pullDistance, isRefreshing, threshold };
}
