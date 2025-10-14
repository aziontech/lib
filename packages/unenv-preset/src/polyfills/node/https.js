/* eslint-disable */
// https://nodejs.org/api/https.html
import { EventEmitter } from 'node:events';

function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}

function notImplemented(name) {
  const fn = () => {
    throw createNotImplementedError(name);
  };
  return Object.assign(fn, { __unenv__: true });
}

class HttpAgent extends EventEmitter {
  __unenv__ = {};
  maxFreeSockets = 256;
  maxSockets = Infinity;
  maxTotalSockets = Infinity;
  freeSockets = {};
  sockets = {};
  requests = {};
  destroy() {}
}

export const Server = notImplementedClass('https.Server');

export const Agent = HttpAgent;

export const globalAgent = new Agent();

export const get = notImplemented('https.get');

export const createServer = notImplemented('https.createServer');

export const request = (urlOrOptions, optionsOrCallback, maybeCallback) => {
  let url, options, callback;
  if (typeof urlOrOptions === 'string' || urlOrOptions instanceof URL) {
    url = urlOrOptions;
    if (typeof optionsOrCallback === 'object' && optionsOrCallback !== null) {
      options = optionsOrCallback;
      callback = maybeCallback;
    } else {
      options = {};
      callback = optionsOrCallback;
    }
  } else {
    url = undefined;
    options = urlOrOptions || {};
    callback = optionsOrCallback;
  }

  let fullUrl, headers, method, body;
  if (url) {
    fullUrl = url.toString();
    headers = { ...(options.headers || {}) };
    method = (options.method || 'GET').toUpperCase();
    body = options.body;
  } else {
    const protocol = options.protocol || 'https:';
    const hostname = options.hostname || 'localhost';
    const port = options.port ? `:${options.port}` : '';
    const path = options.path || '/';
    body = options.body;
    const queryParams = options.query ? new URLSearchParams(options.query).toString() : '';
    const queryString = queryParams ? `?${queryParams}` : '';
    fullUrl = `${protocol}//${hostname}${port}${path}${queryString}`;
    headers = { ...(options.headers || {}) };
    method = (options.method || 'GET').toUpperCase();
  }

  let formattedBody;
  if (headers['Content-Type'] === 'application/json') {
    formattedBody = body ? JSON.stringify(body) : undefined;
    if (!options.method && body) method = 'POST';
  } else if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    formattedBody = body ? new URLSearchParams(body).toString() : undefined;
    if (!options.method && body) method = 'POST';
  } else {
    formattedBody = body;
    if (!options.method && body) method = 'POST';
  }

  const controller = new AbortController();
  const signal = controller.signal;

  let timeoutId;
  if (options.timeout) {
    timeoutId = setTimeout(() => {
      controller.abort();
      reqEvents.emit('error', new Error('Request timed out'));
    }, options.timeout);
  }

  const reqEvents = new EventEmitter();

  let endCalled = false;

  const req = {
    _bodyBuffer: [],
    removeHeader: (name) => {
      if (headers && typeof name === 'string') {
        delete headers[name];
        delete headers[name.toLowerCase()];
      }
    },
    setHeader: (name, value) => {
      if (headers && typeof name === 'string') {
        headers[name] = value;
        headers[name.toLowerCase()] = value;
      }
    },
    write: (chunk) => {
      if (typeof chunk === 'string' || chunk instanceof Buffer) {
        req._bodyBuffer.push(chunk);
      } else {
        throw new Error('Invalid chunk type. Expected string or Buffer.');
      }
    },
    on: (event, listener) => {
      reqEvents.on(event, listener);
      return req;
    },
    once: (event, listener) => {
      reqEvents.once(event, listener);
      return req;
    },
    abort: () => {
      clearTimeout(timeoutId);
      controller.abort();
    },
    end: () => {
      if (endCalled) {
        console.error('end() called multiple times');
        return;
      }
      endCalled = true;

      let bodyFinal;
      if (req._bodyBuffer.length > 0) {
        if (Buffer.isBuffer(req._bodyBuffer[0])) {
          bodyFinal = Buffer.concat(req._bodyBuffer).toString();
        } else {
          bodyFinal = req._bodyBuffer.join('');
        }
      } else {
        bodyFinal = formattedBody;
      }

      const fetchOptions = {
        method,
        headers,
        signal,
      };

      if (method !== 'GET' && method !== 'HEAD' && bodyFinal !== undefined) {
        fetchOptions.body = bodyFinal;
      }

      fetch(fullUrl, fetchOptions)
        .then(async (response) => {
          clearTimeout(timeoutId);
          const res = new EventEmitter();
          res.statusCode = response.status;
          res.headers = Object.fromEntries(response.headers.entries());

          const chunks = [];
          res[Symbol.asyncIterator] = async function* () {
            let ended = false;
            this.on('end', () => {
              ended = true;
            });
            let idx = 0;
            while (!ended || idx < chunks.length) {
              if (idx < chunks.length) {
                yield chunks[idx++];
              } else {
                await new Promise((resolve) => this.once('data', resolve));
              }
            }
          };

          const reader = response.body?.getReader();

          const processStream = async () => {
            try {
              if (!reader) {
                res.emit('end');
                return;
              }
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  res.emit('end');
                  break;
                }
                const buf = Buffer.from(value);
                chunks.push(buf);
                res.emit('data', buf);
              }
            } catch (err) {
              res.emit('error', err);
            }
          };

          if (reader) {
            if (!reader.locked) {
              processStream();
            } else {
              res.emit('error', new Error('Stream is already locked'));
            }
          } else {
            res.emit('end');
          }

          reqEvents.emit('response', res);

          if (typeof callback === 'function') {
            callback(res);
          }
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          reqEvents.emit('error', err);
        });
    },
  };

  return req;
};

export default {
  Server,
  Agent,
  globalAgent,
  get,
  createServer,
  request,
};
