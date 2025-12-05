import * as originalUtil from 'unenv/node/util';

export * from 'unenv/node/util';

const isCryptoKey = (val) => typeof CryptoKey !== 'undefined' && val instanceof CryptoKey;

// eslint-disable-next-line no-undef
const isKeyObject = (val) => typeof KeyObject !== 'undefined' && val instanceof KeyObject;

export const types = {
  ...originalUtil.types,
  isCryptoKey,
  isKeyObject,
};

export default {
  ...originalUtil,
  types,
};
