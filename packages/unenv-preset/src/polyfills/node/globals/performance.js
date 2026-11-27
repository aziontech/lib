import 'unenv/polyfill/performance';

// Anything within this drift is treated as an epoch time already
const MAX_DRIFT_MS = 60_000;

/**
 * Makes `performance.timeOrigin + performance.now()` an epoch time.
 *
 * The Azion runtime only implements a subset of `performance`: `timeOrigin` is `0` and `now()` is not an epoch
 * time. Frameworks compute "now" as `performance.timeOrigin + performance.now()` (i.e. Next.js 16 to decide
 * whether an ISR page is stale), so with the runtime values the pages were never considered stale.
 *
 * `timeOrigin` is overridden only when the runtime value is not an epoch time, so a runtime that has a real
 * `timeOrigin` (Node.js, `azion dev`) is left untouched.
 *
 * @param {{ now: () => number, timeOrigin?: number } | null | undefined} perf
 * @returns {boolean} `true` when `timeOrigin` was overridden.
 */
export function alignPerformanceTimeOrigin(perf = globalThis.performance) {
  if (!perf || typeof perf.now !== 'function') {
    return false;
  }

  const drift = Date.now() - ((perf.timeOrigin || 0) + perf.now());
  // Also covers NaN
  if (Math.abs(drift) < MAX_DRIFT_MS) {
    return false;
  }

  try {
    Object.defineProperty(perf, 'timeOrigin', {
      get: () => Date.now() - perf.now(),
      configurable: true,
    });
    return true;
  } catch {
    // Keep the runtime value when `timeOrigin` can not be overridden
    return false;
  }
}

alignPerformanceTimeOrigin();

export default globalThis.performance;
