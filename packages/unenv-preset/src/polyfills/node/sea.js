import { notImplemented } from './_internal/not-implemented.js';

/**
 * `node:sea` is for Node.js single executable applications, which the Azion runtime is not.
 * `isSea()` answers `false`, the other APIs throw when called.
 */

export const isSea = () => false;
export const getAsset = notImplemented('sea.getAsset');
export const getAssetAsBlob = notImplemented('sea.getAssetAsBlob');
export const getRawAsset = notImplemented('sea.getRawAsset');

export default { isSea, getAsset, getAssetAsBlob, getRawAsset };
