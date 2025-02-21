import mountSPA from './mountSPA';

describe('mountSPA', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({});
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should construct the assetPath for assets correctly', async () => {
    const requestURL = 'http://example.com/assets/image.png';
    const expectedAssetPath = new URL('assets/image.png', 'file:///');

    await mountSPA(requestURL);

    expect(global.fetch).toHaveBeenCalledWith(expectedAssetPath);
  });

  it('should construct the assetPath for routes without file extensions correctly', async () => {
    const requestURL = 'http://example.com/about';
    const expectedAssetPath = new URL('index.html', 'file:///');

    await mountSPA(requestURL);

    expect(global.fetch).toHaveBeenCalledWith(expectedAssetPath);
  });

  it('should handle the root path correctly', async () => {
    const requestURL = 'http://example.com/';
    const expectedAssetPath = new URL('index.html', 'file:///');

    await mountSPA(requestURL);

    expect(global.fetch).toHaveBeenCalledWith(expectedAssetPath);
  });

  it('should return the fetch response', async () => {
    const mockResponse = { ok: true, status: 200 };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const requestURL = 'http://example.com/';
    const result = await mountSPA(requestURL);

    expect(result).toEqual(mockResponse);
  });

  it('should throw an error if fetch fails', async () => {
    const mockError = new Error('Fetch failed');
    (global.fetch as jest.Mock).mockRejectedValue(mockError);

    const requestURL = 'http://example.com/';

    await expect(mountSPA(requestURL)).rejects.toThrow('Fetch failed');
  });
});
