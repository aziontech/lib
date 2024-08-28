export type ApiAzionDomainResponse = {
  id: number;
  domain_name: string;
  environment: string;
  name: string;
  cnames: string[];
  cname_access_only?: boolean;
  digital_certificate_id: string | null | undefined;
  edge_application_id?: number;
  edge_firewall_id?: number;
  is_active: boolean;
  is_mtls_enabled?: boolean;
  mtls_verification?: string;
  mtls_trusted_ca_certificate_id: number;
  crl_list?: number[];
};

export type ApiAzionDomainResult = {
  results: ApiAzionDomainResponse;
};

export type ApiAzionListDomainsResponse = {
  count: number;
  total_pages: number;
  schema_version: 3;
  links: {
    previous: string | null;
    next: string | null;
  };
  results: ApiAzionDomainResponse[];
};

export type ApiAzionQueryListDomainsResponse = {
  order_by?: 'id' | 'name';
  page?: number;
  page_size?: number;
  sort?: 'asc' | 'desc';
};
