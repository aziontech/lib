import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getAbsolutePath = () => path.resolve(__dirname, '../', 'src');

const externalPolyfillsPath = `${getAbsolutePath()}/polyfills/azion`;

export default {
  libs: new Map(),
  globals: new Map(),
  alias: new Map(),
  external: new Map([
    ['azion:storage', `${externalPolyfillsPath}/azion/storage/storage.polyfills.js`],
    ['Azion.env', `${externalPolyfillsPath}/azion/env-vars/env-vars.polyfills.js`],
    ['Azion.networkList', `${externalPolyfillsPath}/azion/network-list/network-list.polyfills.js`],
  ]),
};
