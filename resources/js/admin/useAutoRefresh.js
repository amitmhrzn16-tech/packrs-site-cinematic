import { useEffect, useRef } from 'react';

/**
 * Re-runs `callback` every `intervalMs` while the tab is visible. Pauses when
 * the tab is hidden and re-runs once on the way back so admin views stay live
 * without burning quota on background tabs. The callback isn't called on mount
 * (let the consumer do that itself so we don't fight initial-load ordering).
 */
export function useAutoRefresh(callback, intervalMs = 30_000) {
  const cbRef = useRef(callback);
  useEffect(() => { cbRef.current = callback; }, [callback]);

  useEffect(() => {
    if (!intervalMs || intervalMs <= 0) return undefined;

    let timer = null;
    const start = () => {
      stop();
      timer = window.setInterval(() => cbRef.current?.(), intervalMs);
    };
    const stop = () => {
      if (timer) { window.clearInterval(timer); timer = null; }
    };
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        cbRef.current?.();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [intervalMs]);
}
