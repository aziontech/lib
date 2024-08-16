import { SUPPORTED_FORMATS_IN_RESPONSE } from './constants';
import * as photon from './photon/lib/index';
import { SupportedImageFormat, WasmImage } from './types';
import { isUrl, validateImageExtension } from './utils';

/**
 * Resizes the given image.
 */
function resize(image: photon.PhotonImage, width: number, height: number, usePercent = true): photon.PhotonImage {
  const imageWidth = image.get_width();
  const imageHeight = image.get_height();

  const widthPercent = usePercent ? width : (width * 100.0) / imageWidth;
  const heightPercent = usePercent ? height : (height * 100.0) / imageHeight;

  return photon.resize(image, (imageWidth * widthPercent) / 100, (imageHeight * heightPercent) / 100, 1);
}

/**
 * Gets the image as a Response object in the specified format.
 */
function getImageResponse(image: photon.PhotonImage, format: SupportedImageFormat, quality = 100.0): Response {
  if (!SUPPORTED_FORMATS_IN_RESPONSE.includes(format)) {
    throw new Error(`Invalid image format in Response. Supported: ${SUPPORTED_FORMATS_IN_RESPONSE.join(',')}`);
  }

  let finalImage: Uint8Array;
  let contentType: string;

  switch (format) {
    case 'webp':
      finalImage = image.get_bytes_webp();
      contentType = 'image/webp';
      break;
    case 'jpeg':
      finalImage = image.get_bytes_jpeg(quality);
      contentType = 'image/jpeg';
      break;
    case 'png':
      finalImage = image.get_bytes();
      contentType = 'image/png';
      break;
  }

  return new Response(finalImage, { headers: { 'Content-Type': contentType } });
}

/**
 * Cleans up resources associated with the image.
 * @param {photon.PhotonImage} image - The image to clean up.
 */
function clean(image: photon.PhotonImage): void {
  image.free();
}

/**
 * Loads an image from a given path or URL and returns a WasmImage object.
 *
 * @param {string} pathOrURL - The path or URL of the image to load.
 * @returns {Promise<WasmImage>} A promise that resolves to a WasmImage object.
 *
 * @throws {Error} If the image extension is invalid or if there's an error fetching the image.
 *
 * @example
 * // Load an image from a URL
 * const imageProcessor = await loadImage('https://example.com/image.jpg');
 *
 * // Get the image dimensions
 * const width = imageProcessor.width();
 * const height = imageProcessor.height();
 *
 * // Resize the image
 * const resizedImage = imageProcessor.resize(800, 600, false);
 *
 * // Get the image as a webp response
 * const webpResponse = resizedImage.getImageResponse('webp');
 *
 * // Clean up resources
 * imageProcessor.clean();
 */
async function loadImage(pathOrURL: string): Promise<WasmImage> {
  validateImageExtension(pathOrURL);

  let imageUrl: URL;
  if (isUrl(pathOrURL)) {
    imageUrl = new URL(pathOrURL);
  } else {
    imageUrl = new URL(pathOrURL, 'file://');
  }

  const imageResp: Response = await fetch(imageUrl);

  if (!imageResp.ok) {
    throw new Error(`Error getting image. Http status code: ${imageResp.status}`);
  }

  const imageBuffer: ArrayBuffer = await imageResp.arrayBuffer();
  const imageBytes: Uint8Array = new Uint8Array(imageBuffer);

  const image = photon.PhotonImage.new_from_byteslice(imageBytes);

  const wrapper: WasmImage = {
    image,
    /**
     * Get the width of the image.
     * @returns {number} The width of the image in pixels.
     */
    width: (): number => image.get_width(),
    /**
     * Get the height of the image.
     * @returns {number} The height of the image in pixels.
     */
    height: (): number => image.get_height(),
    /**
     * Resize the image.
     * @param {number} width - The new width.
     * @param {number} height - The new height.
     * @param {boolean} [usePercent=true] - If true, width and height are treated as percentages.
     * @returns {WasmImage} A new WasmImage object with the resized image.
     */
    resize: (width: number, height: number, usePercent = true): WasmImage => {
      const resizedImage = resize(image, width, height, usePercent);
      return {
        ...wrapper,
        image: resizedImage,
      };
    },
    /**
     * Get the image as a Response object in the specified format.
     * @param {SupportedImageFormat} format - The desired image format ('webp', 'jpeg', or 'png').
     * @param {number} [quality=100.0] - The quality of the image (0-100), only applicable for 'jpeg' format.
     * @returns {Response} The image as a Response object.
     * @throws {Error} If an unsupported image format is specified.
     */
    getImageResponse: (format: SupportedImageFormat, quality = 100.0): Response => {
      return getImageResponse(image, format, quality);
    },
    /**
     * Clean up resources associated with the image.
     */
    clean: () => {
      clean(image);
    },
  };

  return wrapper;
}

export { clean, getImageResponse, loadImage, resize };
export default loadImage;

export * from './types';
