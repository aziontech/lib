import * as originalWorkerThreads from 'unenv/node/worker_threads';
import { notImplemented } from './_internal/not-implemented.js';

export * from 'unenv/node/worker_threads';

// Node.js 24: `worker_threads.locks` is the same LockManager as `navigator.locks`
export const locks = globalThis.navigator?.locks ?? {
  request: notImplemented('worker_threads.locks.request'),
  query: notImplemented('worker_threads.locks.query'),
};

export default {
  ...originalWorkerThreads.default,
  locks,
};
