import { mkdir } from 'fs/promises';

/**
 * Runs custom prebuild actions for HTML
 */
async function prebuild(): Promise<void> {
  const outDir = './www';

  await mkdir(outDir, { recursive: true });
}

export default prebuild;
