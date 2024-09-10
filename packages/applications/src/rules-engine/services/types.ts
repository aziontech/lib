export interface ApiListRulesParams {
  page?: number;
  page_size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: string;
}

export interface ApiListRulesResponse {
  count: number;
  total_pages: number;
  schema_version: number;
  links: {
    previous: string | null;
    next: string | null;
  };
  results: Rule[];
}

export interface Rule {
  id: number;
  name: string;
  phase: 'request' | 'response';
  behaviors: Behavior[];
  criteria: Criterion[][];
  is_active: boolean;
  order: number;
  description?: string;
}

export interface Behavior {
  name: string;
  target?: string | null | BehaviorTarget;
}

export interface BehaviorTarget {
  captured_array: string;
  subject: string;
  regex: string;
}

export interface Criterion {
  variable: string;
  operator: string;
  conditional: 'if' | 'and' | 'or';
  input_value: string;
}

export interface ApiCreateRulePayload {
  name: string;
  phase: 'request' | 'response';
  behaviors: Behavior[];
  criteria: Criterion[][];
  is_active?: boolean;
  order?: number;
  description?: string;
}

export interface ApiUpdateRulePayload extends Partial<ApiCreateRulePayload> {}

export interface ApiRuleResponse {
  results: Rule;
  schema_version: number;
}
export interface ApiListRulesParams {
  page?: number;
  page_size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: string;
}

export interface ApiListRulesResponse {
  count: number;
  total_pages: number;
  schema_version: number;
  links: {
    previous: string | null;
    next: string | null;
  };
  results: Rule[];
}

export interface Rule {
  id: number;
  name: string;
  phase: 'request' | 'response';
  behaviors: Behavior[];
  criteria: Criterion[][];
  is_active: boolean;
  order: number;
  description?: string;
}

export interface Behavior {
  name: string;
  target?: string | null | BehaviorTarget;
}

export interface BehaviorTarget {
  captured_array: string;
  subject: string;
  regex: string;
}

export interface Criterion {
  variable: string;
  operator: string;
  conditional: 'if' | 'and' | 'or';
  input_value: string;
}

export interface ApiCreateRulePayload {
  name: string;
  phase: 'request' | 'response';
  behaviors: Behavior[];
  criteria: Criterion[][];
  is_active?: boolean;
  order?: number;
  description?: string;
}

export interface ApiUpdateRulePayload extends Partial<ApiCreateRulePayload> {}

export interface ApiRuleResponse {
  results: Rule;
  schema_version: number;
}

export interface ApiListRulesParams {
  page?: number;
  page_size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: string;
}
