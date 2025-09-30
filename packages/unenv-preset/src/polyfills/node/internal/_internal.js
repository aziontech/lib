export function notImplemented(name) {
  const fn = () => {
    throw createNotImplementedError(name);
  };
  return Object.assign(fn, { __unenv__: true });
}

export function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
