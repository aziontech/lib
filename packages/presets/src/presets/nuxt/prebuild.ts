import { AzionPrebuildResult, BuildConfiguration, BuildContext } from 'azion/config';
import { copyDirectory, exec } from 'azion/utils/node';
import { existsSync } from 'fs';
import { mkdir, readFile, readdir } from 'fs/promises';

const NUXT_CONFIG_FILES = ['nuxt.config.js', 'nuxt.config.ts', 'nuxt.config.mjs', 'nuxt.config.cjs'];
const PATHS = {
  MANIFEST_DIR: '.nuxt/manifest/meta',
  OUTPUT_DIR: '.output/public',
  SERVER_ENTRY: '.output/server/index.mjs',
  STORAGE_DIR: '.edge/storage',
} as const;

const COMMANDS = {
  BUILD: 'npx nuxt build',
  GENERATE: 'npx nuxt generate',
} as const;

async function readNuxtPreset() {
  try {
    let configPath = '';
    for (const file of NUXT_CONFIG_FILES) {
      if (existsSync(file)) {
        configPath = file;
        break;
      }
    }

    if (!configPath) {
      throw new Error('Nuxt config file not found');
    }

    const content = await readFile(configPath, 'utf8');
    const hasNitroPreset = /nitro\s*:\s*{[^}]*preset\s*:/s.test(content);

    return hasNitroPreset ? { nitro: { preset: true } } : null;
  } catch (err) {
    console.log('Nuxt config loading error:', err instanceof Error ? err.message : String(err));
    console.log('Falling back to default config');
    return null;
  }
}

async function readManifest(dirManifest: string) {
  const files = await readdir(dirManifest);
  const manifestFile = files.find((file) => file.endsWith('.json'));
  const manifest = await readFile(`${dirManifest}/${manifestFile}`, 'utf8');
  return JSON.parse(manifest);
}

function createAzionPrebuildResult(manifest: Record<string, unknown>): AzionPrebuildResult {
  return {
    injection: {
      globals: {
        __AZ_NUXT_MANIFEST__: JSON.stringify(JSON.stringify(manifest)),
      },
    },
    filesToInject: [],
    bundler: {
      defineVars: {},
      plugins: [],
    },
  };
}

function configureNitroPreset(buildConfig: BuildConfiguration) {
  delete buildConfig.preset.handler;
  buildConfig.preset.config.build!.entry = PATHS.SERVER_ENTRY;
}

/**
 * Runs custom prebuild actions for Nuxt
 */
async function prebuild(buildConfig: BuildConfiguration, ctx: BuildContext): Promise<AzionPrebuildResult | undefined> {
  const nuxtConfig = await readNuxtPreset();
  const hasNitroPreset = nuxtConfig?.nitro?.preset;

  // If skipFrameworkBuild is true, we need to create the dist folder
  if (ctx.skipFrameworkBuild) {
    await mkdir(PATHS.OUTPUT_DIR, { recursive: true });
    if (hasNitroPreset) {
      try {
        const manifest = await readManifest(PATHS.MANIFEST_DIR);
        configureNitroPreset(buildConfig);
        return createAzionPrebuildResult(manifest);
      } catch {
        console.log('Manifest file not found! Please run command build without --skip-framework-build');
        process.exit(1);
      }
    }
    return;
  }

  // If nuxt config has nitro preset, we need to build the server
  if (hasNitroPreset) {
    await exec(COMMANDS.BUILD, {
      scope: 'Nuxt',
      verbose: true,
    });
    copyDirectory(PATHS.OUTPUT_DIR, PATHS.STORAGE_DIR);
    try {
      const manifest = await readManifest(PATHS.MANIFEST_DIR);
      configureNitroPreset(buildConfig);
      return createAzionPrebuildResult(manifest);
    } catch {
      console.log('Manifest file not found! Please run command build!');
      process.exit(1);
    }
  }

  // Generate static files
  await exec(COMMANDS.GENERATE, {
    scope: 'Nuxt',
    verbose: true,
  });
  copyDirectory(PATHS.OUTPUT_DIR, PATHS.STORAGE_DIR);
}

export default prebuild;
