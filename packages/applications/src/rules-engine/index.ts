import { AzionApplicationCollectionResponse, AzionApplicationResponse, AzionClientOptions } from '../types';
import { resolveDebug, resolveToken } from '../utils';
import { createRule, deleteRule, getRuleById, listRules, updateRule } from './services/index';
import { ApiCreateRulePayload, ApiListRulesParams, ApiUpdateRulePayload } from './services/types';
import { AzionRule } from './types';

/**
 * Creates a new rule for an Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for creating a rule.
 * @param {number} params.applicationId - The ID of the application to create the rule for.
 * @param {'request' | 'response'} params.phase - The phase of the rule (request or response).
 * @param {ApiCreateRulePayload} params.data - The data for the new rule.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionRule>>} A promise that resolves with the created rule data or an error.
 *
 * @example
 * const { error, data } = await createRule({
 *   applicationId: 123,
 *   phase: 'request',
 *   data: { name: 'My New Rule', behaviors: [...] },
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Error:', error);
 * } else {
 *   console.log('Rule created:', data);
 * }
 */
export const createRuleWrapper = ({
  applicationId,
  phase,
  data,
  options,
}: {
  applicationId: number;
  phase: 'request' | 'response';
  data: ApiCreateRulePayload;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionRule>> =>
  createRuleMethod(resolveToken(), applicationId, phase, data, options);

/**
 * Retrieves a specific rule from an Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for retrieving a rule.
 * @param {number} params.applicationId - The ID of the application containing the rule.
 * @param {'request' | 'response'} params.phase - The phase of the rule (request or response).
 * @param {number} params.ruleId - The ID of the rule to retrieve.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionRule>>} A promise that resolves with the rule data or an error.
 *
 * @example
 * const { error, data } = await getRule({
 *   applicationId: 123,
 *   phase: 'request',
 *   ruleId: 456,
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Error:', error);
 * } else {
 *   console.log('Rule retrieved:', data);
 * }
 */
export const getRuleWrapper = ({
  applicationId,
  phase,
  ruleId,
  options,
}: {
  applicationId: number;
  phase: 'request' | 'response';
  ruleId: number;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionRule>> =>
  getRuleMethod(resolveToken(), applicationId, phase, ruleId, options);

/**
 * Retrieves a list of rules for an Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for retrieving rules.
 * @param {number} params.applicationId - The ID of the application to retrieve rules from.
 * @param {'request' | 'response'} params.phase - The phase of the rules to retrieve (request or response).
 * @param {ApiListRulesParams} [params.params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionRule>>} A promise that resolves with a collection of rules or an error.
 *
 * @example
 * const { error, data } = await getRules({
 *   applicationId: 123,
 *   phase: 'request',
 *   params: { page: 1, page_size: 20 },
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Error:', error);
 * } else {
 *   console.log('Rules retrieved:', data.results);
 * }
 */
export const getRulesWrapper = ({
  applicationId,
  phase,
  params,
  options,
}: {
  applicationId: number;
  phase: 'request' | 'response';
  params?: ApiListRulesParams;
  options?: AzionClientOptions;
}): Promise<AzionApplicationCollectionResponse<AzionRule>> =>
  getRulesMethod(resolveToken(), applicationId, phase, params, options);

/**
 * Updates an existing rule in an Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for updating a rule.
 * @param {number} params.applicationId - The ID of the application containing the rule.
 * @param {'request' | 'response'} params.phase - The phase of the rule (request or response).
 * @param {number} params.ruleId - The ID of the rule to update.
 * @param {ApiUpdateRulePayload} params.data - The updated data for the rule.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionRule>>} A promise that resolves with the updated rule data or an error.
 *
 * @example
 * const { error, data } = await updateRule({
 *   applicationId: 123,
 *   phase: 'request',
 *   ruleId: 456,
 *   data: { name: 'Updated Rule Name', behaviors: [...] },
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Error:', error);
 * } else {
 *   console.log('Rule updated:', data);
 * }
 */
export const updateRuleWrapper = ({
  applicationId,
  phase,
  ruleId,
  data,
  options,
}: {
  applicationId: number;
  phase: 'request' | 'response';
  ruleId: number;
  data: ApiUpdateRulePayload;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionRule>> =>
  updateRuleMethod(resolveToken(), applicationId, phase, ruleId, data, options);

/**
 * Deletes a rule from an Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for deleting a rule.
 * @param {number} params.applicationId - The ID of the application containing the rule.
 * @param {'request' | 'response'} params.phase - The phase of the rule (request or response).
 * @param {number} params.ruleId - The ID of the rule to delete.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<void>>} A promise that resolves when the rule is deleted or rejects with an error.
 *
 * @example
 * const { error, data } = await deleteRule({
 *   applicationId: 123,
 *   phase: 'request',
 *   ruleId: 456,
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Error:', error);
 * } else {
 *   console.log('Rule deleted successfully');
 * }
 */
export const deleteRuleWrapper = ({
  applicationId,
  phase,
  ruleId,
  options,
}: {
  applicationId: number;
  phase: 'request' | 'response';
  ruleId: number;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<void>> => deleteRuleMethod(resolveToken(), applicationId, phase, ruleId, options);

/**
 * Internal method to create a new rule.
 *
 * @async
 * @function
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - The ID of the application.
 * @param {'request' | 'response'} phase - The phase of the rule (request or response).
 * @param {ApiCreateRulePayload} ruleData - The data for the new rule.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionRule>>} A promise that resolves with the created rule data or an error.
 */
export const createRuleMethod = async (
  token: string,
  Id: number,
  phase: 'request' | 'response',
  ruleData: ApiCreateRulePayload,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionRule>> => {
  try {
    const { results } = await createRule(resolveToken(token), Id, phase, ruleData, resolveDebug(options?.debug));
    return { data: results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to create rule',
        operation: 'create rule',
      },
    };
  }
};

/**
 * Internal method to retrieve a specific rule.
 *
 * @async
 * @function
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - The ID of the application.
 * @param {'request' | 'response'} phase - The phase of the rule (request or response).
 * @param {number} ruleId - The ID of the rule to retrieve.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionRule>>} A promise that resolves with the rule data or an error.
 */
export const getRuleMethod = async (
  token: string,
  Id: number,
  phase: 'request' | 'response',
  ruleId: number,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionRule>> => {
  try {
    const { results } = await getRuleById(resolveToken(token), Id, phase, ruleId, resolveDebug(options?.debug));
    return { data: results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get rule',
        operation: 'get rule',
      },
    };
  }
};

/**
 * Internal method to retrieve a list of rules.
 *
 * @async
 * @function
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - The ID of the application.
 * @param {'request' | 'response'} phase - The phase of the rules to retrieve (request or response).
 * @param {ApiListRulesParams} [params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionRule>>} A promise that resolves with a collection of rules or an error.
 */
export const getRulesMethod = async (
  token: string,
  Id: number,
  phase: 'request' | 'response',
  params?: ApiListRulesParams,
  options?: AzionClientOptions,
): Promise<AzionApplicationCollectionResponse<AzionRule>> => {
  try {
    const data = await listRules(resolveToken(token), Id, phase, params, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get rules',
        operation: 'get rules',
      },
    };
  }
};

/**
 * Internal method to update an existing rule.
 *
 * @async
 * @function
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - The ID of the application.
 * @param {'request' | 'response'} phase - The phase of the rule (request or response).
 * @param {number} ruleId - The ID of the rule to update.
 * @param {ApiUpdateRulePayload} ruleData - The updated data for the rule.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionRule>>} A promise that resolves with the updated rule data or an error.
 */
export const updateRuleMethod = async (
  token: string,
  Id: number,
  phase: 'request' | 'response',
  ruleId: number,
  ruleData: ApiUpdateRulePayload,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionRule>> => {
  try {
    const { results } = await updateRule(
      resolveToken(token),
      Id,
      phase,
      ruleId,
      ruleData,
      resolveDebug(options?.debug),
    );
    return { data: results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update rule',
        operation: 'update rule',
      },
    };
  }
};

/**
 * Internal method to delete a rule.
 *
 * @async
 * @function
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - The ID of the application.
 * @param {'request' | 'response'} phase - The phase of the rule (request or response).
 * @param {number} ruleId - The ID of the rule to delete.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<void>>} A promise that resolves when the rule is deleted or rejects with an error.
 */
export const deleteRuleMethod = async (
  token: string,
  Id: number,
  phase: 'request' | 'response',
  ruleId: number,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<void>> => {
  try {
    await deleteRule(resolveToken(token), Id, phase, ruleId, resolveDebug(options?.debug));
    return { data: undefined };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete rule',
        operation: 'delete rule',
      },
    };
  }
};
