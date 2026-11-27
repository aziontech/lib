/**
 * `queueMicrotask` is a Web API that the Azion runtime does not define (`ReferenceError: queueMicrotask is not
 * defined`). It is built on a resolved promise, so the callback runs before the next task. As the native one, it
 * throws a `TypeError` when the callback is not a function and it reports the error thrown by the callback
 * instead of turning it into an unhandled promise rejection.
 */
if (typeof globalThis.queueMicrotask !== 'function') {
  globalThis.queueMicrotask = function queueMicrotask(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('The "callback" argument must be of type function.');
    }
    Promise.resolve().then(() => {
      try {
        callback();
      } catch (error) {
        if (typeof globalThis.reportError === 'function') {
          globalThis.reportError(error);
        } else {
          setTimeout(() => {
            throw error;
          }, 0);
        }
      }
    });
  };
}

export default globalThis.queueMicrotask;
