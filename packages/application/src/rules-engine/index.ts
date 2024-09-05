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
  applicationId,
  phase,
  data,
  options,
}: {
  applicationId: number;
  phase: 'request' | 'response';
  data: ApiCreateRulePayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionRule>> =>
  createRuleMethod(resolveToken(), applicationId, phase, data, options);

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
}): Promise<AzionEdgeApplicationResponse<AzionRule>> =>
  getRuleMethod(resolveToken(), applicationId, phase, ruleId, options);

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
}): Promise<AzionEdgeApplicationCollectionResponse<AzionRule>> =>
  getRulesMethod(resolveToken(), applicationId, phase, params, options);

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
}): Promise<AzionEdgeApplicationResponse<AzionRule>> =>
  updateRuleMethod(resolveToken(), applicationId, phase, ruleId, data, options);

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
}): Promise<AzionEdgeApplicationResponse<void>> =>
  deleteRuleMethod(resolveToken(), applicationId, phase, ruleId, options);
