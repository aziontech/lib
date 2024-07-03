# Azion Cookies

The `cookies package` provides functionality for working with HTTP cookies.

This package allows you to easily manage cookies in your Javascript/Typescript applications. It provides classes and functions for retrive, creating, and manipulating cookies.

### Get Cookies

#### Usage

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
