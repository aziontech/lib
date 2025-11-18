import { AzionPrebuildResult, BuildConfiguration, BuildContext } from 'azion/config';
import { exec, getPackageManager } from 'azion/utils/node';
import { existsSync } from 'fs';
import { mkdir, readFile, rm } from 'fs/promises';

const SVELTE_CONFIG_FILES = ['svelte.config.js', 'svelte.config.ts', 'svelte.config.mjs', 'svelte.config.cjs'];
const AZION_CONFIG_FILES = ['azion.config.js', 'azion.config.ts', 'azion.config.mjs', 'azion.config.cjs'];
const PATHS = {
  BUILD_DIR_DEFAULT: 'build',
  AZION_BUILD_DIR: '.svelte-kit/azion',
  WORKER_FILE: '.svelte-kit/azion/_worker.js',
} as const;

async function readSvelteConfig() {
  try {
    let configPath = '';
    for (const file of SVELTE_CONFIG_FILES) {
      if (existsSync(file)) {
        configPath = file;
        break;
      }
    }

    if (!configPath) {
      throw new Error('Svelte config file not found');
    }

    const content = await readFile(configPath, 'utf8');
    const hasAzionPreset = /azion\/preset\/sveltekit/i.test(content);
    const hasAzionAdapter = /@sveltejs\/adapter-azion/i.test(content);
    const hasAzionConfig = hasAzionPreset || hasAzionAdapter;

    // check if adapater-static and assets,pages config exists
    const hasAdapterStatic = /(adapter-static)/i.test(content);

    // Capture assets and pages directory values
    const assetsMatch = /assets:\s*['"`]([^'"`]+)['"`]/i.exec(content);
    const pagesMatch = /pages:\s*['"`]([^'"`]+)['"`]/i.exec(content);

    const assetsDir = assetsMatch ? assetsMatch[1] : null;
    const pagesDir = pagesMatch ? pagesMatch[1] : null;
    const hasChangedAssetsDir = assetsDir !== null;
    const hasChangedPagesDir = pagesDir !== null;

    if (hasAdapterStatic) {
      return {
        adapter: {
          azion: hasAzionConfig,
          static: true,
          changedAssetsDir: hasChangedAssetsDir,
          changedPagesDir: hasChangedPagesDir,
          assetsDir,
          pagesDir,
        },
      };
    }

    return hasAzionConfig ? { adapter: { azion: true } } : null;
  } catch (err) {
    console.log('Svelte config loading error:', err instanceof Error ? err.message : String(err));
    console.log('Falling back to default config');
    return null;
  }
}

async function readAzionConfig() {
  try {
    let configPath = '';
    for (const file of AZION_CONFIG_FILES) {
      if (existsSync(file)) {
        configPath = file;
        break;
      }
    }

    if (!configPath) {
      throw new Error('Azion config file not found');
    }

    const content = await readFile(configPath, 'utf8');

    // Capture dir value from storage array
    const storageMatch = /storage:\s*\[\s*\{[^}]*dir:\s*['"`]([^'"`]+)['"`]/i.exec(content);
    const storageDir = storageMatch ? storageMatch[1] : null;

    return {
      storageDir,
    };
  } catch (err) {
    console.log('Azion config loading error:', err instanceof Error ? err.message : String(err));
    console.log('Falling back to default config');
    return null;
  }
}

function createAzionPrebuildResult(): AzionPrebuildResult {
  return {
    injection: {
      globals: {
        __AZ_SVELTE_KIT__: JSON.stringify(true),
      },
    },
    filesToInject: [],
    bundler: {
      defineVars: {},
      plugins: [],
    },
  };
}

function createConfigMismatchError(azionDir: string, svelteDir: string, suggestion?: string): Error {
  const message = [
    'Configuration mismatch detected!',
    `Azion storage directory: "${azionDir}"`,
    `Svelte assets directory: "${svelteDir}"`,
    suggestion || 'Please update your azion.config to match the Svelte adapter configuration.',
  ].join('\n');

  return new Error(message);
}

function configureSvelteKitPreset(buildConfig: BuildConfiguration) {
  delete buildConfig.preset.handler;
  buildConfig.preset.config.build!.entry = PATHS.WORKER_FILE;
}

/**
 * Runs custom prebuild actions for Svelte
 */
async function prebuild(buildConfig: BuildConfiguration, ctx: BuildContext): Promise<AzionPrebuildResult | undefined> {
  const packageManager = await getPackageManager();
  const [svelteConfig, azionConfig] = await Promise.all([readSvelteConfig(), readAzionConfig()]);

  // Extract adapter configuration
  const adapter = {
    hasAzion: svelteConfig?.adapter?.azion,
    hasStatic: svelteConfig?.adapter?.static,
    assetsDir: svelteConfig?.adapter?.assetsDir,
    pagesDir: svelteConfig?.adapter?.pagesDir,
    hasChangedAssetsDir: svelteConfig?.adapter?.changedAssetsDir,
    hasChangedPagesDir: svelteConfig?.adapter?.changedPagesDir,
  };

  // Extract storage configuration
  const storage = {
    dir: azionConfig?.storageDir,
  };

  // Adapter static
  if (adapter.hasStatic) {
    const buildDir = adapter.assetsDir || PATHS.BUILD_DIR_DEFAULT;
    await mkdir(buildDir, { recursive: true });
    const normalizeDir = (dir: string) => dir.replace(/^\.\//, '').replace(/\/$/, '');

    // Validate configuration consistency
    const validateDirectoryConsistency = () => {
      // Check if assets and pages directories match (required for adapter-static)
      if (adapter.hasChangedAssetsDir || adapter.hasChangedPagesDir) {
        if (adapter.assetsDir !== adapter.pagesDir) {
          throw new Error(
            'Assets and pages directories must be the same when using @sveltejs/adapter-static.\n' +
              `Current configuration: assets="${adapter.assetsDir}", pages="${adapter.pagesDir}"`,
          );
        }
      }

      const svelteDir = adapter.assetsDir || PATHS.BUILD_DIR_DEFAULT;
      const normalizedSvelteDir = normalizeDir(svelteDir);

      // Case 1: No Azion config exists, but Svelte uses custom directory
      if (!storage.dir && adapter.assetsDir) {
        if (normalizedSvelteDir !== PATHS.BUILD_DIR_DEFAULT) {
          throw createConfigMismatchError(
            PATHS.BUILD_DIR_DEFAULT,
            normalizedSvelteDir,
            'Change the storage config dir option on azion.config or assetsDir option on svelte.config.',
          );
        }
      }

      // Case 2: Azion config exists with custom directory
      if (storage.dir) {
        const normalizedStorageDir = normalizeDir(storage.dir);
        if (normalizedStorageDir !== normalizedSvelteDir) {
          // Clean up incorrect storage directory
          try {
            rm(storage.dir, { recursive: true, force: true }).catch((error) =>
              console.warn(`Failed to clean up directory ${storage.dir}:`, error),
            );
          } catch (error) {
            console.warn(`Failed to clean up directory ${storage.dir}:`, error);
          }

          const suggestion =
            adapter.hasChangedAssetsDir || adapter.hasChangedPagesDir
              ? 'Please update your azion.config to match the Svelte adapter configuration.'
              : 'Please update your azion.config to match the Svelte adapter configuration or assetsDir option on svelte.config.';

          throw createConfigMismatchError(normalizedStorageDir, normalizedSvelteDir, suggestion);
        }
      }
    };

    validateDirectoryConsistency();
  }

  // If skipFrameworkBuild is true, we need to create the dist folder
  if (ctx.skipFrameworkBuild) {
    await mkdir(adapter.assetsDir || PATHS.BUILD_DIR_DEFAULT, { recursive: true });
    if (adapter.hasAzion) {
      try {
        // Check if worker file exists from previous build
        if (existsSync(PATHS.WORKER_FILE)) {
          configureSvelteKitPreset(buildConfig);
          return createAzionPrebuildResult();
        } else {
          console.log('Worker file not found! Please run command build without --skip-framework-build');
          process.exit(1);
        }
      } catch {
        console.log('SvelteKit build artifacts not found! Please run command build without --skip-framework-build');
        process.exit(1);
      }
    }
    return;
  }

  // Azion adapter
  if (adapter.hasAzion) {
    await exec(`${packageManager} run build`, {
      scope: 'SvelteKit',
      verbose: true,
    });
    try {
      // Check if worker file was generated
      if (existsSync(PATHS.WORKER_FILE)) {
        configureSvelteKitPreset(buildConfig);
        return createAzionPrebuildResult();
      } else {
        console.log('Worker file not generated! Please check your SvelteKit adapter configuration');
        process.exit(1);
      }
    } catch {
      console.log('SvelteKit build failed! Please run command build!');
      process.exit(1);
    }
  }
  // Build static files (fallback for non-adapter builds)
  await exec(`${packageManager} run build`, {
    scope: 'Svelte',
    verbose: true,
  });
}

export default prebuild;
