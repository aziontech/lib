import { ApiVersion, ConfigVersionModule, DEFAULT_API_VERSION } from './types';
import v3 from './v3';
import v4 from './v4';

const registry: Record<ApiVersion, ConfigVersionModule> = {
  3: v3,
  4: v4,
};

/**
 * Versions that have an implementation registered, in ascending order.
 */
const SUPPORTED_API_VERSIONS = (Object.keys(registry).map(Number) as ApiVersion[]).sort((a, b) => a - b);

function isSupportedApiVersion(version: unknown): version is ApiVersion {
  return (SUPPORTED_API_VERSIONS as readonly unknown[]).includes(version);
}

/**
 * Resolves which API version a config targets.
 * Falls back to DEFAULT_API_VERSION when `version` is not declared.
 * @throws {Error} When `version` is declared but not supported.
 */
function resolveApiVersion(config?: object | null): ApiVersion {
  const declared = (config as { version?: unknown } | null | undefined)?.version;
  if (declared === undefined || declared === null) return DEFAULT_API_VERSION;
  if (!isSupportedApiVersion(declared)) {
    throw new Error(
      `Unsupported config version "${String(declared)}". Supported versions: ${SUPPORTED_API_VERSIONS.join(', ')}.`,
    );
  }
  return declared;
}

function getVersionModule(version: ApiVersion = DEFAULT_API_VERSION): ConfigVersionModule {
  if (!isSupportedApiVersion(version)) {
    throw new Error(
      `Unsupported config version "${String(version)}". Supported versions: ${SUPPORTED_API_VERSIONS.join(', ')}.`,
    );
  }
  return registry[version];
}

export { SUPPORTED_API_VERSIONS, getVersionModule, isSupportedApiVersion, resolveApiVersion };
