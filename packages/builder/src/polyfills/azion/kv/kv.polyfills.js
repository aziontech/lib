/* eslint-disable */

/**
 * KV Storage API Polyfill
 * This polyfill is referenced in #build/bundlers/polyfills/polyfills-manager.js
 *
 * @example
 *
 *  const kv = new KV("mystore");
 *  const value = await kv.get("mykey");
 */

class KV {
  #kvName;

  constructor(kvName) {
    if (typeof kvName !== 'string') {
      throw new Error('kvName must be a string');
    }
    this.#kvName = kvName;
  }

  static async open(name) {
    if (typeof name !== 'string') {
      throw new Error('name must be a string');
    }
    return new KV(name);
  }

  async get(key, returnType, options) {
    if (Array.isArray(key)) {
      return this.#getMultiple(key, returnType, options);
    }

    const actualReturnType = options?.type || returnType || 'text';
    const result = await new KV_CONTEXT(this.#kvName).get(key, actualReturnType, options);
    return result.value;
  }

  async getWithMetadata(key, returnType, options) {
    if (Array.isArray(key)) {
      return this.#getMultipleWithMetadata(key, returnType, options);
    }

    const actualReturnType = options?.type || returnType || 'text';
    return await new KV_CONTEXT(this.#kvName).get(key, actualReturnType, options);
  }

  async #getMultiple(keys, returnType, options) {
    const actualReturnType = options?.type || returnType || 'text';
    const results = await new KV_CONTEXT(this.#kvName).getMultiple(keys, actualReturnType, options);

    const valueMap = new Map();
    for (const [key, result] of results.entries()) {
      valueMap.set(key, result.value);
    }
    return valueMap;
  }

  async #getMultipleWithMetadata(keys, returnType, options) {
    const actualReturnType = options?.type || returnType || 'text';
    return await new KV_CONTEXT(this.#kvName).getMultiple(keys, actualReturnType, options);
  }

  async put(key, value, options) {
    if (typeof key !== 'string') {
      throw new Error('key must be a string');
    }
    return await new KV_CONTEXT(this.#kvName).put(key, value, options || {});
  }

  async delete(key) {
    if (typeof key !== 'string') {
      throw new Error('key must be a string');
    }
    return await new KV_CONTEXT(this.#kvName).delete(key);
  }
}

export default KV;

globalThis.Azion = globalThis.Azion || {};
globalThis.Azion.KV = KV;
