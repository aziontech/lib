/*
 * Copyright Azion
 * Licensed under the MIT license. See LICENSE file for details.
 *
 * Portions of this file Copyright Fastly, Inc, licensed under the MIT license. See LICENSE file for details.
 */

import { Buffer } from 'buffer';
import crypto from 'crypto';

/**
 * Generates an etag string based on a payload.
 * (An adaptation for Compute@Edge of function in Next.js of the same name,
 * found at next/server/api-utils/web.ts)
 * @param {string} payload data to generate etag
 * @returns {string} the generated etag
 */
export default function generateETag(payload) {
  if (payload.length === 0) {
    // fast-path empty
    return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';
  }

  // compute hash of entity
  // Do this without using crypto.subtle, as the crypto
  // polyfill doesn't support it.
  const hash = crypto.createHash('sha1').update(payload, 'utf8').digest('base64').substring(0, 27);

  // compute length of entity
  const len = Buffer.byteLength(payload);

  return `"${len.toString(16)}-${hash}"`;
}
