# Azion Builder

A builder utility for Azion's platform, designed to streamline the development process and enhance productivity by providing build configurations and polyfills for Edge Runtime environments.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
  - [Bundlers](#bundlers)
  - [Polyfills](#polyfills)
- [API Reference](#api-reference)
- [Contributing](#contributing)

## Installation

Install the package using npm or yarn:

```bash
npm install @aziontech/builder
```

or

```bash
yarn add @aziontech/builder
```

## Usage

The builder provides utilities to create build configurations for esbuild and webpack, optimized for Azion Edge Runtime.

### Using with esbuild

```javascript
import { createAzionESBuildConfig, executeESBuildBuild } from '@aziontech/builder';

// Create configuration
const config = createAzionESBuildConfig({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/bundle.js',
});

// Execute build
await executeESBuildBuild(config);
```

### Using with webpack

```javascript
import { createAzionWebpackConfig, executeWebpackBuild } from '@aziontech/builder';

// Create configuration
const config = createAzionWebpackConfig({
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
});

// Execute build
await executeWebpackBuild(config);
```

## Features

### Bundlers

The builder supports two bundlers:

- **esbuild** - Fast JavaScript bundler with optimized configuration for Edge Runtime
- **webpack** - Powerful module bundler with extensive plugin ecosystem

Both bundlers come pre-configured with:

- Node.js polyfills for Edge Runtime compatibility
- Azion-specific polyfills for platform features
- Custom Babel loader support
- Production and development optimizations

### Polyfills

The package includes polyfills for various Node.js modules and Azion-specific features:

- `async-hooks` - Async hooks functionality
- `crypto` - Cryptographic functions
- `fs` - File system operations
- `stream` - Stream handling
- `promises` - Promise utilities
- Azion-specific polyfills:
  - `env-vars` - Environment variables
  - `fetch` - Fetch API
  - `fetch-event` - Fetch event handling
  - `firewall-event` - Firewall event handling
  - `kv` - Key-value storage
  - `network-list` - Network list operations
  - `storage` - Storage API

#### Using Polyfills

```javascript
// Import polyfills directly
import '@aziontech/builder/polyfills';
```

## API Reference

### createAzionESBuildConfig

Creates an esbuild configuration optimized for Azion Edge Runtime.

**Parameters:**

- `options` - esbuild build options

**Returns:**

- `ESBuildConfiguration` - The configured esbuild options

### executeESBuildBuild

Executes the esbuild build process.

**Parameters:**

- `config` - The esbuild configuration

**Returns:**

- `Promise<void>`

### createAzionWebpackConfig

Creates a webpack configuration optimized for Azion Edge Runtime.

**Parameters:**

- `options` - webpack configuration options

**Returns:**

- `WebpackConfiguration` - The configured webpack options

### executeWebpackBuild

Executes the webpack build process.

**Parameters:**

- `config` - The webpack configuration

**Returns:**

- `Promise<void>`

## Contributing

Contributions are welcome! Please read our contributing guidelines for details on our code of conduct and the process for submitting pull requests.

## License

MIT
