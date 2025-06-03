/* eslint-disable */
import stream from 'node:stream';

const localStream = {};
export const { Duplex, Writable, Readable, Transform, PassThrough, Stream } = stream;
export const { prototype } = stream;

localStream.Duplex = Duplex;
localStream.Writable = Writable;
localStream.Readable = Readable;
localStream.Transform = Transform;
localStream.PassThrough = PassThrough;
localStream.Stream = Stream;
localStream.prototype = prototype;

export default localStream;
