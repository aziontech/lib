import { createEdgeDB, deleteEdgeDB, getAllEdgeDBs, getEdgeDB, queryEdgeDB } from './edge-sql/index';
import {
  createBucket,
  deleteBucket,
  deleteObject,
  getAllBuckets,
  getAllObjects,
  getBucketByName,
  getObjectByName,
  patchBucket,
  postObject,
  putObject,
} from './edge-storage/index';

class Azion {
  private token: string;
  private debug: boolean;

  constructor({ token, debug = false }: { token: string; debug?: boolean }) {
    this.token = token;
    this.debug = debug;
  }

  storage = {
    getAll: (options?: BucketCollectionOptions) => getAllBuckets(this.token, options, this.debug),
    create: (name: string, edge_access: string) => createBucket(this.token, name, edge_access, this.debug),
    update: (name: string, edge_access: string) => patchBucket(this.token, name, edge_access, this.debug),
    delete: (name: string) => deleteBucket(this.token, name, this.debug),
    get: (name: string) => getBucketByName(this.token, name, this.debug),
    getAllObjects: (bucketName: string) => getAllObjects(this.token, bucketName, this.debug),
    postObject: (bucketName: string, objectKey: string, file: string) =>
      postObject(this.token, bucketName, objectKey, file, this.debug),
    getObjectByName: (bucketName: string, objectKey: string) =>
      getObjectByName(this.token, bucketName, objectKey, this.debug),
    putObject: (bucketName: string, objectKey: string, file: string) =>
      putObject(this.token, bucketName, objectKey, file, this.debug),
    deleteObject: (bucketName: string, objectKey: string) =>
      deleteObject(this.token, bucketName, objectKey, this.debug),
  };

  sql = {
    create: (name: string) => createEdgeDB(this.token, name, this.debug),
    delete: (id: number) => deleteEdgeDB(this.token, id, this.debug),
    get: (id: number) => getEdgeDB(this.token, id, this.debug),
    getAll: (params?: { ordering?: string; page?: number; page_size?: number; search?: string }) =>
      getAllEdgeDBs(this.token, params, this.debug),
    query: (id: number, statements: string[]) => queryEdgeDB(this.token, id, statements, this.debug),
  };
}

export { Azion, Azion as default };
