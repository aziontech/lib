/* eslint-disable @typescript-eslint/no-explicit-any */
import createClient, { createDomain, deleteDomain, getDomain, getDomains, updateDomain } from '.';
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
        data: {
          state: 'executed',
          id: '123',
          name: 'example.com',
          url: 'example.com',
          environment: 'production',
          active: true,
        },
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
      const { data } = await createDomain(domain, { debug: mockDebug });
      expect(data).toEqual({
        state: 'executed',
        id: '123',
        name: 'example.com',
        url: 'example.com',
        environment: 'production',
        active: true,
      });
      expect(services.createDomain).toHaveBeenCalledWith(mockToken, domain, { debug: mockDebug });
    });

    it('should an error if the domain edgeApplicationId is not provided', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        json: () =>
          Promise.resolve({
            edge_application_id: ['This field is required.'],
          }),
      } as any);
      // @eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(createDomain({ name: 'example.com' } as any, { debug: mockDebug })).resolves.toEqual({
        error: { message: 'Domain name and Edge Application ID are required', operation: 'create domain' },
      });
    });

    it('should create a domain with status failed', async () => {
      const mockResponse = {
        detail: 'Invalid Token',
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponse) } as any);
      jest.spyOn(services, 'createDomain');

      const result = await createDomain({ name: 'example.com', edgeApplicationId: 123 }, { debug: mockDebug });
      expect(result).toEqual({
        error: { message: 'Invalid Token', operation: 'create domain' },
      });
      expect(services.createDomain).toHaveBeenCalledWith(
        mockToken,
        { name: 'example.com', edgeApplicationId: 123 },
        { debug: mockDebug },
      );
    });
  });

  describe('getDomains', () => {
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
      jest.spyOn(services, 'getDomains');

      const results = await getDomains({ debug: mockDebug });
      expect(results.data).toEqual({
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
      expect(services.getDomains).toHaveBeenCalledWith(mockToken, { debug: mockDebug }, undefined);
    });

    it('should list domains with all fields', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponseListDomains) } as any);
      jest.spyOn(services, 'getDomains');

      const queryParams: any = { orderBy: 'id', page: 1, pageSize: 1, sort: 'asc' };
      const results = await getDomains({ debug: mockDebug }, queryParams);
      expect(results.data).toEqual({
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
      expect(services.getDomains).toHaveBeenCalledWith(mockToken, { debug: mockDebug }, queryParams);
    });

    it('should list domains with mtls', async () => {
      mockResponseListDomains.results[0].is_mtls_enabled = true;
      mockResponseListDomains.results[0].mtls_verification = 'enforce';
      mockResponseListDomains.results[0].mtls_trusted_ca_certificate_id = 123;
      mockResponseListDomains.results[0].crl_list = [111];
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponseListDomains) } as any);
      jest.spyOn(services, 'getDomains');

      const results = await getDomains({ debug: mockDebug });
      expect(results.data).toEqual({
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
      expect(services.getDomains).toHaveBeenCalledWith(mockToken, { debug: mockDebug }, undefined);
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

      expect(result).toEqual({
        data: {
          state: 'executed',
          id: 123,
          name: 'example.com',
          url: 'example.com',
          environment: 'production',
          active: true,
        },
      });
      expect(services.getDomainById).toHaveBeenCalledWith(mockToken, 123, { debug: mockDebug });
    });

    it('should get a domain by id with all fields', async () => {
      const mockResponse = {
        results: {
          id: 123,
          name: 'example.com',
          domain_name: 'example.com',
          environment: 'production',
          is_active: true,
          cnames: ['cname1', 'cname2'],
          cname_access_only: true,
          digital_certificate_id: 'lets_encrypt',
          edge_application_id: 123,
          edge_firewall_id: null,
          is_mtls_enabled: true,
          mtls_verification: 'enforce',
          mtls_trusted_ca_certificate_id: 123,
          crl_list: [111],
        },
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponse) } as any);
      jest.spyOn(services, 'getDomainById');

      const result = await getDomain(123, { debug: mockDebug });
      expect(result).toEqual({
        data: {
          state: 'executed',
          id: 123,
          name: 'example.com',
          url: 'example.com',
          environment: 'production',
          active: true,
          cnames: ['cname1', 'cname2'],
          cnameAccessOnly: true,
          digitalCertificateId: 'lets_encrypt',
          edgeFirewallId: null,
          edgeApplicationId: 123,
          mtls: {
            verification: 'enforce',
            trustedCaCertificateId: 123,
            crlList: [111],
          },
        },
      });
      expect(services.getDomainById).toHaveBeenCalledWith(mockToken, 123, { debug: mockDebug });
    });
  });

  describe('updateDomain', () => {
    it('should update a domain', async () => {
      const mockResponse = {
        results: {
          id: 170,
          name: 'Overwritten Domain',
          cnames: ['different-cname.org', 'new-domain.net'],
          cname_access_only: false,
          digital_certificate_id: 61561,
          edge_application_id: 123,
          is_active: false,
          domain_name: 'n3wd0ma1n9.map.azionedge.net',
          environment: 'production',
          is_mtls_enabled: false,
          mtls_verification: 'enforce',
          mtls_trusted_ca_certificate_id: null,
          crl_list: null,
          edge_firewall_id: null,
        },
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponse) } as any);
      jest.spyOn(services, 'updateDomain');

      const result = await updateDomain(
        170,
        { name: 'Overwritten Domain', edgeApplicationId: 123, active: false },
        { debug: mockDebug },
      );
      expect(result).toEqual({
        data: {
          state: 'executed',
          id: 170,
          name: 'Overwritten Domain',
          url: 'n3wd0ma1n9.map.azionedge.net',
          environment: 'production',
          active: false,
          cnameAccessOnly: false,
          cnames: ['different-cname.org', 'new-domain.net'],
          digitalCertificateId: 61561,
          edgeApplicationId: 123,
          edgeFirewallId: null,
          mtls: undefined,
        },
      });
      expect(services.updateDomain).toHaveBeenCalledWith(
        mockToken,
        170,
        { name: 'Overwritten Domain', edgeApplicationId: 123, active: false },
        { debug: mockDebug },
      );
    });

    it('should fail to update a domain if edgeApplicationId is not provided', async () => {
      const mockResponse = {
        edge_application_id: ['This field is required.'],
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponse) } as any);

      const result = await updateDomain(170, { name: 'Overwritten Domain', active: false }, { debug: mockDebug });

      expect(result.error).toEqual({
        message: 'Edge Application ID is required',
        operation: 'update domain',
      });
    });

    it('should fail to update a domain if the some field is invalid', async () => {
      const mockResponse = {
        duplicated_domain_name: 'my domain',
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponse) } as any);

      const result = await updateDomain(170, { name: 'my domain', edgeApplicationId: 123 }, { debug: mockDebug });

      expect(result.error).toEqual({
        message: '{"duplicated_domain_name":"my domain"}',
        operation: 'update domain',
      });
    });

    it('should update a domain with all fields', async () => {
      const mockResponse = {
        results: {
          id: 170,
          name: 'Overwritten Domain',
          cnames: ['different-cname.org', 'new-domain.net'],
          cname_access_only: false,
          digital_certificate_id: 61561,
          edge_application_id: 123,
          is_active: false,
          domain_name: 'n3wd0ma1n9.map.azionedge.net',
          environment: 'production',
          is_mtls_enabled: true,
          mtls_verification: 'enforce',
          mtls_trusted_ca_certificate_id: 123,
          crl_list: [111],
          edge_firewall_id: null,
        },
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponse) } as any);
      jest.spyOn(services, 'updateDomain');

      const domain: any = {
        name: 'Overwritten Domain',
        cnames: ['different-cname.org', 'new-domain.net'],
        cnameAccessOnly: false,
        digitalCertificateId: 61561,
        edgeApplicationId: 123,
        active: false,
        mtls: {
          verification: 'enforce',
          trustedCaCertificateId: 123,
          crlList: [111],
        },
      };
      const result = await updateDomain(170, domain, { debug: mockDebug });
      expect(result).toEqual({
        data: {
          state: 'executed',
          id: 170,
          name: 'Overwritten Domain',
          url: 'n3wd0ma1n9.map.azionedge.net',
          environment: 'production',
          active: false,
          cnameAccessOnly: false,
          cnames: ['different-cname.org', 'new-domain.net'],
          digitalCertificateId: 61561,
          edgeApplicationId: 123,
          edgeFirewallId: null,
          mtls: {
            verification: 'enforce',
            trustedCaCertificateId: 123,
            crlList: [111],
          },
        },
      });
      expect(services.updateDomain).toHaveBeenCalledWith(mockToken, 170, domain, { debug: mockDebug });
    });
  });

  describe('deleteDomain', () => {
    it('should delete a domain', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 204 } as any);
      jest.spyOn(services, 'deleteDomain');

      const result = await deleteDomain(123, { debug: mockDebug });
      expect(result).toEqual(expect.objectContaining({ data: { state: 'executed', id: 123 } }));
      expect(services.deleteDomain).toHaveBeenCalledWith(mockToken, 123, { debug: mockDebug });
    });

    it('should throw an error if the domain deletion fails with a message', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 404,
        json: () => Promise.resolve({ detail: 'Not found.' }),
      } as any);
      jest.spyOn(services, 'deleteDomain');

      const result = await deleteDomain(123, { debug: mockDebug });
      expect(result).toEqual(expect.objectContaining({ error: { message: 'Not found.', operation: 'delete domain' } }));
      expect(services.deleteDomain).toHaveBeenCalledWith(mockToken, 123, { debug: mockDebug });
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
        data: {
          state: 'executed',
          id: '123',
          name: 'example.com',
          url: 'example.com',
          environment: 'production',
          active: true,
        },
      });
      expect(client).toBeDefined();
    });

    it('should create a client with getDomains', async () => {
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
      jest.spyOn(services, 'getDomains');

      const client = createClient({ token: mockToken, options: { debug: mockDebug } });

      const results = await client.getDomains({ debug: mockDebug });
      expect(results.data).toEqual({
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
        data: {
          state: 'executed',
          id: 123,
          name: 'example.com',
          url: 'example.com',
          environment: 'production',
          active: true,
        },
      });
      expect(client).toBeDefined();
    });

    it('should create a client with updateDomain', async () => {
      const mockResponse = {
        results: {
          id: 170,
          name: 'Overwritten Domain',
          cnames: ['different-cname.org', 'new-domain.net'],
          cname_access_only: false,
          digital_certificate_id: 61561,
          edge_application_id: 123,
          is_active: false,
          domain_name: 'n3wd0ma1n9.map.azionedge.net',
          environment: 'production',
          is_mtls_enabled: false,
          mtls_verification: 'enforce',
          mtls_trusted_ca_certificate_id: null,
          crl_list: null,
          edge_firewall_id: null,
        },
      };
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockResponse) } as any);
      jest.spyOn(services, 'updateDomain');

      const client = createClient({ token: mockToken, options: { debug: mockDebug } });

      const result = await client.updateDomain(
        170,
        { name: 'Overwritten Domain', edgeApplicationId: 123, active: false },
        { debug: mockDebug },
      );
      expect(result).toEqual({
        data: {
          state: 'executed',
          id: 170,
          name: 'Overwritten Domain',
          url: 'n3wd0ma1n9.map.azionedge.net',
          environment: 'production',
          active: false,
          cnameAccessOnly: false,
          cnames: ['different-cname.org', 'new-domain.net'],
          digitalCertificateId: 61561,
          edgeApplicationId: 123,
          edgeFirewallId: null,
          mtls: undefined,
        },
      });
      expect(client).toBeDefined();
    });

    it('should create a client with deleteDomain', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 204 } as any);
      jest.spyOn(services, 'deleteDomain');

      const client = createClient({ token: mockToken, options: { debug: mockDebug } });

      const result = await client.deleteDomain(123, { debug: mockDebug });
      expect(result).toEqual({
        data: { id: 123, state: 'executed' },
      });
      expect(client).toBeDefined();
    });
  });
});
