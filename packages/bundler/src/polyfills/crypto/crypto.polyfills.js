/* eslint-disable */
/** This polyfill is referenced in #build/bundlers/polyfills/polyfills-manager.js
 *
 * CRYPTO_CONTEXT is defined in runtime.env.js for use on the local server
 */

/* eslint-disable */

export var { Cipher } = CRYPTO_CONTEXT.cryptoContext;
export var { Decipher } = CRYPTO_CONTEXT.cryptoContext;
export var { DiffieHellman } = CRYPTO_CONTEXT.cryptoContext;
export var { DiffieHellmanGroup } = CRYPTO_CONTEXT.cryptoContext;
export var { Hash } = CRYPTO_CONTEXT.cryptoContext;
export var { Hmac } = CRYPTO_CONTEXT.cryptoContext;
export var { Sign } = CRYPTO_CONTEXT.cryptoContext;
export var { Verify } = CRYPTO_CONTEXT.cryptoContext;
export var { constants } = CRYPTO_CONTEXT.cryptoContext;
export var { createCipheriv } = CRYPTO_CONTEXT.cryptoContext;
export var { createDecipheriv } = CRYPTO_CONTEXT.cryptoContext;
export var { createDiffieHellman } = CRYPTO_CONTEXT.cryptoContext;
export var { createDiffieHellmanGroup } = CRYPTO_CONTEXT.cryptoContext;
export var { createECDH } = CRYPTO_CONTEXT.cryptoContext;
export var { createHash } = CRYPTO_CONTEXT.cryptoContext;
export var { createHmac } = CRYPTO_CONTEXT.cryptoContext;
export var { createSign } = CRYPTO_CONTEXT.cryptoContext;
export var { createVerify } = CRYPTO_CONTEXT.cryptoContext;
export var { getCiphers } = CRYPTO_CONTEXT.cryptoContext;
export var { getDiffieHellman } = CRYPTO_CONTEXT.cryptoContext;
export var { getHashes } = CRYPTO_CONTEXT.cryptoContext;
export var { pbkdf2 } = CRYPTO_CONTEXT.cryptoContext;
export var { pbkdf2Sync } = CRYPTO_CONTEXT.cryptoContext;
export var { privateDecrypt } = CRYPTO_CONTEXT.cryptoContext;
export var { privateEncrypt } = CRYPTO_CONTEXT.cryptoContext;
export var { pseudoRandomBytes } = CRYPTO_CONTEXT.cryptoContext;
export var { publicDecrypt } = CRYPTO_CONTEXT.cryptoContext;
export var { publicEncrypt } = CRYPTO_CONTEXT.cryptoContext;
export var { randomBytes } = CRYPTO_CONTEXT.cryptoContext;
export var { randomFill } = CRYPTO_CONTEXT.cryptoContext;
export var { randomFillSync } = CRYPTO_CONTEXT.cryptoContext;

export default {
  Cipher,
  Decipher,
  DiffieHellman,
  DiffieHellmanGroup,
  Hash,
  Hmac,
  Sign,
  Verify,
  constants,
  createCipheriv,
  createDecipheriv,
  createDiffieHellman,
  createDiffieHellmanGroup,
  createECDH,
  createHash,
  createHmac,
  createSign,
  createVerify,
  getCiphers,
  getDiffieHellman,
  getHashes,
  pbkdf2,
  pbkdf2Sync,
  privateDecrypt,
  privateEncrypt,
  pseudoRandomBytes,
  publicDecrypt,
  publicEncrypt,
  randomBytes,
  randomFill,
  randomFillSync,
};
