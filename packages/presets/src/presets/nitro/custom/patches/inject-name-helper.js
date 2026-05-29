import { readFile, writeFile } from 'node:fs/promises';

// Fix: EdgeVM transforms add the __name helper to function bodies. When seroval
// calls .toString() on those functions to embed them in inline <script> tags,
// __name is referenced but not defined in that scope.
// tsrScript_default is the first inline script on every SSR page — prepending
// __name here makes it available for all subsequent inline scripts.
export async function injectNameHelper(ssrBundlePath) {
  let ssrContent = await readFile(ssrBundlePath, 'utf-8');

  const tsrScriptPattern = /(var tsrScript_default = ")(self\.\$_TSR)/;
  if (tsrScriptPattern.test(ssrContent)) {
    const __nameDef = 'var __name=(fn,n)=>(Object.defineProperty(fn,\\"name\\",{value:n,configurable:!0}),fn);';
    ssrContent = ssrContent.replace(tsrScriptPattern, `$1${__nameDef}$2`);
    await writeFile(ssrBundlePath, ssrContent);
    console.log('[azion preset] Injected __name definition into tsrScript_default in _ssr/ssr.mjs');
  } else {
    console.warn('[azion preset] tsrScript_default pattern not found in _ssr/ssr.mjs');
  }
}
