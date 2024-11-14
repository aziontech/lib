import type { AzionAIClient } from 'azion/ai';
import createAzionAIClient from 'azion/ai';
import type { AzionApplicationsClient } from 'azion/applications';
import createAzionApplicationClient from 'azion/applications';
import { convertJsonConfigToObject, defineConfig, processConfig } from 'azion/config';
import type { AzionDomainsClient } from 'azion/domains';
import createDomainsClient from 'azion/domains';
import type { AzionPurgeClient } from 'azion/purge';
import createPurgeClient from 'azion/purge';
import type { AzionSQLClient } from 'azion/sql';
import createSqlClient from 'azion/sql';
import type { AzionStorageClient } from 'azion/storage';
import createStorageClient from 'azion/storage';

import type { AzionClient, AzionClientConfig } from './types';

/**
 * Creates an Azion Client with methods to interact with Azion services
 *
 * @param {AzionClientConfig} [config] - Client configuration options.
 * @param {string} [config.token] - Authentication token for Azion API.
 * @param {boolean} [config.debug=false] - Enable debug mode for detailed logging.
 * @returns {AzionClient} An object containing SQL, Storage, Purge, Edge Application, and AI clients.
 *
 * @example
 * // Create a client with a token and debug mode enabled
 * const client = createClient({ token: 'your-api-token', options: { debug: true } });
 *
 * @example
 * // Create a client using environment variables for token
 * const client = createClient({ options: { debug: true } });
 */
function createClient({ token, options }: AzionClientConfig = {}): AzionClient {
  /**
   * Storage client with methods to interact with Azion Edge Storage.
   * @type {AzionStorageClient}
   */
  const storageClient: AzionStorageClient = createStorageClient({ token, options });

  /**
   * SQL client with methods to interact with Azion Edge SQL databases.
   * @type {AzionSQLClient}
   */
  const sqlClient: AzionSQLClient = createSqlClient({ token, options });

  /**
   * Purge client with methods to interact with Azion Edge Purge.
   * @type {AzionPurgeClient}
   */
  const purgeClient: AzionPurgeClient = createPurgeClient({ token, options });

  /**
   * Domains client with methods to interact with Azion Edge Domains.
   * @type {AzionDomainsClient}
   */
  const domainsClient: AzionDomainsClient = createDomainsClient({ token, options });

  /**
   * Edge Application client with methods to interact with Azion Edge Applications.
   * @type {AzionApplicationsClient}
   */
  const applicationClient: AzionApplicationsClient = createAzionApplicationClient({ token, options });

  /**
   * AI client with methods to interact with Azion AI services.
   * @type {AzionAIClient}
   */
  const aiClient: AzionAIClient = createAzionAIClient({ token, options });

  /**
   * Azion Client object containing Storage, SQL, Purge, Edge Application, and AI clients.
   * Use this object to interact with various Azion services.
   *
   * @type {AzionClient}
   *
   * @property {AzionStorageClient} storage - Client for Azion Edge Storage operations.
   * @property {AzionSQLClient} sql - Client for Azion Edge SQL database operations.
   * @property {AzionPurgeClient} purge - Client for Azion Edge Purge operations.
   * @property {AzionDomainsClient} domains - Client for Azion Edge Domains operations.
   * @property {AzionApplicationsClient} applications - Client for Azion Edge Application operations.
   * @property {AzionAIClient} ai - Client for Azion AI operations.
   */
  const client: AzionClient = {
    storage: storageClient,
    sql: sqlClient,
    purge: purgeClient,
    domains: domainsClient,
    applications: applicationClient,
    ai: aiClient,
  };

  return client;
}

export { convertJsonConfigToObject, createClient, defineConfig, processConfig };

export default createClient;

export type * from './types';
