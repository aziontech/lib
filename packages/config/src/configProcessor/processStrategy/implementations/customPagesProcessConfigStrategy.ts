import { AzionConfig, AzionCustomPage, AzionEdgeConnector, CustomPageErrorCode, CustomPageType } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * CustomPagesProcessConfigStrategy V4
 * @class CustomPagesProcessConfigStrategy
 * @description This class is implementation of the Custom Pages ProcessConfig Strategy for API V4.
 */
class CustomPagesProcessConfigStrategy extends ProcessConfigStrategy {
  /**
   * Validate Edge Connector references
   */
  private validateEdgeConnectorReference(
    edgeConnectors: AzionEdgeConnector[] | undefined,
    connectorNameOrId: string | number,
    customPageName: string,
    errorCode: string,
  ) {
    // Only validate if it's a string (name), skip validation for numbers (IDs)
    if (typeof connectorNameOrId === 'string') {
      if (!Array.isArray(edgeConnectors) || !edgeConnectors.find((connector) => connector.name === connectorNameOrId)) {
        throw new Error(
          `Custom page "${customPageName}" with error code "${errorCode}" references non-existent Edge Connector "${connectorNameOrId}".`,
        );
      }
    }
  }

  /**
   * Transform azion.config Custom Pages to V4 manifest format
   */
  transformToManifest(config: AzionConfig) {
    const customPages = config?.customPages;
    if (!Array.isArray(customPages) || customPages.length === 0) {
      return [];
    }

    return customPages.map((customPage: AzionCustomPage) => {
      // Validate connector references
      customPage.pages.forEach((pageEntry) => {
        this.validateEdgeConnectorReference(
          config.edgeConnectors,
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
              connector: Number(pageEntry.page.attributes.connector), // Convert to number for API
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
   * Transform V4 manifest format back to azion.config Custom Pages
   */
  transformToConfig(
    payload: {
      custom_pages?: Array<{
        name: string;
        active?: boolean;
        pages: Array<{
          code: string;
          page: {
            type: string;
            attributes: {
              connector: number;
              ttl?: number;
              uri?: string | null;
              custom_status_code?: number | null;
            };
          };
        }>;
      }>;
    },
    transformedPayload: AzionConfig,
  ) {
    if (!Array.isArray(payload?.custom_pages) || payload.custom_pages.length === 0) {
      return;
    }

    transformedPayload.customPages = payload.custom_pages.map((customPage) => ({
      name: customPage.name,
      active: customPage.active,
      pages: customPage.pages.map((pageEntry) => ({
        code: pageEntry.code as CustomPageErrorCode,
        page: {
          type: pageEntry.page.type as CustomPageType,
          attributes: {
            connector: pageEntry.page.attributes.connector, // Keep as number from API
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
