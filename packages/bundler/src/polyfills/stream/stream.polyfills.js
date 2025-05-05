/* eslint-disable */
/** This polyfill is referenced in #build/bundlers/polyfills/polyfills-manager.js
 *
 * STREAM_CONTEXT is defined in runtime.env.js for use on the local server
 */

export var { Duplex } = STREAM_CONTEXT;
export var { Writable } = STREAM_CONTEXT;
export var { Readable } = STREAM_CONTEXT;
export var { Transform } = STREAM_CONTEXT;
export var { PassThrough } = STREAM_CONTEXT;
export var { Stream } = STREAM_CONTEXT;
export var { prototype } = STREAM_CONTEXT;

Readable.toWeb = function (readable) {
  const stream = new ReadableStream({
    start(controller) {
      readable.on('data', (chunk) => {
        controller.enqueue(chunk);
      });
      readable.on('end', () => {
        controller.close();
      });
      readable.on('error', (error) => {
        controller.error(error);
      });
    },
  });
  return stream;
};

Readable.fromWeb = function (webStream) {
  const reader = webStream.getReader();
  return new Readable({
    async read(size) {
      const { done, value } = await reader.read();
      if (done) {
        return { done: true };
      }
      return { done: false, value };
    },
    async destroy(error) {
      await reader.cancel(error);
    },
  });
};

Writable.toWeb = function (webStream) {
  const writer = webStream.getWriter();

  writer.closed.catch((error) => {
    console.error('WritableStream closed with error:', error);
    console.error('Error details:', error?.message, error?.stack);
  });

  return new Writable({
    write(chunk, encoding, callback) {
      if (writer.desiredSize === null) {
        const err = new Error('WritableStream is not writable or has been closed.');
        console.error(err.message);
        callback(err);
        return;
      }

      writer
        .write(chunk)
        .then(() => callback(undefined))
        .catch((err) => {
          callback(err);
        });
    },
    final(callback) {
      writer.ready
        .then(() => {
          return writer.close();
        })
        .then(() => callback(undefined))
        .catch((err) => {
          callback(err);
        });
    },
    destroy(error, callback) {
      writer
        .abort(error)
        .then(() => {
          callback(undefined);
        })
        .catch((err) => {
          callback(err);
        });
    },
  });
};

export default {
  Duplex,
  Writable,
  Readable,
  Transform,
  PassThrough,
  Stream,
  stream: STREAM_CONTEXT,
  prototype,
};
