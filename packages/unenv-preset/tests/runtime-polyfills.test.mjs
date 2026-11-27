import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const polyfills = new URL('../src/polyfills/node/', import.meta.url);

describe('process.nextTick', () => {
  const processShim = require(fileURLToPath(new URL('globals/process.cjs', polyfills)));

  it('runs the callback as a microtask with its arguments, before the next task', async () => {
    const order = [];
    setTimeout(() => order.push('timeout'), 0);
    processShim.nextTick((a, b) => order.push(`tick ${a} ${b}`), 1, 2);
    order.push('sync');
    await new Promise((resolve) => setTimeout(resolve, 5));
    assert.deepEqual(order, ['sync', 'tick 1 2', 'timeout']);
  });

  it('falls back to the timer queue when queueMicrotask is not available', async () => {
    const original = globalThis.queueMicrotask;
    globalThis.queueMicrotask = undefined;
    try {
      const calls = [];
      processShim.nextTick((value) => calls.push(value), 'fallback');
      assert.deepEqual(calls, []);
      await new Promise((resolve) => setTimeout(resolve, 5));
      assert.deepEqual(calls, ['fallback']);
    } finally {
      globalThis.queueMicrotask = original;
    }
  });
});

describe('reportError', () => {
  it('is defined when the runtime does not define it', async () => {
    const original = globalThis.reportError;
    delete globalThis.reportError;
    try {
      const { default: reportError } = await import(`${new URL('globals/report-error.js', polyfills)}?missing`);
      assert.equal(globalThis.reportError, reportError);
      const logged = [];
      const originalError = console.error;
      console.error = (...args) => logged.push(args);
      try {
        const error = new Error('boom');
        reportError(error);
        assert.deepEqual(logged, [[error]]);
      } finally {
        console.error = originalError;
      }
    } finally {
      globalThis.reportError = original;
    }
  });

  it('keeps the runtime implementation', async () => {
    const original = globalThis.reportError;
    const runtimeImplementation = () => {};
    globalThis.reportError = runtimeImplementation;
    try {
      await import(`${new URL('globals/report-error.js', polyfills)}?present`);
      assert.equal(globalThis.reportError, runtimeImplementation);
    } finally {
      globalThis.reportError = original;
    }
  });
});

describe('setImmediate', () => {
  const load = async (runtime, tag) => {
    const saved = { setImmediate: globalThis.setImmediate, clearImmediate: globalThis.clearImmediate };
    Object.assign(globalThis, runtime);
    if (!('setImmediate' in runtime)) {
      // no `runtime` override: keep the host (native) one
    } else if (!runtime.setImmediate) {
      delete globalThis.setImmediate;
    }
    try {
      await import(`${new URL('globals/set-immediate.js', polyfills)}?${tag}`);
      return { setImmediate: globalThis.setImmediate, clearImmediate: globalThis.clearImmediate };
    } finally {
      Object.assign(globalThis, saved);
    }
  };
  const tick = () => new Promise((resolve) => setTimeout(resolve, 10));

  // Same as the Azion runtime: `setImmediate` returns a number and `clearImmediate` does not cancel it
  const runtimeLike = () => ({
    setImmediate: (callback) => {
      setTimeout(callback, 0);
      return 1;
    },
    clearImmediate: () => {},
  });

  it('returns an Immediate with ref, unref and hasRef when the runtime returns a number', async () => {
    const { setImmediate } = await load(runtimeLike(), 'number');
    const calls = [];
    const immediate = setImmediate((a, b) => calls.push([a, b]), 1, 2);
    assert.equal(typeof immediate, 'object');
    assert.equal(immediate.hasRef(), true);
    assert.equal(immediate.unref(), immediate);
    assert.equal(immediate.hasRef(), false);
    assert.equal(immediate.ref(), immediate);
    assert.equal(immediate.hasRef(), true);
    assert.equal(typeof +immediate, 'number');
    await tick();
    assert.deepEqual(calls, [[1, 2]]);
  });

  it('cancels the immediate with clearImmediate', async () => {
    const { setImmediate, clearImmediate } = await load(runtimeLike(), 'clear');
    let called = false;
    clearImmediate(setImmediate(() => (called = true)));
    await tick();
    assert.equal(called, false);
  });

  it('runs the callback once', async () => {
    const { setImmediate } = await load(runtimeLike(), 'once');
    let count = 0;
    setImmediate(() => count++);
    await tick();
    assert.equal(count, 1);
  });

  it('schedules with a timer when the runtime has no setImmediate', async () => {
    const { setImmediate, clearImmediate } = await load(
      { setImmediate: undefined, clearImmediate: undefined },
      'missing',
    );
    const calls = [];
    setImmediate(() => calls.push('run'));
    clearImmediate(setImmediate(() => calls.push('cleared')));
    await tick();
    assert.deepEqual(calls, ['run']);
  });

  it('keeps the native Immediate when the runtime returns one', async () => {
    const { setImmediate, clearImmediate } = await load({}, 'native');
    let called = false;
    const immediate = setImmediate(() => (called = true));
    assert.equal(immediate.constructor.name, 'Immediate');
    clearImmediate(immediate);
    await tick();
    assert.equal(called, false);
  });
});

