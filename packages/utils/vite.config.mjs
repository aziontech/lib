import { createViteConfig } from '@lib/vite-config';

export default createViteConfig({
  dirname: __dirname,
  ssr: true,
  entry: {
    index: 'src/index.ts',
    edge: 'src/edge/index.ts',
    node: 'src/node/index.ts',
  },
  external: ['signale'],
});
