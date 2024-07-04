# Azion Cookies

The `cookies package` provides functionality for working with HTTP cookies.

This package allows you to easily manage cookies in your Javascript/Typescript applications. It provides classes and functions for retrive, creating, and manipulating cookies.

### Get Cookies

`Function Parameters`

```js
getCookie(Request, <Cookie Name>, <prefix>);
```

Parameters:

- `Request`: The Request interface of the Fetch API represents a resource request. [https://developer.mozilla.org/en-US/docs/Web/API/Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
- `cookieName`: string
- `prefix`: host | secure

#### Example

> worker.js

```js
import { getCookie } from 'azion/cookies';

async function main(event) {
  const request = event.request;
  const cookie = getCookie(request, 'auth_cookie', 'secure');
  if (cookie) {
    return new Response(`Cookie value: ${cookie}`);
  }
  return new Response('No cookie found', { status: 404 });
}

addEventListener('fetch', (event) => {
  event.respondWith(main(event));
});
```

### SetCookie

`Function Parameters`

```js
setCookie(Response, <Cookie Name>, <Cookie Value>, Options);
```

Parameters:

- `Response`: The Response interface of the Fetch API represents the response to a request. [https://developer.mozilla.org/en-US/docs/Web/API/Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
- `Cookie Name`: string
- `Cookie Value`: string
- `Options`
  - domain: string
  - expires: Date
  - httpOnly: boolean
  - maxAge: number
  - path: string
  - secure: boolean
  - sameSite: 'Strict' | 'Lax' | 'None'
  - prefix: secure | 'host'
  - partitioned: boolean

#### Example

> worker.js

```js
import { setCookie } from 'azion/cookies';

export default async function main(event) {
  const response = new Response('Hello, SetCookie', { status: 200 });
  const cookieKey = 'auth';
  try {
    setCookie(response, cookieKey, '123', { maxAge: 120 });
  } catch (e) {
    console.error(e);
  }
  return response;
}

addEventListener('fetch', (event) => {
  event.respondWith(main(event));
});
```
