import {
  COOKIE_BEHAVIORS,
  HEADER_BEHAVIORS,
  ID_BEHAVIORS,
  NO_ARGS_BEHAVIORS,
  STRING_BEHAVIORS,
} from '../../../../constants';

const noArgsBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: NO_ARGS_BEHAVIORS,
      errorMessage: "The 'type' field must be a valid no-args behavior type.",
    },
  },
  required: ['type'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in no-args behaviors.',
    required: "The 'type' field is required in no-args behaviors.",
  },
};

const stringBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: STRING_BEHAVIORS,
      errorMessage: "The 'type' field must be a valid string behavior type.",
    },
    attributes: {
      type: 'object',
      properties: {
        value: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          pattern: '.*',
          errorMessage: "The 'value' field must be a string between 1 and 255 characters.",
        },
      },
      required: ['value'],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in string behavior attributes.',
        required: "The 'value' field is required in string behavior attributes.",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

// Schema para behaviors com ID value (run_function, set_cache_policy, etc.)
const idBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ID_BEHAVIORS,
      errorMessage: "The 'type' field must be a valid ID behavior type.",
    },
    attributes: {
      type: 'object',
      properties: {
        value: {
          oneOf: [
            {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              pattern: '.*',
            },
            {
              type: 'number',
              minimum: 1,
            },
          ],
          errorMessage: "The 'value' field must be a string or positive number.",
        },
      },
      required: ['value'],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in ID behavior attributes.',
        required: "The 'value' field is required in ID behavior attributes.",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

const headerBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: HEADER_BEHAVIORS,
      errorMessage: "The 'type' field must be a valid header behavior type.",
    },
    attributes: {
      type: 'object',
      properties: {
        value: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          pattern: '.*',
          errorMessage: "The 'value' field must be a non-empty string between 1 and 255 characters.",
        },
      },
      required: ['value'],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in header behavior attributes.',
        required: "The 'value' field is required in header behavior attributes.",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

const cookieBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: COOKIE_BEHAVIORS,
      errorMessage: "The 'type' field must be a valid cookie behavior type.",
    },
    attributes: {
      type: 'object',
      properties: {
        value: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          pattern: '.*',
          errorMessage: "The 'value' field must be a non-empty string between 1 and 255 characters.",
        },
      },
      required: ['value'],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in cookie behavior attributes.',
        required: "The 'value' field is required in cookie behavior attributes.",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

const captureGroupsBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['capture_match_groups'],
      errorMessage: "The 'type' field must be 'capture_match_groups'.",
    },
    attributes: {
      type: 'object',
      properties: {
        regex: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          pattern: '.*',
          errorMessage: "The 'regex' field must be a string between 1 and 255 characters.",
        },
        subject: {
          type: 'string',
          minLength: 4,
          maxLength: 50,
          pattern: '.*',
          errorMessage: "The 'subject' field must be a string between 4 and 50 characters.",
        },
        captured_array: {
          type: 'string',
          minLength: 1,
          maxLength: 10,
          pattern: '.*',
          errorMessage: "The 'captured_array' field must be a string between 1 and 10 characters.",
        },
      },
      required: ['regex', 'subject', 'captured_array'],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in capture groups behavior attributes.',
        required:
          "All fields ('regex', 'subject', 'captured_array') are required in capture groups behavior attributes.",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

const applicationRuleBehaviorSchema = {
  oneOf: [
    noArgsBehaviorSchema,
    stringBehaviorSchema,
    idBehaviorSchema,
    headerBehaviorSchema,
    cookieBehaviorSchema,
    captureGroupsBehaviorSchema,
  ],
  errorMessage: 'Each behavior must match one of the valid behavior formats.',
};

export default applicationRuleBehaviorSchema;
