/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryResponse } from '../../types';

export type JsonObjectQueryExecutionResponse = {
  state: 'executed' | 'pending';
  data: {
    statement?: string;
    rows: { [key: string]: any }[];
  }[];
  info?: {
    rowsRead?: number;
    rowsWritten?: number;
    durationMs?: number;
  };
};

export const toObjectQueryExecutionResponse = ({ state, data }: QueryResponse) => {
  let transformedData: any = null;
  if (data instanceof Array) {
    let transformedRows: any = null;
    transformedData = data?.map((item) => {
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
    state,
    data: transformedData,
  };
};
