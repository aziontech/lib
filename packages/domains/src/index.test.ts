/* eslint-disable @typescript-eslint/no-explicit-any */
import createClient, { createDomain, getDomain, listDomains } from '.';
import * as services from './services/api';

describe('Domains Package', () => {
  const mockToken = 'mock-token';
  const mockDebug = false;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AZION_TOKEN = mockToken;
    process.env.AZION_DEBUG = 'false';
  });
  describe('createDomain', () => {
    it('should create a domain', async () => {
      const mockResponse = {
        results: {
          id: '123',
          name: 'example.com',
          domain_name: 'example.com',
          environment: 'production',
          is_active: true,
        },
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponse) } as any);
      jest.spyOn(services, 'createDomain');

      const result = await createDomain({ name: 'example.com', edgeApplicationId: 123 }, { debug: mockDebug });
      expect(result).toEqual({
        state: 'executed',
        data: { id: '123', name: 'example.com', url: 'example.com', environment: 'production', active: true },
      });
      expect(services.createDomain).toHaveBeenCalledWith(
        mockToken,
        { name: 'example.com', edgeApplicationId: 123 },
        { debug: mockDebug },
      );
    });

    it('should throw an error if the domain creation fails', async () => {
      const mockError = new Error('Error creating Domain: Request failed');
      jest.spyOn(global, 'fetch').mockRejectedValue(mockError);
      jest.spyOn(services, 'createDomain');
      await expect(createDomain({ name: 'example.com', edgeApplicationId: 123 }, { debug: mockDebug })).rejects.toThrow(
        mockError,
      );
      expect(services.createDomain).toHaveBeenCalledWith(
        mockToken,
        { name: 'example.com', edgeApplicationId: 123 },
        { debug: mockDebug },
      );
    });

    it('should create a domain with all fields', async () => {
      const mockResponse = {
        results: {
          id: '123',
          name: 'example.com',
          domain_name: 'example.com',
          environment: 'production',
          is_active: true,
        },
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponse) } as any);
      jest.spyOn(services, 'createDomain');
      const domain: any = {
        name: 'example.com',
        cnames: ['cname1', 'cname2'],
        cnameAccessOnly: true,
        digitalCertificateId: 'lets_encrypt',
        edgeApplicationId: 123,
        mtls: {
          verification: 'enforce',
          trustedCaCertificateId: 123,
          crlList: [111],
        },
      };
      const result = await createDomain(domain, { debug: mockDebug });
      expect(result).toEqual({
        state: 'executed',
        data: { id: '123', name: 'example.com', url: 'example.com', environment: 'production', active: true },
      });
      expect(services.createDomain).toHaveBeenCalledWith(mockToken, domain, { debug: mockDebug });
    });

    it('should throw an error if the domain edgeApplicationId is not provided', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve({}) } as any);
      // @eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(createDomain({ name: 'example.com' } as any, { debug: mockDebug })).rejects.toThrow(
        'Domain name and Edge Application ID are required',
      );
    });

    it('should create a domain with status failed', async () => {
      const mockResponse = {
        results: {},
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponse) } as any);
      jest.spyOn(services, 'createDomain');

      const result = await createDomain({ name: 'example.com', edgeApplicationId: 123 }, { debug: mockDebug });
      expect(result).toEqual({
        state: 'failed',
        data: {},
      });
      expect(services.createDomain).toHaveBeenCalledWith(
        mockToken,
        { name: 'example.com', edgeApplicationId: 123 },
        { debug: mockDebug },
      );
    });
  });

  describe('listDomains', () => {
    let mockResponseListDomains: any;
    beforeEach(() => {
      jest.clearAllMocks();
      process.env.AZION_TOKEN = mockToken;
      process.env.AZION_DEBUG = 'false';
      mockResponseListDomains = {
        count: 1,
        total_pages: 1,
        schema_version: 3,
        links: {
          previous: null,
          next: null,
        },
        results: [
          {
            id: 1700496622,
            name: 'My domain',
            cnames: [],
            cname_access_only: false,
            digital_certificate_id: 61561,
            edge_application_id: 1700498641,
            is_active: true,
            domain_name: 'd0ma1n3xmp.map.azionedge.net',
            environment: 'production',
            is_mtls_enabled: false,
            mtls_verification: 'enforce',
            mtls_trusted_ca_certificate_id: null,
            crl_list: null,
            edge_firewall_id: null,
          },
        ],
      };
    });

    it('should list domains', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponseListDomains) } as any);
      jest.spyOn(services, 'listDomains');

      const results = await listDomains({ debug: mockDebug });
      expect(results).toEqual({
        state: 'executed',
        pages: 1,
        count: 1,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1700496622,
            name: 'My domain',
            url: 'd0ma1n3xmp.map.azionedge.net',
            environment: 'production',
            active: true,
          }),
        ]),
      });
      expect(services.listDomains).toHaveBeenCalledWith(mockToken, { debug: mockDebug }, undefined);
    });

    it('should list domains with all fields', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponseListDomains) } as any);
      jest.spyOn(services, 'listDomains');

      const queryParams: any = { orderBy: 'id', page: 1, pageSize: 1, sort: 'asc' };
      const results = await listDomains({ debug: mockDebug }, queryParams);
      expect(results).toEqual({
        state: 'executed',
        pages: 1,
        count: 1,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1700496622,
            name: 'My domain',
            url: 'd0ma1n3xmp.map.azionedge.net',
            environment: 'production',
            active: true,
          }),
        ]),
      });
      expect(services.listDomains).toHaveBeenCalledWith(mockToken, { debug: mockDebug }, queryParams);
    });

    it('should list domains with mtls', async () => {
      mockResponseListDomains.results[0].is_mtls_enabled = true;
      mockResponseListDomains.results[0].mtls_verification = 'enforce';
      mockResponseListDomains.results[0].mtls_trusted_ca_certificate_id = 123;
      mockResponseListDomains.results[0].crl_list = [111];
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponseListDomains) } as any);
      jest.spyOn(services, 'listDomains');

      const results = await listDomains({ debug: mockDebug });
      expect(results).toEqual({
        state: 'executed',
        pages: 1,
        count: 1,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1700496622,
            name: 'My domain',
            url: 'd0ma1n3xmp.map.azionedge.net',
            environment: 'production',
            active: true,
            mtls: {
              verification: 'enforce',
              trustedCaCertificateId: 123,
              crlList: [111],
            },
          }),
        ]),
      });
      expect(services.listDomains).toHaveBeenCalledWith(mockToken, { debug: mockDebug }, undefined);
    });
  });

  describe('getDomain', () => {
    it('should get a domain by id', async () => {
      const mockResponse = {
        results: {
          id: 123,
          name: 'example.com',
          domain_name: 'example.com',
          environment: 'production',
          is_active: true,
        },
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponse) } as any);
      jest.spyOn(services, 'getDomainById');

      const result = await getDomain(123, { debug: mockDebug });
      console.log(result);

      expect(result).toEqual({
        state: 'executed',
        data: { id: 123, name: 'example.com', url: 'example.com', environment: 'production', active: true },
      });
      expect(services.getDomainById).toHaveBeenCalledWith(mockToken, 123, { debug: mockDebug });
    });
  });

  describe('createClient', () => {
    it('should create a client with createDomain', async () => {
      const mockResponse = {
        results: {
          id: '123',
          name: 'example.com',
          domain_name: 'example.com',
          environment: 'production',
          is_active: true,
        },
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponse) } as any);
      jest.spyOn(services, 'createDomain');

      const client = createClient({ token: mockToken, options: { debug: mockDebug } });

      const domain = { name: 'example.com', edgeApplicationId: 123 };
      const resultDomain = await client.createDomain(domain, { debug: mockDebug });
      expect(resultDomain).toEqual({
        state: 'executed',
        data: { id: '123', name: 'example.com', url: 'example.com', environment: 'production', active: true },
      });
      expect(client).toBeDefined();
    });

    it('should create a client with listDomains', async () => {
      const mockResponseListDomains = {
        count: 1,
        total_pages: 1,
        schema_version: 3,
        links: {
          previous: null,
          next: null,
        },
        results: [
          {
            id: 1700496622,
            name: 'My domain',
            cnames: [],
            cname_access_only: false,
            digital_certificate_id: 61561,
            edge_application_id: 1700498641,
            is_active: true,
            domain_name: 'd0ma1n3xmp.map.azionedge.net',
            environment: 'production',
            is_mtls_enabled: false,
            mtls_verification: 'enforce',
            mtls_trusted_ca_certificate_id: null,
            crl_list: null,
            edge_firewall_id: null,
          },
        ],
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponseListDomains) } as any);
      jest.spyOn(services, 'listDomains');

      const client = createClient({ token: mockToken, options: { debug: mockDebug } });

      const results = await client.listDomains({ debug: mockDebug });
      expect(results).toEqual({
        state: 'executed',
        count: 1,
        pages: 1,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1700496622,
            name: 'My domain',
            url: 'd0ma1n3xmp.map.azionedge.net',
            environment: 'production',
            active: true,
          }),
        ]),
      });
      expect(client).toBeDefined();
    });

    it('should create a client with getDomain', async () => {
      const mockResponse = {
        results: {
          id: 123,
          name: 'example.com',
          domain_name: 'example.com',
          environment: 'production',
          is_active: true,
        },
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponse) } as any);
      jest.spyOn(services, 'getDomainById');

      const client = createClient({ token: mockToken, options: { debug: mockDebug } });

      const result = await client.getDomain(123, { debug: mockDebug });
      expect(result).toEqual({
        state: 'executed',
        data: { id: 123, name: 'example.com', url: 'example.com', environment: 'production', active: true },
      });
      expect(client).toBeDefined();
    });
  });
});
