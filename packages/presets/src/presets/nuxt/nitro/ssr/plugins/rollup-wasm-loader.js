/* eslint-disable */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

export function rollupWasmLoader(options = {}) {
  const { outputDir = '.output/public' } = options;

  return {
    name: 'rollup-wasm-loader',
    enforce: 'pre',

    resolveId(id, importer) {
      // Intercepts WASM file imports
      if (id.includes('.wasm')) {
        let cleanId = id;

        cleanId = cleanId.replace('unwasm:external:', '');
        cleanId = cleanId.replace('unwasm:', '');
        cleanId = cleanId.replace(/\x00/g, '');
        cleanId = cleanId.split('?')[0];

        if (cleanId.length > 100) {
          const wasmMatch = cleanId.match(/([^\/\\-]+)\.wasm/);
          if (wasmMatch) {
            cleanId = `${wasmMatch[1]}.wasm`;
          }
        }

        let wasmPath = cleanId;

        if (cleanId.startsWith('@') || cleanId.includes('node_modules')) {
          const packageMatch = cleanId.match(/(@[^/]+\/[^/]+|[^/]+)\/(.+)/);
          if (packageMatch) {
            wasmPath = resolve(process.cwd(), 'node_modules', packageMatch[1], packageMatch[2]);
          } else {
            wasmPath = resolve(process.cwd(), 'node_modules', cleanId);
          }
        } else if (importer && !cleanId.startsWith('/')) {
          try {
            wasmPath = resolve(dirname(importer.replace(/\x00/g, '')), cleanId);
          } catch {
            wasmPath = resolve(process.cwd(), 'node_modules', cleanId);
          }
        }

        console.log(`[rollup-wasm-loader] Intercepting: ${id.substring(0, 50)}... -> ${cleanId}`);
        console.log(`[rollup-wasm-loader] Resolved path: ${wasmPath}`);

        return `\0wasm:${basename(cleanId)}:${wasmPath}`;
      }

      return null;
    },

    load(id) {
      if (id.startsWith('\0wasm:')) {
        const parts = id.replace('\0wasm:', '').split(':');
        const fileName = parts[0];
        const sourcePath = parts[1];

        console.log(`[rollup-wasm-loader] Processing: ${fileName}`);
        console.log(`[rollup-wasm-loader] Source path: ${sourcePath}`);
        console.log(`[rollup-wasm-loader] File exists: ${sourcePath ? existsSync(sourcePath) : 'N/A'}`);

        if (sourcePath && existsSync(sourcePath)) {
          try {
            const destDir = resolve(process.cwd(), outputDir);
            const destPath = resolve(destDir, fileName);

            console.log(`[rollup-wasm-loader] Destination directory: ${destDir}`);
            console.log(`[rollup-wasm-loader] Destination file: ${destPath}`);

            if (!existsSync(destDir)) {
              mkdirSync(destDir, { recursive: true });
              console.log(`[rollup-wasm-loader] Directory created: ${destDir}`);
            }

            // Copy file
            copyFileSync(sourcePath, destPath);
            console.log(`[rollup-wasm-loader] ✅ Copied: ${sourcePath} -> ${destPath}`);

            // Verify if it was copied
            if (existsSync(destPath)) {
              console.log(`[rollup-wasm-loader] ✅ Confirmed: file exists at ${destPath}`);
            } else {
              console.error(`[rollup-wasm-loader] ❌ Error: file was not copied to ${destPath}`);
            }
          } catch (error) {
            console.error(`[rollup-wasm-loader] ❌ Error copying ${fileName}:`, error.message);
            console.error(`[rollup-wasm-loader] Stack:`, error.stack);
          }
        } else {
          console.warn(`[rollup-wasm-loader] ⚠️  Source file not found: ${sourcePath}`);
          console.warn(`[rollup-wasm-loader] ⚠️  Generating reference without copy for: ${fileName}`);
        }

        // Return simple code that only exports file:///
        return {
          code: `export default 'file:///${fileName}';`,
          map: null,
        };
      }

      return null;
    },

    transform(code, id) {
      // Block any unwasm transformation
      if (
        id.startsWith('\0wasm:') ||
        id.includes('.wasm') ||
        id.includes('wasm/') ||
        /[a-f0-9]{16}-[a-f0-9]{16}\.wasm/.test(id)
      ) {
        return { code, map: null };
      }

      return null;
    },
  };
}

export default rollupWasmLoader;
