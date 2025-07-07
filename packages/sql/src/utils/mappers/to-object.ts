/* eslint-disable @typescript-eslint/no-explicit-any */
import { AzionDatabaseQueryResponse, ToObjectQueryExecution } from '../../types';

export const toObjectQueryExecutionResponse = ({ data }: AzionDatabaseQueryResponse) => {
  const transformedData: ToObjectQueryExecution = {
    data: [],
  };

  let transformedRows: any = [];
  if (data?.rows && data?.columns) {
    transformedRows = data.rows.map((row: any[]) => {
      const obj: { [key: string]: any } = {};
      if (data.columns) {
        data.columns.forEach((col: string, index: number) => {
          obj[col] = row[index];
        });
      }
      return obj;
    });
    transformedData.data = transformedRows;
  }
  return transformedData;
};
