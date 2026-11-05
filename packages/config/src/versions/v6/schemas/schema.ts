import applicationsSchema from './applications';
import buildSchema from './build';
import connectorsSchema from './connectors';
import customPagesSchema from './customPages';
import environmentsSchema from './environments';
import firewallSchema from './firewall';
import functionsSchema from './functions';
import networkListSchema from './networkList';
import purgeSchema from './purge';
import storageSchema from './storage';
import wafSchema from './waf';
import workloadsSchema from './workloads';

/**
 * JSON Schema of the v6 config.
 */
const azionConfigSchema = {
  $id: 'azionConfig',
  definitions: {
    mainConfig: {
      type: 'object',
      properties: {
        version: { type: 'number', enum: [6] },
        build: buildSchema,
        functions: functionsSchema,
        storage: storageSchema,
        connectors: connectorsSchema,
        customPages: customPagesSchema,
        networkList: networkListSchema,
        waf: wafSchema,
        firewall: firewallSchema,
        applications: applicationsSchema,
        workloads: workloadsSchema,
        environments: environmentsSchema,
        purge: purgeSchema,
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties:
          'Config can only contain the following properties: version, build, functions, storage, connectors, customPages, networkList, waf, firewall, applications, workloads, environments, purge',
        type: 'Configuration must be an object',
      },
    },
  },
  $ref: '#/definitions/mainConfig',
};

export default azionConfigSchema;
