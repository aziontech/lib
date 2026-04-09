globalThis.Promise = Promise || globalThis.Promise;

globalThis.Promise.withResolvers = function () {
  let resolve;
  let reject;
  const promise = new globalThis.Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve, reject: reject };
};

export default globalThis.Promise.withResolvers;
