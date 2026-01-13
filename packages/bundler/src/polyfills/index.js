import { AsyncHooksContext } from './async-hooks/index.js';
import EnvVarsContext from './azion/env-vars/index.js';
import FetchEventContext from './azion/fetch-event/index.js';
import fetchContext from './azion/fetch/index.js';
import FirewallEventContext from './azion/firewall-event/index.js';
import { KVContext } from './azion/kv/index.js';
import NetworkListContext from './azion/network-list/index.js';
import { StorageContext } from './azion/storage/index.js';
import cryptoContext from './crypto/index.js';
import { fsContext } from './fs/index.js';
import promisesContext from './promises/index.js';
import { streamContext } from './stream/index.js';

// TODO: transform polyfills to TypeScript

export {
  AsyncHooksContext,
  cryptoContext,
  EnvVarsContext,
  fetchContext,
  FetchEventContext,
  FirewallEventContext,
  fsContext,
  KVContext,
  NetworkListContext,
  promisesContext,
  StorageContext,
  streamContext,
};
