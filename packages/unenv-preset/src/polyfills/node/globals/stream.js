import { Duplex, Readable, Transform, Writable } from 'node:stream';

globalThis.Readable = Readable;
globalThis.Writable = Writable;
globalThis.Duplex = Duplex;
globalThis.Transform = Transform;

globalThis.Readable.toWeb = function (readable) {
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

globalThis.Readable.fromWeb = function (webStream) {
  const reader = webStream.getReader();
  return new Readable({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

globalThis.Writable.toWeb = function (webStream) {
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

globalThis.stream = {
  Readable: globalThis.Readable,
  Writable: globalThis.Writable,
  Duplex: Duplex,
  Transform: Transform,
};

export default globalThis.stream;
