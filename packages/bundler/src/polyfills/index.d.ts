/* eslint-disable @typescript-eslint/no-explicit-any */

// this is temp solution to avoid typescript error

declare module 'azion/bundler/polyfills' {
  export const fetchContext: any;
  export const FetchEventContext: any;
  export const AsyncHooksContext: any;
  export const StorageContext: any;
  export const EnvVarsContext: any;
  export const NetworkListContext: any;
  export const fsContext: any;
  export const FirewallEventContext: any;
}
