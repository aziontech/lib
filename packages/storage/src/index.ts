import {
  createBucket,
  deleteBucket,
  deleteObject,
  getAllBuckets,
  getAllObjects,
  // getBucketByName,
  getObjectByName,
  patchBucket,
  postObject,
  putObject,
} from './services';

const resolveToken = (token?: string) => {
  return token ?? process.env.AZION_TOKEN ?? '';
};
const resolveDebug = (debug: boolean = false) => debug || !!process.env.AZION_DEBUG;

const createBucketMethod = (token: string, name: string, edge_access: string, debug: boolean) =>
  createBucket(resolveToken(token), name, edge_access, resolveDebug(debug));

const deleteBucketMethod = (token: string, name: string, debug: boolean) =>
  deleteBucket(resolveToken(token), name, resolveDebug(debug));

const getAllBucketsMethod = (token: string, options?: BucketCollectionOptions, debug?: boolean) =>
  getAllBuckets(resolveToken(token), options, resolveDebug(debug));

const getBucketByNameMethod = async (token: string, name: string, debug: boolean) => {
  // const bucket = await getBucketByName(resolveToken(token), name, resolveDebug(debug));
  return {
    name: name,
    listObjects: () => getAllObjectsMethod(token, name, debug),
    uploadObject: (objectKey: string, file: string) => postObjectMethod(token, name, objectKey, file, debug),
    getObject: (objectKey: string) => getObjectByNameMethod(token, name, objectKey, debug),
    updateObject: (objectKey: string, file: string) => putObjectMethod(token, name, objectKey, file, debug),
    deleteObject: (objectKey: string) => deleteObjectMethod(token, name, objectKey, debug),
  };
};

const patchBucketMethod = (token: string, name: string, edge_access: string, debug: boolean) =>
  patchBucket(resolveToken(token), name, edge_access, resolveDebug(debug));

const getAllObjectsMethod = (token: string, bucketName: string, debug: boolean) =>
  getAllObjects(resolveToken(token), bucketName, resolveDebug(debug));

const postObjectMethod = (token: string, bucketName: string, objectKey: string, file: string, debug: boolean) =>
  postObject(resolveToken(token), bucketName, objectKey, file, resolveDebug(debug));

const getObjectByNameMethod = (token: string, bucketName: string, objectKey: string, debug: boolean) =>
  getObjectByName(resolveToken(token), bucketName, objectKey, resolveDebug(debug));

const putObjectMethod = (token: string, bucketName: string, objectKey: string, file: string, debug: boolean) =>
  putObject(resolveToken(token), bucketName, objectKey, file, resolveDebug(debug));

const deleteObjectMethod = (token: string, bucketName: string, objectKey: string, debug: boolean) =>
  deleteObject(resolveToken(token), bucketName, objectKey, resolveDebug(debug));

const storage = (token?: string, debug: boolean = false) => {
  const tokenValue = resolveToken(token);
  const debugValue = resolveDebug(debug);

  return {
    getAll: (options?: BucketCollectionOptions) => getAllBucketsMethod(tokenValue, options, debugValue),
    create: (name: string, edge_access: string) => createBucketMethod(tokenValue, name, edge_access, debugValue),
    update: (name: string, edge_access: string) => patchBucketMethod(tokenValue, name, edge_access, debugValue),
    delete: (name: string) => deleteBucketMethod(tokenValue, name, debugValue),
    get: (name: string) => getBucketByNameMethod(tokenValue, name, debugValue),
    getAllObjects: (bucketName: string) => getAllObjectsMethod(tokenValue, bucketName, debugValue),
    postObject: (bucketName: string, objectKey: string, file: string) =>
      postObjectMethod(tokenValue, bucketName, objectKey, file, debugValue),
    getObjectByName: (bucketName: string, objectKey: string) =>
      getObjectByNameMethod(tokenValue, bucketName, objectKey, debugValue),
    putObject: (bucketName: string, objectKey: string, file: string) =>
      putObjectMethod(tokenValue, bucketName, objectKey, file, debugValue),
    deleteObject: (bucketName: string, objectKey: string) =>
      deleteObjectMethod(tokenValue, bucketName, objectKey, debugValue),
  };
};

const createBucketWrapper = (name: string, edge_access: string, debug: boolean) =>
  createBucket(resolveToken(), name, edge_access, resolveDebug(debug));

const deleteBucketWrapper = (name: string, debug: boolean) => deleteBucket(resolveToken(), name, resolveDebug(debug));

const getAllBucketsWrapper = (options?: BucketCollectionOptions, debug?: boolean) =>
  getAllBuckets(resolveToken(), options, resolveDebug(debug));

const getBucketByNameWrapper = async (name: string, debug: boolean) => {
  const bucket = await getBucketByNameMethod(resolveToken(), name, resolveDebug(debug));
  if (bucket) {
    return {
      ...bucket,
      listObjects: () => getAllObjectsWrapper(name, debug),
      uploadObject: (objectKey: string, file: string) => postObjectWrapper(name, objectKey, file, debug),
      getObject: (objectKey: string) => getObjectByNameWrapper(name, objectKey, debug),
      updateObject: (objectKey: string, file: string) => putObjectWrapper(name, objectKey, file, debug),
      deleteObject: (objectKey: string) => deleteObjectWrapper(name, objectKey, debug),
    };
  }
  return null;
};

const patchBucketWrapper = (name: string, edge_access: string, debug: boolean) =>
  patchBucket(resolveToken(), name, edge_access, resolveDebug(debug));

const getAllObjectsWrapper = (bucketName: string, debug: boolean) =>
  getAllObjects(resolveToken(), bucketName, resolveDebug(debug));

const postObjectWrapper = (bucketName: string, objectKey: string, file: string, debug: boolean) =>
  postObject(resolveToken(), bucketName, objectKey, file, resolveDebug(debug));

const getObjectByNameWrapper = (bucketName: string, objectKey: string, debug: boolean) =>
  getObjectByName(resolveToken(), bucketName, objectKey, resolveDebug(debug));

const putObjectWrapper = (bucketName: string, objectKey: string, file: string, debug: boolean) =>
  putObject(resolveToken(), bucketName, objectKey, file, resolveDebug(debug));

const deleteObjectWrapper = (bucketName: string, objectKey: string, debug: boolean) =>
  deleteObject(resolveToken(), bucketName, objectKey, resolveDebug(debug));

export {
  createBucketWrapper as createBucket,
  storage as createClient,
  deleteBucketWrapper as deleteBucket,
  deleteObjectWrapper as deleteObject,
  getAllBucketsWrapper as getAllBuckets,
  getAllObjectsWrapper as getAllObjects,
  getBucketByNameWrapper as getBucketByName,
  getObjectByNameWrapper as getObjectByName,
  patchBucketWrapper as patchBucket,
  postObjectWrapper as postObject,
  putObjectWrapper as putObject,
};
export default storage;
