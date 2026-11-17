import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import type { BuildConfiguration, BuildContext } from '@aziontech/config';
import { createTempProject } from '../__helpers__/tempProject';
import prebuild from './prebuild';

const skipCtx = { skipFrameworkBuild: true } as BuildContext;
const buildConfig = {} as BuildConfiguration;

describe('qwik prebuild with skipFrameworkBuild', () => {
  let project: ReturnType<typeof createTempProject>;

  beforeEach(() => {
    project = createTempProject();
  });

  afterEach(() => {
    project.cleanup();
  });

  it('copies the dist folder to .edge/assets', async () => {
    project.write({ 'dist/index.html': '<html></html>', 'dist/build/q-abc.js': 'console.log(1)' });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual(['build/q-abc.js', 'index.html']);
  });

  it('creates an empty .edge/assets when there is no previous build', async () => {
    await prebuild(buildConfig, skipCtx);

    expect(project.list('.edge/assets')).toEqual([]);
  });
});
