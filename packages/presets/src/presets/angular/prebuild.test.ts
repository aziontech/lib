import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import type { BuildConfiguration, BuildContext } from '@aziontech/config';
import { createTempProject } from '../__helpers__/tempProject';
import prebuild from './prebuild';

const skipCtx = { skipFrameworkBuild: true } as BuildContext;
const buildConfig = {} as BuildConfiguration;

describe('angular prebuild with skipFrameworkBuild', () => {
  let project: ReturnType<typeof createTempProject>;

  beforeEach(() => {
    project = createTempProject();
  });

  afterEach(() => {
    project.cleanup();
  });

  it('keeps a build that is already at the dist root', async () => {
    project.write({ 'dist/index.html': '<html></html>', 'dist/main.js': 'console.log(1)' });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('dist')).toEqual(['index.html', 'main.js']);
  });

  it('moves dist/<project>/browser to the dist root (application builder)', async () => {
    project.write({
      'dist/my-app/browser/index.html': '<html></html>',
      'dist/my-app/browser/chunk.js': 'console.log(1)',
    });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('dist')).toEqual(['chunk.js', 'index.html']);
  });

  it('moves dist/<project> to the dist root (browser builder)', async () => {
    project.write({ 'dist/my-app/index.html': '<html></html>', 'dist/my-app/main.js': 'console.log(1)' });

    await prebuild(buildConfig, skipCtx);

    expect(project.list('dist')).toEqual(['index.html', 'main.js']);
  });

  it('creates an empty dist when there is no previous build', async () => {
    await prebuild(buildConfig, skipCtx);

    expect(project.list('dist')).toEqual([]);
  });
});
