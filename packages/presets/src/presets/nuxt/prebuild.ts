import { AzionPrebuildResult, BuildConfiguration, BuildContext } from '@aziontech/config';
import { exec } from '@aziontech/utils/node';
import { existsSync } from 'fs';
import { mkdir, readFile, readdir } from 'fs/promises';
import { dirname, join } from 'path';

const NUXT_CONFIG_FILES = ['nuxt.config.js', 'nuxt.config.ts', 'nuxt.config.mjs', 'nuxt.config.cjs'];
const PATHS = {
  // Candidate locations of the Nuxt app manifest (`<dir>/<buildId>.json`), in priority order:
  // 1. final build output, independent of `buildDir` (Nuxt 4.5.x and 4.6.x)
  // 2. Nuxt >= 4.6 builds into the cache dir when `.nuxt` already exists
  // 3. default `buildDir` (Nuxt <= 4.5.x)
  MANIFEST_DIRS: [
    '.output/public/_nuxt/builds/meta',
    'node_modules/.cache/nuxt/.nuxt/manifest/meta',
    '.nuxt/manifest/meta',
  ],
  OUTPUT_DIR: '.output/public',
  SERVER_ENTRY: '.output/server/index.mjs',
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

async function readManifestFromDir(dirManifest: string) {
  let manifestFile: string | undefined;

  // `latest.json` sits next to the `meta` dir and points to the current build id.
  // Prefer it to avoid reading a stale manifest when more than one build id is present.
  try {
    const latest = JSON.parse(await readFile(join(dirname(dirManifest), 'latest.json'), 'utf8'));
    if (typeof latest?.id === 'string' && existsSync(join(dirManifest, `${latest.id}.json`))) {
      manifestFile = `${latest.id}.json`;
    }
  } catch {
    // no latest.json, fall back to the first manifest file found
  }

  if (!manifestFile) {
    const files = await readdir(dirManifest);
    manifestFile = files.find((file) => file.endsWith('.json'));
  }
  if (!manifestFile) {
    throw new Error(`No manifest file found in ${dirManifest}`);
  }

  return JSON.parse(await readFile(join(dirManifest, manifestFile), 'utf8'));
}

async function readManifest(dirs: readonly string[] = PATHS.MANIFEST_DIRS) {
  for (const dir of dirs) {
    try {
      return await readManifestFromDir(dir);
    } catch {
      // try next candidate
    }
  }
  throw new Error(`Nuxt manifest not found in: ${dirs.join(', ')}`);
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
        const manifest = await readManifest();
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
    try {
      const manifest = await readManifest();
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
}

export default prebuild;
