/* eslint-disable no-unused-vars */

import { PurgeClient } from '../../purge/src/types';
import { SQLClient } from '../../sql/src/types';
import { StorageClient } from '../../storage/src/types';

export interface AzionClient {
  storage: StorageClient;
  sql: SQLClient;
  purge: PurgeClient;
}

export interface ClientConfig {
  token?: string;
  debug?: boolean;
}
