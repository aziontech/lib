import { createDomain, deleteDomain, getDomainById, getDomains, updateDomain } from './services/api/index';
import {
  AzionClientOptions,
  AzionCreateDomain,
  AzionDeletedDomain,
  AzionDomain,
  AzionDomains,
  AzionDomainsClient,
  AzionDomainsCreateClient,
  AzionDomainsResponse,
  AzionUpdateDomain,
} from './types';
import { resolveDebug, resolveToken } from './utils/index';

/**
 * Create a new domain
 * @param token Token to authenticate
 * @param domain Domain to create
 * @param options Options to create the domain
 * @returns Domain created
 * @throws Error if domain name or edge application ID are not provided
 */
const createDomainMethod = async (
  token: string,
  domain: AzionCreateDomain,
  options?: AzionClientOptions,
): Promise<AzionDomainsResponse<AzionDomain>> => {
  if (domain.name === undefined || domain.edgeApplicationId === undefined) {
    return {
      error: {
        message: 'Domain name and Edge Application ID are required',
        operation: 'create domain',
      },
    };
  }
  const { results: apiResponse, error } = await createDomain(resolveToken(token), domain, {
    ...options,
    debug: resolveDebug(options?.debug),
  });
  if (apiResponse && apiResponse.id) {
    return {
      data: {
        state: 'executed',
        id: apiResponse.id,
        name: apiResponse?.name,
        url: apiResponse?.domain_name,
        environment: apiResponse?.environment,
        active: apiResponse?.is_active,
      },
    };
  }
  return {
    error: error,
  };
};

/**
 * Get domains
 * @param token Token to authenticate
 * @param queryParams Query parameters to list the domains
 * @param options Options to list the domains
 * @returns List of domains
 */
const getDomainsMethod = async (
  token: string,
  queryParams?: { order_by?: 'id' | 'name'; page?: number; pageSize?: number; sort?: 'asc' | 'desc' },
  options?: AzionClientOptions,
): Promise<AzionDomainsResponse<AzionDomains>> => {
  const apiResponse = await getDomains(resolveToken(token), options, queryParams);
  if (apiResponse.results) {
    return {
      data: {
        count: apiResponse.count ?? apiResponse.results.length,
        state: 'executed',
        results: apiResponse.results,
        pages: apiResponse.total_pages ?? 1,
      },
    };
  }
  return {
    error: apiResponse.error,
  };
};

/**
 * Get a domain by ID
 * @param token Token to authenticate
 * @param domainId Domain ID
 * @param options Options to get the domain
 * @returns Domain
 */
const getDomainMethod = async (
  token: string,
  domainId: number,
  options?: AzionClientOptions,
): Promise<AzionDomainsResponse<AzionDomain>> => {
  const { results: apiResponse, error } = await getDomainById(resolveToken(token), domainId, {
    ...options,
    debug: resolveDebug(options?.debug),
  });
  if (apiResponse && apiResponse.id) {
    return {
      data: {
        state: 'executed',
        id: apiResponse.id,
        name: apiResponse?.name,
        url: apiResponse?.domain_name,
        environment: apiResponse?.environment,
        active: apiResponse?.is_active,
        cnameAccessOnly: apiResponse?.cname_access_only,
        digitalCertificateId: apiResponse?.digital_certificate_id,
        cnames: apiResponse?.cnames,
        edgeApplicationId: apiResponse?.edge_application_id,
        edgeFirewallId: apiResponse?.edge_firewall_id,
        mtls: apiResponse?.is_mtls_enabled
          ? {
              verification: apiResponse.mtls_verification as 'enforce' | 'permissive',
              trustedCaCertificateId: apiResponse.mtls_trusted_ca_certificate_id as number,
              crlList: apiResponse.crl_list,
            }
          : undefined,
      },
    };
  }
  return {
    error: error,
  };
};

/**
 *
 * @param token The token to authenticate
 * @param domainId The domain ID
 * @param domain The domain to update
 * @param options Options to update the domain
 * @returns Domain updated
 */
