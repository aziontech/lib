import ProcessConfigStrategy from '../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6, AzionConnectorV6, AzionCustomPageV6 } from '../../types';

/**
 * CustomPagesProcessConfigStrategy V6
 * @class CustomPagesProcessConfigStrategy
 * @description Converts the v6 custom pages between the config (`customPages`) and the manifest (`custom_pages`).
 * The connector of a page is kept in the manifest as the name (or the id as a string) the config has, which the Azion
 * CLI resolves to the id of the API.
 */
class CustomPagesProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  /**
   * Validate Connector references
   */
  private validateConnectorReference(
    connectors: AzionConnectorV6[] | undefined,
    connectorNameOrId: string | number,
    customPageName: string,
    errorCode: string,
  ) {
    // Only validate if it's a string (name), skip validation for numbers (IDs)
    if (typeof connectorNameOrId === 'string') {
      if (!Array.isArray(connectors) || !connectors.find((connector) => connector.name === connectorNameOrId)) {
        throw new Error(
          `Custom page "${customPageName}" with error code "${errorCode}" references non-existent Connector "${connectorNameOrId}".`,
        );
      }
    }
  }

  /**
   * Transform azion.config Custom Pages to V6 manifest format
   */
  transformToManifest(config: AzionConfigV6) {
    const customPages = config?.customPages;
    if (!Array.isArray(customPages) || customPages.length === 0) {
      return [];
    }

    return customPages.map((customPage: AzionCustomPageV6) => {
      // Validate connector references
      customPage.pages.forEach((pageEntry) => {
        this.validateConnectorReference(
          config.connectors,
          pageEntry.page.attributes.connector,
          customPage.name,
          pageEntry.code,
        );
      });

      return {
        name: customPage.name,
        active: customPage.active ?? true,
        pages: customPage.pages.map((pageEntry) => ({
          code: pageEntry.code,
          page: {
            type: pageEntry.page.type || 'page_connector',
            attributes: {
              connector: String(pageEntry.page.attributes.connector),
              ttl: pageEntry.page.attributes.ttl ?? 0,
              uri: pageEntry.page.attributes.uri || null,
              custom_status_code: pageEntry.page.attributes.customStatusCode || null,
            },
          },
        })),
      };
    });
  }

  /**
   * Transform V6 manifest format back to azion.config Custom Pages
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: { custom_pages?: any[] }, transformedPayload: AzionConfigV6) {
    if (!Array.isArray(payload?.custom_pages) || payload.custom_pages.length === 0) {
      return;
    }

    transformedPayload.customPages = payload.custom_pages.map((customPage) => ({
      name: customPage.name,
      active: customPage.active,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pages: customPage.pages.map((pageEntry: any) => ({
        code: pageEntry.code,
        page: {
          type: pageEntry.page.type,
          attributes: {
            connector: pageEntry.page.attributes.connector, // Keep as it comes from the API
            ttl: pageEntry.page.attributes.ttl,
            uri: pageEntry.page.attributes.uri,
            customStatusCode: pageEntry.page.attributes.custom_status_code,
          },
        },
      })),
    }));

    return transformedPayload.customPages;
  }
}

export default CustomPagesProcessConfigStrategy;
