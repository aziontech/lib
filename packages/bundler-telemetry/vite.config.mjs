import { createViteConfig } from '@aziontech/vite-config';

export default createViteConfig({
  dirname: __dirname,
  ssr: true,
  external: ['os', 'fs', 'path'],
});
