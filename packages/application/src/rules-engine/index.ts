import { AzionClientOptions, AzionEdgeApplicationCollectionResponse, AzionEdgeApplicationResponse } from '../types';
import { resolveDebug, resolveToken } from '../utils';
import { createRule, deleteRule, getRuleById, listRules, updateRule } from './services/index';
import { ApiCreateRulePayload, ApiListRulesParams, ApiUpdateRulePayload } from './services/types';
import { AzionRule } from './types';

const createRuleMethod = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  ruleData: ApiCreateRulePayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionRule>> => {
  try {
    const { results } = await createRule(
      resolveToken(token),
      edgeApplicationId,
      phase,
      ruleData,
      resolveDebug(options?.debug),
    );
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

const getRuleMethod = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  ruleId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionRule>> => {
  try {
    const { results } = await getRuleById(
      resolveToken(token),
      edgeApplicationId,
      phase,
      ruleId,
      resolveDebug(options?.debug),
    );
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

const getRulesMethod = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  params?: ApiListRulesParams,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationCollectionResponse<AzionRule>> => {
  try {
    const data = await listRules(resolveToken(token), edgeApplicationId, phase, params, resolveDebug(options?.debug));
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

const updateRuleMethod = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  ruleId: number,
  ruleData: ApiUpdateRulePayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionRule>> => {
  try {
    const { results } = await updateRule(
      resolveToken(token),
      edgeApplicationId,
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

const deleteRuleMethod = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  ruleId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<void>> => {
  try {
    await deleteRule(resolveToken(token), edgeApplicationId, phase, ruleId, resolveDebug(options?.debug));
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

export const createRuleWrapper = ({
  edgeApplicationId,
  phase,
  ruleData,
  options,
}: {
  edgeApplicationId: number;
  phase: 'request' | 'response';
  ruleData: ApiCreateRulePayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionRule>> =>
  createRuleMethod(resolveToken(), edgeApplicationId, phase, ruleData, options);

export const getRuleWrapper = ({
  edgeApplicationId,
  phase,
  ruleId,
  options,
}: {
  edgeApplicationId: number;
  phase: 'request' | 'response';
  ruleId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionRule>> =>
  getRuleMethod(resolveToken(), edgeApplicationId, phase, ruleId, options);

export const getRulesWrapper = ({
  edgeApplicationId,
  phase,
  params,
  options,
}: {
  edgeApplicationId: number;
  phase: 'request' | 'response';
  params?: ApiListRulesParams;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationCollectionResponse<AzionRule>> =>
  getRulesMethod(resolveToken(), edgeApplicationId, phase, params, options);

export const updateRuleWrapper = ({
  edgeApplicationId,
  phase,
  ruleId,
  ruleData,
  options,
}: {
  edgeApplicationId: number;
  phase: 'request' | 'response';
  ruleId: number;
  ruleData: ApiUpdateRulePayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionRule>> =>
  updateRuleMethod(resolveToken(), edgeApplicationId, phase, ruleId, ruleData, options);

export const deleteRuleWrapper = ({
  edgeApplicationId,
  phase,
  ruleId,
  options,
}: {
  edgeApplicationId: number;
  phase: 'request' | 'response';
  ruleId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<void>> =>
  deleteRuleMethod(resolveToken(), edgeApplicationId, phase, ruleId, options);

export {
  createRuleWrapper as createRule,
  deleteRuleWrapper as deleteRule,
  getRuleWrapper as getRule,
  getRulesWrapper as getRules,
  updateRuleWrapper as updateRule,
};
