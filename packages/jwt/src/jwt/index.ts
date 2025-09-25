/**
 * @module
 * JSON Web Token (JWT)
 * https://datatracker.ietf.org/doc/html/rfc7519
 */

import type { JWTPayload } from '../common/types';
import {
  JwtHeaderInvalid,
  JwtTokenExpired,
  JwtTokenInvalid,
  JwtTokenIssuedAt,
  JwtTokenNotBefore,
  JwtTokenSignatureMismatched,
} from '../common/types';
import type { SignatureAlgorithm } from '../jwa';
import { AlgorithmTypes } from '../jwa';
import type { SignatureKey } from '../jws';
import { signing, verifying } from '../jws';
import { decodeBase64Url, encodeBase64Url } from '../utils/encode';
import { utf8Decoder, utf8Encoder } from '../utils/utf8';

/**
 * Encodes a JWT part (header or payload) to a Base64 URL string.
 * @param part - The part to encode.
 * @returns The Base64 URL encoded string.
 * @example
 * const encodedHeader = encodeJwtPart({ alg: 'HS256', typ: 'JWT' });
 * console.log(encodedHeader);
 */
const encodeJwtPart = (part: unknown): string =>
  // eslint-disable-next-line
  // @ts-ignore
  encodeBase64Url(utf8Encoder.encode(JSON.stringify(part))).replace(/=/g, '');

/**
 * Encodes a signature part to a Base64 URL string.
 * @param buf - The buffer to encode.
 * @returns The Base64 URL encoded string.
 * @example
 * const signature = encodeSignaturePart(new Uint8Array([1, 2, 3]));
 * console.log(signature);
 */
const encodeSignaturePart = (buf: ArrayBufferLike): string => encodeBase64Url(buf).replace(/=/g, '');

/**
 * Decodes a JWT part (header or payload) from a Base64 URL string.
 * @param part - The part to decode.
 * @returns The decoded TokenHeader or JWTPayload, or undefined if decoding fails.
 * @example
 * const decodedHeader = decodeJwtPart(encodedHeader);
 * console.log(decodedHeader);
 */
const decodeJwtPart = (part: string): TokenHeader | JWTPayload | undefined =>
  JSON.parse(utf8Decoder.decode(decodeBase64Url(part)));

/**
 * Interface representing the JWT header.
 */
export interface TokenHeader {
  alg: SignatureAlgorithm;
  typ?: 'JWT';
}

/**
 * Type guard to check if an object is a TokenHeader.
 * @param obj - The object to check.
 * @returns True if the object is a TokenHeader, false otherwise.
 * @example
 * const isHeader = isTokenHeader({ alg: 'HS256', typ: 'JWT' });
 * console.log(isHeader); // true
 */
export function isTokenHeader(obj: unknown): obj is TokenHeader {
  if (typeof obj === 'object' && obj !== null) {
    const objWithAlg = obj as { [key: string]: unknown };
    return (
      'alg' in objWithAlg &&
      Object.values(AlgorithmTypes).includes(objWithAlg.alg as AlgorithmTypes) &&
      (!('typ' in objWithAlg) || objWithAlg.typ === 'JWT')
    );
  }
  return false;
}

/**
 * Signs a JWT payload with a given private key and algorithm.
 * @param payload - The JWT payload to sign.
 * @param privateKey - The private key to sign the payload with.
 * @param alg - The signature algorithm to use (default is 'HS256').
 * @returns The signed JWT as a string.
 * @example
 * const token = await sign({ sub: '1234567890', name: 'John Doe', iat: 1516239022 }, privateKey);
 * console.log(token);
 */
export const sign = async (
  payload: JWTPayload,
  privateKey: SignatureKey,
  alg: SignatureAlgorithm = 'HS256',
): Promise<string> => {
  const encodedPayload = encodeJwtPart(payload);
  const encodedHeader = encodeJwtPart({ alg, typ: 'JWT' } satisfies TokenHeader);

  const partialToken = `${encodedHeader}.${encodedPayload}`;

  const signaturePart = await signing(privateKey, alg, utf8Encoder.encode(partialToken));
  const signature = encodeSignaturePart(signaturePart);

  return `${partialToken}.${signature}`;
};

/**
 * Verifies a JWT with a given public key and algorithm.
 * @param token - The JWT to verify.
 * @param publicKey - The public key to verify the JWT with.
 * @param alg - The signature algorithm to use (default is 'HS256').
 * @returns The decoded JWT payload if verification is successful.
 * @throws {JwtTokenInvalid} If the token is invalid.
 * @throws {JwtHeaderInvalid} If the token header is invalid.
 * @throws {JwtTokenNotBefore} If the token is not yet valid.
 * @throws {JwtTokenExpired} If the token has expired.
 * @throws {JwtTokenIssuedAt} If the token was issued in the future.
 * @throws {JwtTokenSignatureMismatched} If the token signature does not match.
 * @example
 * const payload = await verify(token, publicKey);
 * console.log(payload);
 */
export const verify = async (
  token: string,
  publicKey: SignatureKey,
  alg: SignatureAlgorithm = 'HS256',
): Promise<JWTPayload> => {
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    throw new JwtTokenInvalid(token);
  }

  const { header, payload } = decode(token);
  if (!isTokenHeader(header)) {
    throw new JwtHeaderInvalid(header);
  }
  const now = Math.floor(Date.now() / 1000);
  if (payload.nbf && payload.nbf > now) {
    throw new JwtTokenNotBefore(token);
  }
  if (payload.exp && payload.exp <= now) {
    throw new JwtTokenExpired(token);
  }
  if (payload.iat && now < payload.iat) {
    throw new JwtTokenIssuedAt(now, payload.iat);
  }

  const headerPayload = token.substring(0, token.lastIndexOf('.'));
  // eslint-disable-next-line
  // @ts-ignore
  const verified = await verifying(publicKey, alg, decodeBase64Url(tokenParts[2]), utf8Encoder.encode(headerPayload));
  if (!verified) {
    throw new JwtTokenSignatureMismatched(token);
  }

  return payload;
};

/**
 * Decodes a JWT into its header and payload.
 * @param token - The JWT to decode.
 * @returns An object containing the decoded header and payload.
 * @throws {JwtTokenInvalid} If the token is invalid.
 * @example
 * const { header, payload } = decode(token);
 * console.log(header, payload);
 */
export const decode = (token: string): { header: TokenHeader; payload: JWTPayload } => {
  try {
    const [h, p] = token.split('.');
    const header = decodeJwtPart(h) as TokenHeader;
    const payload = decodeJwtPart(p) as JWTPayload;
    return {
      header,
      payload,
    };
  } catch {
    throw new JwtTokenInvalid(token);
  }
};
