import stream from 'node:stream';

const localStream = {};
export const { Duplex, Writable, Readable, Transform, PassThrough, Stream } = stream;
export const { prototype } = stream;
// used by the `node:stream/promises` polyfill, Next.js uses `pipeline` to read the body of a server action
export const { pipeline, finished, promises } = stream;

localStream.pipeline = pipeline;
localStream.finished = finished;
localStream.promises = promises;
localStream.Duplex = Duplex;
localStream.Writable = Writable;
localStream.Readable = Readable;
localStream.Transform = Transform;
localStream.PassThrough = PassThrough;
localStream.Stream = Stream;
localStream.prototype = prototype;

export default localStream;
