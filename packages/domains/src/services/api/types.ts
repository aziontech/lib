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

export type ApiError = {
  message: string;
  operation: string;
};

export type ApiAzionDomainResult = {
  results?: ApiAzionDomainResponse;
  error?: ApiError;
};

export type ApiAzionListDomainsResponse = {
  count?: number;
  total_pages?: number;
  links?: {
    previous: string | null;
    next: string | null;
  };
  results?: ApiAzionDomainResponse[];
  error?: ApiError;
};

export type ApiAzionQueryListDomainsResponse = {
  order_by?: 'id' | 'name';
  page?: number;
  page_size?: number;
  sort?: 'asc' | 'desc';
};
