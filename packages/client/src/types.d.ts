/* eslint-disable no-unused-vars */

import { SQLInternalClient } from '../../sql/src/types';
import { StorageInternalClient } from '../../storage/src/types';

export interface AzionClient {
  storage: StorageInternalClient;
  sql: SQLInternalClient;
}

export interface ClientConfig {
  token?: string;
  debug?: boolean;
}
