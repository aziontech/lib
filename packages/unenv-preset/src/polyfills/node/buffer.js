import * as originalBuffer from 'unenv/node/buffer';

if (!originalBuffer.Buffer.prototype.latin1Slice) {
  originalBuffer.Buffer.prototype.latin1Slice = function (start, end) {
    return originalBuffer.Buffer.from(this).toString('latin1', start, end);
  };
}
if (!originalBuffer.Buffer.prototype.utf8Slice) {
  originalBuffer.Buffer.prototype.utf8Slice = function (start, end) {
    return originalBuffer.Buffer.from(this).toString('utf8', start, end);
  };
}

export * from 'unenv/node/buffer';

export const Buffer = originalBuffer.Buffer;

export default {
  ...originalBuffer.default,
  Buffer,
};
