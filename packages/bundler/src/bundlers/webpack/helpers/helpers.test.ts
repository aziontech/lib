import fs from 'fs';
import tmp from 'tmp';
import { generateWebpackBanner } from './helpers';

describe('generateWebpackBanner', () => {
  let tmpDir: tmp.DirResult;
  let tmpFile1: tmp.FileResult;
  let tmpFile2: tmp.FileResult;

  beforeEach(async () => {
    tmpDir = tmp.dirSync();
    tmpFile1 = tmp.fileSync({
      postfix: '.js',
      dir: tmpDir.name,
      name: 'file1.js',
    });
    tmpFile2 = tmp.fileSync({
      postfix: '.js',
      dir: tmpDir.name,
      name: 'file2.js',
    });
  });

  afterEach(async () => {
    tmpFile1.removeCallback();
    tmpFile2.removeCallback();
    tmpDir.removeCallback();
  });

  it('should generate a webpack banner', () => {
    fs.writeFileSync(tmpFile1.name, 'file-1-content');
    fs.writeFileSync(tmpFile2.name, 'file-2-content');
    const arrayOfPaths = [tmpFile1.name, tmpFile2.name];

    const bannerArray = generateWebpackBanner(arrayOfPaths);

    expect(bannerArray).toBe('file-1-content\nfile-2-content');
  });
});
