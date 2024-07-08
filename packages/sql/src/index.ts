import { createEdgeDB, deleteEdgeDB, getAllEdgeDBs, getEdgeDB, queryEdgeDB } from './services';

const resolveToken = (token?: string) => token ?? process.env.AZION_TOKEN ?? '';
const resolveDebug = (debug: boolean = false) => debug || !!process.env.AZION_DEBUG;

const createDatabase = async (token: string, name: string, debug: boolean = false) => {
  const db = await createEdgeDB(resolveToken(token), name, resolveDebug(debug));
  if (db) {
    return {
      ...db,
      query: (statements: string[]) => queryDatabase(token, db.id, statements, debug),
      execute: (statements: string[]) => queryDatabase(token, db.id, statements, debug),
    };
  }
  return null;
};

const deleteDatabase = (token: string, id: number, debug: boolean = false) =>
  deleteEdgeDB(resolveToken(token), id, resolveDebug(debug));

const getDatabase = async (token: string, id: number, debug: boolean = false) => {
  const db = await getEdgeDB(resolveToken(token), id, resolveDebug(debug));
  if (db) {
    return {
      ...db,
      query: (statements: string[]) => queryDatabase(token, id, statements, debug),
      execute: (statements: string[]) => queryDatabase(token, id, statements, debug),
    };
  }
  return null;
};
const getAllDatabases = (
  token: string,
  params?: {
    ordering?: string;
    page?: number;
    page_size?: number;
    search?: string;
  },
  debug: boolean = false,
) => getAllEdgeDBs(resolveToken(token), params, resolveDebug(debug));

const queryDatabase = (token: string, id: number, statements: string[], debug: boolean = false) =>
  queryEdgeDB(resolveToken(token), id, statements, resolveDebug(debug));

const sql = (token?: string, debug: boolean = false) => {
  const tokenValue = resolveToken(token);
  const debugValue = resolveDebug(debug);

  return {
    create: (name: string) => createDatabase(tokenValue, name, debugValue),
    delete: (id: number) => deleteDatabase(tokenValue, id, debugValue),
    get: (id: number) => getDatabase(tokenValue, id, debugValue),
    getAll: (params?: { ordering?: string; page?: number; page_size?: number; search?: string }) =>
      getAllDatabases(tokenValue, params, debugValue),
    query: (id: number, statements: string[]) => queryDatabase(tokenValue, id, statements, debugValue),
    execute: (id: number, statements: string[]) => queryDatabase(tokenValue, id, statements, debugValue),
  };
};

const createDatabaseWrapper = async (name: string, debug: boolean = false) => {
  const db = await createDatabase(resolveToken(), name, resolveDebug(debug));
  if (db) {
    return {
      ...db,
      query: (statements: string[]) => queryDatabase(resolveToken(), db.id, statements, resolveDebug(debug)),
      execute: (statements: string[]) => queryDatabase(resolveToken(), db.id, statements, resolveDebug(debug)),
    };
  }
  return null;
};

const deleteDatabaseWrapper = (id: number, debug: boolean = false) =>
  deleteDatabase(resolveToken(), id, resolveDebug(debug));

const getDatabaseWrapper = async (id: number, debug: boolean = false) => {
  const db = await getDatabase(resolveToken(), id, resolveDebug(debug));
  if (db) {
    return {
      ...db,
      query: (statements: string[]) => queryDatabase(resolveToken(), id, statements, resolveDebug(debug)),
      execute: (statements: string[]) => queryDatabase(resolveToken(), id, statements, resolveDebug(debug)),
    };
  }
  return null;
};
const getAllDatabasesWrapper = (
  params?: {
    ordering?: string;
    page?: number;
    page_size?: number;
    search?: string;
  },
  debug: boolean = false,
) => getAllDatabases(resolveToken(), params, resolveDebug(debug));

const queryDatabaseWrapper = (id: number, statements: string[], debug: boolean = false) =>
  queryDatabase(resolveToken(), id, statements, resolveDebug(debug));

export {
  sql as createClient,
  createDatabaseWrapper as createDatabase,
  deleteDatabaseWrapper as deleteDatabase,
  getAllDatabasesWrapper as getAllDatabases,
  getDatabaseWrapper as getDatabase,
  queryDatabaseWrapper as queryDatabase,
};
export default sql;
