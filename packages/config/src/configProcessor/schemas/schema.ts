import applicationsSchema from './applications';
import buildSchema from './build';
import connectorsSchema from './connectors';
import customPagesSchema from './customPages';
import firewallSchema from './firewall';
import functionsSchema from './functions';
import kvSchema from './kv';
import networkListSchema from './networkList';
import purgeSchema from './purge';
import storageSchema from './storage';
import wafSchema from './waf';
import workloadsSchema from './workloads';

const azionConfigSchema = {
  $id: 'azionConfig',
  definitions: {
    mainConfig: {
      type: 'object',
      properties: {
        build: buildSchema,
        applications: applicationsSchema,
        workloads: workloadsSchema,
        purge: purgeSchema,
        firewall: firewallSchema,
        networkList: networkListSchema,
        waf: wafSchema,
        connectors: connectorsSchema,
        functions: functionsSchema,
        customPages: customPagesSchema,
        storage: storageSchema,
        kv: kvSchema,
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties:
          'Config can only contain the following properties: build, functions, applications, workloads, purge, firewall, networkList, waf, connectors, customPages',
        type: 'Configuration must be an object',
      },
    },
  },
  $ref: '#/definitions/mainConfig',
};

export default azionConfigSchema;
