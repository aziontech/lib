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

export const request = (options, callback) => {
  let fullUrl;
  let headers = {};
  let method;

  if (typeof options === 'object') {
    const protocol = options.protocol || 'https:';
    const hostname = options.hostname || 'localhost';
    const port = options.port ? `:${options.port}` : '';
    const path = options.path || '/';
    method = options.method || 'GET';

    // Adiciona os query params, se existirem
    const queryParams = options.query ? new URLSearchParams(options.query).toString() : '';
    const queryString = queryParams ? `?${queryParams}` : '';

    fullUrl = `${protocol}//${hostname}${port}${path}${queryString}`;
    headers = { ...options.headers };
  } else {
    fullUrl = options;
    headers = options.headers || {};
  }

  const { body } = options;

  // Verifica o tipo de conteúdo e formata o corpo adequadamente
  let formattedBody;
  if (headers['Content-Type'] === 'application/json') {
    formattedBody = body ? JSON.stringify(body) : undefined;
  } else if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    formattedBody = body ? new URLSearchParams(body).toString() : undefined;
  } else {
    formattedBody = body; // Envia o corpo como está para outros tipos de conteúdo
  }

  const fetchOptions = {
    method,
    headers,
    body: JSON.stringify(formattedBody) || JSON.stringify({}),
  };

  const controller = new AbortController();
  const signal = controller.signal;

  let timeoutId;
  if (options.timeout) {
    timeoutId = setTimeout(() => {
      controller.abort();
      reqEvents.emit('error', new Error('Request timed out'));
    }, 5000);
  }

  const reqEvents = new EventEmitter();

  let endCalled = false;

  const req = {
    _bodyBuffer: [],
    write: (chunk) => {
      if (typeof chunk === 'string' || chunk instanceof Buffer) {
        req._bodyBuffer.push(chunk); // Adiciona o chunk ao buffer
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

      // Concatena os chunks do buffer para formar o corpo completo
      const body = req._bodyBuffer.length > 0 ? req._bodyBuffer.join('') : undefined;

      fetch(fullUrl, { ...fetchOptions, body, signal })
        .then(async (response) => {
          clearTimeout(timeoutId);

          const res = new EventEmitter();
          res.statusCode = response.status;
          res.headers = Object.fromEntries(response.headers.entries());

          const reader = response.body?.getReader();

          const processStream = async () => {
            try {
              if (!reader) {
                console.log('No reader available');
                res.emit('end'); // Emite 'end' se não houver corpo na resposta
                return;
              }
              // eslint-disable-next-line no-constant-condition
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  res.emit('end');
                  break;
                }
                res.emit('data', Buffer.from(value));
              }
            } catch (err) {
              console.error('Error processing stream:', err);
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

          if (callback) {
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
