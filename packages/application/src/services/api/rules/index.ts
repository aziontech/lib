import {
  ApiCreateRuleRequest,
  ApiListRulesParams,
  ApiListRulesResponse,
  ApiRuleResponse,
  ApiUpdateRuleRequest,
} from './types';

const BASE_URL = 'https://api.azionapi.net/edge_applications';

/**
 * Lists all rules for a specific phase (request or response) of an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} edgeApplicationId - ID of the edge application.
 * @param {'request' | 'response'} phase - The phase of the rules.
 * @param {ApiListRulesParams} [params] - Optional parameters for filtering and pagination.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiListRulesResponse>} Array of rules or an error if retrieval failed.
 */
export const listRules = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  params?: ApiListRulesParams,
  debug?: boolean,
): Promise<ApiListRulesResponse> => {
  try {
    const { page = 1, page_size = 10, sort = 'name', order = 'asc' } = params || {};
    const queryParams = new URLSearchParams({
      page: String(page),
      page_size: String(page_size),
      sort,
      order,
    });
    const response = await fetch(
      `${BASE_URL}/${edgeApplicationId}/rules_engine/${phase}/rules?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
      },
    );
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error listing rules:', error);
    throw error;
  }
};

/**
 * Retrieves a specific rule by its ID for a given phase of an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} edgeApplicationId - ID of the edge application.
 * @param {'request' | 'response'} phase - The phase of the rule.
 * @param {number} ruleId - ID of the rule to retrieve.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiRuleResponse>} Rule data or an error if retrieval failed.
 */
export const getRuleById = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  ruleId: number,
  debug?: boolean,
): Promise<ApiRuleResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${edgeApplicationId}/rules_engine/${phase}/rules/${ruleId}`, {
      method: 'GET',
      headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error getting rule by ID:', error);
    throw error;
  }
};

/**
 * Creates a new rule for a specific phase of an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} edgeApplicationId - ID of the edge application.
 * @param {'request' | 'response'} phase - The phase for the new rule.
 * @param {ApiCreateRuleRequest} ruleData - Data of the rule to be created.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiRuleResponse>} The created rule or an error if creation failed.
 */
export const createRule = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  ruleData: ApiCreateRuleRequest,
  debug?: boolean,
): Promise<ApiRuleResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${edgeApplicationId}/rules_engine/${phase}/rules`, {
      method: 'POST',
      headers: {
        Accept: 'application/json; version=3',
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(ruleData),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error creating rule:', error);
    throw error;
  }
};

/**
 * Updates an existing rule for a specific phase of an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} edgeApplicationId - ID of the edge application.
 * @param {'request' | 'response'} phase - The phase of the rule to update.
 * @param {number} ruleId - ID of the rule to update.
 * @param {ApiUpdateRuleRequest} ruleData - New data for the rule.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiRuleResponse>} The updated rule or an error if update failed.
 */
export const updateRule = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  ruleId: number,
  ruleData: ApiUpdateRuleRequest,
  debug?: boolean,
): Promise<ApiRuleResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${edgeApplicationId}/rules_engine/${phase}/rules/${ruleId}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json; version=3',
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(ruleData),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error updating rule:', error);
    throw error;
  }
};

/**
 * Deletes a specific rule from an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} edgeApplicationId - ID of the edge application.
 * @param {'request' | 'response'} phase - The phase of the rule to delete.
 * @param {number} ruleId - ID of the rule to delete.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<void>} Resolves when the rule is successfully deleted.
 */
export const deleteRule = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  ruleId: number,
  debug?: boolean,
): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/${edgeApplicationId}/rules_engine/${phase}/rules/${ruleId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
    });
    if (debug) console.log('Response status:', response.status);
  } catch (error) {
    if (debug) console.error('Error deleting rule:', error);
    throw error;
  }
};
