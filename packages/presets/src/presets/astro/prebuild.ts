import { BuildConfiguration, BuildContext } from 'azion/config';
import { exec, getPackageManager } from 'azion/utils/node';
import { constants } from 'fs';
import { access, mkdir, readFile } from 'fs/promises';

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

async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  try {
    const [packageManager, outDir] = await Promise.all([getPackageManager(), getAstroOutDir()]);

    // If skipFrameworkBuild is true, we need to create the dist folder
    if (ctx.skipFrameworkBuild) {
      await mkdir(outDir, { recursive: true });
      return;
    }

    await exec(`${packageManager} run build`, {
      scope: 'Astro',
      verbose: true,
    });
  } catch (error) {
    throw new Error(`Error during Astro prebuild: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default prebuild;
