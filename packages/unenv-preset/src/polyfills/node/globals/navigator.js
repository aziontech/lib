// This a temporary polyfill for navigator.
globalThis.navigator = {
  userAgent: 'edge-runtime/1.0 (polyfill)',
};

export default globalThis.navigator;
