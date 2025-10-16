import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'pathe';

export default {
  extends: 'static',
  output: {
    dir: '{{ rootDir }}/.output',
    publicDir: '{{ output.dir }}/public/{{ baseURL }}',
  },
  commands: {
    preview: 'azion dev',
    deploy: 'azion deploy --local',
  },
  hooks: {
    'build:before': async (nitro) => {
      const serverDir = resolve(nitro.options.output.dir, 'server');
      const indexFile = resolve(serverDir, 'index.mjs');
      await mkdir(serverDir, { recursive: true });

      // this to local preview
      const fileHandler = `
          export default {
            async fetch(request, env, context) {
              const requestPath = new URL(request.url).pathname;
              const cleanRequestPath = requestPath.endsWith('/') ? requestPath.slice(0, -1) : requestPath;  
              const fileExtensionRegex = /\\.[^.]+$/;

              let assetPath;
              if (cleanRequestPath === '') {
                assetPath = new URL('index.html', 'file:///');
              } 
              else if (fileExtensionRegex.test(cleanRequestPath)) {
                assetPath = new URL(cleanRequestPath.slice(1), 'file:///');
              } else {
                assetPath = new URL(cleanRequestPath + '/index.html', 'file:///');
              }
              return fetch(assetPath).catch(() => {
                return fetch(new URL('404.html', 'file:///')).catch(() => {
                  return new Response('Not Found', { status: 404 });
                });
              });
            },
          };
        `;
      await writeFile(indexFile, fileHandler);
    },
  },
};
