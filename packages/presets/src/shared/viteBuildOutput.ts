import { lstat, readFile } from 'fs/promises';
import { join } from 'path';

const VITE_CONFIG_FILES = ['vite.config.ts', 'vite.config.js'];

/**
 * Check if a vite.config file exists in the current working directory
 */
export async function viteConfigExists(): Promise<boolean> {
  const checks = VITE_CONFIG_FILES.map((file) =>
    lstat(file).then(
      () => true,
      () => false,
    ),
  );
  return (await Promise.all(checks)).includes(true);
}

/**
 * Returns the index of the bracket that closes the one opened at `openIndex`,
 * ignoring brackets inside string literals. Returns -1 if it is never closed.
 */
function findClosingBrace(source: string, openIndex: number): number {
  let depth = 0;
  let quote: string | null = null;

  for (let i = openIndex; i < source.length; i++) {
    const char = source[i];

    if (quote) {
      if (char === '\\') i++;
      else if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') quote = char;
    else if (char === '{') depth++;
    else if (char === '}' && --depth === 0) return i;
  }

  return -1;
}

/**
 * Extracts the literal `build.outDir` value from the source of a vite config.
 * Tolerates any formatting (quotes, trailing commas, multiline, `build` as the last property)
 * and returns undefined when the value is not a plain string literal (e.g. computed values).
 */
export function parseViteOutDir(source: string): string | undefined {
  const buildMatch = /\bbuild\s*:\s*\{/.exec(source);
  if (!buildMatch) return undefined;

  const openIndex = buildMatch.index + buildMatch[0].length - 1;
  const closeIndex = findClosingBrace(source, openIndex);
  if (closeIndex === -1) return undefined;

  const buildBody = source.slice(openIndex + 1, closeIndex);
  const outDirMatch = /\boutDir\s*:\s*(['"`])([^'"`]+)\1/.exec(buildBody);

  return outDirMatch?.[2].trim() || undefined;
}

/**
 * Read the `build.outDir` declared in vite.config.
 * @returns the declared outDir, or undefined when there is no config or no literal outDir
 */
export async function readViteOutDir(): Promise<string | undefined> {
  for (const file of VITE_CONFIG_FILES) {
    try {
      return parseViteOutDir(await readFile(join(process.cwd(), file), 'utf-8'));
    } catch {
      // file does not exist, try the next one
    }
  }
  return undefined;
}

/**
 * Throws a descriptive error when the vite build output folder was not generated,
 * so a mismatch between the build and the declared outDir is not reported as a bare copy failure.
 */
export async function assertOutDirExists(outDir: string): Promise<void> {
  const exists = await lstat(outDir).then(
    () => true,
    () => false,
  );
  if (!exists) {
    throw new Error(
      `Build output directory "${outDir}" was not found. ` +
        'Check that "build.outDir" in your vite.config matches where the build writes its output.',
    );
  }
}
