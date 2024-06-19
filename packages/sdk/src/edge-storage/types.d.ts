interface Bucket {
  name: string;
  edge_access: string;
  listObjects: () => Promise<BucketObject[]>;
  uploadObject: (objectKey: string, file: string) => Promise<BucketObject>;
  getObject: (objectKey: string) => Promise<BucketObject>;
  updateObject: (objectKey: string, file: string) => Promise<BucketObject>;
  deleteObject: (objectKey: string) => Promise<void>;
}

interface BucketCollectionOptions {
  size?: number;
  page?: number;
}
interface BucketObject {
  key: string;
  size: number;
  last_modified: string;
  content_type: string;
}
