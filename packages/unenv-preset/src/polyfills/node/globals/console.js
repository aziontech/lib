globalThis.__mockTimers = new Map();

const _console = globalThis.console;

_console.time = (label = 'default') => {
  globalThis.__mockTimers.set(label, Date.now());
};
_console.timeEnd = (label = 'default') => {
  const startTime = globalThis.__mockTimers.get(label);
  if (startTime) {
    const duration = Date.now() - startTime;
    globalThis.__mockTimers.delete(label);
    return duration;
  }
  return 0;
};

globalThis.console = _console;

export default globalThis.console;
