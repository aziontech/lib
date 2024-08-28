export type AzionDomain = {
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

export type AzionClientOptions = {
  debug?: boolean | undefined;
  force?: boolean | undefined;
};

export type AzionDomainResponse = {
  state: 'pending' | 'executed' | 'failed';
  data: AzionDomain | unknown;
};

export type AzionListDomainsResponse = {
  state: 'executed';
  count: number;
  pages: number;
  data: AzionDomain[];
};

export type AzionDomainsClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
) => AzionCreateClientDomains;

export interface AzionCreateClientDomains {
  createDomain: (domain: AzionCreateDomain, options?: AzionClientOptions) => Promise<AzionDomainResponse>;
  listDomains: (
    options?: AzionClientOptions,
    queryParams?: { orderBy?: 'id' | 'name'; page?: number; pageSize?: number; sort?: 'asc' | 'desc' },
  ) => Promise<AzionListDomainsResponse>;
  getDomain: (domainId: number, options?: AzionClientOptions) => Promise<AzionDomainResponse>;
  updateDomain: (
    domainId: number,
    domain: AzionUpdateDomain,
    options?: AzionClientOptions,
  ) => Promise<AzionDomainResponse>;
}
