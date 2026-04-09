// Use package exports for polyfills so they can be resolved externally
const polyfillsPath = '@aziontech/unenv-preset/polyfills';

export default {
  inject: {
    __dirname: `${polyfillsPath}/node/globals/path-dirname.js`,
    __filename: `${polyfillsPath}/node/globals/path-filename.js`,
    process: `${polyfillsPath}/node/globals/process.cjs`,
    performance: `unenv/polyfill/performance`,
    setInterval: `${polyfillsPath}/node/globals/set-interval.js`,
    clearInterval: `${polyfillsPath}/node/globals/clear-interval.js`,
    console: `${polyfillsPath}/node/globals/console.js`,
    asyncStorage: `${polyfillsPath}/node/globals/async-storage.js`,
    dateToString: `${polyfillsPath}/node/globals/date-to-string.js`,
  },
  alias: {
    '@aziontech/utils': '@aziontech/utils',
    '@aziontech/utils/edge': '@aziontech/utils/edge',
    '@aziontech/utils/node': '@aziontech/utils/node',
    '@fastly/http-compute-js': '@fastly/http-compute-js',
    accepts: 'accepts',
    assert: 'assert-browserify',
    buffer: `${polyfillsPath}/node/buffer.js`,
    https: `${polyfillsPath}/node/https.js`,
    module: `${polyfillsPath}/node/module.js`,
    string_decoder: 'string_decoder',
    timers: 'timers-browserify',
    util: `${polyfillsPath}/node/util.js`,
    zlib: `${polyfillsPath}/node/zlib.js`,
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
