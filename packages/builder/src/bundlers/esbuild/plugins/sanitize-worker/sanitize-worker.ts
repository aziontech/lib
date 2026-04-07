import { Plugin, PluginBuild } from 'esbuild';
import fs from 'fs';

const SanitizeWorker = (sanitize: boolean, options?: { outfile?: string }): Plugin => {
  const NAME = 'sanitize-worker';

  const sanitizeUTF8 = (content: string) => {
    let escapedCount = 0;
    const chars = Array.from(content);
    const result = chars
      .map((char) => {
        const codePoint = char.codePointAt(0)!;
        // Escape caracteres fora do Basic Multilingual Plane (BMP)
        if (codePoint >= 0x10000) {
          escapedCount++;
          return `\\u{${codePoint.toString(16)}}`;
        }
        return char;
      })
      .join('');
    return { result, escapedCount };
  };

  const processFile = (filePath: string) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { result, escapedCount } = sanitizeUTF8(content);

    if (escapedCount > 0) {
      console.log(`[sanitize-worker] Escaped ${escapedCount} Unicode character(s) in ${filePath}`);
      fs.writeFileSync(filePath, result, 'utf-8');
    }
  };

  return {
    name: NAME,
    setup(build: PluginBuild) {
      build.onEnd(async (result) => {
        if (!sanitize || result.errors.length > 0) {
          return;
        }
        if (build.initialOptions.entryPoints) {
          for (const filePath of Object.keys(build.initialOptions.entryPoints)) {
            processFile(`${filePath}.js`);
          }
        } else {
          const outfile = options?.outfile || build.initialOptions.outfile;
          if (outfile) {
            processFile(outfile);
          }
        }
      });
    },
  };
};

export default SanitizeWorker;
