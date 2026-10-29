/**
 * JSON Schema of the v6 config.
 * TODO: placeholder. Only `version` and `build` are accepted until the v6 schemas are defined.
 */
const azionConfigSchema = {
  $id: 'azionConfig',
  type: 'object',
  additionalProperties: false,
  properties: {
    version: { const: 6 },
    build: { type: 'object' },
  },
};

export default azionConfigSchema;
