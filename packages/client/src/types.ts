/* eslint-disable no-unused-vars */

import { AzionPurgeClient } from '../../purge/src/types';
import { AzionClientOptions, AzionSQLClient } from '../../sql/src/types';
import { AzionStorageClient } from '../../storage/src/types';

export interface AzionClient {
  storage: AzionStorageClient;
  sql: AzionSQLClient;
  purge: AzionPurgeClient;
}

export interface AzionClientConfig {
  token?: string;
  options?: AzionClientOptions;
}
