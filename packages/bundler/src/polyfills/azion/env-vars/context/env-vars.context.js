import dotenv from 'dotenv';
import fs, { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

/**
 * This class is a VM context (ENV_VARS_CONTEXT) to handle with environment variables
 * @class EnvVarsContext
 * @description Class to handle with environment variables
 */
class EnvVarsContext {
  #envVars;

  #envFile = '.env';

  #pathDefaultEdge = '.edge';

  constructor() {
    const projectRoot = process.cwd();
    const isWindows = process.platform === 'win32';
    const outputPath = isWindows ? fileURLToPath(new URL(`file:///${join(projectRoot, '.')}`)) : join(projectRoot, '.');
    const envFilePathEdge = join(outputPath, `${this.#pathDefaultEdge}/${this.#envFile}`);

    // Consolidate and merge .env files
    this.#consolidateEnvFiles(outputPath, envFilePathEdge);

    // Load the consolidated .env file
    dotenv.config({ path: envFilePathEdge });

    this.#envVars = process.env;
  }

  /**
   * Consolidate and merge all .env files into .edge/.env
   * @param {string} outputPath Root path of user project
   * @param {string} targetEnvFilePath Path to the consolidated .env file
   * @returns {void} - No return
   */
  #consolidateEnvFiles = async (outputPath, targetEnvFilePath) => {
    const envFiles = [
      join(outputPath, '.env.local'),
      join(outputPath, '.env.production'),
      join(outputPath, '.env.development'),
      join(outputPath, '.env'),
    ];

    const mergedEnv = {};

    for (const filePath of envFiles) {
      if (existsSync(filePath)) {
        const envConfig = dotenv.parse(await fs.promises.readFile(filePath));
        for (const [key, value] of Object.entries(envConfig)) {
          if (!(key in mergedEnv)) {
            mergedEnv[key] = value; // Only add if the key does not already exist
          }
        }
      }
    }

    // Ensure the .edge directory exists
    await fs.promises.mkdir(join(outputPath, this.#pathDefaultEdge), { recursive: true });

    // Write the merged environment variables to the target .env file
    const mergedEnvContent = Object.entries(mergedEnv)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    await fs.promises.writeFile(targetEnvFilePath, mergedEnvContent);
  };

  /**
   * Azion env vars get method
   * @param {string} key - The environment variable key
   * @returns {string} - The environment variable value
   */
  get(key) {
    return this.#envVars[key];
  }
}

export default new EnvVarsContext();
