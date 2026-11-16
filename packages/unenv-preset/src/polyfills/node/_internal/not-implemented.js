/**
 * Stubs for Node.js APIs that the Azion runtime does not provide and unenv does not cover yet.
 * They fail when called, not when imported, so a bundle that only references them still loads.
 */

/**
 * @param {string} name Name of the API, used in the error message
 * @returns {Function} Function that throws when called
 */
export function notImplemented(name) {
  return function () {
    throw new Error(`[azion] ${name} is not implemented yet!`);
  };
}

/**
 * @param {string} name Name of the API, used in the error message
 * @returns {Function} Class that throws when instantiated
 */
export function notImplementedClass(name) {
  return class {
    constructor() {
      throw new Error(`[azion] ${name} is not implemented yet!`);
    }
  };
}
