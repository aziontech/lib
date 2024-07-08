import sql from 'azion/sql';
import storage from 'azion/storage';

/**
 * Creates an Azion client.
 * @param {ClientConfig} [config] - Client configuration.
 * @returns {AzionClient} Azion client.
 * @example
 * const client = createClient({ token: 'your-token', debug: true });
 */
function createClient({ token, debug = false }: ClientConfig = {}): AzionClient {
  return {
    storage: storage(token, debug),
    sql: sql(token, debug),
  };
}

export { createClient };
export default createClient;
