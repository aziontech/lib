# Azion Utils

The Azion Utils package provides a set of utility functions designed to simplify common tasks when working with Azion edge functions. These utilities cover tasks such as routing for Single Page Applications (SPA) and Multi-Page Applications (MPA), as well as parsing and debugging incoming requests.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [mountSPA](#mountspa)
  - [mountMPA](#mountmpa)
  - [parseRequest](#parserequest)
- [API Reference](#api-reference)
  - [`mountSPA`](#mountspa)
  - [`mountMPA`](#mountmpa)
  - [`parseRequest`](#parserequest)
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

### mountSPA

The `mountSPA` function is designed to process requests to a Single Page Application (SPA) that's being computed at the edge of a Content Delivery Network (CDN). It determines whether the incoming request is for a static asset or an application route and then mounts the appropriate request URL for fetching the required resource.

**JavaScript Example:**

```javascript
import { mountSPA } from 'azion/utils/edge';

const myApp = await mountSPA('https://example.com/');
console.log(myApp);
// Fetches: file:///index.html
// Response object representing the content of index.html
```

**TypeScript Example:**

```typescript
import { mountSPA } from 'azion/utils/edge';

const myApp: Response = await mountSPA('https://example.com/');
console.log(myApp);
// Fetches: file:///index.html
// Response object representing the content of index.html
```

### mountMPA

The `mountMPA` function handles requests for Multi-Page Applications (MPA) at the edge. It processes the incoming request URL, constructs the appropriate asset path, and fetches the corresponding response from the origin server or edge cache.

**JavaScript Example:**

```javascript
import { mountMPA } from 'azion/utils/edge';

const myApp = await mountMPA('https://example.com/about');
console.log(myApp);
// Fetches: file:///about/index.html
// Response object representing the content of about/index.html
```

**TypeScript Example:**

```typescript
import { mountMPA } from 'azion/utils/edge';

const myApp: Response = await mountMPA('https://example.com/about');
console.log(myApp);
// Fetches: file:///about/index.html
// Response object representing the content of about/index.html
```

### parseRequest

The `parseRequest` function is designed to parse and log the details of an incoming request. It extracts key information such as headers, cookies, body, and client data from the incoming FetchEvent, providing a structured object with all these details for further processing or logging.

**JavaScript Example:**

```javascript
import { parseRequest } from 'azion/utils';

const parsedRequest = await parseRequest(event);
console.log(parsedRequest);
// Example ParsedRequest object:
// {
//   timestamp: '2024-08-14T12:34:56.789Z',
//   metadata: {
//     geoip_asn: '12345',
//     geoip_city: 'Sao Paulo',
//     geoip_city_continent_code: 'SA',
//     geoip_city_country_code: 'BR',
//     geoip_city_country_name: 'Brazil',
//     geoip_continent_code: 'SA',
//     geoip_country_code: 'BR',
//     geoip_country_name: 'Brazil',
//     geoip_region: 'SP',
//     geoip_region_name: 'Sao Paulo',
//     remote_addr: '192.0.2.1',
//     remote_port: '443',
//     remote_user: 'user',
//     server_protocol: 'HTTP/1.1',
//     ssl_cipher: 'ECDHE-RSA-AES128-GCM-SHA256',
//     ssl_protocol: 'TLSv1.2',
//   },
//   method: 'GET',
//   url: {
//     full: 'https://example.com/',
//     protocol: 'https:',
//     hostname: 'example.com',
//     path: '/',
//     query: {},
//   },
//   headers: {
//     'user-agent': 'Mozilla/5.0 ...',
//     'accept-language': 'en-US,en;q=0.9',
//   },
//   cookies: {
//     'session_id': 'abc123',
//   },
//   body: null,
//   client: {
//     ip: '192.0.2.1',
//     userAgent: 'Mozilla/5.0 ...',
//   },
//   referer: 'Unknown',
//   origin: 'Unknown',
//   cacheControl: 'no-cache',
//   pragma: 'no-cache',
//   contentType: 'text/html',
//   contentLength: '1234',
//   acceptLanguage: 'en-US,en;q=0.9',
//   acceptEncoding: 'gzip, deflate, br',
//   priority: 'High',
//   host: 'example.com',
//   authorization: 'Not Present',
// }
```

**TypeScript Example:**

```typescript
import { parseRequest } from 'azion/utils';
import type { ParsedRequest } from 'azion/utils';

const parsedRequest: ParsedRequest = await parseRequest(event);
console.log(parsedRequest);
// Example ParsedRequest object:
// {
//   timestamp: '2024-08-14T12:34:56.789Z',
//   metadata: {
//     geoip_asn: '12345',
//     geoip_city: 'Sao Paulo',
//     geoip_city_continent_code: 'SA',
//     geoip_city_country_code: 'BR',
//     geoip_city_country_name: 'Brazil',
//     geoip_continent_code: 'SA',
//     geoip_country_code: 'BR',
//     geoip_country_name: 'Brazil',
//     geoip_region: 'SP',
//     geoip_region_name: 'Sao Paulo',
//     remote_addr: '192.0.2.1',
//     remote_port: '443',
//     remote_user: 'user',
//     server_protocol: 'HTTP/1.1',
//     ssl_cipher: 'ECDHE-RSA-AES128-GCM-SHA256',
//     ssl_protocol: 'TLSv1.2',
//   },
//   method: 'GET',
//   url: {
//     full: 'https://example.com/',
//     protocol: 'https:',
//     hostname: 'example.com',
//     path: '/',
//     query: {},
//   },
//   headers: {
//     'user-agent': 'Mozilla/5.0 ...',
//     'accept-language': 'en-US,en;q=0.9',
//   },
//   cookies: {
//     'session_id': 'abc123',
//   },
//   body: null,
//   client: {
//     ip: '192.0.2.1',
//     userAgent: 'Mozilla/5.0 ...',
//   },
//   referer: 'Unknown',
//   origin: 'Unknown',
//   cacheControl: 'no-cache',
//   pragma: 'no-cache',
//   contentType: 'text/html',
//   contentLength: '1234',
//   acceptLanguage: 'en-US,en;q=0.9',
//   acceptEncoding: 'gzip, deflate, br',
//   priority: 'High',
//   host: 'example.com',
//   authorization: 'Not Present',
// }
```

## API Reference

### `mountSPA`

Processes requests for Single Page Applications, determining the correct path and fetching the required resource.

### `mountMPA`

Handles routing for Multi-Page Applications, constructing the asset path and fetching the corresponding response.

### `parseRequest`

Parses and logs the details of an incoming request, including headers, cookies, and client information.

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
