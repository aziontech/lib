export type AzionDomainsResponse<T> = {
  data?: T;
  error?: {
    message: string;
    operation: string;
  };
};

export type ResponseState = 'pending' | 'executed' | 'failed';

export type AzionDomain = {
  state?: ResponseState;
  id?: number;
  url?: string;
  environment?: string;
  active?: boolean;
  name: string;
  cnameAccessOnly?: boolean;
  cnames?: string[];
  edgeApplicationId?: number;
  edgeFirewallId?: number;
  digitalCertificateId?: string | number | null;
  mtls?: {
    verification: 'enforce' | 'permissive';
    trustedCaCertificateId: number;
    crlList?: number[];
  };
};

export type AzionCreateDomain = Omit<AzionDomain, 'id' | 'environment' | 'active' | 'url'>;

export type AzionUpdateDomain = Omit<AzionDomain, 'id' | 'environment' | 'url'>;

export type AzionDeletedDomain = Pick<AzionDomain, 'id' | 'state'>;

export type AzionClientOptions = {
  debug?: boolean | undefined;
  force?: boolean | undefined;
};

export type AzionDomains = {
  state: ResponseState;
  count: number;
  pages: number;
  data: AzionDomain[];
};

export type AzionDomainsCreateClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
) => AzionDomainsClient;

export interface AzionDomainsClient {
  createDomain: (domain: AzionCreateDomain, options?: AzionClientOptions) => Promise<AzionDomainsResponse<AzionDomain>>;
  getDomains: (
    options?: AzionClientOptions,
    queryParams?: { orderBy?: 'id' | 'name'; page?: number; pageSize?: number; sort?: 'asc' | 'desc' },
  ) => Promise<AzionDomainsResponse<AzionDomains>>;
  getDomain: (domainId: number, options?: AzionClientOptions) => Promise<AzionDomainsResponse<AzionDomain>>;
  updateDomain: (
    domainId: number,
    domain: AzionUpdateDomain,
    options?: AzionClientOptions,
  ) => Promise<AzionDomainsResponse<AzionDomain>>;
  deleteDomain: (domainId: number, options?: AzionClientOptions) => Promise<AzionDomainsResponse<AzionDeletedDomain>>;
}
