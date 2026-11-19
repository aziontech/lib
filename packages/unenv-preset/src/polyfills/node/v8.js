import * as originalV8 from 'unenv/node/v8';
import { notImplemented } from './_internal/not-implemented.js';

export * from 'unenv/node/v8';

// Node.js 24
export const startCpuProfile = notImplemented('v8.startCpuProfile');

export default {
  ...originalV8.default,
  startCpuProfile,
};
