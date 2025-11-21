import { inflateSync as inflateSyncBrowserify } from 'browserify-zlib';
import * as originalZlib from 'unenv/node/zlib';

export function inflateSync(buffer, options = {}) {
  return inflateSyncBrowserify(buffer, options);
}

export default {
  ...originalZlib.default,
  inflateSync,
};
