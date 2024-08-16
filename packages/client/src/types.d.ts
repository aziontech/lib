/* eslint-disable no-unused-vars */

import { PurgeClient } from '../../purge/src/types';
import { AzionSQLClient, OptionsParams } from '../../sql/src/types';
import { StorageClient } from '../../storage/src/types';

export interface AzionClient {
  storage: StorageClient;
  sql: AzionSQLClient;
  purge: PurgeClient;
}

export interface ClientConfig {
  token?: string;
  options?: OptionsParams;
  debug?: boolean;
}
