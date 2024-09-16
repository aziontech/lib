# Azion Cookies Library

The Azion Cookies Library provides utility functions to get and set cookies in an HTTP request and response. This library is useful for handling cookies in web applications, ensuring ease of use and consistency.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Get Cookie](#get-cookie)
  - [Set Cookie](#set-cookie)
- [API Reference](#api-reference)
  - [`getCookie`](#getcookie)
  - [`setCookie`](#setcookie)
- [Types](#types)
  - [`CookiePrefix`](#cookieprefix)
  - [`CookieOptions`](#cookieoptions)
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

### Get Cookie

**JavaScript:**

```javascript
import { getCookie } from 'azion/cookies';

const myCookie = getCookie(request, 'my-cookie');
console.log(myCookie); // Outputs the value of 'my-cookie'
```

**TypeScript:**

```typescript
import { getCookie } from 'azion/cookies';

const myCookie: string | undefined = getCookie(request, 'my-cookie');
const secureCookie: string | undefined = getCookie(request, 'my-cookie', 'secure');
console.log(myCookie); // Outputs the value of 'my-cookie'
console.log(secureCookie); // Outputs the value of '__Secure-my-cookie'
```

### Set Cookie

**JavaScript:**

```javascript
import { setCookie } from 'azion/cookies';

const res = setCookie(response, 'my-cookie', 'cookie-value', { maxAge: 3600 });
```

**TypeScript:**

```typescript
import { setCookie } from 'azion/cookies';
import type { CookieOptions } from 'azion/cookies';

const options: CookieOptions = { maxAge: 3600 };
const res = setCookie(response, 'my-cookie', 'cookie-value', options);
```

## API Reference

### `getCookie`

Retrieves the value of a cookie from the HTTP request.

**Parameters:**

- `req: Request` - The HTTP request object.
- `key?: string` - The name of the cookie to retrieve. If not provided, returns all cookies as an object.
- `prefixOptions?: CookiePrefix` - The prefix for the cookie (`'host'` or `'secure'`).

**Returns:**

- `string | undefined | Record<string, string>` - The cookie value, or an object of all cookies if no key is provided.

### `setCookie`

Sets a cookie in the HTTP response.

**Parameters:**

- `res: Response` - The HTTP response object.
- `name: string` - The name of the cookie.
- `value: string` - The value of the cookie.
- `options?: CookieOptions` - Additional options for setting the cookie.

## Types

### `CookiePrefix`

Specifies the prefix for the cookie.

- `'host'`
- `'secure'`

### `CookieOptions`

Options for setting a cookie.

- `maxAge?: number`
- `expires?: Date`
- `path?: string`
- `domain?: string`
- `secure?: boolean`
- `httpOnly?: boolean`
- `sameSite?: 'Strict' | 'Lax' | 'None'`

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
