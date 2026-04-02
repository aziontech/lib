import { readFileSync } from 'fs';
import { createRequire } from 'module';

const requireCustom = createRequire(import.meta.url);

/**
 * Generates webpack banner content from multiple files
 * @param filesPaths - Array of file paths to read and concatenate
 * @returns Concatenated content from all files
 * @throws Error if any file cannot be read
 */
export function generateWebpackBanner(filesPaths: string[]): string {
  try {
    return filesPaths
      .map((filePath) => {
        // Resolve package exports (e.g., @aziontech/bundler/polyfills/...)
        const resolved = requireCustom.resolve(filePath);
        return readFileSync(resolved, 'utf-8');
      })
      .join('\n');
  } catch (error: unknown) {
    throw new Error(`Failed to generate webpack banner: ${error instanceof Error ? error.message : String(error)}`);
  }
}