const updateDomainMethod = async (
  token: string,
  domainId: number,
  domain: AzionUpdateDomain,
  options?: AzionClientOptions,
): Promise<AzionDomainsResponse<AzionDomain>> => {
  if (domain?.edgeApplicationId === undefined) {
    return {
      error: {
        message: 'Edge Application ID is required',
        operation: 'update domain',
      },
    };
  }

  const apiResponse = await updateDomain(resolveToken(token), domainId, domain, {
    ...options,
    debug: resolveDebug(options?.debug),
  });

  if (!apiResponse?.results?.id) {
    return {
      error: apiResponse?.error,
    };
  }

  return {
    data: {
      state: 'executed',
      name: apiResponse?.results?.name,
      id: apiResponse?.results?.id,
      environment: apiResponse?.results?.environment,
      cnames: apiResponse?.results?.cnames,
      url: apiResponse?.results?.domain_name,
      active: apiResponse?.results?.is_active,
      cnameAccessOnly: apiResponse?.results?.cname_access_only,
      digitalCertificateId: apiResponse?.results?.digital_certificate_id,
      edgeApplicationId: apiResponse?.results?.edge_application_id,
      edgeFirewallId: apiResponse?.results?.edge_firewall_id,
      mtls: apiResponse?.results?.is_mtls_enabled
        ? {
            verification: apiResponse?.results.mtls_verification as 'enforce' | 'permissive',
            trustedCaCertificateId: apiResponse?.results.mtls_trusted_ca_certificate_id as number,
            crlList: apiResponse?.results.crl_list,
          }
        : undefined,
    },
  };
};

/**
 * Delete a domain
 * @param token Token to authenticate
 * @param domainId Domain ID
 * @param options Options to delete the domain
 * @returns Domain deleted
 */
const deleteDomainMethod = async (
  token: string,
  domainId: number,
  options?: AzionClientOptions,
): Promise<AzionDomainsResponse<AzionDeletedDomain>> => {
  const { error } = await deleteDomain(resolveToken(token), domainId, {
    ...options,
    debug: resolveDebug(options?.debug),
  });
  if (error) {
    return {
      error: error,
    };
  }
  return {
    data: {
      state: 'executed',
      id: domainId,
    },
  };
};

/**
 * Create a new domain
 * @param domain Domain to create
 * @param options Options to create the domain
 * @returns Domain created with data or error
 *
 * @example
 * const domain = { name: 'example.com', edgeApplicationId: 123 };
 * const { data, error } = await createDomain(domain);
 * if(data) {
 *  console.log(data);
 * } else {
 * console.error(error);
 *
 *
 */
const createDomainWrapper = async (
  domain: AzionCreateDomain,
  options?: AzionClientOptions,
): Promise<AzionDomainsResponse<AzionDomain>> => {
  return createDomainMethod(resolveToken(), domain, options);
};

/**
 * List domains
 * @param options Options to list the domains
 * @param queryParams Query parameters to list the domains
 * @returns List of domains with data or error
 *
 * @example
 * const { data, error } = await getDomains();
 * if(data) {
 * console.log(data.results);
 * } else {
 * console.error(error);
 * }
 */
const getDomainsWrapper = async (
  options?: AzionClientOptions,
  queryParams?: { orderBy?: 'id' | 'name'; page?: number; pageSize?: number; sort?: 'asc' | 'desc' },
): Promise<AzionDomainsResponse<AzionDomains>> => {
  return getDomainsMethod(resolveToken(), queryParams, options);
};

/**
 * Get a domain by ID
 * @param domainId Domain ID
 * @param options Options to get the domain
 * @returns Domain with data or error
 *
 * @example
 * const { data, error } = await getDomain(123);
 * if(data) {
 * console.log(data);
 * } else {
 * console.error(error);
 *
 */
const getDomainWrapper = async (
  domainId: number,
  options?: AzionClientOptions,
): Promise<AzionDomainsResponse<AzionDomain>> => {
  return getDomainMethod(resolveToken(), domainId, options);
};

/**
 * Update a domain
 * @param domainId Domain ID
 * @param domain Domain to update
 * @param options Options to update the domain
 * @returns Domain updated with data or error
 *
 * @example
 * const domain = { name: 'example.com', edgeApplicationId: 123 };
 * const { data, error } = await updateDomain(123, domain);
 * if(data) {
 * console.log(data);
 * } else {
 * console.error(error);
 * }
 */
const updateDomainWrapper = async (
  domainId: number,
  domain: AzionUpdateDomain,
  options?: AzionClientOptions,
): Promise<AzionDomainsResponse<AzionDomain>> => {
  return updateDomainMethod(resolveToken(), domainId, domain, options);
};

