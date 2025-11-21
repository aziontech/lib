import async_hooks from 'async_hooks';
// Implement snapshot for AsyncLocalStorage
if (async_hooks.AsyncLocalStorage && !async_hooks.AsyncLocalStorage.prototype.snapshot) {
  async_hooks.AsyncLocalStorage.prototype.snapshot = function () {
    const store = this.getStore();
    return () => store;
  };
}
// Also add snapshot as a static method if needed
if (async_hooks.AsyncLocalStorage && !async_hooks.AsyncLocalStorage.snapshot) {
  async_hooks.AsyncLocalStorage.snapshot = () => {
    return (fn, ...args) => {
      if (typeof fn === 'function') {
        const result = fn(...args);
        return result;
      }
      return fn;
    };
  };
}

export default async_hooks.AsyncLocalStorage;
