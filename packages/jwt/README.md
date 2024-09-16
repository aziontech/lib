# Azion JWT Library

The Azion JWT Library provides utility functions for signing, verifying, and decoding JSON Web Tokens (JWTs). This library ensures ease of use and security when handling JWTs in web applications.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Sign JWT](#sign-jwt)
  - [Verify JWT](#verify-jwt)
  - [Decode JWT](#decode-jwt)
- [API Reference](#api-reference)
  - [`sign`](#sign)
  - [`verify`](#verify)
  - [`decode`](#decode)
- [Types](#types)
  - [`JWTPayload`](#jwtpayload)
  - [`TokenHeader`](#tokenheader)
- [Errors](#errors)
  - [`JwtAlgorithmNotImplemented`](#jwtalgorithmnotimplemented)
  - [`JwtTokenInvalid`](#jwttokeninvalid)
  - [`JwtTokenNotBefore`](#jwttokennotbefore)
  - [`JwtTokenExpired`](#jwttokenexpired)
  - [`JwtTokenIssuedAt`](#jwttokenissuedat)
  - [`JwtHeaderInvalid`](#jwtheaderinvalid)
  - [`JwtTokenSignatureMismatched`](#jwttokensignaturemismatched)
- [Contributing](#contributing)

## Installation

Install the package using npm or yarn:

```sh
npm install azion
```

or

```sh
yarn add azion
```

## Usage

### Sign JWT

**JavaScript:**

```javascript
import { sign } from 'azion/jwt';

const privateKey = 'your-private-key';
const payload = { userId: 123, exp: Math.floor(Date.now() / 1000) + 3600 }; // 1 hour expiration
sign(payload, privateKey).then((token) => console.log(token)); // Outputs the signed JWT
```

**TypeScript:**

```typescript
import { sign } from 'azion/jwt';
import type { JWTPayload } from 'azion/jwt';

const privateKey: string = 'your-private-key';
const payload: JWTPayload = { userId: 123, exp: Math.floor(Date.now() / 1000) + 3600 }; // 1 hour expiration
sign(payload, privateKey).then((token: string) => console.log(token)); // Outputs the signed JWT
```

### Verify JWT

**JavaScript:**

```javascript
import { verify } from 'azion/jwt';

const publicKey = 'your-public-key';
const token = 'your-jwt-token';
verify(token, publicKey)
  .then((payload) => console.log(payload))
  .catch((err) => console.error(err)); // Outputs the payload if verification is successful
```

**TypeScript:**

```typescript
import { verify } from 'azion/jwt';
import type { JWTPayload } from 'azion/jwt';

const publicKey: string = 'your-public-key';
const token: string = 'your-jwt-token';
verify(token, publicKey)
  .then((payload: JWTPayload) => console.log(payload))
  .catch((err) => console.error(err)); // Outputs the payload if verification is successful
```

### Decode JWT

**JavaScript:**

```javascript
import { decode } from 'azion/jwt';

const token = 'your-jwt-token';
const { header, payload } = decode(token);
console.log(header, payload); // Outputs the decoded header and payload
```

**TypeScript:**

```typescript
import { decode } from 'azion/jwt';
import type { JWTPayload, TokenHeader } from 'azion/jwt';

const token: string = 'your-jwt-token';
const { header, payload }: { header: TokenHeader; payload: JWTPayload } = decode(token);
console.log(header, payload); // Outputs the decoded header and payload
```

## API Reference

### `sign`

Signs a JWT payload with the specified algorithm and private key.

**Parameters:**

- `payload: JWTPayload` - The payload to be signed.
- `privateKey: SignatureKey` - The private key used for signing.
- `alg?: SignatureAlgorithm` - The algorithm to use for signing (default is `'HS256'`).

**Returns:**

- `Promise<string>` - The signed JWT.

### `verify`

Verifies a JWT using the specified public key and algorithm.

**Parameters:**

- `token: string` - The JWT to verify.
- `publicKey: SignatureKey` - The public key used for verification.
- `alg?: SignatureAlgorithm` - The algorithm to use for verification (default is `'HS256'`).

**Returns:**

- `Promise<JWTPayload>` - The decoded payload if the token is valid.

### `decode`

Decodes a JWT without verifying its signature.

**Parameters:**

- `token: string` - The JWT to decode.

**Returns:**

- `{ header: TokenHeader; payload: JWTPayload }` - The decoded header and payload.

## Types

### `JWTPayload`

Defines the structure of the JWT payload.

```typescript
type JWTPayload = {
  [key: string]: unknown;
  exp?: number;
  nbf?: number;
  iat?: number;
};
```

### `TokenHeader`

Defines the structure of the JWT header.

```typescript
interface TokenHeader {
  alg: SignatureAlgorithm;
  typ?: 'JWT';
}
```

## Errors

### `JwtAlgorithmNotImplemented`

Thrown when an algorithm is not implemented.

### `JwtTokenInvalid`

Thrown when a JWT is invalid.

### `JwtTokenNotBefore`

Thrown when a JWT is used before its `nbf` claim.

### `JwtTokenExpired`

Thrown when a JWT has expired.

### `JwtTokenIssuedAt`

Thrown when a JWT `iat` claim is in the future.

### `JwtHeaderInvalid`

Thrown when a JWT header is invalid.

### `JwtTokenSignatureMismatched`

Thrown when a JWT signature does not match.

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
