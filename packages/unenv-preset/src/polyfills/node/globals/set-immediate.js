const _setImmediate = globalThis.setImmediate;
const _clearImmediate = globalThis.clearImmediate;

let nextId = 1;

/**
 * Node-like `Immediate`, with `ref()`, `unref()` and `hasRef()`.
 */
class Immediate {
  constructor(state) {
    this._state = state;
    this._id = nextId++;
    this._hasRef = true;
  }

  ref() {
    this._hasRef = true;
    return this;
  }

  unref() {
    this._hasRef = false;
    return this;
  }

  hasRef() {
    return this._hasRef;
  }

  [Symbol.toPrimitive]() {
    return this._id;
  }
}

if (typeof Symbol.dispose === 'symbol') {
  Immediate.prototype[Symbol.dispose] = function () {
    this._state.cancelled = true;
  };
}

const isNativeImmediate = (value) => value !== null && typeof value === 'object' && typeof value.ref === 'function';

/**
 * Makes `setImmediate` return a Node-like `Immediate`.
 *
 * Frameworks call `ref()` and `unref()` on the value (Next.js 16.4+), but the runtime returns a number, or does
 * not define `setImmediate` at all. The runtime `setImmediate` and `clearImmediate` do not work together (one
 * returns a number, the other expects an object), so an immediate that is not native is cancelled here, with a
 * flag, and the callback is scheduled with the runtime `setImmediate` or with a macrotask.
 *
 * A native `Immediate` (Node.js, `azion dev`) is returned as it is and cleared with the native `clearImmediate`.
 */
globalThis.setImmediate = Object.assign(function setImmediate(callback, ...args) {
  const state = { cancelled: false };
  const run = () => {
    if (!state.cancelled) {
      state.cancelled = true;
      callback(...args);
    }
  };
  if (typeof _setImmediate !== 'function') {
    globalThis.setTimeout(run, 0);
    return new Immediate(state);
  }

  const scheduled = _setImmediate(run);
  return isNativeImmediate(scheduled) ? scheduled : new Immediate(state);
}, _setImmediate);

globalThis.clearImmediate = function clearImmediate(immediate) {
  if (immediate instanceof Immediate) {
    immediate._state.cancelled = true;
  } else if (typeof _clearImmediate === 'function' && isNativeImmediate(immediate)) {
    _clearImmediate(immediate);
  }
};

export default globalThis.setImmediate;
