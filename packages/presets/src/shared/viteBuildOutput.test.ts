import { describe, expect, it } from '@jest/globals';
import { parseViteOutDir } from './viteBuildOutput';

describe('parseViteOutDir', () => {
  it('reads a single-line build config', () => {
    expect(parseViteOutDir(`defineConfig({ build: { outDir: 'out' }, plugins: [] })`)).toBe('out');
  });

  it('reads a multiline build config with double quotes and trailing commas', () => {
    const source = `export default defineConfig({
  build: {
    outDir: "./build",
  },
  plugins: [vue()],
});`;
    expect(parseViteOutDir(source)).toBe('./build');
  });

  it('reads outDir when build is the last property and has other keys', () => {
    const source = `export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: true,
    rollupOptions: { output: { manualChunks: {} } },
    outDir: 'public/dist'
  }
})`;
    expect(parseViteOutDir(source)).toBe('public/dist');
  });

  it('ignores an outDir that is not inside the build object', () => {
    expect(parseViteOutDir(`defineConfig({ build: { sourcemap: true }, test: { outDir: 'x' } })`)).toBeUndefined();
  });

  it('returns undefined for computed values or missing build config', () => {
    expect(parseViteOutDir(`defineConfig({ build: { outDir: resolve('a') } })`)).toBeUndefined();
    expect(parseViteOutDir(`defineConfig({ plugins: [] })`)).toBeUndefined();
  });
});
