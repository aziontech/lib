// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Azion {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Sql {
    interface Connection {
      query: (sql: string) => Promise<Rows>;
      execute: (sql: string) => Promise<null>;
    }
    export interface Rows {
      next: () => Promise<Row>;
      columnCount: () => number;
      columnName: (index: number) => string;
      columnType: (index: number) => string;
    }
    export interface Row {
      columnName: (index: number) => string;
      columnType: (index: number) => string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getValue: (index: number) => any;
      getString: (index: number) => string;
    }
    export interface AzionDatabase {
      connection: Connection;
      open?: (name: string) => Promise<Connection>;
    }
  }
}
