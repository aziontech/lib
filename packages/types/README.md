# Azion Types

The Types package provides global TypeScript types that are used across Azion platform, ensuring consistency and reducing redundancy throughout the codebase.

⚠️ These types are specifically tailored for Azion Runtime environments.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Defining Metadata](#defining-metadata)
  - [Working with FetchEvent](#working-with-fetchevent)
  - [Handling FirewallEvent](#handling-firewallevent)
- [API Reference](#api-reference)
  - [`Metadata`](#metadata)
  - [`FetchEvent`](#fetchevent)
  - [`FirewallEvent`](#firewallevent)
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

### Defining Metadata

The `Metadata` interface provides a structured way to represent request metadata, including GeoIP information, remote address details, and server/TLS data.

**TypeScript Example:**

```typescript
import { Metadata } from 'azion/types';

const requestMetadata: Metadata = {
  geoip_asn: '12345',
  geoip_city: 'Sao Paulo',
  geoip_city_continent_code: 'SA',
  geoip_city_country_code: 'BR',
  geoip_city_country_name: 'Brazil',
  geoip_continent_code: 'SA',
  geoip_country_code: 'BR',
  geoip_country_name: 'Brazil',
  geoip_region: 'SP',
  geoip_region_name: 'Sao Paulo',
  remote_addr: '192.0.2.1',
  remote_port: '443',
  remote_user: 'user',
  server_protocol: 'HTTP/1.1',
  ssl_cipher: 'ECDHE-RSA-AES128-GCM-SHA256',
  ssl_protocol: 'TLSv1.2',
};
```

### Working with FetchEvent

The `FetchEvent` interface extends the standard `Event` interface to include request and metadata properties, providing a complete context for handling fetch operations in the Azion environment.

**TypeScript Example:**

```typescript
import { FetchEvent, Metadata } from 'azion/types';

addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const metadata: Metadata = request.metadata;

  console.log('Request URL:', request.url);
  console.log('Client IP:', metadata.remote_addr);
  console.log('GeoIP City:', metadata.geoip_city);

  event.respondWith(fetch(request));
});
```

### Handling FirewallEvent

The `FirewallEvent` interface provides additional methods specific to firewall events, allowing for actions like denying requests, dropping connections, or adding headers to requests and responses.

**TypeScript Example:**

```typescript
import { FirewallEvent } from 'azion/types';

addEventListener('firewall', (event: FirewallEvent) => {
  const { request } = event;

  console.log('Request URL:', request.url);
  console.log('GeoIP Country:', request.metadata.geoip_country_name);

  if (request.metadata.geoip_country_code === 'CN') {
    event.deny();
  } else {
    event.continue();
  }
});
```

## API Reference

### `Metadata`

The `Metadata` interface represents metadata information for requests, including GeoIP data, remote address, server protocol, and TLS information.

### `FetchEvent`

The `FetchEvent` interface extends the standard `Event` interface and includes the request object and methods to handle fetch events within the Azion Runtime.

### `FirewallEvent`

The `FirewallEvent` interface extends the standard `Event` interface and includes methods to manage firewall events, such as denying or continuing requests and manipulating headers.

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
