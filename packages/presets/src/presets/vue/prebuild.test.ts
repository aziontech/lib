import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import type { BuildConfiguration, BuildContext } from '@aziontech/config';
import { createTempProject } from '../__helpers__/tempProject';
import prebuild from './prebuild';

const skipCtx = { skipFrameworkBuild: true } as BuildContext;
const buildConfig = {} as BuildConfiguration;

describe('vue prebuild with skipFrameworkBuild', () => {
  let project: ReturnType<typeof createTempProject>;

  beforeEach(() => {
    project = createTempProject();
  });

  afterEach(() => {
    project.cleanup();
  });

  it('copies the existing dist folder to .edge/assets', async () => {
    project.write({ 'dist/index.html': '<html></html>', 'dist/assets/app.js': 'console.log(1)' });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual(['assets/app.js', 'index.html']);
  });

  it('copies the outDir declared in vite.config', async () => {
    project.write({
      'vite.config.ts': `import { defineConfig } from 'vite';\nexport default defineConfig({\n  build: { outDir: 'out' },\n});\n`,
      'out/index.html': '<html></html>',
    });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual(['index.html']);
  });

  it('creates an empty .edge/assets when there is no previous build', async () => {
    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual([]);
  });
});
