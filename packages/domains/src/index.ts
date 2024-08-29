import { createDomain, deleteDomain, getDomainById, listDomains, updateDomain } from './services/api';
import { ApiAzionDomainResponse, ApiAzionListDomainsResponse } from './services/api/types';
import {
  AzionClientOptions,
  AzionCreateClientDomains,
  AzionCreateDomain,
  AzionDomainResponse,
  AzionDomainsClient,
  AzionListDomainsResponse,
  AzionUpdateDomain,
} from './types';
import { resolveDebug, resolveToken } from './utils';

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
): Promise<AzionDomainResponse> => {
  if (domain.name === undefined || domain.edgeApplicationId === undefined) {
    return {
      state: 'failed',
      data: {
        message: 'Domain name and Edge Application ID are required',
      },
    };
  }
  const { results: apiResponse } = await createDomain(resolveToken(token), domain, {
    ...options,
    debug: resolveDebug(options?.debug),
  });
  return {
    state: apiResponse?.id ? 'executed' : 'failed',
    data: {
      id: apiResponse.id,
      name: apiResponse?.name,
      url: apiResponse?.domain_name,
      environment: apiResponse?.environment,
      active: apiResponse?.is_active,
    },
  };
};

/**
 * List domains
 * @param token Token to authenticate
 * @param queryParams Query parameters to list the domains
 * @param options Options to list the domains
 * @returns List of domains
 */
