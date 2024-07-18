import { SUPPORTED_FORMATS_IN_RESPONSE } from './constants';
import { loadImage } from './index';
import * as photon from './photon/lib/index';
import { SupportedImageFormat, WasmImage } from './types';

describe('WasmImage - index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadImage', () => {
    test('loads image from URL', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const mockedResponse = new Response(new ArrayBuffer(0), { status: 200 });

      jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockedResponse);
      jest.spyOn(photon.PhotonImage, 'new_from_byteslice');

      await loadImage(imageUrl);

      expect(fetch).toHaveBeenCalledWith(new URL(imageUrl));
      expect(photon.PhotonImage.new_from_byteslice).toHaveBeenCalledTimes(1);
    });

    test('loads image from storage path', async () => {
      const imageUrl = '/images/image.jpg';
      const mockedResponse = new Response(new ArrayBuffer(0), { status: 200 });

      jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockedResponse);
      jest.spyOn(photon.PhotonImage, 'new_from_byteslice');

      await loadImage(imageUrl);

      expect(fetch).toHaveBeenCalledWith(new URL(imageUrl, 'file://'));
      expect(photon.PhotonImage.new_from_byteslice).toHaveBeenCalledTimes(1);
    });

    test('throws error when image fetch fails', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const mockedResponse = new Response(null, { status: 404 });
      global.fetch = jest.fn().mockResolvedValue(mockedResponse);

      await expect(loadImage(imageUrl)).rejects.toThrow(
        `Error getting image. Http status code: ${mockedResponse.status}`,
      );
    });
  });

  describe('resize', () => {
    let wrapper: WasmImage;

    beforeEach(async () => {
      jest.clearAllMocks();

      const mockedResponse = new Response(new ArrayBuffer(5), { status: 200 });
      jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockedResponse);

      wrapper = await loadImage('https://example.com/image.jpg');
    });

    test('resizes image with percentages', async () => {
      const width = 0.5;
      const height = 0.5;

      const resizedWrapper = wrapper.resize(width, height);

      expect(photon.resize).toHaveBeenCalledTimes(1);
      expect(photon.resize).toHaveBeenCalledWith(
        expect.any(photon.PhotonImage),
        expect.any(Number),
        expect.any(Number),
        1,
      );
      expect(resizedWrapper).not.toBe(wrapper);
    });

    test('resizes image with absolute values', async () => {
      const width = 100;
      const height = 100;
      const resizedWrapper = wrapper.resize(width, height, false);

      expect(photon.resize).toHaveBeenCalledTimes(1);
      expect(photon.resize).toHaveBeenCalledWith(
        expect.any(photon.PhotonImage),
        expect.any(Number),
        expect.any(Number),
        1,
      );
      expect(resizedWrapper).not.toBe(wrapper);
    });
  });

  describe('getImageResponse', () => {
    let wrapper: WasmImage;

    beforeEach(async () => {
      jest.clearAllMocks();

      const mockedResponse = new Response(new ArrayBuffer(5), { status: 200 });
      jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockedResponse);

      wrapper = await loadImage('https://example.com/image.jpg');
    });

    test('returns image response in webp format', () => {
      const imageResponse = wrapper.getImageResponse('webp');

      expect(imageResponse.headers.get('Content-Type')).toEqual('image/webp');
    });

    test('returns image response in jpeg format', () => {
      const imageResponse = wrapper.getImageResponse('jpeg');

      expect(imageResponse.headers.get('Content-Type')).toEqual('image/jpeg');
    });

    test('returns image response in png format', () => {
      const imageResponse = wrapper.getImageResponse('png');

      expect(imageResponse.headers.get('Content-Type')).toEqual('image/png');
    });

    test('throws error for invalid image format', () => {
      expect(() => {
        wrapper.getImageResponse('invalid-format' as SupportedImageFormat);
      }).toThrow(`Invalid image format in Response. Supported: ${SUPPORTED_FORMATS_IN_RESPONSE.join(',')}`);
    });
  });

  describe('clean', () => {
    test('calls free method on PhotonImage', async () => {
      const mockedResponse = new Response(new ArrayBuffer(5), { status: 200 });
      jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockedResponse);

      const wrapper = await loadImage('https://example.com/image.jpg');
      const freeSpy = jest.spyOn(wrapper.image, 'free');

      wrapper.clean();

      expect(freeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
