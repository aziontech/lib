import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import type { BuildConfiguration, BuildContext } from '@aziontech/config';
import { createTempProject } from '../__helpers__/tempProject';
import prebuild from './prebuild';

const skipCtx = { skipFrameworkBuild: true } as BuildContext;
const buildConfig = {} as BuildConfiguration;

describe('vuepress prebuild with skipFrameworkBuild', () => {
  let project: ReturnType<typeof createTempProject>;

  beforeEach(() => {
    project = createTempProject();
  });

  afterEach(() => {
    project.cleanup();
  });

  it('copies the root .vuepress/dist folder to .edge/assets', async () => {
    project.write({ '.vuepress/dist/index.html': '<html></html>', '.vuepress/dist/assets/app.js': 'console.log(1)' });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual(['assets/app.js', 'index.html']);
  });

  it('copies docs/.vuepress/dist when the project uses a docs folder', async () => {
    project.write({ 'docs/.vuepress/dist/index.html': '<html></html>' });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual(['index.html']);
  });

  it('creates an empty .edge/assets when there is no previous build', async () => {
    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual([]);
  });

  it('does not delete the previous build output', async () => {
    project.write({ '.vuepress/dist/index.html': '<html></html>' });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('.vuepress/dist')).toEqual(['index.html']);
  });
});
