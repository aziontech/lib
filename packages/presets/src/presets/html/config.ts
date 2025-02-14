import { defineConfig } from 'azion/config';

export default defineConfig({
  build: {
    builder: 'webpack',
    preset: 'html',
    polyfills: false,
  },
  origin: [
    {
      name: 'origin-storage-default',
      type: 'object_storage',
    },
  ],
  rules: {
    request: [
      {
        name: 'Set Storage Origin for All Requests',
        match: '^\\/',
        behavior: {
          setOrigin: {
            name: 'origin-storage-default',
            type: 'object_storage',
          },
        },
      },
    ],
  },
});
