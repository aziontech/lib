import { Azion } from 'azion/types';
import { AzionClientOptions, NonSelectQueryResult, QueryResult } from '../../types';

export const getAzionSql = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis as any).Azion?.Sql || null;
};

export class InternalAzionSql {
  private database: Azion.Sql.Database | null = null;

  constructor() {
    this.database = getAzionSql()?.Database || null;
  }

  /**
   * Maps query results to a structured format.
   * @param {Array<{ statement: string; result: Azion.Sql.Rows }>} resultRows - The result rows from the query.
   * @returns {Promise<Array<QueryResult | NonSelectQueryResult>>} The mapped query results.
   */
  mapperQuery = async (
    resultRows: { statement: string; result: Azion.Sql.Rows }[],
  ): Promise<(QueryResult | NonSelectQueryResult)[]> => {
    const resultStatements: QueryResult[] | NonSelectQueryResult[] = [];
    for (const row of resultRows) {
      const columns = row.result.columnCount();
      if (columns === 0) {
        continue;
      }
      const columnNames = [];
      for (let i = 0; i < columns; i++) {
        columnNames.push(row.result.columnName(i));
      }
      let nextRow = await row.result.next();
      const rows = [];
      while (nextRow) {
        const line = [];
        for (let i = 0; i < columns; i++) {
          line.push(nextRow.getValue(i));
        }
        rows.push(line);
        nextRow = await row.result.next();
      }
      resultStatements.push({
        statement: row?.statement?.split(' ')[0], // TODO: This can improve
        columns: columnNames,
        rows: rows,
      });
    }
    return Promise.resolve(resultStatements);
  };

  /**
   * Executes a series of SQL statements on the specified database.
   * @param {string} name - The name of the database.
   * @param {string[]} statements - The SQL statements to execute.
   * @param {AzionClientOptions} [options] - Optional client options.
   * @returns {Promise<Array<{ statement: string; result: Azion.Sql.Rows }>>} The results of the executed statements.
   */
  query = async (
    name: string,
    statements: string[],
    options?: AzionClientOptions,
  ): Promise<{ statement: string; result: Azion.Sql.Rows }[]> => {
    if (this.database?.open) {
      const conn = await this.database?.open(name);
      const promises = statements.map(async (statement) => {
        const result = await conn?.query(statement);
        return { statement, result };
      });
      try {
        const results = await Promise.all(promises);
        if (results.every((item) => item.result?.columnCount() > 0)) {
          return results;
        }
      } catch (error) {
        if (options?.debug) {
          console.error('Error querying:', (error as Error)?.message);
        }
        throw error;
      }
    }
    return [];
  };
}
