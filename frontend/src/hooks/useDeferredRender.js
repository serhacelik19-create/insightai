import { useState, useEffect } from 'react';

/**
 * Custom hook to defer rendering of heavy UI components (e.g., Recharts)
 * until after the initial page mount and DOM paint.
 * @param {number} delay - Delay in milliseconds before revealing heavy components (default 50ms)
 * @returns {boolean} isReady - True when deferred components should be rendered
 */
export function useDeferredRender(delay = 50) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
    const timer = setTimeout(() => {
      setIsReady(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isReady;
}
