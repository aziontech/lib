import fs from 'fs';
import mockFs from 'mock-fs';
import copyDirectory from './copyDirectory';

describe('copyDirectory', () => {
  afterEach(() => {
    mockFs.restore();
  });

  it('should copy a directory to the target directory', () => {
    const source = 'path/to/source';
    const target = 'path/to/target';

    mockFs({
      [source]: {
        'file.txt': 'file content',
        subdir: {
          'file2.txt': 'file2 content',
        },
      },
      [target]: {},
    });

    copyDirectory(source, target);

    expect(fs.readdirSync(target)).toEqual(['file.txt', 'subdir']);
    expect(fs.readFileSync(`${target}/file.txt`, 'utf8')).toBe('file content');
    expect(fs.readdirSync(`${target}/subdir`)).toEqual(['file2.txt']);
    expect(fs.readFileSync(`${target}/subdir/file2.txt`, 'utf8')).toBe('file2 content');
  });

  it('should not copy the target directory if ignoreFiles is provided', () => {
    const source = 'path/to/source';
    const target = 'path/to/target';

    mockFs({
      [source]: {
        'file.txt': 'file content',
        subdir: {
          'file2.txt': 'file2 content',
        },
      },
      [target]: {},
    });

    copyDirectory(source, target, ['subdir']);

    expect(fs.existsSync(`${target}/subdir/file2.txt`)).toBe(false);
    expect(fs.readdirSync(target)).toEqual(['file.txt']);
  });
});
