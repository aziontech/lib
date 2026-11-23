import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import type { BuildConfiguration, BuildContext } from '@aziontech/config';
import { createTempProject } from '../__helpers__/tempProject';
import prebuild from './prebuild';

const skipCtx = { skipFrameworkBuild: true } as BuildContext;
const buildConfig = {} as BuildConfiguration;

describe('react prebuild with skipFrameworkBuild', () => {
  let project: ReturnType<typeof createTempProject>;

  beforeEach(() => {
    project = createTempProject();
  });

  afterEach(() => {
    project.cleanup();
  });

  it('copies the dist folder of a Vite project to .edge/assets', async () => {
    project.write({
      'vite.config.ts': `import { defineConfig } from 'vite';\nexport default defineConfig({ plugins: [] });\n`,
      'dist/index.html': '<html></html>',
    });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual(['index.html']);
  });

  it('copies the outDir when vite.config is formatted with double quotes and trailing commas', async () => {
    project.write({
      'vite.config.js': `import { defineConfig } from "vite";\nexport default defineConfig({\n  build: {\n    outDir: "./build",\n  },\n  plugins: [],\n});\n`,
      'build/index.html': '<html></html>',
    });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual(['index.html']);
  });

  it('copies the outDir declared in vite.config', async () => {
    project.write({
      'vite.config.ts': `import { defineConfig } from 'vite';\nexport default defineConfig({\n  build: { outDir: 'out' },\n});\n`,
      'out/index.html': '<html></html>',
    });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual(['index.html']);
  });

  it('copies the build folder of a CRA project to .edge/assets', async () => {
    project.write({ 'build/index.html': '<html></html>', 'build/static/js/main.js': 'console.log(1)' });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual(['index.html', 'static/js/main.js']);
  });

  it('creates an empty .edge/assets when there is no previous build', async () => {
    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual([]);
  });
});
