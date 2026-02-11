import { createViteConfig } from '@lib/vite-config';
import { defineConfig } from 'vite';
import wasmPlugin from './src/vite/wasmPlugin';

const baseConfig = createViteConfig({
  dirname: __dirname,
  ssr: true,
});

export default defineConfig({
  ...baseConfig,
  plugins: [wasmPlugin(), ...baseConfig.plugins],
});
