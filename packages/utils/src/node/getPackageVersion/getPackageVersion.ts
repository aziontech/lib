import { readFileSync } from 'fs';
import { join } from 'path';

function getPackageVersion(packageName: string) {
  if (!packageName || packageName === '' || packageName === ' ') {
    throw new Error('Invalid package name!');
  }

  const packageJsonPath = join(process.cwd(), 'package.json');
  const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  if (!packageJson.dependencies || !packageJson.dependencies[packageName]) {
    throw new Error(`'${packageName}' not detected in project dependencies!`);
  }

  return packageJson.dependencies[packageName];
}

export default getPackageVersion;
