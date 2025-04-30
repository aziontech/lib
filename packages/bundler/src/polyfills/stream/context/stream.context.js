/* eslint-disable */
import * as stream from 'node:stream';

export class Duplex extends stream.Duplex {}
export class Writable extends stream.Writable {}
export class Readable extends stream.Readable {}
export class Transform extends stream.Transform {}
export class PassThrough extends stream.PassThrough {}
export class Stream extends stream.Stream {}

export default {
  Duplex,
  Writable,
  Readable,
  Transform,
  PassThrough,
  Stream,
};
