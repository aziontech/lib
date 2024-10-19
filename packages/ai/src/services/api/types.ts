import { AzionAIConfig, AzionAIMessage } from '../../types';

export interface ApiAzionAIRequest {
  messages: AzionAIMessage[];
  azion?: AzionAIConfig;
  stream: boolean;
}

export interface ApiAzionAIResponse {
  choices: {
    finish_reason: string;
    index: number;
    message: {
      content: string;
      role: string;
    };
    logprobs: null;
  }[];
  created: number;
  id: string;
  model: string;
  object: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
    completion_tokens_details: {
      reasoning_tokens: number;
    };
  };
}

export interface ApiAzionAIStreamResponse {
  choices: {
    delta: {
      content?: string;
    };
    finish_reason: string | null;
    index: number;
    logprobs: null;
  }[];
  created: number;
  id: string;
  model: string;
  object: string;
  system_fingerprint: string;
}