describe('performance.timeOrigin', async () => {
  const { alignPerformanceTimeOrigin } = await import(new URL('globals/performance.js', polyfills));

  it('follows Date.now() when the runtime value is not an epoch time', () => {
    let now = 5;
    const perf = { timeOrigin: 0, now: () => now };
    assert.equal(alignPerformanceTimeOrigin(perf), true);

    const before = Date.now();
    const current = perf.timeOrigin + perf.now();
    assert.ok(Math.abs(current - before) < 50, `${current} should be close to ${before}`);

    now = 1005;
    const later = perf.timeOrigin + perf.now();
    assert.ok(Math.abs(later - Date.now()) < 50, `${later} should be close to Date.now()`);
  });

  it('keeps timeOrigin when it is an epoch time already', () => {
    const start = performance.now();
    const perf = { timeOrigin: Date.now() - start, now: () => performance.now() - start };
    const descriptor = Object.getOwnPropertyDescriptor(perf, 'timeOrigin');
    assert.equal(alignPerformanceTimeOrigin(perf), false);
    assert.deepEqual(Object.getOwnPropertyDescriptor(perf, 'timeOrigin'), descriptor);
  });

  it('keeps the runtime value when timeOrigin can not be overridden', () => {
    const perf = Object.freeze({ timeOrigin: 0, now: () => 5 });
    assert.equal(alignPerformanceTimeOrigin(perf), false);
  });

  it('ignores a missing or incomplete performance', () => {
    assert.equal(alignPerformanceTimeOrigin(null), false);
    assert.equal(alignPerformanceTimeOrigin({}), false);
  });
});

