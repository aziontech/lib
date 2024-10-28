/**
 * Represents a message in the AI conversation.
 *
 * @property {('system' | 'user' | 'assistant')} role - The role of the message sender.
 * @property {string} content - The content of the message.
 */
export interface AzionAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Configuration options for the Azion AI request.
 *
 * @property {string} [session_id] - Unique identifier for the session.
 * @property {string} [url] - URL associated with the request.
 * @property {string} [app] - Application identifier.
 * @property {string} [user_name] - Name of the user.
 * @property {string} [client_id] - Client identifier.
 * @property {string} [system_prompt] - System-level prompt.
 * @property {string} [user_prompt] - User-level prompt.
 */
export interface AzionAIConfig {
  session_id?: string;
  url?: string;
  app?: string;
  user_name?: string;
  client_id?: string;
  system_prompt?: string;
  user_prompt?: string;
}

/**
 * Structure of an AI request to be sent to the Azion AI service.
 *
 * @property {AzionAIMessage[]} messages - Array of messages in the conversation.
 * @property {AzionAIConfig} [azion] - Additional Azion-specific configuration.
 * @property {boolean} [stream] - Whether to use streaming for the response.
 */
export interface AzionAIRequest {
  messages: AzionAIMessage[];
  azion?: AzionAIConfig;
  stream?: boolean;
}

/**
 * Structure of the AI response received from the Azion AI service.
 *
 * @property {Object[]} choices - Array of response choices.
 * @property {string} choices[].finish_reason - Reason for finishing the response.
 * @property {number} choices[].index - Index of the choice.
 * @property {Object} choices[].message - Message content and role.
 * @property {string} choices[].message.content - Content of the message.
 * @property {string} choices[].message.role - Role of the message sender.
 * @property {null} choices[].logprobs - Log probabilities (null in this case).
 * @property {number} created - Timestamp of when the response was created.
 * @property {string} id - Unique identifier for the response.
 * @property {string} model - Model used for generating the response.
 * @property {string} object - Type of object returned.
 * @property {Object} usage - Token usage statistics.
 * @property {number} usage.completion_tokens - Number of tokens in the completion.
 * @property {number} usage.prompt_tokens - Number of tokens in the prompt.
 * @property {number} usage.total_tokens - Total number of tokens used.
 * @property {Object} usage.completion_tokens_details - Detailed token usage for completion.
 * @property {number} usage.completion_tokens_details.reasoning_tokens - Number of tokens used for reasoning.
 */
export interface AzionAIResponse {
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

/**
 * Structure of a streaming AI response from the Azion AI service.
 *
 * @property {Object[]} choices - Array of response choices.
 * @property {Object} choices[].delta - Delta of the response content.
 * @property {string} [choices[].delta.content] - Content of the delta, if any.
 * @property {string | null} choices[].finish_reason - Reason for finishing the response, if applicable.
 * @property {number} choices[].index - Index of the choice.
 * @property {null} choices[].logprobs - Log probabilities (null in this case).
 * @property {number} created - Timestamp of when the response was created.
 * @property {string} id - Unique identifier for the response.
 * @property {string} model - Model used for generating the response.
 * @property {string} object - Type of object returned.
 * @property {string} system_fingerprint - Fingerprint of the system.
 */
export interface AzionAIStreamResponse {
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

/**
 * Generic result type for Azion AI operations.
 *
 * @template T - The type of data expected in the result.
 * @property {T | null} data - The data returned from the operation, if successful.
 * @property {Error | null} error - The error object, if the operation failed.
 */
export interface AzionAIResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Interface for the Azion AI client, providing methods to interact with the AI service.
 */
export interface AzionAIClient {
  /**
   * Sends a chat request to the AI service.
   *
   * @param {AzionAIRequest} request - The chat request to be sent.
   * @param {AzionClientOptions} [options] - Additional options for the request.
   * @returns {Promise<AzionAIResult<AzionAIResponse>>} A promise that resolves to the chat result or an error.
   *
   * @example
   * const result = await aiClient.chat({
   *   messages: [{ role: 'user', content: 'Hello, AI!' }]
   * });
   * if (result.data) {
   *   console.log('AI response:', result.data.choices[0].message.content);
   * } else {
   *   console.error('Error:', result.error);
   * }
   */
  chat: (request: AzionAIRequest, options?: AzionClientOptions) => Promise<AzionAIResult<AzionAIResponse>>;

  /**
   * Sends a streaming chat request to the AI service.
   *
   * @param {AzionAIRequest} request - The chat request to be sent.
   * @param {AzionClientOptions} [options] - Additional options for the request.
   * @returns {AsyncGenerator<AzionAIResult<AzionAIStreamResponse>>} An async generator that produces partial chat results.
   *
   * @example
   * const stream = aiClient.streamChat({
   *   messages: [{ role: 'user', content: 'Tell me a story' }]
   * });
   * for await (const chunk of stream) {
   *   if (chunk.data) {
   *     console.log('AI chunk:', chunk.data.choices[0].delta.content);
   *   } else {
   *     console.error('Error:', chunk.error);
   *   }
   * }
   */
  streamChat: (
    request: AzionAIRequest,
    options?: AzionClientOptions,
  ) => AsyncGenerator<AzionAIResult<AzionAIStreamResponse>>;
}

/**
 * Options for configuring the Azion client behavior.
 *
 * @property {boolean} [debug] - Enable debug mode for detailed logging.
 * @property {boolean} [force] - Force the operation even if it might be destructive.
 *
 * @example
 * const options: AzionClientOptions = {
 *   debug: true,
 *   force: false
 * };
 */
export type AzionClientOptions = {
  debug?: boolean;
  force?: boolean;
};

/**
 * Function type for creating an Azion AI Client.
 *
 * @param {Object} [config] - Configuration options for the AI client.
 * @param {string} [config.token] - Authentication token for Azion API. If not provided,
 * the client will attempt to use the AZION_TOKEN environment variable.
 * @param {AzionClientOptions} [config.options] - Additional client options.
 *
 * @returns {AzionAIClient} An instance of the Azion AI Client.
 *
 * @example
 * // Create an AI client with a token and debug mode enabled
 * const aiClient = createAzionAIClient({
 *   token: 'your-api-token',
 *   options: { debug: true }
 * });
 *
 * @example
 * // Create an AI client using environment variables for token
 * const aiClient = createAzionAIClient();
 *
 * @example
 * // Use the AI client to send a chat request
 * const response = await aiClient.chat({
 *   messages: [{ role: 'user', content: 'Hello, AI!' }]
 * });
 */
export type CreateAzionAIClient = (config?: Partial<{ token: string; options?: AzionClientOptions }>) => AzionAIClient;
