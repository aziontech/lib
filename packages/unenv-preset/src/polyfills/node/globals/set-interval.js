const _setInterval = globalThis.setInterval;
const _clearInterval = globalThis.clearInterval;

globalThis.setInterval = (...args) => {
  const id = _setInterval(...args);
  if (typeof id === 'object' && id !== null) {
    // this is necessary for compatibility with the Sentry library and node's timers
    if (typeof id.unref !== 'function') {
      id.unref = () => {};
    }
    return id;
  }
  return {
    id,
    unref: () => {},
    ref: () => {},
    clear: () => _clearInterval(id),
  };
};

export default globalThis.setInterval;
