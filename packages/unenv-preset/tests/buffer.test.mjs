import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

// The Azion runtime has no native `Buffer`, so `unenv/node/buffer` provides its own implementation. Hide the
// native one (this file runs in its own process) to exercise that implementation, which is the one patched.
const nativeBuffer = globalThis.Buffer;
delete globalThis.Buffer;
const { Buffer } = await import('../src/polyfills/node/buffer.js');
globalThis.Buffer = nativeBuffer;

describe('buffer: indexOf, lastIndexOf and includes accept a Uint8Array', () => {
  const buffer = Buffer.from('hello world, hello');

  it('uses the polyfill implementation, not the native one', () => {
    assert.notEqual(Buffer, nativeBuffer);
  });

  it('finds a Uint8Array that is not a Buffer', () => {
    const needle = new Uint8Array(Buffer.from('world'));
    assert.equal(buffer.indexOf(needle), 6);
    assert.equal(buffer.indexOf(needle, 7), -1);
    assert.equal(buffer.lastIndexOf(new Uint8Array(Buffer.from('hello'))), 13);
    assert.equal(buffer.includes(needle), true);
  });

  it('respects the byteOffset and the length of a Uint8Array view', () => {
    const bytes = new Uint8Array(Buffer.from('xxworldxx'));
    const view = new Uint8Array(bytes.buffer, 2, 5);
    assert.equal(buffer.indexOf(view), 6);
  });

  it('keeps accepting strings, numbers and Buffers', () => {
    assert.equal(buffer.indexOf('world'), 6);
    assert.equal(buffer.indexOf(0x77), 6);
    assert.equal(buffer.indexOf(Buffer.from('world')), 6);
    assert.equal(buffer.lastIndexOf('hello'), 13);
  });

  it('still rejects values of other types', () => {
    assert.throws(() => buffer.indexOf({}), TypeError);
  });
});
