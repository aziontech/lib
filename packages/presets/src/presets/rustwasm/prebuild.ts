import { copyDirectory, exec } from 'azion/utils/node';
import { rm } from 'fs/promises';

/**
 * Runs custom prebuild actions for RustWasm
 */
async function prebuild(): Promise<void> {
  const pkg = '.wasm-bindgen';
  const target = 'target/wasm32-unknown-unknown/debug/azion_rust_edge_function.wasm';

  await rm(pkg, { recursive: true, force: true });

  await exec('cargo build --target=wasm32-unknown-unknown', {
    scope: 'RustWasm',
    verbose: true,
  });

  await exec(`wasm-bindgen --out-dir=${pkg} --target=web --omit-default-module-path ${target}`, {
    scope: 'RustWasm',
    verbose: true,
  });

  const destPath = '.edge/storage';
  copyDirectory(pkg, destPath);
}

export default prebuild;
