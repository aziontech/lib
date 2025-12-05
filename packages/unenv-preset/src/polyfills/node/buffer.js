import * as base64 from 'base64-js';
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

// Store original methods
const originalToString = originalBuffer.Buffer.prototype.toString;
const originalWrite = originalBuffer.Buffer.prototype.write;
const originalIsEncoding = originalBuffer.Buffer.prototype.isEncoding;

// Helper functions for base64url conversion
const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
const BASE64_CHAR_62 = '+';
const BASE64_CHAR_63 = '/';
const BASE64URL_CHAR_62 = '-';
const BASE64URL_CHAR_63 = '_';

function base64urlFromBase64(str) {
  return str.replaceAll(BASE64_CHAR_62, BASE64URL_CHAR_62).replaceAll(BASE64_CHAR_63, BASE64URL_CHAR_63);
}

function base64urlToBase64(str) {
  return str.replaceAll(BASE64URL_CHAR_62, BASE64_CHAR_62).replaceAll(BASE64URL_CHAR_63, BASE64_CHAR_63);
}

// Override toString to support base64url encoding
originalBuffer.Buffer.prototype.toString = function toString(encoding, start, end) {
  if (encoding === 'base64url') {
    return base64Slice(this, start, end, encoding);
  }
  if (encoding === 'base64') {
    return base64Slice(this, start, end, encoding);
  }
  return originalToString.call(this, encoding, start, end);
};

function blitBuffer(src, dst, offset, length) {
  let i;
  for (i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length) break;
    dst[i + offset] = src[i];
  }
  return i;
}

function base64clean(str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0];
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '');
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return '';
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str;
}

function base64ToBytes(str) {
  return base64.toByteArray(base64clean(str));
}

function base64Write(buf, string, offset, length, encoding) {
  const b64 = encoding === 'base64url' ? base64urlToBase64(string) : string;
  return blitBuffer(base64ToBytes(b64), buf, offset, length);
}

function base64Slice(buf, start, end, encoding) {
  let b64;
  if (start === 0 && end === buf.length) {
    b64 = base64.fromByteArray(buf);
  } else {
    b64 = base64.fromByteArray(buf.slice(start, end));
  }
  return encoding === 'base64url' ? base64urlFromBase64(b64) : b64;
}

originalBuffer.Buffer.prototype.write = function write(string, offset, length, encoding) {
  if (encoding === 'base64') {
    return base64Write(this, string, offset, length, encoding);
  }
  return originalWrite.call(this, string, offset, length, encoding);
};

originalBuffer.Buffer.prototype.isEncoding = function isEncoding(encoding) {
  if (String(encoding).toLowerCase() === 'base64url') {
    return true;
  }
  return originalIsEncoding.call(this, encoding);
};

export * from 'unenv/node/buffer';

export const Buffer = originalBuffer.Buffer;

export default {
  ...originalBuffer.default,
  Buffer,
};
