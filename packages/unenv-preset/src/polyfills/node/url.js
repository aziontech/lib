import * as originalUrl from 'unenv/node/url';
import { notImplementedClass } from './_internal/not-implemented.js';

export * from 'unenv/node/url';

// Node.js 24: `url.URLPattern` is the same class as the `URLPattern` global, use the one of the runtime when it has it
export const URLPattern =
  typeof globalThis.URLPattern === 'function' ? globalThis.URLPattern : notImplementedClass('url.URLPattern');

export default {
  ...originalUrl.default,
  URLPattern,
};
