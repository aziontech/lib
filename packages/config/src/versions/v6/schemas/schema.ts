import applicationsSchema from './applications';
import buildSchema from './build';
import functionsSchema from './functions';

/**
 * JSON Schema of the v6 config.
 * TODO: only `version`, `build`, `functions` and `applications` are accepted until the schemas of the other v6 resources are defined.
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
        applications: applicationsSchema,
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties:
          'Config can only contain the following properties: version, build, functions, applications',
        type: 'Configuration must be an object',
      },
    },
  },
  $ref: '#/definitions/mainConfig',
};

export default azionConfigSchema;
