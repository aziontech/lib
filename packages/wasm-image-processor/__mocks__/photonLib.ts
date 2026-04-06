/* eslint-disable */
/* tslint-disable */
import { jest } from '@jest/globals';

export class PhotonImage {
  constructor() {}

  static new_from_byteslice(vec: any): PhotonImage {
    return new PhotonImage();
  }

  free() {}

  get_width() {
    return 320;
  }

  get_height() {
    return 320;
  }

  get_bytes() {
    return new Uint8Array(5);
  }

  get_bytes_jpeg(quality: any) {
    return new Uint8Array(5);
  }

  get_bytes_webp() {
    return new Uint8Array(5);
  }
}

export const resize = jest.fn((photon_img: any, width: any, height: any, sampling_filter: any) => {
  return new PhotonImage();
});

export default function __wbg_init(module_or_path?: any) {}
