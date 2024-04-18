import * as photon from './photon/lib/index';

import { isUrl, validateImageExtension } from './utils.js';

const SUPPORTED_FORMATS_IN_RESPONSE: string[] = ['png', 'jpeg', 'webp'];

const LOAD_IMG_ERROR_MSG: string = "Must load image before! Use 'loadImage' function.";
const OP_NEEDED_ERROR_MSG: string = 'Must run an image processing operation before return the result.';

let image: photon.PhotonImage | null = null;
let result: photon.PhotonImage | null = null;

async function loadImage(pathOrURL: string) {
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

  image = photon.PhotonImage.new_from_byteslice(imageBytes);
}

function cleanEnv() {
  if (image === null) throw new Error(LOAD_IMG_ERROR_MSG);

  image.free();

  image = null;
  result = null;
}

function getDimensionPercent(isWidth: boolean, value: number) {
  if (image === null) throw new Error(LOAD_IMG_ERROR_MSG);

  let dimensionValue;
  if (isWidth) {
    dimensionValue = image.get_width();
  } else {
    dimensionValue = image.get_height();
  }

  const percent = (value * 100.0) / dimensionValue;

  return percent;
}

async function resize(width: number, height: number, usePercent = true) {
  if (image === null) throw new Error(LOAD_IMG_ERROR_MSG);

  const imageWidth = image.get_width();
  const imageHeight = image.get_height();

  let widthPercent;
  let heightPercent;
  if (!usePercent) {
    widthPercent = getDimensionPercent(true, width);
    heightPercent = getDimensionPercent(false, height);
  } else {
    widthPercent = width;
    heightPercent = height;
  }

  result = photon.resize(image, imageWidth * widthPercent, imageHeight * heightPercent, 1);
}

function getImageResponse(format: string, quality = 100.0) {
  if (result === null) throw new Error(OP_NEEDED_ERROR_MSG);

  if (!SUPPORTED_FORMATS_IN_RESPONSE.includes(format)) {
    throw new Error(`Invalid image format in Response. Supported: ${SUPPORTED_FORMATS_IN_RESPONSE.join(',')}`);
  }

  let finalImage;
  let headers;
  switch (format) {
    case 'webp':
      finalImage = result.get_bytes_webp();
      headers = {
        'Content-Type': 'image/webp',
      };
      break;
    case 'jpeg':
      finalImage = result.get_bytes_jpeg(quality);
      headers = {
        'Content-Type': 'image/jpeg',
      };
      break;
    // png case
    default:
      finalImage = result.get_bytes();
      headers = {
        'Content-Type': 'image/png',
      };
      break;
  }

  const imageResponse = new Response(finalImage, { headers });

  cleanEnv();

  return imageResponse;
}

const WasmImageProcessor = {
  loadImage,
  resize,
  getImageResponse,
};

export default WasmImageProcessor;