const listDomainsMethod = async (
  token: string,
  queryParams?: { order_by?: 'id' | 'name'; page?: number; pageSize?: number; sort?: 'asc' | 'desc' },
  options?: AzionClientOptions,
): Promise<AzionListDomainsResponse> => {
  const { results, count, total_pages }: ApiAzionListDomainsResponse = await listDomains(
    resolveToken(token),
    options,
    queryParams,
  );
  return {
    state: 'executed',
    count,
    pages: total_pages,
    data: results.map((domain: ApiAzionDomainResponse) => ({
      id: domain.id,
      name: domain.name,
      url: domain.domain_name,
      environment: domain.environment,
      active: domain.is_active,
      edgeApplicationId: domain.edge_application_id,
      cnameAccessOnly: domain.cname_access_only,
      digitalCertificateId: domain.digital_certificate_id,
      edgeFirewallId: domain?.edge_firewall_id,
      cnames: domain.cnames,
      mtls: domain.is_mtls_enabled
        ? {
            verification: domain.mtls_verification as 'enforce' | 'permissive',
            trustedCaCertificateId: domain.mtls_trusted_ca_certificate_id as number,
            crlList: domain.crl_list,
          }
        : undefined,
    })),
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
): Promise<AzionDomainResponse> => {
  const { results: apiResponse } = await getDomainById(resolveToken(token), domainId, {
    ...options,
    debug: resolveDebug(options?.debug),
  });
  return {
    state: 'executed',
    data: {
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
): Promise<AzionDomainResponse> => {
  if (domain?.edgeApplicationId === undefined) {
    return {
      state: 'failed',
      data: {
        message: 'Edge Application ID is required',
      },
    };
  }

  const apiResponse = await updateDomain(resolveToken(token), domainId, domain, {
    ...options,
    debug: resolveDebug(options?.debug),
  });

  if (!apiResponse?.results?.id) {
    return {
      state: 'failed',
      data: apiResponse,
    };
  }

  return {
    state: 'executed',
    data: {
      id: apiResponse?.results.id,
      name: apiResponse?.results?.name,
      url: apiResponse?.results?.domain_name,
      environment: apiResponse?.results?.environment,
      active: apiResponse?.results?.is_active,
      cnameAccessOnly: apiResponse?.results?.cname_access_only,
      digitalCertificateId: apiResponse?.results?.digital_certificate_id,
      cnames: apiResponse?.results?.cnames,
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
): Promise<AzionDomainResponse> => {
  try {
    await deleteDomain(resolveToken(token), domainId, {
      ...options,
      debug: resolveDebug(options?.debug),
    });
    return {
      state: 'executed',
      data: {
        id: domainId,
      },
    };
  } catch (error) {
    return {
      state: 'failed',
      data: {
        message: (error as Error).message,
      },
    };
  }
};

/**
 * Create a new domain
 * @param domain Domain to create
 * @param options Options to create the domain
 * @returns Domain created
 */
const createDomainWrapper = async (
  domain: AzionCreateDomain,
  options?: AzionClientOptions,
): Promise<AzionDomainResponse> => {
  return createDomainMethod(resolveToken(), domain, options);
};

/**
 * List domains
 * @param options Options to list the domains
 * @param queryParams Query parameters to list the domains
 * @returns List of domains
 */
const listDomainsWrapper = async (
  options?: AzionClientOptions,
  queryParams?: { orderBy?: 'id' | 'name'; page?: number; pageSize?: number; sort?: 'asc' | 'desc' },
): Promise<AzionListDomainsResponse> => {
  return listDomainsMethod(resolveToken(), queryParams, options);
};

/**
 * Get a domain by ID
 * @param domainId Domain ID
 * @param options Options to get the domain
 * @returns Domain
 */
const getDomainWrapper = async (domainId: number, options?: AzionClientOptions): Promise<AzionDomainResponse> => {
  return getDomainMethod(resolveToken(), domainId, options);
};

/**
 * Update a domain
 * @param domainId Domain ID
 * @param domain Domain to update
 * @param options Options to update the domain
 * @returns Domain updated
 */
const updateDomainWrapper = async (
  domainId: number,
  domain: AzionUpdateDomain,
  options?: AzionClientOptions,
): Promise<AzionDomainResponse> => {
  return updateDomainMethod(resolveToken(), domainId, domain, options);
};

/**
 * Delete a domain
 * @param domainId Domain ID
 * @param options Options to delete the domain
 * @returns Domain deleted
 */
const deleteDomainWrapper = async (domainId: number, options?: AzionClientOptions): Promise<AzionDomainResponse> => {
  return deleteDomainMethod(resolveToken(), domainId, options);
};

/**
 * Creates an Azion client to interact with the Domains.
 *
 * @param {Partial<{ token?: string; options?: AzionClientOptions; }>} [config] - Configuration options for the client.
 * @returns {AzionCreateClientDomains} An object with methods to interact with the Domains.
 *
 * @example
 * const client = createClient(); // Uses the token from the environment variable process.env.AZION_TOKEN
 * const domain = { name: 'example.com', edgeApplicationId: 123 };
 * const result = await client.createDomain(domain);
 * console.log(result);
 */
const createClient: AzionDomainsClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
): AzionCreateClientDomains => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.options?.debug);

  const client: AzionCreateClientDomains = {
    /**
     * Create a new domain
     * @param domain Domain to create
     * @param options Options to create the domain
     * @returns Domain created
     *
     * @example
     * const domain = { name: 'example.com', edgeApplicationId: 123 };
     * const result = await client.createDomain(domain);
     * console.log(result);
     */
    createDomain: (domain: AzionCreateDomain, options?: AzionClientOptions) =>
      createDomainMethod(tokenValue, domain, { ...options, debug: debugValue }),

    /**
     * List domains
     * @param options Options to list the domains
     * @param queryParams Query parameters to list the domains
     * @returns List of domains
     *
     * @example
     * const results = await client.listDomains();
     * console.log(results);
     */
    listDomains: (
      options?: AzionClientOptions,
      queryParams?: { orderBy?: 'id' | 'name'; page?: number; pageSize?: number; sort?: 'asc' | 'desc' },
    ) => listDomainsMethod(tokenValue, queryParams, { ...options, debug: debugValue }),

    /**
     * Get a domain by ID
     * @param domainId Domain ID
     * @param options Options to get the domain
     * @returns Domain
     *
     * @example
     * const result = await client.getDomain(123);
     * console.log(result);
     */
    getDomain: (domainId: number, options?: AzionClientOptions) =>
      getDomainMethod(tokenValue, domainId, { ...options, debug: debugValue }),

    /**
     * Update a domain
     * @param domainId Domain ID
     * @param domain Domain to update
     * @param options Options to update the domain
     * @returns Domain updated
     *
     * @example
     * const domain = { name: 'example.com', edgeApplicationId: 123 };
     * const result = await client.updateDomain(123, domain);
     * console.log(result);
     */
    updateDomain: (domainId: number, domain: AzionUpdateDomain, options?: AzionClientOptions) =>
      updateDomainMethod(tokenValue, domainId, domain, { ...options, debug: debugValue }),

    /**
     * Delete a domain
     * @param domainId Domain ID
     * @param options Options to delete the domain
     * @returns Domain deleted
     * @example
     * const result = await client.deleteDomain(123);
     * console.log(result);
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
  listDomainsWrapper as listDomains,
  updateDomainWrapper as updateDomain,
};

export default createClient;

export type * from './types';
