import { SUPPORTED_BUNDLERS, VALID_IMG_EXTENSIONS } from './constants';

type InjectedWasmWebpack = {
  default: string;
};

async function getWasmModule(
  wasmFromBuilder: InjectedWasmWebpack,
  bundler: string = 'webpack',
): Promise<WebAssembly.Module> {
  if (!SUPPORTED_BUNDLERS.includes(bundler)) {
    throw new Error(`Bundler not supported. Supported bundlers: ${SUPPORTED_BUNDLERS.join(',')}`);
  }

  const wasmString: string = wasmFromBuilder.default;

  // Wasm format after inject: 'data:application/wasm;base64,BASE_64_STRING'
  const wasmBytes: string = atob(wasmString.split('application/wasm;base64,')[1]);
  const wasmArray: Uint8Array = new Uint8Array(wasmBytes.length);
  for (let i = 0; i < wasmBytes.length; i++) {
    wasmArray[i] = wasmBytes.charCodeAt(i);
  }

  const wasmModule = await WebAssembly.compile(wasmArray);

  return wasmModule;
}

function isUrl(pathOrUrl: string): boolean {
  try {
    new URL(pathOrUrl);

    return true;
  } catch (err) {
    return false;
  }
}

function getFileExtension(pathOrUrl: string): string {
  const match: RegExpMatchArray | null = pathOrUrl.match(/(?:\.([^.]+))?$/);

  if (!match || !match[1]) {
    throw new Error('No file extension found');
  }

  return match[1].toLowerCase();
}

function validateImageExtension(pathOrUrl: string) {
  const extension = getFileExtension(pathOrUrl);
  const hasValidExtension = VALID_IMG_EXTENSIONS.includes(extension);

  if (!hasValidExtension) {
    throw new Error(`Invalid image extension. Supported: ${VALID_IMG_EXTENSIONS.join(',')}`);
  }
}

export { getFileExtension, getWasmModule, isUrl, validateImageExtension };
