import { getAbsoluteDirPath } from 'azion/utils/node';
import path from 'path';

const getAbsolutePath = () => path.resolve(getAbsoluteDirPath(import.meta.url, 'bundler'), 'src');

const externalPolyfillsPath = `${getAbsolutePath()}/polyfills/azion`;

export default {
  libs: new Map(),
  globals: new Map(),
  alias: new Map(),
  external: new Map([
    ['azion:storage', `${externalPolyfillsPath}/storage/storage.polyfills.js`],
    ['Azion.env', `${externalPolyfillsPath}/env-vars/env-vars.polyfills.js`],
    ['Azion.networkList', `${externalPolyfillsPath}/network-list/network-list.polyfills.js`],
    ['Azion.Storage', `${externalPolyfillsPath}/storage/storage.polyfills.js`],
  ]),
};
