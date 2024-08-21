/* eslint-disable @typescript-eslint/no-explicit-any */
import { AzionQueryResponse } from '../../types';

export type JsonObjectQueryExecutionResponse = {
  state: 'executed' | 'pending' | 'executed-runtime';
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

export const toObjectQueryExecutionResponse = ({ state, data }: AzionQueryResponse) => {
  let transformedData: any = [];
  if (data instanceof Array) {
    if (data.length === 0) {
      return {
        state,
        data: [],
      };
    }
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
