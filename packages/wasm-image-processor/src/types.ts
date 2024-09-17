import { PhotonImage as PhotonImageType } from './photon/lib/index';

export interface WasmImage {
  /** The underlying PhotonImage object. */
  image: PhotonImage;
  /** Get the width of the image. */
  width(): number;
  /** Get the height of the image. */
  height(): number;
  /**
   * Resize the image.
   * @param width - The new width.
   * @param height - The new height.
   * @param usePercent - If true, width and height are treated as percentages.
   */
  resize(width: number, height: number, usePercent?: boolean): WasmImage;
  /**
   * Get the image as a Response object in the specified format.
   * @param format - The desired image format ('webp', 'jpeg', or 'png').
   * @param quality - The quality of the image (0-100), only applicable for 'jpeg' format.
   * @throws {Error} If an unsupported image format is specified.
   */
  getImageResponse(format: SupportedImageFormat, quality?: number): Response;
  /** Clean up resources associated with the image. */
  clean(): void;
}

export type SupportedImageFormat = 'webp' | 'jpeg' | 'png';

export type PhotonImage = PhotonImageType;
