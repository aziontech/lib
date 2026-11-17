import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import type { BuildConfiguration, BuildContext } from '@aziontech/config';
import { createTempProject } from '../__helpers__/tempProject';
import prebuild from './prebuild';

const skipCtx = { skipFrameworkBuild: true } as BuildContext;
const buildConfig = {} as BuildConfiguration;

describe('vitepress prebuild with skipFrameworkBuild', () => {
  let project: ReturnType<typeof createTempProject>;

  beforeEach(() => {
    project = createTempProject();
  });

  afterEach(() => {
    project.cleanup();
  });

  it('copies the root .vitepress/dist folder to .edge/assets', async () => {
    project.write({ '.vitepress/dist/index.html': '<html></html>', '.vitepress/dist/assets/app.js': 'console.log(1)' });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual(['assets/app.js', 'index.html']);
  });

  it('copies docs/.vitepress/dist when the project uses a docs folder', async () => {
    project.write({ 'docs/.vitepress/dist/index.html': '<html></html>' });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual(['index.html']);
  });

  it('creates an empty .edge/assets when there is no previous build', async () => {
    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual([]);
  });
});
