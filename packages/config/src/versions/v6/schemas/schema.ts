import applicationsSchema from './applications';
import buildSchema from './build';
import connectorsSchema from './connectors';
import deploymentsSchema from './deployments';
import environmentsSchema from './environments';
import functionsSchema from './functions';
import storageSchema from './storage';
import workloadsSchema from './workloads';

/**
 * JSON Schema of the v6 config.
 * TODO: only `version`, `build`, `functions`, `storage`, `connectors`, `applications`, `workloads`, `environments` and `deployments` are accepted until the schemas of the other v6 resources are defined.
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
        applications: applicationsSchema,
        workloads: workloadsSchema,
        environments: environmentsSchema,
        deployments: deploymentsSchema,
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties:
          'Config can only contain the following properties: version, build, functions, storage, connectors, applications, workloads, environments, deployments',
        type: 'Configuration must be an object',
      },
    },
  },
  $ref: '#/definitions/mainConfig',
};

export default azionConfigSchema;
