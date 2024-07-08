const BASE_URL = 'https://api.azion.com/v4/edge_sql/databases';

const createEdgeDB = async (token: string, name: string, debug?: boolean): Promise<Database | null> => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return { ...data.data };
  } catch (error) {
    if (debug) console.error('Error creating EdgeDB:', error);
    return null;
  }
};

const deleteEdgeDB = async (token: string, id: number, debug?: boolean): Promise<void | null> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    if (debug) console.log('Response:', response);
    return response.json();
  } catch (error) {
    if (debug) console.error('Error deleting EdgeDB:', error);
    return null;
  }
};

const queryEdgeDB = async (
  token: string,
  id: number,
  statements: string[],
  debug?: boolean,
): Promise<QueryResponse | null> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ statements }),
    });

    console.log(response);

    if (!response.ok) {
      if (debug) console.error('Error querying EdgeDB:', response.statusText);
      return null;
    }

    const json = await response.json();
    if (debug) console.log('Response:', json);
    return {
      state: json.state,
      columns: json.data[0].results.columns,
      rows: json.data[0].results.rows,
    };
  } catch (error) {
    if (debug) console.error('Error querying EdgeDB:', error);
    return null;
  }
};

const getEdgeDB = async (token: string, id: number, debug?: boolean): Promise<Database | null> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    const database = await response.json();
    if (debug) console.log('Response:', database);
    return database.data;
  } catch (error) {
    if (debug) console.error('Error getting EdgeDB:', error);
    return null;
  }
};

const getAllEdgeDBs = async (
  token: string,
  params?: { ordering?: string; page?: number; page_size?: number; search?: string },
  debug?: boolean,
): Promise<Database[] | null> => {
  try {
    const url = new URL(BASE_URL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data.results;
  } catch (error) {
    if (debug) console.error('Error getting all EdgeDBs:', error);
    return null;
  }
};

export { createEdgeDB, deleteEdgeDB, getAllEdgeDBs, getEdgeDB, queryEdgeDB };
