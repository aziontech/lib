/* eslint-disable @typescript-eslint/no-explicit-any */
import { BuildConfiguration, BuildContext } from 'azion/config';
import { readFileSync, writeFileSync } from 'fs';

// eslint-disable-next-line no-unused-vars
// TODO: check if we need to use the buildConfig parameter
async function postbuild(config: BuildConfiguration, ctx: BuildContext) {
  const replacements = [
    // based on: https://github.com/cloudflare/next-on-pages/blob/main/packages/next-on-pages/src/buildApplication/processVercelFunctions/dedupeEdgeFunctions.ts#L462
    // TODO: This hack is not good. We should replace this with something less brittle ASAP
    // https://github.com/vercel/next.js/blob/2e7dfca362931be99e34eccec36074ab4a46ffba/packages/next/src/server/web/adapter.ts#L276-L282
    {
      file: ctx.output,
      pattern:
        /Object\.defineProperty\(\s*globalThis\s*,\s*"__import_unsupported"[\s\S]*?,\s*configurable\s*:\s*[^}]*\}\)/gm,
      replacement: 'true',
    },
  ];

  replacements.forEach(({ file, pattern, replacement }: any) => {
    let sourceCode = readFileSync(file, 'utf-8');
    sourceCode = sourceCode.replace(pattern, replacement);
    writeFileSync(file, sourceCode);
  });
}

export default postbuild;
