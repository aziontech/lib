import async_hooks from 'async_hooks';

// Implement snapshot for AsyncLocalStorage
if (async_hooks.AsyncLocalStorage && !async_hooks.AsyncLocalStorage.prototype.snapshot) {
  async_hooks.AsyncLocalStorage.prototype.snapshot = function () {
    const store = this.getStore();
    return () => store;
  };
}

/**
 * Adds the static `AsyncLocalStorage.snapshot()` and `AsyncLocalStorage.bind()`, used by Next.js 16+, when the
 * runtime does not implement them.
 *
 * Without them, `AsyncLocalStorage.bind` is `Function.prototype.bind` and calling the bound function throws
 * "Class constructor AsyncLocalStorage cannot be invoked without 'new'".
 *
 * The class is patched in place because frameworks capture the global class when they are loaded. The snapshot
 * restores the stores of the instances that have been run or entered.
 *
 * @param {typeof import('node:async_hooks').AsyncLocalStorage | undefined} AsyncLocalStorageClass
 */
export function addStaticSnapshot(AsyncLocalStorageClass) {
  if (!AsyncLocalStorageClass) {
    return;
  }
  const nativeSnapshot = AsyncLocalStorageClass.snapshot;
  const hasBind = AsyncLocalStorageClass.bind !== Function.prototype.bind;
  if (typeof nativeSnapshot === 'function' && hasBind) {
    return;
  }

  let snapshot;
  if (typeof nativeSnapshot === 'function') {
    snapshot = nativeSnapshot.bind(AsyncLocalStorageClass);
  } else {
    const instances = new Set();
    const prototype = AsyncLocalStorageClass.prototype;
    for (const method of ['run', 'enterWith']) {
      const original = prototype[method];
      if (typeof original === 'function') {
        prototype[method] = function (...args) {
          instances.add(this);
          return original.apply(this, args);
        };
      }
    }
    snapshot = () => {
      const stores = Array.from(instances, (instance) => [instance, instance.getStore()]);
      return (fn, ...args) =>
        stores.reduce(
          (next, [instance, store]) =>
            () =>
              instance.run(store, next),
          () => fn(...args),
        )();
    };
  }

  Object.defineProperties(AsyncLocalStorageClass, {
    snapshot: { value: snapshot, configurable: true, writable: true },
    bind: {
      value: (fn) => {
        const run = snapshot();
        return (...args) => run(fn, ...args);
      },
      configurable: true,
      writable: true,
    },
  });
}

addStaticSnapshot(async_hooks.AsyncLocalStorage);

globalThis.AsyncLocalStorage = async_hooks.AsyncLocalStorage;

export default async_hooks.AsyncLocalStorage;
