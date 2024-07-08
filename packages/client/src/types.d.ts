interface AzionClient {
  storage: {
    getAll: (options?: BucketCollectionOptions) => Promise<Bucket[]>;
    create: (name: string, edge_access: string) => Promise<Bucket>;
    update: (name: string, edge_access: string) => Promise<Bucket>;
    delete: (name: string) => Promise<void>;
    get: (name: string) => Promise<Bucket>;
    getAllObjects: (bucketName: string) => Promise<BucketObject[]>;
    postObject: (bucketName: string, objectKey: string, file: string) => Promise<BucketObject>;
    getObjectByName: (bucketName: string, objectKey: string) => Promise<BucketObject>;
    putObject: (bucketName: string, objectKey: string, file: string) => Promise<BucketObject>;
    deleteObject: (bucketName: string, objectKey: string) => Promise<void>;
  };
  sql: {
    create: (name: string) => Promise<Database | null>;
    delete: (id: number) => Promise<void | null>;
    get: (id: number) => Promise<Database | null>;
    getAll: (params?: {
      ordering?: string;
      page?: number;
      page_size?: number;
      search?: string;
    }) => Promise<Database[] | null>;
    query: (id: number, statements: string[]) => Promise<QueryResponse | null>;
    execute: (id: number, statements: string[]) => Promise<QueryResponse | null>;
  };
}

interface ClientConfig {
  token?: string;
  debug?: boolean;
}
