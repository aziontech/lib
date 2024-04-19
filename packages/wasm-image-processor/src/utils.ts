import { INVALID_IMG_EXT_MSG, NO_EXTENSION_MSG, VALID_IMG_EXTENSIONS } from './constants';

function isUrl(pathOrUrl: string | null | undefined): boolean {
  if (!pathOrUrl) {
    return false;
  }

  try {
    new URL(pathOrUrl);

    return true;
  } catch (err) {
    return false;
  }
}

function getFileExtension(pathOrUrl: string | undefined | null): string {
  if (!pathOrUrl) {
    throw new Error(NO_EXTENSION_MSG);
  }

  const match: RegExpMatchArray | null = pathOrUrl.match(/(?:\.([^.]+))?$/);

  if (!match || !match[1]) {
    throw new Error(NO_EXTENSION_MSG);
  }

  return match[1].toLowerCase();
}

function validateImageExtension(pathOrUrl: string) {
  const extension = getFileExtension(pathOrUrl);
  const hasValidExtension = VALID_IMG_EXTENSIONS.includes(extension);

  if (!hasValidExtension) {
    throw new Error(INVALID_IMG_EXT_MSG);
  }
}

export { getFileExtension, isUrl, validateImageExtension };
