import { BUILD_BUNDLERS } from '../../../constants';

const buildSchema = {
  type: 'object',
  properties: {
    entry: {
      oneOf: [
        { type: 'string' },
        { type: 'array', items: { type: 'string' } },
        { type: 'object', additionalProperties: { type: 'string' } },
      ],
      errorMessage: "The 'build.entry' must be a string, array of strings, or object with string values",
    },
    bundler: {
      type: 'string',
      enum: BUILD_BUNDLERS,
      errorMessage: "The 'build.bundler' must be either 'webpack' or 'esbuild'",
    },
    preset: {
      anyOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            metadata: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  errorMessage: "The 'name' field in preset metadata must be a string",
                },
                ext: {
                  type: 'string',
                  errorMessage: "The 'ext' field in preset metadata must be a string",
                },
              },
              required: ['name'],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: 'No additional properties are allowed in preset metadata',
                required: "The 'name' field is required in preset metadata",
              },
            },
            // validated against the config of the file only when the preset has no `configs` (see `if` below)
            config: { type: 'object' },
            configs: {
              type: 'object',
              additionalProperties: { type: 'object' },
              errorMessage: "The 'configs' field in preset must be an object keyed by API version",
            },
            handler: { instanceof: 'Function' },
            prebuild: { instanceof: 'Function' },
            postbuild: { instanceof: 'Function' },
          },
          required: ['metadata', 'config'],
          // `config` is the preset config of the default API version, which may differ from the version of this file
          // (e.g. the v4 `config` of a preset used in a v3 file), so it is only checked against this version's schema
          // when the preset has no `configs` to pick the right version from.
          if: { required: ['configs'] },
          else: { properties: { config: { $ref: '#/definitions/mainConfig' } } },
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in preset',
            required: "Preset must contain both 'metadata' and 'config' properties",
          },
        },
      ],
      errorMessage: 'Preset must be either a string or an object with preset properties',
    },
    polyfills: {
      type: 'boolean',
      errorMessage: "The 'build.polyfills' must be a boolean",
    },
    worker: {
      type: 'boolean',
      errorMessage: "The 'build.worker' must be a boolean",
    },
    extend: {
      instanceof: 'Function',
      errorMessage: "The 'build.extend' must be a function",
    },
    memoryFS: {
      type: 'object',
      properties: {
        injectionDirs: {
          type: 'array',
          items: { type: 'string' },
        },
        removePathPrefix: { type: 'string' },
      },
      required: ['injectionDirs', 'removePathPrefix'],
      additionalProperties: false,
    },
  },
  additionalProperties: false,
  errorMessage: {
    additionalProperties: "No additional properties are allowed in the 'build' object",
  },
};

export default buildSchema;
