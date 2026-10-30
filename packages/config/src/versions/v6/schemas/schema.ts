import buildSchema from './build';

/**
 * JSON Schema of the v6 config.
 * TODO: only `version` and `build` are accepted until the schemas of the other v6 resources are defined.
 */
const azionConfigSchema = {
  $id: 'azionConfig',
  definitions: {
    mainConfig: {
      type: 'object',
      properties: {
        version: { type: 'number', enum: [6] },
        build: buildSchema,
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'Config can only contain the following properties: version, build',
        type: 'Configuration must be an object',
      },
    },
  },
  $ref: '#/definitions/mainConfig',
};

export default azionConfigSchema;
