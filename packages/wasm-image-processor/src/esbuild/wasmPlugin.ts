/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import path from 'node:path';

const WasmPlugin: any = {
  name: 'wasm',
  setup(build: any) {
    // Resolve ".wasm" files to a path with a namespace
    build.onResolve({ filter: /\.wasm$/ }, (args: any) => {
      // If this is the import inside the stub module, import the
      // binary itself. Put the path in the "wasm-binary" namespace
      // to tell our binary load callback to load the binary file.
      if (args.namespace === 'wasm-stub') {
        return {
          path: args.path,
          namespace: 'wasm-binary',
        };
      }

      // Otherwise, generate the JavaScript stub module for this
      // ".wasm" file. Put it in the "wasm-stub" namespace to tell
      // our stub load callback to fill it with JavaScript.
      //
      // Resolve relative paths to absolute paths here since this
      // resolve callback is given "resolveDir", the directory to
      // resolve imports against.
      if (args.resolveDir === '') {
        return; // Ignore unresolvable paths
      }
      return {
        path: path.isAbsolute(args.path) ? args.path : path.join(args.resolveDir, args.path),
        namespace: 'wasm-stub',
      };
    });

    build.onLoad({ filter: /.*/, namespace: 'wasm-stub' }, async (args: any) => ({
      contents: `import wasm from ${JSON.stringify(args.path)}; export default wasm`,
    }));

    build.onLoad({ filter: /.*/, namespace: 'wasm-binary' }, async (args: any) => ({
      contents: await fs.promises.readFile(args.path),
      loader: 'binary',
    }));
  },
};

export default WasmPlugin;
