import type { AzionConfigV6, AzionCustomPageV6 } from '../../types';
import CustomPagesProcessConfigStrategy from './customPagesProcessConfigStrategy';

describe('CustomPagesProcessConfigStrategy (v6)', () => {
  let strategy: CustomPagesProcessConfigStrategy;

  const connectors: AzionConfigV6['connectors'] = [
    { name: 'my-connector', type: 'storage', attributes: { bucket: 'my-bucket' } },
  ];
  const withPages = (customPages: AzionCustomPageV6[], extra: Partial<AzionConfigV6> = {}): AzionConfigV6 => ({
    version: 6,
    connectors,
    customPages,
    ...extra,
  });

  beforeEach(() => {
    strategy = new CustomPagesProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return an empty array when there are no custom pages', () => {
      expect(strategy.transformToManifest({ version: 6 })).toEqual([]);
      expect(strategy.transformToManifest({ version: 6, customPages: [] })).toEqual([]);
    });

    it('should apply the defaults to a minimal page', () => {
      expect(
        strategy.transformToManifest(
          withPages([
            { name: 'errors', pages: [{ code: '404', page: { attributes: { connector: 'my-connector' } } }] },
          ]),
        ),
      ).toEqual([
        {
          name: 'errors',
          active: true,
          pages: [
            {
              code: '404',
              page: {
                type: 'page_connector',
                attributes: { connector: 'my-connector', ttl: 0, uri: null, custom_status_code: null },
              },
            },
          ],
        },
      ]);
    });

    it('should map every field of the custom page to the manifest', () => {
      expect(
        strategy.transformToManifest(
          withPages([
            {
              name: 'errors',
              active: false,
              pages: [
                {
                  code: 'default',
                  page: {
                    type: 'page_connector',
                    attributes: { connector: 'my-connector', ttl: 300, uri: '/error.html', customStatusCode: 200 },
                  },
                },
                { code: '500', page: { attributes: { connector: 'my-connector', uri: '/500.html' } } },
              ],
            },
          ]),
        ),
      ).toEqual([
        {
          name: 'errors',
          active: false,
          pages: [
            {
              code: 'default',
              page: {
                type: 'page_connector',
                attributes: { connector: 'my-connector', ttl: 300, uri: '/error.html', custom_status_code: 200 },
              },
            },
            {
              code: '500',
              page: {
                type: 'page_connector',
                attributes: { connector: 'my-connector', ttl: 0, uri: '/500.html', custom_status_code: null },
              },
            },
          ],
        },
      ]);
    });

    it('should keep a connector referenced by id as a string, without validating it', () => {
      const [customPage] = strategy.transformToManifest({
        version: 6,
        customPages: [{ name: 'errors', pages: [{ code: '404', page: { attributes: { connector: 10 } } }] }],
      });

      expect(customPage.pages[0].page.attributes.connector).toBe('10');
    });

    it('should throw when the connector of a page is not declared', () => {
      const pages: AzionCustomPageV6[] = [
        { name: 'errors', pages: [{ code: '404', page: { attributes: { connector: 'missing' } } }] },
      ];
      const message = 'Custom page "errors" with error code "404" references non-existent Connector "missing".';

      expect(() => strategy.transformToManifest(withPages(pages))).toThrow(message);
      expect(() => strategy.transformToManifest(withPages(pages, { connectors: undefined }))).toThrow(message);
    });
  });

  describe('transformToConfig', () => {
    it('should not set custom pages when the manifest has none', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      expect(strategy.transformToConfig({}, transformedPayload)).toBeUndefined();
      expect(strategy.transformToConfig({ custom_pages: [] }, transformedPayload)).toBeUndefined();
      expect(transformedPayload.customPages).toBeUndefined();
    });

    it('should map the custom_pages of the manifest back to the config', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      strategy.transformToConfig(
        {
          custom_pages: [
            {
              name: 'errors',
              active: true,
              pages: [
                {
                  code: '404',
                  page: {
                    type: 'page_connector',
                    attributes: { connector: 10, ttl: 60, uri: '/404.html', custom_status_code: 404 },
                  },
                },
              ],
            },
          ],
        },
        transformedPayload,
      );

      expect(transformedPayload.customPages).toEqual([
        {
          name: 'errors',
          active: true,
          pages: [
            {
              code: '404',
              page: {
                type: 'page_connector',
                attributes: { connector: 10, ttl: 60, uri: '/404.html', customStatusCode: 404 },
              },
            },
          ],
        },
      ]);
    });
  });
});
