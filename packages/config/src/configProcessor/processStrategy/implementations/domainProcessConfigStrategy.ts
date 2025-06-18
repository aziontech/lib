import { AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * DomainProcessConfigStrategy
 * @class DomainProcessConfigStrategy
 * @description This class is implementation of the Domain ProcessConfig Strategy.
 */
class DomainProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    const domain = config?.domain;
    if (!domain || Object.keys(domain).length === 0) {
      return;
    }
    if (
      domain.digitalCertificateId &&
      typeof domain.digitalCertificateId === 'string' &&
      domain.digitalCertificateId !== 'lets_encrypt'
    ) {
      throw new Error(
        `Domain ${domain.name} has an invalid digital certificate ID: ${domain.digitalCertificateId}. Only 'lets_encrypt' or null is supported.`,
      );
    }

    if (
      domain.mtls?.verification &&
      domain.mtls.verification !== 'enforce' &&
      domain.mtls.verification !== 'permissive'
    ) {
      throw new Error(
        `Domain ${domain.name} has an invalid verification value: ${domain.mtls.verification}. Only 'enforce' or 'permissive' is supported.`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domainSetting: any = {
      name: domain.name,
      cname_access_only: domain.cnameAccessOnly ?? false,
      cnames: domain.cnames || [],
      digital_certificate_id: domain.digitalCertificateId || null,
      edge_application_id: domain.edgeApplicationId || null,
      edge_firewall_id: domain.edgeFirewallId || null,
      is_active: domain.active === undefined ? true : domain.active,
    };
    if (domain.mtls) {
      domainSetting.is_mtls_enabled = true;
      domainSetting.mtls_verification = domain.mtls.verification;
      domainSetting.mtls_trusted_ca_certificate_id = domain.mtls.trustedCaCertificateId;
      domainSetting.crl_list = domain.mtls.crlList || [];
    } else {
      domainSetting.is_mtls_enabled = false;
    }
    return domainSetting;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const domain = payload.domain;
    if (!domain || Object.keys(domain).length === 0) {
      return;
    }
    transformedPayload.domain = {
      name: domain.name,
      cnameAccessOnly: domain.cname_access_only,
      cnames: domain.cnames,
      digitalCertificateId: domain.digital_certificate_id,
      edgeApplicationId: domain.edge_application_id,
      edgeFirewallId: domain.edge_firewall_id,
      active: domain.is_active === undefined ? true : domain.is_active,
      mtls: domain.mtls_verification
        ? {
            verification: domain.mtls_verification,
            trustedCaCertificateId: domain.mtls_trusted_ca_certificate_id,
            crlList: domain.crl_list,
          }
        : undefined,
    };
    return transformedPayload.domain;
  }
}

export default DomainProcessConfigStrategy;
