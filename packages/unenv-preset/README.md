# Azion Unenv Preset

A preset configuration for unenv that provides polyfills and environment compatibility for Azion Edge Runtime.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
  - [Node.js Polyfills](#nodejs-polyfills)
  - [File System Polyfills](#file-system-polyfills)
- [API Reference](#api-reference)
  - [getFileContent](#getfilecontent)
  - [closeSync](#closesync)
  - [openSync](#opensync)
  - [statSync](#statsync)
  - [readFileSync](#readfilesync)
  - [readdirSync](#readdirsync)
- [Contributing](#contributing)

## Installation

Install the package using npm or yarn:

```bash
npm install azion
```

or

```bash
yarn add azion
```

## Usage

The preset can be used with unenv to provide compatibility between Node.js and Azion Edge Runtime environments:

```javascript:packages/unenv-preset/README.md
import { preset } from 'azion/unenv-preset'
// Use with unenv
export default {
  preset: preset
}
```

## Features

### Node.js Polyfills

This preset provides polyfills for common Node.js APIs to ensure compatibility when running code in the Azion Edge Runtime environment. The following modules are polyfilled:

- `crypto` - Complete cryptographic functionality including hashing, encryption, and UUID generation
- `events` - Event handling through events/events.js
- `http` - HTTP client functionality via stream-http
- `module` - Basic module system compatibility (limited functionality)
- `stream` - Stream implementations via stream-browserify
- `string_decoder` - String decoding utilities
- `url` - URL parsing and formatting
- `util` - Utility functions
- `timers` - Timer functions via timers-browserify
- `vm` - Virtual Machine functionality via vm-browserify
- `zlib` - Compression functionality via browserify-zlib

Example using crypto polyfill:

```javascript
import { createHash, randomUUID } from 'azion/unenv-preset/polyfills/node/crypto'

// Create a hash
const hash = createHash('sha256')
hash.update('some data')
console.log(hash.digest('hex'))

// Generate a UUID
const uuid = randomUUID()
```

### File System Polyfills

The preset includes comprehensive file system polyfills that mirror Node.js's `fs` module functionality. These polyfills work with an in-memory file system when running in the Edge Runtime.

#### Basic File Operations

```javascript:packages/unenv-preset/README.md
import { readFileSync, writeFileSync } from 'azion/unenv-preset/polyfills/node/fs'

// Read a file
const content = readFileSync('/path/to/file.txt', 'utf8')

// Write to a file
writeFileSync('/path/to/new-file.txt', 'Hello World', 'utf8')

#### Directory Operations

```javascript
import { readdirSync, mkdirSync } from 'azion/unenv-preset/polyfills/node/fs'

// List directory contents
const files = readdirSync('/path/to/dir')

// Create a directory
mkdirSync('/path/to/new-dir')
```

#### File Stats and Information

```javascript
import { statSync, existsSync } from 'azion/unenv-preset/polyfills/node/fs'

// Check if file exists
if (existsSync('/path/to/file.txt')) {
  
  // Get file stats
  const stats = statSync('/path/to/file.txt')
  console.log(`File size: ${stats.size}`)
  console.log(`Is directory: ${stats.isDirectory()}`)
  console.log(`Is file: ${stats.isFile()}`)
}
```

#### File Descriptors

```javascript
import { openSync, closeSync, readSync } from 'azion/unenv-preset/polyfills/node/fs'

// Open file and get file descriptor
const fd = openSync('/path/to/file.txt', 'r')

// Read from file descriptor
const buffer = Buffer.alloc(1024)
readSync(fd, buffer, 0, 1024, 0)

// Close file descriptor
closeSync(fd)
```

### Global Polyfills

The preset also provides polyfills for Node.js global variables and objects:

- `__dirname` - Current directory name
- `__filename` - Current file name
- `process` - Process information and environment (including env variables)
- `performance` - Performance timing functionality
- `navigator` - Browser-compatible navigator object

The preset also handles injection of these globals through the unenv configuration:

```javascript
import { preset } from 'azion/unenv-preset'

// Preset configuration automatically injects globals
export default {
  inject: {
    __dirname: preset.inject.__dirname,
    __filename: preset.inject.__filename,
    process: preset.inject.process,
    performance: preset.inject.performance,
    navigator: preset.inject.navigator
  }
}
```

## API Reference

### getFileContent

Decodes file content and returns it as either a Buffer or string.

**Parameters:**

- `file` - The file object containing content in base64 format
- `returnBuffer` - (Optional) Boolean to determine return type (default: true)
  - `true` returns Buffer
  - `false` returns string

**Returns:**

- `Buffer | string` - The decoded file content

**Example:**

```javascript
const fileBuffer = getFileContent(file) // returns Buffer
const fileString = getFileContent(file, false) // returns string
```

### closeSync

Synchronously closes the file descriptor.

**Parameters:**

- `fd` - The file descriptor to close.

**Example:**

```javascript
closeSync(fd)
```

### openSync

Synchronously opens a file.

**Parameters:**

- `path` - The path to the file.
- `flags` - The opening mode (e.g., 'r', 'w').
- `mode` - (Optional) The file mode.

**Returns:**

- `number` - The file descriptor.

**Example:**

```javascript
const fd = openSync('/path/to/file.txt', 'r')
```

### statSync

Synchronously retrieves the `fs.Stats` for the specified path.

**Parameters:**

- `path` - The path to the file or directory.
- `options` - (Optional) Options for the stat call.

**Returns:**

- `fs.Stats` - The stats object for the file or directory.

**Example:**

```javascript
const stats = statSync('/path/to/file.txt')
```

### readFileSync

Synchronously reads the entire contents of a file.

**Parameters:**

- `path` - The path to the file.
- `options` - (Optional) Options for reading the file.

**Returns:**

- `string | Buffer` - The contents of the file.

**Example:**

```javascript
const content = readFileSync('/path/to/file.txt', 'utf8')
```

### readdirSync

Synchronously reads the contents of a directory.

**Parameters:**

- `path` - The path to the directory.
- `options` - (Optional) Options for reading the directory.

**Returns:**

- `string[]` - An array of file names in the directory.

**Example:**

```javascript
const files = readdirSync('/path/to/dir')
```

## Contributing

Contributions are welcome! Please read our contributing guidelines for details on our code of conduct and the process for submitting pull requests.
