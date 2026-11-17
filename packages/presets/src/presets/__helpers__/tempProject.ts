import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';

/**
 * Creates a temporary project directory and makes it the current working directory,
 * so presets that resolve paths relative to `process.cwd()` run against it.
 */
export function createTempProject() {
  const originalCwd = process.cwd();
  const root = mkdtempSync(join(tmpdir(), 'preset-prebuild-'));
  process.chdir(root);

  return {
    root,
    /** Writes files (path -> content) relative to the project root, creating folders as needed. */
    write(files: Record<string, string>) {
      for (const [file, content] of Object.entries(files)) {
        const target = join(root, file);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, content);
      }
    },
    /** Lists, recursively and sorted, the files inside a folder relative to the project root. */
    list(dir: string): string[] {
      const walk = (current: string): string[] =>
        readdirSync(join(root, current), { withFileTypes: true }).flatMap((entry) =>
          entry.isDirectory() ? walk(join(current, entry.name)) : [join(current, entry.name)],
        );
      return walk(dir)
        .map((file) => file.slice(dir.length + 1))
        .sort();
    },
    cleanup() {
      process.chdir(originalCwd);
      rmSync(root, { recursive: true, force: true });
    },
  };
}
