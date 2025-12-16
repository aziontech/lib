// TODO: fix temp, move to runtime
// Polyfill to fix next-auth token decode issue where Date objects return [object Object] instead of [object Date]

// Save the original toString before we modify it
const originalToString = Object.prototype.toString;

// Create a Proxy for the toString function
const toStringProxy = new Proxy(originalToString, {
  apply(target, thisArg, argumentsList) {
    // Only intercept for Date objects
    try {
      if (thisArg instanceof Date) {
        return '[object Date]';
      }

      if (thisArg && typeof thisArg.getTime === 'function' && typeof thisArg.toISOString === 'function') {
        return '[object Date]';
      }
    } catch {
      // If any check fails, just use original
    }

    // For everything else, call the original toString
    return Reflect.apply(target, thisArg, argumentsList);
  },
});

// Replace Object.prototype.toString with the proxy
Object.prototype.toString = toStringProxy;

export default toStringProxy;