/**
 * Delete a domain
 * @param domainId Domain ID
 * @param options Options to delete the domain
 * @returns Domain deleted with data or error
 *
 * @example
 * const { data, error } = await deleteDomain(123);
 * if(data) {
 * console.log(data.id);
 * } else {
 * console.error(error);
 *
 */
const deleteDomainWrapper = async (
  domainId: number,
  options?: AzionClientOptions,
): Promise<AzionDomainsResponse<AzionDeletedDomain>> => {
  return deleteDomainMethod(resolveToken(), domainId, options);
};

/**
 * Creates an Azion client to interact with the Domains.
 *
 * @param {Partial<{ token?: string; options?: AzionClientOptions; }>} [config] - Configuration options for the client.
 * @returns {AzionDomainsClient} An object with methods to interact with the Domains.
 *
 * @example
 * const client = createClient(); // Uses the token from the environment variable process.env.AZION_TOKEN
 * const domain = { name: 'example.com', edgeApplicationId: 123 };
 * const result = await client.createDomain(domain);
 * console.log(result);
 */
const createClient: AzionDomainsCreateClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
): AzionDomainsClient => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.options?.debug);

  const client: AzionDomainsClient = {
    /**
     * Create a new domain
     * @param domain Domain to create
     * @param options Options to create the domain
     * @returns Domain created with data or error
     *
     * @example
     * const domain = { name: 'example.com', edgeApplicationId: 123 };
     * const { data, error } = await client.createDomain(domain);
     * if(data) {
     * console.log(data);
     * } else {
     * console.error(error);
     * }
     */
    createDomain: (domain: AzionCreateDomain, options?: AzionClientOptions) =>
      createDomainMethod(tokenValue, domain, { ...options, debug: debugValue }),

    /**
     * List domains
     * @param options Options to list the domains
     * @param queryParams Query parameters to list the domains
     * @returns List of domains with data or error
     *
     * @example
     * const { data, error } = await client.getDomains();
     * if(data) {
     * console.log(data.results);
     * } else {
     * console.error(error);
     * }
     */
    getDomains: (
      options?: AzionClientOptions,
      queryParams?: { orderBy?: 'id' | 'name'; page?: number; pageSize?: number; sort?: 'asc' | 'desc' },
    ) => getDomainsMethod(tokenValue, queryParams, { ...options, debug: debugValue }),

    /**
     * Get a domain by ID
     * @param domainId Domain ID
     * @param options Options to get the domain
     * @returns Domain created with data or error
     *
     * @example
     * const { data, error } = await client.getDomain(123);
     * if(data) {
     * console.log(data);
     * } else {
     * console.error(error);
     * }
     */
    getDomain: (domainId: number, options?: AzionClientOptions) =>
      getDomainMethod(tokenValue, domainId, { ...options, debug: debugValue }),

    /**
     * Update a domain
     * @param domainId Domain ID
     * @param domain Domain to update
     * @param options Options to update the domain
     * @returns Domain updated with data or error
     *
     * @example
     * const domain = { name: 'example.com', edgeApplicationId: 123 };
     * const { data, error } = await client.updateDomain(123, domain);
     * if(data) {
     * console.log(data);
     * } else {
     * console.error(error);
     * }
     */
    updateDomain: (domainId: number, domain: AzionUpdateDomain, options?: AzionClientOptions) =>
      updateDomainMethod(tokenValue, domainId, domain, { ...options, debug: debugValue }),

    /**
     * Delete a domain
     * @param domainId Domain ID
     * @param options Options to delete the domain
     * @returns Domain deleted with data or error
     * @example
     * const { data, error } = await client.deleteDomain(123);
     * if(data) {
     * console.log(data.id);
     * } else {
     * console.error(error);
     * }
     */
    deleteDomain: (domainId: number, options?: AzionClientOptions) =>
      deleteDomainMethod(tokenValue, domainId, { ...options, debug: debugValue }),
  };
  return client;
};

export {
  createClient,
  createDomainWrapper as createDomain,
  deleteDomainWrapper as deleteDomain,
  getDomainWrapper as getDomain,
  getDomainsWrapper as getDomains,
  updateDomainWrapper as updateDomain,
};

export default createClient;

export type * from './types';
