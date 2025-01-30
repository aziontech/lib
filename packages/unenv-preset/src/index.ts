const nextNodePresetPath = `./polyfills/node/frameworks/next`;
const nodePolyfillsPath = `./polyfills/node`;

export default {
  inject: {
    __dirname: `${nodePolyfillsPath}/node/globals/path-dirname.js`,
    __filename: `${nodePolyfillsPath}/node/globals/path-filename.js`,
    process: `${nodePolyfillsPath}/node/globals/process.cjs`,
  },
  alias: {
    'azion/utils': 'azion/utils',
    '@fastly/http-compute-js': '@fastly/http-compute-js',
    'next/dist/compiled/etag': `${nextNodePresetPath}/custom-server/12.3.x/util/etag.js`,
    accepts: 'accepts',
    crypto: `${nodePolyfillsPath}/node/crypto.js`,
    events: 'events/events.js',
    http: 'stream-http',
    module: `${nodePolyfillsPath}/node/module.js`,
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
