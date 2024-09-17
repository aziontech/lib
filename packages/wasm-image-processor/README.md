# Azion WASM Image Processor Library

The Azion WASM Image Processor Library provides functions to process images using WebAssembly. This library allows you to load, resize, and retrieve images in various formats efficiently.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Load Image](#load-image)
  - [Resize Image](#resize-image)
  - [Get Image Response](#get-image-response)
  - [Clean](#clean)
  - [Using Separate Methods](#using-separate-methods)
- [API Reference](#api-reference)
  - [loadImage](#loadimage)
  - [resize](#resize)
  - [getImageResponse](#getimageresponse)
  - [clean](#clean)
- [Types](#types)
  - [WasmImage](#wasmimage)
  - [SupportedImageFormat](#supportedimageformat)
- [Contributing](#contributing)

## Installation

Install the package using npm or yarn:

```sh
npm install azion-wasm-image-processor
```

or

```sh
yarn add azion-wasm-image-processor
```

## Usage

### Load Image

**JavaScript:**

```javascript
import { loadImage } from 'azion/wasm-image-processor';

const image = await loadImage('https://example.com/image.jpg');
```

**TypeScript:**

```typescript
import { loadImage } from 'azion/wasm-image-processor';
import type { WasmImage } from 'azion/wasm-image-processor';

const image: WasmImage = await loadImage('https://example.com/image.jpg');
```

### Resize Image

**JavaScript:**

```javascript
import { loadImage } from 'azion/wasm-image-processor';

const image = await loadImage('https://example.com/image.jpg');
const resizedImage = image.resize(0.5, 0.5);
```

**TypeScript:**

```typescript
import { loadImage } from 'azion/wasm-image-processor';
import type { WasmImage } from 'azion/wasm-image-processor';

const image: WasmImage = await loadImage('https://example.com/image.jpg');
const resizedImage: WasmImage = image.resize(0.5, 0.5);
```

### Get Image Response

**JavaScript:**

```javascript
import { loadImage } from 'azion/wasm-image-processor';

const image = await loadImage('https://example.com/image.jpg');
const imageResponse = image.getImageResponse('jpeg');
console.log(imageResponse);
```

**TypeScript:**

```typescript
import { loadImage } from 'azion/wasm-image-processor';
import type { WasmImage, SupportedImageFormat } from 'azion/wasm-image-processor';

const image: WasmImage = await loadImage('https://example.com/image.jpg');
const imageResponse: Response = image.getImageResponse('jpeg' as SupportedImageFormat);
console.log(imageResponse);
```

### Clean

**JavaScript:**

```javascript
import { loadImage } from 'azion/wasm-image-processor';

const image = await loadImage('https://example.com/image.jpg');
image.clean();
```

**TypeScript:**

```typescript
import { loadImage } from 'azion/wasm-image-processor';
import type { WasmImage, SupportedImageFormat } from 'azion/wasm-image-processor';

const image: WasmImage = await loadImage('https://example.com/image.jpg');
image.clean();
```

### Using Separate Methods

**JavaScript:**

```javascript
import { loadImage, resize, getImageResponse, clean } from 'azion/wasm-image-processor';

const image = await loadImage('https://example.com/image.jpg');
const resizedImage = resize(image.image, 0.5, 0.5);
const imageResponse = getImageResponse(resizedImage, 'jpeg');
console.log(imageResponse);
clean(resizedImage);
```

**TypeScript:**

```typescript
import { loadImage, resize, getImageResponse, clean } from 'azion/wasm-image-processor';
import type { WasmImage, PhotonImage } from 'azion/wasm-image-processor';

const image: WasmImage = await loadImage('https://example.com/image.jpg');
const resizedImage: PhotonImage = resize(image.image, 0.5, 0.5);
const imageResponse: Response = getImageResponse(resizedImage, 'jpeg');
console.log(imageResponse);
clean(resizedImage);
```

## API Reference

### loadImage

Loads an image from a URL or file path.

**Parameters:**

- `pathOrURL: string` - The URL or file path of the image to load.

**Returns:**

- `Promise<WasmImage>` - A promise that resolves with a `WasmImage` instance.

### resize

Resizes the loaded image.

**Parameters:**

- `width: number` - The new width of the image.
- `height: number` - The new height of the image.
- `usePercent?: boolean` - Whether to use percentages for resizing. Defaults to `true`.

**Returns:**

- `WasmImage` - A new `WasmImage` instance with the resized image.

### getImageResponse

Retrieves the processed image in the specified format.

**Parameters:**

- `format: SupportedImageFormat` - The format of the image (`'jpeg'`, `'png'`, `'webp'`).
- `quality?: number` - The quality of the image (for `'jpeg'`). Defaults to `100.0`.

**Returns:**

- `Response` - The response object containing the processed image.

### clean

Cleans up the image data to free memory.

**Returns:**

- `void`

## Types

### WasmImage

An interface representing a wrapped PhotonImage with additional methods for image processing.

**Properties:**

- `image: PhotonImage` - The PhotonImage instance.

**Methods:**

- `width(): number` - Gets the width of the image.
- `height(): number` - Gets the height of the image.
- `resize(width: number, height: number, usePercent?: boolean): WasmImage` - Resizes the image.
- `getImageResponse(format: SupportedImageFormat, quality?: number): Response` - Gets the processed image as a response.
- `clean(): void` - Cleans up the image data.

### SupportedImageFormat

A type representing supported image formats.

- `'webp'`
- `'jpeg'`
- `'png'`

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
