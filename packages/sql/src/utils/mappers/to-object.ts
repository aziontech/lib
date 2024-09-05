/* eslint-disable @typescript-eslint/no-explicit-any */
import { AzionDatabaseQueryResponse } from '../../types';

export type JsonObjectQueryExecutionResponse = {
  results?: {
    statement?: string;
    rows: { [key: string]: any }[];
  }[];
};

export const toObjectQueryExecutionResponse = ({ results }: AzionDatabaseQueryResponse) => {
  let transformedData: any = [];
  if (results instanceof Array) {
    if (results.length === 0) {
      return {
        results: [],
      };
    }
    let transformedRows: any = null;
    transformedData = results?.map((item) => {
      if (item?.rows) {
        transformedRows = item.rows.map((row) => {
          const obj: { [key: string]: any } = {};
          if (item?.columns) {
            item.columns.forEach((col: string, index: number) => {
              obj[col] = row[index];
            });
          }
          return obj;
        });
      }
      return {
        statement: item.statement,
        rows: transformedRows,
      };
    });
  }
  return {
    results: transformedData,
  };
};
