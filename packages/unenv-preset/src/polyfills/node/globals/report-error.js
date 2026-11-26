/**
 * `reportError` is a Web API that the Azion runtime does not define, but it reports the errors thrown by
 * asynchronous callbacks (i.e. the ones of `process.nextTick`) with it.
 */
if (typeof globalThis.reportError !== 'function') {
  globalThis.reportError = function reportError(error) {
    console.error(error);
  };
}

export default globalThis.reportError;
