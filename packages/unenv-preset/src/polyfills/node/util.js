/* eslint-disable */
// https://nodejs.org/api/util.html
import types from 'node:util/types';
import { notImplemented } from './internal/_internal.js';
import { inherits } from './internal/util/inherits.js';
import {
  isArray,
  isBoolean,
  isBuffer,
  isDate,
  isDeepStrictEqual,
  isError,
  isFunction,
  isNull,
  isNullOrUndefined,
  isNumber,
  isObject,
  isPrimitive,
  isRegExp,
  isString,
  isSymbol,
  isUndefined,
} from './internal/util/legacy-types.js';
import { debug, debuglog, format, formatWithOptions, inspect, log } from './internal/util/log.js';
import { MIMEParams, MIMEType } from './internal/util/mime.js';
import { promisify } from './internal/util/promisify.js';

export { MIMEParams, MIMEType } from './internal/util/mime.js';

export * from './internal/util/legacy-types.js';

export * from './internal/util/log.js';

export { inherits } from './internal/util/inherits.js';

export { promisify };

export { default as types } from './internal/util/types.js';

export const TextDecoder = globalThis.TextDecoder;

export const TextEncoder = globalThis.TextEncoder;

export const deprecate = (fn) => fn;

export const _errnoException = notImplemented('util._errnoException');

export const _exceptionWithHostPort = notImplemented('util._exceptionWithHostPort');

export const _extend = notImplemented('util._extend');

export const aborted = notImplemented('util.aborted');

export const callbackify = notImplemented('util.callbackify');

export const getSystemErrorMap = notImplemented('util.getSystemErrorMap');

export const getSystemErrorName = notImplemented('util.getSystemErrorName');

export const toUSVString = notImplemented('util.toUSVString');

export const stripVTControlCharacters = notImplemented('util.stripVTControlCharacters');

export const transferableAbortController = notImplemented('util.transferableAbortController');

export const transferableAbortSignal = notImplemented('util.transferableAbortSignal');

export const parseArgs = notImplemented('util.parseArgs');

export const parseEnv = notImplemented('util.parseEnv');

export const styleText = notImplemented('util.styleText');

/** @deprecated */
export const getCallSite = notImplemented('util.getCallSite');

export const getCallSites = notImplemented('util.getCallSites');

export const getSystemErrorMessage = notImplemented('util.getSystemErrorMessage');

export default {
  // @ts-expect-error
  _errnoException,
  _exceptionWithHostPort,
  _extend,
  aborted,
  callbackify,
  deprecate,
  getCallSite,
  getCallSites,
  getSystemErrorMessage,
  getSystemErrorMap,
  getSystemErrorName,
  inherits,
  promisify,
  stripVTControlCharacters,
  toUSVString,
  TextDecoder,
  TextEncoder,
  types,
  transferableAbortController,
  transferableAbortSignal,
  parseArgs,
  parseEnv,
  styleText,
  MIMEParams,
  MIMEType,
  isArray,
  isBoolean,
  isBuffer,
  isDate,
  isDeepStrictEqual,
  isError,
  isFunction,
  isNull,
  isNullOrUndefined,
  isNumber,
  isObject,
  isPrimitive,
  isRegExp,
  isString,
  isSymbol,
  isUndefined,
  debug,
  debuglog,
  format,
  formatWithOptions,
  inspect,
  log,
};
