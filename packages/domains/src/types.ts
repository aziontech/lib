/**
 * AzionDomainsResponse<T> is a generic type that represents the response of the Azion API.
 * It can be either a success response with the data or an error response with the error message and operation.
 *
 * @param T The type of the data that the response contains.
 * @returns An object with the data or an error message and operation.
 */
export type AzionDomainsResponse<T> = {
  data?: T;
  error?: {
    message: string;
    operation: string;
  };
};

/**
 * ResponseState is a type that represents the state of the response of the Azion API.
 * It can be either pending, executed or failed.
 * @returns A string with the state of the response.
 */
export type ResponseState = 'pending' | 'executed' | 'failed';

/**
 * AzionDomain is a type that represents the domain object in the Azion API.
 * @param state The state of the response.
 * @param id The id of the domain.
 * @param url The url of the domain.
 * @param environment The environment of the domain.
 * @param active The status of the domain.
 * @param name The name of the domain.
 * @param cnameAccessOnly The status of the domain.
 * @param cnames The cnames of the domain.
 * @param edgeApplicationId The id of the edge application.
 * @param edgeFirewallId The id of the edge firewall.
 * @param digitalCertificateId The id of the digital certificate.
 * @param mtls The mtls object.
 * @returns An object with the domain data.
 */
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

/**
 * AzionDomains is a type that represents the domains object in the Azion API.
 * @param state The state of the response.
 * @param count The count of the domains.
 * @param pages The number of pages.
 * @param results The list of domains.
 * @returns An object with the domains data.
 */
export type AzionCreateDomain = Omit<
  AzionDomain,
  'id' | 'environment' | 'active' | 'url' | 'state' | 'edgeApplicationId'
> & {
  edgeApplicationId: number;
};

/**
 * AzionUpdateDomain is a type that represents the domain object in the Azion API.
 * @param active The status of the domain.
 * @param name The name of the domain.
 * @param cnameAccessOnly The status of the domain.
 * @param cnames The cnames of the domain.
 * @param edgeApplicationId The id of the edge application.
 * @param edgeFirewallId The id of the edge firewall.
 * @param digitalCertificateId The id of the digital certificate.
 * @param mtls The mtls object.
 * @returns An object with the domain data.
 */
export type AzionUpdateDomain = Omit<AzionDomain, 'id' | 'environment' | 'url' | 'edgeApplicationId' | 'state'> & {
  edgeApplicationId: number;
};

/**
 * AzionDeletedDomain is a type that represents the domain object in the Azion API.
 * @param id The id of the domain.
 * @param state The state of the response.
 * @returns An object with the domain data.
 */
export type AzionDeletedDomain = Pick<AzionDomain, 'id' | 'state'>;

/**
 * AzionClientOptions is a type that represents the options of the Azion API client.
 * @param debug The debug option.
 * @param force The force option.
 * @returns An object with the options of the client.
 */
export type AzionClientOptions = {
  debug?: boolean | undefined;
  force?: boolean | undefined;
};

/**
 * AzionDomains is a type that represents the domains object in the Azion API.
 * @param state The state of the response.
 * @param count The count of the domains.
 * @param pages The number of pages.
 * @param results The list of domains.
 * @returns An object with the domains data.
 */
export type AzionDomains = {
  state: ResponseState;
  count: number;
  pages: number;
  results: AzionDomain[];
};

/**
 * AzionDomainsCreateClient is a type that represents the function to create an Azion domains client.
 * @param config The configuration object.
 * @returns The Azion domains client.
 */
export type AzionDomainsCreateClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
) => AzionDomainsClient;
/**
 * AzionDomainsClient is a type that represents the client of the Azion domains API.
 * @param createDomain The function to create a domain.
 * @param getDomains The function to get the domains.
 * @param getDomain The function to get a domain.
 * @param updateDomain The function to update a domain.
 * @param deleteDomain The function to delete a domain.
 * @returns An object with the client functions.
 */
export interface AzionDomainsClient {
  /**
   * createDomain is a function that creates a domain in the Azion API.
   * @param {AzionCreateDomain} domain The domain object.
   * @param { AzionClientOptions } options The options of the client.
   * @returns {Promise<AzionDomainsResponse<AzionDomain>>} The response of the API.
   * @example
   * const domain = {
   *  name: 'example.com',
   *  edgeApplicationId: 1,
   * };
   * const { data, error } = await client.createDomain(domain);
   * if (error) {
   *  console.error(error.message);
   * } else {
   * console.log(data);
   * }
   */
  createDomain: (domain: AzionCreateDomain, options?: AzionClientOptions) => Promise<AzionDomainsResponse<AzionDomain>>;
  /**
   * getDomains is a function that gets the domains in the Azion API.
   * @param {AzionClientOptions} options The options of the client.
   * @param {{ orderBy?: 'id' | 'name'; page?: number; pageSize?: number; sort?: 'asc' | 'desc' }} queryParams The query parameters of the request.
   * @returns {Promise<AzionDomainsResponse<AzionDomains>>} The response of the API.
   * @example
   * const { data, error } = await client.getDomains();
   * if (error) {
   *  console.error(error.message);
   * } else {
   * console.log(data.results);
   * }
   */
  getDomains: (
    options?: AzionClientOptions,
    queryParams?: { orderBy?: 'id' | 'name'; page?: number; pageSize?: number; sort?: 'asc' | 'desc' },
  ) => Promise<AzionDomainsResponse<AzionDomains>>;
  /**
   * getDomain is a function that gets a domain in the Azion API.
   * @param {number} domainId The id of the domain.
   * @param {AzionClientOptions} options The options of the client.
   * @returns {Promise<AzionDomainsResponse<AzionDomain>>} The response of the API.
   * @example
   * const { data, error } = await client.getDomain(1);
   * if (error) {
   *  console.error(error.message);
   * } else {
   * console.log(data);
   * }
   */
  getDomain: (domainId: number, options?: AzionClientOptions) => Promise<AzionDomainsResponse<AzionDomain>>;
  /**
   * updateDomain is a function that updates a domain in the Azion API.
   * @param {number} domainId The id of the domain.
   * @param {AzionUpdateDomain} domain The domain object.
   * @param {AzionClientOptions} options The options of the client.
   * @returns {Promise<AzionDomainsResponse<AzionDomain>>} The response of the API.
   * @example
   * const domain = {
   *  name: 'example.com',
   *  edgeApplicationId: 1,
   * };
   * const { data, error } = await client.updateDomain(1, domain);
   * if (error) {
   *  console.error(error.message);
   * } else {
   * console.log(data);
   * }
   */
  updateDomain: (
    domainId: number,
    domain: AzionUpdateDomain,
    options?: AzionClientOptions,
  ) => Promise<AzionDomainsResponse<AzionDomain>>;
  /**
   * deleteDomain is a function that deletes a domain in the Azion API.
   * @param {number} domainId The id of the domain.
   * @param {AzionClientOptions} options The options of the client.
   * @returns {Promise<AzionDomainsResponse<AzionDeletedDomain>>} The response of the API.
   * @example
   * const { data, error } = await client.deleteDomain(1);
   * if (error) {
   *  console.error(error.message);
   * } else {
   * console.log(data.id);
   * }
   */
  deleteDomain: (domainId: number, options?: AzionClientOptions) => Promise<AzionDomainsResponse<AzionDeletedDomain>>;
}
