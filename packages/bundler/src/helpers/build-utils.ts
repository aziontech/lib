import { existsSync, promises as fsPromises, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function ensureEdgeFunctionEnvFile() {
  const projectRoot = process.cwd();
  const edgeDirPath = join(projectRoot, '.edge');
  const envFilePath = join(edgeDirPath, '.env');

  if (!existsSync(envFilePath)) {
    mkdirSync(edgeDirPath, { recursive: true });
    writeFileSync(envFilePath, '');
  }
}

async function isDirectoryInProjectRoot(directoryName: string) {
  const dirPath = join(process.cwd(), directoryName);

  try {
    const stats = await fsPromises.stat(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}
function isProjectUsingCommonJS() {
  const packageJsonPath = join(process.cwd(), 'package.json');
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return packageJson.type !== 'module'; // Returns true for 'commonjs' or no 'type' specified
  }
  return true; // Default to CommonJS if 'package.json' does not exist or 'type' key is absent
}

export { ensureEdgeFunctionEnvFile, isDirectoryInProjectRoot, isProjectUsingCommonJS };
