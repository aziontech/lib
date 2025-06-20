import { copyDirectory, exec, getPackageManager } from 'azion/utils/node';
import { constants } from 'fs';
import { access, readFile } from 'fs/promises';

const CONFIG_FILES = ['astro.config.ts', 'astro.config.mjs', 'astro.config.js', 'astro.config.cjs'] as const;

async function getAstroOutDir(): Promise<string> {
  for (const configFile of CONFIG_FILES) {
    try {
      await access(configFile, constants.F_OK);
      const configContent = await readFile(configFile, 'utf-8');

      // Regex supports: outDir: 'path', outDir:"path", outDir: `path`
      const outDirMatch = configContent.match(/outDir\s*:\s*['"`]([^'"`]+)['"`]/);

      if (outDirMatch && outDirMatch[1]) {
        return outDirMatch[1].trim();
      }

      break;
    } catch {
      continue;
    }
  }

  return 'dist'; // Default Astro output directory
}

async function prebuild(): Promise<void> {
  try {
    const [packageManager, outDir] = await Promise.all([getPackageManager(), getAstroOutDir()]);

    const newOutDir = '.edge/storage';

    await exec(`${packageManager} run build`, {
      scope: 'Astro',
      verbose: true,
    });

    copyDirectory(outDir, newOutDir);
  } catch (error) {
    throw new Error(`Error during Astro prebuild: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default prebuild;
