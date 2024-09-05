import { AzionClientOptions, AzionDomain } from '../../types';
import {
  ApiAzionDomainResponse,
  ApiAzionDomainResult,
  ApiAzionListDomainsResponse,
  ApiAzionQueryListDomainsResponse,
} from './types';

const BASE_URL =
  process.env.AZION_ENV === 'stage' ? 'https://stage-api.azion.net/domains' : 'https://api.azionapi.net/domains';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleApiError = (fields: string[], data: any) => {
  let error = undefined;
  fields.forEach((field: string) => {
    if (data[field]) {
      const message = Array.isArray(data[field]) ? data[field].join(', ') : data[field];
      error = message;
    }
  });
  return error ?? JSON.stringify(data);
};

const makeHeaders = (token: string) => ({
  Authorization: `Token ${token}`,
  Accept: 'application/json; version=3',
  'Content-Type': 'application/json',
});

const createDomain = async (
  token: string,
  domain: AzionDomain,
  { debug }: AzionClientOptions,
): Promise<ApiAzionDomainResult> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any = {
      name: domain.name,
      cnames: domain?.cnames ?? [],
      cname_access_only: domain?.cnameAccessOnly ?? false,
      digital_certificate_id: domain?.digitalCertificateId ?? undefined,
      edge_application_id: domain.edgeApplicationId,
      edge_firewall_id: domain?.edgeFirewallId ?? undefined,
      is_active: true,
    };

    if (domain?.mtls) {
      if (domain.mtls.verification !== 'enforce' && domain.mtls.verification !== 'permissive') {
        throw new Error('mtls.verification must be enforce or permissive');
      }
      body = {
        ...body,
        is_mtls_enabled: true,
        mtls_verification: domain.mtls.verification,
        mtls_trusted_ca_certificate_id: domain.mtls.trustedCaCertificateId,
        crl_list: domain.mtls.crlList,
      };
    }

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: makeHeaders(token),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (debug) console.log('Response Post Domains', data);
    if (!data.results) {
      return {
        error: { message: handleApiError(['detail', 'edge_application_id'], data), operation: 'create domain' },
      };
    }
    return data;
  } catch (error) {
    if (debug) console.error('Error creating Domain:', error);
    throw error;
  }
};

const listDomains = async (
  token: string,
  options?: AzionClientOptions,
  queryParams?: ApiAzionQueryListDomainsResponse,
): Promise<ApiAzionListDomainsResponse> => {
  try {
    const { page_size = 10, page = 1 } = queryParams || {};
    const queryParamsUrl = new URLSearchParams({ page_size: String(page_size), page: String(page) });
    const response = await fetch(`${BASE_URL}?${queryParamsUrl.toString()}`, {
      method: 'GET',
      headers: makeHeaders(token),
    });
    const data = await response.json();
    if (options?.debug) console.log('Response List Domains', data);
    if (!data.results) {
      return {
        error: { message: handleApiError(['detail', 'edge_application_id'], data), operation: 'list domains' },
      };
    }
    return {
      ...data,
      results: data.results.map((domain: ApiAzionDomainResponse) => ({
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
  } catch (error) {
    if (options?.debug) console.error('Error listing Domains:', error);
    throw error;
  }
};

const getDomainById = async (
  token: string,
  domainId: number,
  options?: AzionClientOptions,
): Promise<ApiAzionDomainResult> => {
  try {
    const response = await fetch(`${BASE_URL}/${domainId}`, {
      method: 'GET',
      headers: makeHeaders(token),
    });
    const data = await response.json();
    if (options?.debug) console.log('Response Get Domain', data);
    if (!data.results) {
      return {
        error: { message: handleApiError(['detail', 'edge_application_id'], data), operation: 'get domain' },
      };
    }
    return data;
  } catch (error) {
    if (options?.debug) console.error('Error getting Domain:', error);
    throw error;
  }
};

const updateDomain = async (
  token: string,
  domainId: number,
  domain: AzionDomain,
  options?: AzionClientOptions,
): Promise<ApiAzionDomainResult> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any = {
      name: domain.name,
      cnames: domain?.cnames ?? [],
      cname_access_only: domain?.cnameAccessOnly ?? false,
      digital_certificate_id: domain?.digitalCertificateId ?? undefined,
      edge_application_id: domain.edgeApplicationId,
      edge_firewall_id: domain?.edgeFirewallId ?? undefined,
      is_active: domain.active ?? true,
    };

    if (domain?.mtls) {
      if (domain.mtls.verification !== 'enforce' && domain.mtls.verification !== 'permissive') {
        throw new Error('mtls.verification must be enforce or permissive');
      }
      body = {
        ...body,
        is_mtls_enabled: true,
        mtls_verification: domain.mtls.verification,
        mtls_trusted_ca_certificate_id: domain.mtls.trustedCaCertificateId,
        crl_list: domain.mtls.crlList,
      };
    }

    const response = await fetch(`${BASE_URL}/${domainId}`, {
      method: 'PUT',
      headers: makeHeaders(token),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (options?.debug) console.log('Response Put Domains', data);
    if (!data.results) {
      return {
        error: { message: handleApiError(['detail', 'edge_application_id'], data), operation: 'update domain' },
      };
    }
    return data;
  } catch (error) {
    if (options?.debug) console.error('Error updating Domain:', error);
    throw error;
  }
};

const deleteDomain = async (
  token: string,
  domainId: number,
  options?: AzionClientOptions,
): Promise<ApiAzionDomainResult> => {
  try {
    const result = await fetch(`${BASE_URL}/${domainId}`, {
      method: 'DELETE',
      headers: makeHeaders(token),
    });

    if (result.status !== 204) {
      const message = await result.json();
      return {
        error: { message: handleApiError(['detail', 'edge_application_id'], message), operation: 'delete domain' },
      };
    }

    if (options?.debug) console.log('Response Delete Domain');
    return { results: undefined };
  } catch (error) {
    if (options?.debug) console.error('Error deleting Domain:', error);
    throw error;
  }
};

export { createDomain, deleteDomain, getDomainById, listDomains, updateDomain };
