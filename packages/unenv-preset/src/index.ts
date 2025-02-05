import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAbsolutePath = () => path.resolve(__dirname, '../', 'src');

const nextNodePresetPath = `${getAbsolutePath()}/polyfills/node/frameworks/next`;
const polyfillsPath = `${getAbsolutePath()}/polyfills`;

export default {
  inject: {
    __dirname: `${polyfillsPath}/node/globals/path-dirname.js`,
    __filename: `${polyfillsPath}/node/globals/path-filename.js`,
    process: `${polyfillsPath}/node/globals/process.cjs`,
    performance: `${polyfillsPath}/node/globals/performance.js`,
    navigator: `${polyfillsPath}/node/globals/navigator.js`,
  },
  alias: {
    'azion/utils': 'azion/utils',
    '@fastly/http-compute-js': '@fastly/http-compute-js',
    'next/dist/compiled/etag': `${nextNodePresetPath}/custom-server/12.3.x/util/etag.js`,
    accepts: 'accepts',
    crypto: `${polyfillsPath}/node/crypto.js`,
    events: 'events/events.js',
    http: 'stream-http',
    module: `${polyfillsPath}/node/module.js`,
    stream: 'stream-browserify/',
    string_decoder: 'string_decoder/lib/string_decoder.js',
    url: 'url/url.js',
    util: 'util/util.js',
    timers: 'timers-browserify/',
    inherits: 'inherits/inherits_browser.js',
    vm: 'vm-browserify/',
    zlib: 'browserify-zlib',
  },
  external: ['node:async_hooks', 'node:fs/promises'],
  polyfill: [
    'aziondev:async_hooks:/async-hooks/async-hooks.polyfills.js',
    'aziondev:fs:/fs/fs.polyfills.js',
    'aziondev:fs/promises:/fs/promises/promises.polyfills.js',
    `azionprd:fs:/fs.js`,
  ],
};
