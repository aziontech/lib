/* eslint-disable */
/** This polyfill is referenced in #build/bundlers/polyfills/polyfills-manager.js
 *
 * STREAM is defined in runtime.env.js for use on the local server
 */
export class Duplex extends STREAM.Duplex {}
export class Writable extends STREAM.Writable {}
export class Readable extends STREAM.Readable {}
export class Transform extends STREAM.Transform {}
export class PassThrough extends STREAM.PassThrough {}
export class Stream extends STREAM.Stream {}

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

  // Captura erros no fechamento do stream
  writer.closed.catch((error) => {
    console.error('WritableStream closed with error:', error);
    console.error('Error details:', error?.message, error?.stack);
  });

  return new Writable({
    write(chunk, encoding, callback) {
      // Verifica se o stream ainda está ativo antes de escrever
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
          // console.error('Error writing to WritableStream:', err);
          callback(err);
        });
    },
    final(callback) {
      // Wait for the writer to be ready before closing
      writer.ready
        .then(() => {
          return writer.close();
        })
        .then(() => callback(undefined))
        .catch((err) => {
          // console.error('Error closing WritableStream:', err);
          callback(err);
        });
    },
    destroy(error, callback) {
      // Cancela o stream em caso de destruição
      writer
        .abort(error)
        .then(() => {
          // console.log('WritableStream aborted successfully.');
          callback(undefined);
        })
        .catch((err) => {
          // console.error('Error aborting WritableStream:', err);
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
};
