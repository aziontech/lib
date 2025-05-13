/**
 * This class is a VM context (ENV_VARS_CONTEXT) to handle with environment variables
 * @class EnvVarsContext
 * @description Class to handle with environment variables
 */
class EnvVarsContext {
  #envVars;

  constructor() {
    this.#envVars = process.env;
  }

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
