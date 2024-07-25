import { utf8Decoder, utf8Encoder } from './index';

describe('UTF8 Encoder/Decoder', () => {
  test('utf8Encoder should encode a string to a Uint8Array', () => {
    const input = 'Hello, World!';
    const encoded = utf8Encoder.encode(input);
    const expected = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]);

    expect(encoded).toEqual(expected);
  });

  test('utf8Decoder should decode a Uint8Array to a string', () => {
    const input = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]);
    const decoded = utf8Decoder.decode(input);
    const expected = 'Hello, World!';

    expect(decoded).toBe(expected);
  });

  test('utf8Encoder should encode and utf8Decoder should decode correctly for non-ASCII characters', () => {
    const input = 'こんにちは世界';
    const encoded = utf8Encoder.encode(input);
    const decoded = utf8Decoder.decode(encoded);

    expect(decoded).toBe(input);
  });
});
