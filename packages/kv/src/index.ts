export {
  clear,
  clearMethod,
  // Internal methods
  configureMethod,
  createClient,
  del as delete,
  deleteMethod,
  get,
  getMethod,
  has,
  hasMethod,
  list,
  listMethod,
  put,
  putMethod,
  setupKV,
} from './kv';

import { createClient } from './kv';
export default createClient;

export type * from './types';
