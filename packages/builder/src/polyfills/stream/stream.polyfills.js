/* eslint-disable */
/**
 * STREAM_CONTEXT is defined in runtime.env.js for use on the local server
 */

const localStream = {};
const { Duplex, Writable, Readable, Transform, PassThrough, Stream } = STREAM_CONTEXT;
export const { prototype } = STREAM_CONTEXT;

localStream.Duplex = Duplex;
localStream.Writable = Writable;
localStream.Readable = Readable;
localStream.Transform = Transform;
localStream.PassThrough = PassThrough;
localStream.Stream = Stream;
localStream.prototype = prototype;

Readable.toWeb = function (readable) {
  let onData, onEnd, onError;
  let closed = false;
  const stream = new ReadableStream({
    start(controller) {
      onData = (chunk) => {
        if (!closed) controller.enqueue(chunk);
      };
      onEnd = () => {
        if (!closed) {
          closed = true;
          controller.close();
        }
      };
      onError = (error) => {
        if (!closed) {
          closed = true;
          controller.error(error);
        }
      };

      readable.on('data', onData);
      readable.on('end', onEnd);
      readable.on('error', onError);

      readable.on('close', () => {
        if (!closed) {
          closed = true;
          controller.close();
        }
      });
    },
    cancel(reason) {
      readable.off('data', onData);
      readable.off('end', onEnd);
      readable.off('error', onError);
      if (typeof readable.destroy === 'function') {
        readable.destroy(reason);
      }
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

Writable.fromWeb = function (webStream) {
  const writer = webStream.getWriter();

  writer.closed.catch((error) => {
    if (error) {
      console.error('WritableStream closed with error:', error);
      console.error('Error details:', error?.message, error?.stack);
    }
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

export { Duplex, PassThrough, Readable, Stream, Transform, Writable };

export default localStream;