describe('AsyncLocalStorage static snapshot and bind', async () => {
  const { addStaticSnapshot } = await import(new URL('globals/async-storage.js', polyfills));

  // Same as the Azion runtime: no static `snapshot` and no static `bind` (it is `Function.prototype.bind`)
  const createClass = () => {
    class AsyncLocalStorage {
      #store;
      run(store, callback, ...args) {
        const previous = this.#store;
        this.#store = store;
        try {
          return callback(...args);
        } finally {
          this.#store = previous;
        }
      }
      getStore() {
        return this.#store;
      }
    }
    return AsyncLocalStorage;
  };

  it('adds snapshot and bind that restore the stores of the instances that ran', () => {
    const ALS = createClass();
    addStaticSnapshot(ALS);
    assert.notEqual(ALS.bind, Function.prototype.bind);

    const first = new ALS();
    const second = new ALS();
    let snapshot;
    let bound;
    first.run('a', () =>
      second.run('b', () => {
        snapshot = ALS.snapshot();
        bound = ALS.bind(() => [first.getStore(), second.getStore()]);
      }),
    );
    assert.equal(first.getStore(), undefined);
    assert.deepEqual(
      snapshot(() => [first.getStore(), second.getStore()]),
      ['a', 'b'],
    );
    assert.deepEqual(bound(), ['a', 'b']);
  });

  it('passes the arguments to the snapshot function', () => {
    const ALS = createClass();
    addStaticSnapshot(ALS);
    const snapshot = ALS.snapshot();
    assert.equal(
      snapshot((a, b) => a + b, 1, 2),
      3,
    );
    assert.equal(ALS.bind((a, b) => a * b)(3, 4), 12);
  });

  it('keeps the native implementation', async () => {
    const { AsyncLocalStorage } = await import('node:async_hooks');
    const { snapshot, bind } = AsyncLocalStorage;
    addStaticSnapshot(AsyncLocalStorage);
    assert.equal(AsyncLocalStorage.snapshot, snapshot);
    assert.equal(AsyncLocalStorage.bind, bind);
  });

  it('adds only bind when the runtime has snapshot but not bind', () => {
    const ALS = createClass();
    const stores = [];
    ALS.snapshot =
      () =>
      (fn, ...args) => {
        stores.push('native');
        return fn(...args);
      };
    addStaticSnapshot(ALS);
    assert.notEqual(ALS.bind, Function.prototype.bind);
    assert.equal(ALS.bind((value) => value)('x'), 'x');
    assert.deepEqual(stores, ['native']);
  });

  it('ignores a missing class', () => {
    assert.doesNotThrow(() => addStaticSnapshot(undefined));
  });
});

describe('queueMicrotask', () => {
  const load = async (query) => {
    const original = globalThis.queueMicrotask;
    delete globalThis.queueMicrotask;
    try {
      await import(`${new URL('globals/queue-microtask.js', polyfills)}?${query}`);
      return { polyfill: globalThis.queueMicrotask, restore: () => (globalThis.queueMicrotask = original) };
    } catch (error) {
      globalThis.queueMicrotask = original;
      throw error;
    }
  };

  it('is defined when the runtime does not define it and runs the callback before the next task', async () => {
    const { polyfill, restore } = await load('missing');
    try {
      assert.equal(typeof polyfill, 'function');
      const order = [];
      setTimeout(() => order.push('timeout'), 0);
      assert.equal(polyfill(() => order.push('microtask')), undefined);
      order.push('sync');
      await new Promise((resolve) => setTimeout(resolve, 5));
      assert.deepEqual(order, ['sync', 'microtask', 'timeout']);
    } finally {
      restore();
    }
  });

  it('throws a TypeError when the callback is not a function', async () => {
    const { polyfill, restore } = await load('type-error');
    try {
      assert.throws(() => polyfill(undefined), TypeError);
      assert.throws(() => polyfill('callback'), TypeError);
    } finally {
      restore();
    }
  });

  it('reports the error thrown by the callback', async () => {
    const { polyfill, restore } = await load('report');
    const originalReportError = globalThis.reportError;
    const reported = [];
    globalThis.reportError = (error) => reported.push(error);
    try {
      const error = new Error('boom');
      polyfill(() => {
        throw error;
      });
      await new Promise((resolve) => setTimeout(resolve, 5));
      assert.deepEqual(reported, [error]);
    } finally {
      globalThis.reportError = originalReportError;
      restore();
    }
  });

  it('keeps the runtime implementation', async () => {
    const original = globalThis.queueMicrotask;
    const runtimeImplementation = () => {};
    globalThis.queueMicrotask = runtimeImplementation;
    try {
      await import(`${new URL('globals/queue-microtask.js', polyfills)}?present`);
      assert.equal(globalThis.queueMicrotask, runtimeImplementation);
    } finally {
      globalThis.queueMicrotask = original;
    }
  });
});
