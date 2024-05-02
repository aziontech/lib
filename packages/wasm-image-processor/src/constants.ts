const VALID_IMG_EXTENSIONS: string[] = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

const SUPPORTED_FORMATS_IN_RESPONSE: string[] = ['png', 'jpeg', 'webp'];

const LOAD_IMG_ERROR_MSG: string = "Must load image before! Use 'loadImage' function.";
const OP_NEEDED_ERROR_MSG: string = 'Must run an image processing operation before return the result.';
const NO_EXTENSION_MSG: string = 'No file extension found';
const INVALID_IMG_EXT_MSG = `Invalid image extension. Supported: ${VALID_IMG_EXTENSIONS.join(',')}`;

export {
  INVALID_IMG_EXT_MSG,
  LOAD_IMG_ERROR_MSG,
  NO_EXTENSION_MSG,
  OP_NEEDED_ERROR_MSG,
  SUPPORTED_FORMATS_IN_RESPONSE,
  VALID_IMG_EXTENSIONS,
};
