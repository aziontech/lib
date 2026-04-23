import { existsSync, promises as fsPromises, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path, { join } from 'path';
import { fileURLToPath } from 'url';

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
  } catch {
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

function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export default generateTimestamp;

function getAbsoluteDirPath() {
  const currentModuleUrl = new URL(import.meta.url);
  const currentFilePath = fileURLToPath(currentModuleUrl);
  return path.dirname(currentFilePath);
}

/**
 * Moves all import and require statements to the top of the file while preserving comments.
 * This helps maintain a consistent module initialization pattern.
 *
 * @param sourceCode - The source code content to be reorganized
 * @returns The reorganized source code with imports/requires at the top
 */
function moveModuleImportsToTop(sourceCode: string): string {
  const importRegex = /import\s+.*?from\s*['"](.*?)['"];?/g;
  const requireRegex = /(const\s+.*?=\s*require\(.*\).*);/g;

  const importStatements = [...sourceCode.matchAll(importRegex)].map((match) => match[0]);
  const requireStatements = [...sourceCode.matchAll(requireRegex)].map((match) => match[0]);

  const codeWithoutImports = sourceCode.replace(importRegex, '').replace(requireRegex, '');

  return [...importStatements, ...requireStatements, codeWithoutImports].join('\n');
}

/**
 * Checks if a specific event listener exists in the source code.
 *
 * @param eventType - The event type to find (e.g., 'fetch', 'firewall')
 * @param sourceCode - The source code to analyze
 * @returns boolean indicating if the event was found
 */
function hasEventListener(eventType: string, sourceCode: string): boolean {
  const eventPattern = new RegExp(`addEventListener\\(['"]${eventType}['"]`, 'g');
  return eventPattern.test(sourceCode);
}

/**
 * Transforms event listener declarations in source code by replacing specified event types.
 * Optimized for Cloudflare Workers and Edge environments.
 *
 * @param options - Configuration options
 * @param options.event - The event type to find (e.g., 'fetch', 'scheduled')
 * @param options.newEvent - The event type to replace with
 * @param options.source - The source code to analyze
 * @returns The modified source code with replaced event
 */
function transformEventListener({
  event: originalEvent,
  newEvent,
  source,
}: {
  event: string;
  newEvent: string;
  source: string;
}): string {
  const eventPattern = new RegExp(`addEventListener\\(['"]${originalEvent}['"]`, 'g');
  return source.replace(eventPattern, `addEventListener("${newEvent}"`);
}

export {
  ensureEdgeFunctionEnvFile,
  generateTimestamp,
  getAbsoluteDirPath,
  hasEventListener,
  isDirectoryInProjectRoot,
  isProjectUsingCommonJS,
  moveModuleImportsToTop,
  transformEventListener,
};
