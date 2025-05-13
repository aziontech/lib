/* eslint-disable @typescript-eslint/no-explicit-any */
import { BuildConfiguration, BuildContext } from 'azion/config';
import { promises as fs, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function postbuild(config: BuildConfiguration, ctx: BuildContext) {
  const fixImportUnsupported = async () => {
    // based on: https://github.com/cloudflare/next-on-pages/blob/main/packages/next-on-pages/src/buildApplication/processVercelFunctions/dedupeEdgeFunctions.ts#L462
    // TODO: This hack is not good. We should replace this with something less brittle ASAP
    // https://github.com/vercel/next.js/blob/2e7dfca362931be99e34eccec36074ab4a46ffba/packages/next/src/server/web/adapter.ts#L276-L282
    const pattern =
      /Object\.defineProperty\(\s*globalThis\s*,\s*"__import_unsupported"[\s\S]*?,\s*configurable\s*:\s*[^}]*\}\)/gm;
    const replacement = 'true';
    const entryFiles = config.entry as Record<string, string>;

    for (const filePath of Object.keys(entryFiles)) {
      try {
        const filePathWithExt = filePath.endsWith('.js') ? filePath : `${filePath}.js`;
        const absolutePath = resolve(filePathWithExt);

        const sourceCode = readFileSync(absolutePath, 'utf-8');
        const modifiedCode = sourceCode.replace(pattern, replacement);
        writeFileSync(absolutePath, modifiedCode);
      } catch (error) {
        throw new Error(`Failed to process file ${filePath}: ${error}`);
      }
    }
  };

  const getEnvFileName = () => {
    switch (process.env.NODE_ENV) {
      case 'production':
        return '.env.production';
      case 'staging':
        return '.env.staging';
      default:
        return '.env.local';
    }
  };

  const copyEnvFile = async () => {
    const envFiles = [getEnvFileName(), '.env'];
    const targetEnvPath = join('.edge', '.env');

    for (const envFile of envFiles) {
      const sourcePath = resolve(envFile);
      try {
        await fs.access(sourcePath);
        await fs.copyFile(sourcePath, targetEnvPath);
        return;
      } catch {
        continue;
      }
    }
  };

  await fixImportUnsupported();
  await copyEnvFile();
}

export default postbuild;
