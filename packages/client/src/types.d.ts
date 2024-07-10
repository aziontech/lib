/* eslint-disable no-unused-vars */

import { PurgeInternalClient } from '../../purge/src/types';
import { SQLInternalClient } from '../../sql/src/types';
import { StorageInternalClient } from '../../storage/src/types';

export interface AzionClient {
  storage: StorageInternalClient;
  sql: SQLInternalClient;
  purge: PurgeInternalClient;
}

export interface ClientConfig {
  token?: string;
  debug?: boolean;
}
