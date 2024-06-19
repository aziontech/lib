interface Database {
  id: number;
  name: string;
  client_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  query?: (statements: string[]) => Promise<QueryResponse>;
}

interface CreateDBResponse {
  state: string;
  data: Database;
}

interface ListDBsResponse {
  count: number;
  links: {
    first: string | null;
    last: string | null;
    next: string | null;
    prev: string | null;
  };
  results: Database[];
}

interface QueryResults {
  columns: string[];
  rows: (number | string)[][];
}
interface QueryResponse {
  state: string;
  columns: string[];
  rows: (number | string)[][];
}
