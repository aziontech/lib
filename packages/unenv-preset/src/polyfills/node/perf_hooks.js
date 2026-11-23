import * as originalPerfHooks from 'unenv/node/perf_hooks';

export * from 'unenv/node/perf_hooks';

// Node.js 24: `timerify` wraps a function to measure it. There is no event loop to measure, so the function is
// returned as it is and nothing is recorded.
export function timerify(fn) {
  return fn;
}

// Node.js 24: with no event loop activity to measure, everything is idle.
export function eventLoopUtilization() {
  return { idle: 0, active: 0, utilization: 0 };
}

export default {
  ...originalPerfHooks.default,
  timerify,
  eventLoopUtilization,
};
