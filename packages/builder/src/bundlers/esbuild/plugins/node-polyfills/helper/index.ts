import { getAbsoluteDirPath } from '@aziontech/utils/node';
import path from 'path';

const getAbsolutePath = (moving: string, internalPath?: string) => {
  const pathDir = path.join(getAbsoluteDirPath(import.meta.url, 'builder'), moving);

  return `${pathDir}${internalPath ? `${internalPath}` : ''}`;
};

export default { getAbsolutePath };
