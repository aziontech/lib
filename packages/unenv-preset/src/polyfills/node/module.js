/* eslint-disable */

function createRequire(...args) {
  /* EMPTY */
}

function unimplemented() {
  throw new Error('Not implemented yet!');
}

const builtinModules = [
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

// Crie um objeto para exportação
const moduleExports = {
  builtinModules: builtinModules,
  _cache: null,
  _pathCache: null,
  _extensions: null,
  globalPaths: null,
  _debug: unimplemented,
  _findPath: unimplemented,
  _nodeModulePaths: _nodeModulePaths,
  _resolveLookupPaths: unimplemented,
  _load: _load,
  _resolveFilename: unimplemented,
  createRequireFromPath: unimplemented,
  createRequire: createRequire,
  _initPaths: unimplemented,
  _preloadModules: unimplemented,
  syncBuiltinESMExports: unimplemented,
  Module: unimplemented,
  runMain: unimplemented,
  findSourceMap: unimplemented,
  SourceMap: unimplemented,
};

Object.defineProperty(moduleExports, '_resolveFilename', {
  value: unimplemented,
  writable: true,
  configurable: true,
});

export default moduleExports;
