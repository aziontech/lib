/* eslint-disable */

function createRequire(...args) {
  /* EMPTY */
}

function unimplemented() {
  throw new Error('Not implemented yet!');
}

var builtinModules = [
  '_http_agent',
  '_http_client',
  '_http_common',
  '_http_incoming',
  '_http_outgoing',
  '_http_server',
  '_stream_duplex',
  '_stream_passthrough',
  '_stream_readable',
  '_stream_transform',
  '_stream_wrap',
  '_stream_writable',
  '_tls_common',
  '_tls_wrap',
  'assert',
  'assert/strict',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'diagnostics_channel',
  'dns',
  'dns/promises',
  'domain',
  'events',
  'fs',
  'fs/promises',
  'http',
  'http2',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'path',
  'path/posix',
  'path/win32',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'stream/consumers',
  'stream/promises',
  'stream/web',
  'string_decoder',
  'sys',
  'timers',
  'timers/promises',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'util/types',
  'v8',
  'vm',
  'worker_threads',
  'zlib',
];

function _load(...args) {
  /* EMPTY */
}

function _nodeModulePaths(...args) {
  /* EMPTY */
}

function _resolveFilename(...args) {
  /* EMPTY */
}

const Module = {};

// Adicione as propriedades estáticas esperadas
Module.builtinModules = builtinModules;
Module._cache = null;
Module._pathCache = null;
Module._extensions = null;
Module.globalPaths = null;
Module._debug = unimplemented;
Module._findPath = unimplemented;
Module._nodeModulePaths = _nodeModulePaths;
Module._resolveLookupPaths = unimplemented;
Module._load = _load;
Module._resolveFilename = _resolveFilename;
Module.createRequireFromPath = unimplemented;
Module.createRequire = createRequire;
Module._initPaths = unimplemented;
Module._preloadModules = unimplemented;
Module.syncBuiltinESMExports = unimplemented;
Module.runMain = unimplemented;
Module.findSourceMap = unimplemented;
Module.SourceMap = unimplemented;
Module.require = unimplemented;
const _prototype = {
  require: unimplemented,
  resolve: unimplemented,
  paths: [],
  id: '',
  filename: '',
  loaded: false,
  children: [],
  exports: {},
  _compile: unimplemented,
  _resolveFilename: unimplemented,
};

export default Module;

export var _cache = null,
  _pathCache = null,
  _extensions = null,
  globalPaths = null;

export {
  unimplemented as _debug,
  unimplemented as _findPath,
  unimplemented as _initPaths,
  unimplemented as _load,
  unimplemented as _nodeModulePaths,
  unimplemented as _preloadModules,
  unimplemented as _resolveFilename,
  unimplemented as _resolveLookupPaths,
  builtinModules,
  createRequire as createRequire,
  createRequire as createRequireFromPath,
  unimplemented as findSourceMap,
  Module,
  _prototype as prototype,
  unimplemented as require,
  unimplemented as runMain,
  unimplemented as SourceMap,
  unimplemented as syncBuiltinESMExports,
};

/* eslint-enable */
