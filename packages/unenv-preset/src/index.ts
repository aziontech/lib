import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getAbsolutePath = () => path.resolve(__dirname, '../../', 'unenv-preset', 'src');

const polyfillsPath = `${getAbsolutePath()}/polyfills`;

export default {
  inject: {
    __dirname: `${polyfillsPath}/node/globals/path-dirname.js`,
    __filename: `${polyfillsPath}/node/globals/path-filename.js`,
    process: `${polyfillsPath}/node/globals/process.cjs`,
    performance: `unenv/polyfill/performance`,
    setInterval: `${polyfillsPath}/node/globals/set-interval.js`,
  },
  alias: {
    'azion/utils': 'azion/utils',
    'azion/utils/edge': 'azion/utils/edge',
    'azion/utils/node': 'azion/utils/node',
    '@fastly/http-compute-js': '@fastly/http-compute-js',
    accepts: 'accepts',
    assert: 'assert-browserify',
    https: `${polyfillsPath}/node/https.js`,
    module: `${polyfillsPath}/node/module.js`,
    string_decoder: 'string_decoder/lib/string_decoder.js',
    timers: 'timers-browserify/',
    util: `${polyfillsPath}/node/util.js`,
    'util/types': `${polyfillsPath}/node/internal/util/types.js`,
  },
  external: ['node:async_hooks', 'node:fs/promises', 'node:stream', 'node:crypto'],
  polyfill: [
    'aziondev:async_hooks:/async-hooks/async-hooks.polyfills.js',
    'aziondev:fs:/fs/fs.polyfills.js',
    'aziondev:fs/promises:/fs/promises/promises.polyfills.js',
    'aziondev:stream:/stream/stream.polyfills.js',
    'aziondev:crypto:/crypto/crypto.polyfills.js',
    `azionprd:fs:/fs.js`,
  ],
};
