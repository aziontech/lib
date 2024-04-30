import { LOAD_IMG_ERROR_MSG, OP_NEEDED_ERROR_MSG, SUPPORTED_FORMATS_IN_RESPONSE } from './constants';
import WasmImageProcessor from './index';
import * as photon from './photon/lib/index';

describe('WasmImageProcessor - index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadImage', () => {
    test('loads image from URL', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const mockedResponse = new Response(new ArrayBuffer(0), { status: 200 });

      jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockedResponse);
      jest.spyOn(photon.PhotonImage, 'new_from_byteslice');

      await WasmImageProcessor.loadImage(imageUrl);

      expect(fetch).toHaveBeenCalledWith(new URL(imageUrl));
      expect(photon.PhotonImage.new_from_byteslice).toHaveBeenCalledTimes(1);
    });

    test('throws error when image fetch fails', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const mockedResponse = new Response(null, { status: 404 });
      global.fetch = jest.fn().mockResolvedValue(mockedResponse);

      await expect(WasmImageProcessor.loadImage(imageUrl)).rejects.toThrow(
        `Error getting image. Http status code: ${mockedResponse.status}`,
      );
    });
  });

  describe('resize', () => {
    describe('when correct load image', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resizeSpy: any;
      beforeEach(async () => {
        jest.clearAllMocks();

        const mockedResponse = new Response(new ArrayBuffer(5), { status: 200 });
        jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockedResponse);

        resizeSpy = jest.spyOn(photon, 'resize');

        await WasmImageProcessor.loadImage('https://example.com/image.jpg');
      });

      test('resizes image with percentages', async () => {
        const width = 0.5;
        const height = 0.5;

        await WasmImageProcessor.resize(width, height);

        expect(photon.resize).toHaveBeenCalledTimes(1);
        expect(resizeSpy).toHaveBeenCalledWith(
          expect.any(photon.PhotonImage),
          expect.any(Number),
          expect.any(Number),
          1,
        );
      });

      test('resizes image with absolute values', async () => {
        const width = 100;
        const height = 100;
        await WasmImageProcessor.resize(width, height, false);

        expect(photon.resize).toHaveBeenCalledTimes(1);
        expect(photon.resize).toHaveBeenCalledWith(
          expect.any(photon.PhotonImage),
          expect.any(Number),
          expect.any(Number),
          1,
        );
      });
    });

    describe('when not load image', () => {
      test('', async () => {
        jest.clearAllMocks();
        WasmImageProcessor.clean();

        await expect(WasmImageProcessor.resize(0.5, 0.5)).rejects.toThrow(LOAD_IMG_ERROR_MSG);
      });
    });
  });

  describe('getImageResponse', () => {
    describe('when correct load image and make an operation', () => {
      beforeEach(async () => {
        jest.clearAllMocks();

        const mockedResponse = new Response(new ArrayBuffer(5), { status: 200 });
        jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockedResponse);

        await WasmImageProcessor.loadImage('https://example.com/image.jpg');
        await WasmImageProcessor.resize(0.5, 0.5);
      });

      test('returns image response in webp format', async () => {
        const imageResponse = WasmImageProcessor.getImageResponse('webp');

        expect(imageResponse.headers.get('Content-Type')).toEqual('image/webp');
      });

      test('returns image response in jpeg format', async () => {
        const imageResponse = WasmImageProcessor.getImageResponse('jpeg');

        expect(imageResponse.headers.get('Content-Type')).toEqual('image/jpeg');
      });

      test('returns image response in png format', async () => {
        const imageResponse = WasmImageProcessor.getImageResponse('png');

        expect(imageResponse.headers.get('Content-Type')).toEqual('image/png');
      });

      test('throws error for invalid image format', async () => {
        expect(() => {
          WasmImageProcessor.getImageResponse('invalid-format');
        }).toThrow(`Invalid image format in Response. Supported: ${SUPPORTED_FORMATS_IN_RESPONSE.join(',')}`);
      });
    });

    describe('when correct load image but return without an operation', () => {
      test('throws error', async () => {
        jest.clearAllMocks();

        WasmImageProcessor.clean();

        const mockedResponse = new Response(new ArrayBuffer(5), { status: 200 });
        jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockedResponse);

        await WasmImageProcessor.loadImage('https://example.com/image.jpg');

        expect(() => {
          WasmImageProcessor.getImageResponse('webp');
        }).toThrow(OP_NEEDED_ERROR_MSG);
      });
    });
  });
});
