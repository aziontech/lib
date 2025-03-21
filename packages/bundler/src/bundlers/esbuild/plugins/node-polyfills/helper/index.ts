import { getAbsoluteDirPath } from 'azion/utils/node';
import path from 'path';

const getAbsolutePath = (moving: string, internalPath?: string) => {
  const pathDir = path.join(getAbsoluteDirPath(import.meta.url, 'bundler'), moving);
  return `${pathDir}${internalPath ? `${internalPath}` : ''}`;
};

export default { getAbsolutePath };
