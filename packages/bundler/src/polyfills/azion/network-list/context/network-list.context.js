import ipCidrLib from 'ip-cidr';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import nodePath from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

/**
 * This class is a VM context (NETWORK_LIST_CONTEXT) to handle with network list
 * @class NetworkListContext
 * @description Class to manage the network list
 */
class NetworkListContext {
  /**
   * Cache Dynamic Import flag - If true, the file will be reloaded every time default: true
   */
  #cacheDynamicImport;

  #networkList = [];

  #workDir = '.edge';

  #configFile = 'azion.config';

  #configFileTypes = ['.cjs', '.js', '.ts', '.mjs'];

  #configFileExtension = '.js';

  /**
   * Creates an instance of NetworkListContext.
   * @param {boolean} [cacheDynamicImport=true] - Cache Dynamic Import flag - If false, the file will be reloaded every time default: true
   */
  constructor(cacheDynamicImport = true) {
    this.#cacheDynamicImport = cacheDynamicImport;
    this.#init();
  }

  /**
   * Check if the network list contains the value
   * @param {string} networkListId - The network list id
   * @param {string} value - The value to check
   * @returns {boolean} - Return true if the network list contains the value
   * @memberof NetworkListContext
   */
  contains(networkListId, value) {
    const network = this.#networkList.find((networkItem) => {
      // At runtime, networkListId is the id of the network list, but in this local context,
      // it is not the name of the object in the networkList[] array. Instead, it is the id property of the object.
      return networkItem.name === networkListId;
    });
    return this.#containsType(network, value);
  }

  #containsType(network, value) {
    switch (network?.listType) {
      case 'ip_cidr':
        return this.#networkCIDR(value, network);
      case 'asn':
        return this.#networkAsn(value, network);
      case 'countries':
        return this.#networkCountries(value, network);
      default:
        return false;
    }
  }

  #networkCIDR(ipAddress, network) {
    const listContent = network?.listContent;
    if (!listContent || listContent.length === 0) return false;
    return listContent.some((currentIp) => {
      if (currentIp.includes('/')) {
        try {
          const cidr = new ipCidrLib(currentIp);
          return cidr.contains(ipAddress);
        } catch {
          return false; // Invalid CIDR format
        }
      }
      return currentIp === ipAddress;
    });
  }

  #networkAsn(asn, network) {
    const listContent = network?.listContent;
    if (!listContent || listContent.length === 0) return false;
    return listContent.some((currentAsn) => {
      return parseInt(currentAsn, 10) === parseInt(asn, 10);
    });
  }

  #networkCountries(country, network) {
    const listContent = network?.listContent;
    if (!listContent || listContent.length === 0) return false;
    return listContent.some((currentCountry) => {
      return currentCountry === country;
    });
  }

  async #init() {
    try {
      const config = await this.#loadConfigFile();
      this.#networkList = config.networkList;
    } catch {
      this.#networkList = [];
    }
  }

  async #loadConfigFile() {
    const { configFilePath, rootPath } = this.#getConfigFilePath();

    const { type: typeImport, changed, currentConfigPath, matchPaths } = this.#checkFileImportType(configFilePath);

    let config;
    if (typeImport === 'esm') {
      config = await this.#importEsmModule(rootPath, currentConfigPath, changed);
    } else {
      config = await this.#importCjsModule(rootPath, currentConfigPath, changed, matchPaths);
    }

    return config?.default || config;
  }

  #getConfigFilePath() {
    const projectRoot = process.cwd();
    const isWindows = process.platform === 'win32';
    const rootPath = isWindows
      ? fileURLToPath(new URL(`file:///${nodePath.resolve(projectRoot, '.')}`))
      : nodePath.resolve(projectRoot, '.');
    const configFiles = this.#configFileTypes.map((type) => nodePath.resolve(rootPath, `${this.#configFile}${type}`));
    const configFilePath = configFiles.find((filePath) => existsSync(filePath));
    this.#configFileExtension = configFilePath?.split('.').pop();
    return {
      configFilePath: configFilePath || '',
      rootPath,
    };
  }

  async #importEsmModule(rootPath, originalConfigPath, changed) {
    let pathCache = originalConfigPath;
    if (!this.#cacheDynamicImport) {
      pathCache = `${originalConfigPath}?u=${Date.now()}`;
    }
    const config = (await import(pathCache)).default;
    if (changed) {
      rmSync(originalConfigPath);
    }
    return config;
  }

  async #importCjsModule(rootPath, configFilePath, changed, matchPaths) {
    if (!this.#cacheDynamicImport) {
      delete require.cache[configFilePath];
      if (changed && matchPaths?.length > 0) {
        matchPaths.forEach((match) => {
          delete require.cache[nodePath.resolve(rootPath, match)];
        });
      }
    }
    return new Promise((resolve) => {
      resolve(require(configFilePath));
    });
  }

  #checkFileImportType(originalConfigPath) {
    const file = readFileSync(originalConfigPath, 'utf8');
    if (file?.includes('export default')) {
      const { changed, currentConfigPath } = this.#changeEsmImports(originalConfigPath, file);
      return { type: 'esm', changed, currentConfigPath };
    }
    const { changed, matchPaths } = this.#changeCjsImports(file);
    return {
      type: 'cjs',
      changed,
      currentConfigPath: originalConfigPath,
      matchPaths,
    };
  }

  #changeEsmImports(originalConfigPath, file) {
    const regex = /import\s+(.*)\s+from\s+['"]\.(.*)['"]/g;
    let changed = false;
    let fileUpdated = file;
    if (file.match(regex)) {
      changed = true;
      fileUpdated = file.replace(regex, `import $1 from "..$2?u=${Date.now()}"`);
      const tmpFile = this.#configFile.replace(this.#configFileExtension, '.temp.js');
      const tmpConfigPath = nodePath.join(process.cwd(), this.#workDir, tmpFile);
      writeFileSync(tmpConfigPath, fileUpdated, 'utf8');
      return { changed, currentConfigPath: tmpConfigPath };
    }
    return { changed, currentConfigPath: originalConfigPath };
  }

  #changeCjsImports(file) {
    let changed = false;
    const regex = /require\(['"]([^'"]+)['"]\)/g;
    const matchPaths = [];
    let match = regex.exec(file);
    while (match !== null) {
      changed = true;
      matchPaths.push(match[1]);
      match = regex.exec(file);
    }
    return { changed, matchPaths };
  }
}

export default NetworkListContext;
