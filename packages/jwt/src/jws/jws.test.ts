/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtAlgorithmNotImplemented } from '../common/types';
import { getKeyAlgorithm, pemToBinary, signing, verifying } from './index';

describe('JWS module', () => {
  describe('signing', () => {
    it('should sign data with a private key (string)', async () => {
      const privateKey = 'my-private-key';
      const alg = 'HS256';
      const data = new Uint8Array([1, 2, 3]);

      const subtleSignSpy = jest.spyOn(crypto.subtle, 'sign');

      await signing(privateKey, alg, data);

      expect(subtleSignSpy).toHaveBeenCalledTimes(1);
      expect(subtleSignSpy).toHaveBeenCalledWith(getKeyAlgorithm(alg), expect.any(CryptoKey), data);

      subtleSignSpy.mockRestore();
    });

    it('should sign data with a private key (JsonWebKey)', async () => {
      const privateKey: JsonWebKey = { kty: 'oct', k: 'some_key' };
      const alg = 'HS256';
      const data = new Uint8Array([1, 2, 3]);

      const subtleSignSpy = jest.spyOn(crypto.subtle, 'sign');

      await signing(privateKey, alg, data);

      expect(subtleSignSpy).toHaveBeenCalledTimes(1);
      expect(subtleSignSpy).toHaveBeenCalledWith(getKeyAlgorithm(alg), expect.any(CryptoKey), data);

      subtleSignSpy.mockRestore();
    });

    it('should throw an error for unsupported algorithms', async () => {
      const privateKey = 'my-private-key';
      const alg = 'UNSUPPORTED' as any;
      const data = new Uint8Array([1, 2, 3]);

      await expect(signing(privateKey, alg, data)).rejects.toThrow(JwtAlgorithmNotImplemented);
    });
  });

  describe('verifying', () => {
    it('should verify data with a public key', async () => {
      const publicKey = 'my-public-key';
      const alg = 'HS256';
      const signature = new Uint8Array([1, 2, 3]);
      const data = new Uint8Array([4, 5, 6]);

      const subtleVerifySpy = jest.spyOn(crypto.subtle, 'verify').mockResolvedValue(true);

      const result = await verifying(publicKey, alg, signature, data);

      expect(subtleVerifySpy).toHaveBeenCalledTimes(1);
      expect(subtleVerifySpy).toHaveBeenCalledWith(getKeyAlgorithm(alg), expect.any(CryptoKey), signature, data);
      expect(result).toBe(true);

      subtleVerifySpy.mockRestore();
    });
  });

  describe('pemToBinary', () => {
    it('should convert PEM to binary', () => {
      const pem = '-----BEGIN PRIVATE KEY-----some_base64_data-----END PRIVATE KEY-----';
      const binary = pemToBinary(pem);

      expect(binary).toBeInstanceOf(Uint8Array);
    });
  });

  describe('getKeyAlgorithm', () => {
    it('should return the correct algorithm for supported algorithms', async () => {
      expect(getKeyAlgorithm('HS256')).toEqual({
        name: 'HMAC',
        hash: { name: 'SHA-256' },
      });
      expect(getKeyAlgorithm('HS384')).toEqual({
        name: 'HMAC',
        hash: { name: 'SHA-384' },
      });
      expect(getKeyAlgorithm('HS512')).toEqual({
        name: 'HMAC',
        hash: { name: 'SHA-512' },
      });
      expect(getKeyAlgorithm('RS256')).toEqual({
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-256' },
      });
      expect(getKeyAlgorithm('RS384')).toEqual({
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-384' },
      });
      expect(getKeyAlgorithm('RS512')).toEqual({
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-512' },
      });
      expect(getKeyAlgorithm('PS256')).toEqual({
        name: 'RSA-PSS',
        hash: { name: 'SHA-256' },
        saltLength: 32,
      });
      expect(getKeyAlgorithm('PS384')).toEqual({
        name: 'RSA-PSS',
        hash: {
          name: 'SHA-384',
        },
        saltLength: 48,
      });
      expect(getKeyAlgorithm('PS512')).toEqual({
        name: 'RSA-PSS',
        hash: {
          name: 'SHA-512',
        },
        saltLength: 64,
      });
      expect(getKeyAlgorithm('ES256')).toEqual({
        name: 'ECDSA',
        hash: {
          name: 'SHA-256',
        },
        namedCurve: 'P-256',
      });
      expect(getKeyAlgorithm('ES384')).toEqual({
        name: 'ECDSA',
        hash: {
          name: 'SHA-384',
        },
        namedCurve: 'P-384',
      });
      expect(getKeyAlgorithm('ES512')).toEqual({
        name: 'ECDSA',
        hash: {
          name: 'SHA-512',
        },
        namedCurve: 'P-521',
      });
      expect(getKeyAlgorithm('EdDSA')).toEqual({
        name: 'Ed25519',
        namedCurve: 'Ed25519',
      });

      expect(() => getKeyAlgorithm('UNSUPPORTED' as any)).toThrow(JwtAlgorithmNotImplemented);
    });
  });
});
