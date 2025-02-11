import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const getAbsolutePath = () => path.resolve(dirname, '../');

const externalPolyfillsPath = `${getAbsolutePath()}/polyfills/azion`;

export default {
  libs: new Map(),
  globals: new Map(),
  alias: new Map(),
  external: new Map([
    ['azion:storage', `${externalPolyfillsPath}/storage/storage.polyfills.js`],
    ['Azion.env', `${externalPolyfillsPath}/env-vars/env-vars.polyfills.js`],
    ['Azion.networkList', `${externalPolyfillsPath}/network-list/network-list.polyfills.js`],
  ]),
};
