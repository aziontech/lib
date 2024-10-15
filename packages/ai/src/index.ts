/**
 * @module @azion/ai
 * @description This module provides a client for interacting with Azion AI services.
 */

import { chatCompletion, streamChatCompletion } from './services/api/index';
import {
  AzionAIClient,
  AzionAIRequest,
  AzionAIResponse,
  AzionAIResult,
  AzionAIStreamResponse,
  AzionClientOptions,
  CreateAzionAIClient,
} from './types';
import { resolveDebug, resolveToken } from './utils';

/**
 * Executes an AI chat request.
 *
 * @async
 * @function chatMethod
 * @param {string} token - Authentication token for the API.
 * @param {AzionAIRequest} request - Request object containing chat parameters.
 * @param {AzionClientOptions} [options] - Additional client options.
 * @returns {Promise<AzionAIResult<AzionAIResponse>>} A promise that resolves to the chat result or an error.
 *
 * @example
 * const result = await chatMethod('your-token', {
 *   messages: [{ role: 'user', content: 'Hello, AI!' }]
 * }, { debug: true });
 * if (result.data) {
 *   console.log('AI response:', result.data.choices[0].message.content);
 * } else {
 *   console.error('Error:', result.error);
 * }
 */
export const chatMethod = async (
  token: string,
  request: AzionAIRequest,
  options?: AzionClientOptions,
): Promise<AzionAIResult<AzionAIResponse>> => {
  try {
    const response = await chatCompletion(token, {
      ...request,
      stream: false,
    });
    if (options?.debug) {
      console.log('AI Chat Response:', response);
    }
    return { data: response, error: null };
  } catch (error) {
    if (options?.debug) {
      console.error('Error in AI chat:', error);
    }
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};

/**
 * Executes a streaming AI chat request.
 *
 * @async
 * @generator
 * @function streamChatMethod
 * @param {string} token - Authentication token for the API.
 * @param {AzionAIRequest} request - Request object containing chat parameters.
 * @param {AzionClientOptions} [options] - Additional client options.
 * @yields {AzionAIResult<AzionAIStreamResponse>} Generates partial chat results in real-time.
 *
 * @example
 * const stream = streamChatMethod('your-token', {
 *   messages: [{ role: 'user', content: 'Tell me a story' }]
 * }, { debug: true });
 * for await (const chunk of stream) {
 *   if (chunk.data) {
 *     console.log('AI chunk:', chunk.data.choices[0].delta.content);
 *   } else {
 *     console.error('Error:', chunk.error);
 *   }
 * }
 */
export const streamChatMethod = async function* (
  token: string,
  request: AzionAIRequest,
  options?: AzionClientOptions,
): AsyncGenerator<AzionAIResult<AzionAIStreamResponse>> {
  try {
    const stream = streamChatCompletion(token, {
      ...request,
      stream: true,
    });
    for await (const chunk of stream) {
      if (options?.debug) {
        console.log('AI Stream Chunk:', chunk);
      }
      yield { data: chunk, error: null };
    }
  } catch (error) {
    if (options?.debug) {
      console.error('Error in AI stream chat:', error);
    }
    yield { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};

/**
 * Executes an AI chat request with automatic token resolution.
 *
 * @async
 * @function chat
 * @param {AzionAIRequest} request - Request object containing chat parameters.
 * @param {AzionClientOptions} [options] - Additional client options.
 * @returns {Promise<AzionAIResult<AzionAIResponse>>} A promise that resolves to the chat result or an error.
 *
 * @example
 * const result = await chat({
 *   messages: [{ role: 'user', content: 'What is the capital of France?' }]
 * });
 * if (result.data) {
 *   console.log('AI response:', result.data.choices[0].message.content);
 * } else {
 *   console.error('Error:', result.error);
 * }
 */
const chat = (request: AzionAIRequest, options?: AzionClientOptions): Promise<AzionAIResult<AzionAIResponse>> =>
  chatMethod(resolveToken(), request, {
    ...options,
    debug: resolveDebug(options?.debug),
  });

/**
 * Executes a streaming AI chat request with automatic token resolution.
 *
 * @async
 * @generator
 * @function streamChat
 * @param {AzionAIRequest} request - Request object containing chat parameters.
 * @param {AzionClientOptions} [options] - Additional client options.
 * @returns {AsyncGenerator<AzionAIResult<AzionAIStreamResponse>>} An async generator that produces partial chat results.
 *
 * @example
 * const stream = streamChat({
 *   messages: [{ role: 'user', content: 'Write a short story about a robot' }]
 * });
 * for await (const chunk of stream) {
 *   if (chunk.data) {
 *     process.stdout.write(chunk.data.choices[0].delta.content || '');
 *   } else {
 *     console.error('Error:', chunk.error);
 *   }
 * }
 */
const streamChat = (
  request: AzionAIRequest,
  options?: AzionClientOptions,
): AsyncGenerator<AzionAIResult<AzionAIStreamResponse>> =>
  streamChatMethod(resolveToken(), request, {
    ...options,
    debug: resolveDebug(options?.debug),
  });

/**
 * Creates an Azion AI client with methods to interact with AI services.
 *
 * @function createClient
 * @param {Partial<{ token: string; options?: AzionClientOptions }>} [config] - Optional configuration for the client.
 * @returns {AzionAIClient} A client object with methods to interact with AI services.
 *
 * @example
 * const aiClient = createClient({ token: 'your-api-token', options: { debug: true } });
 *
 * // Using the chat method
 * const chatResult = await aiClient.chat({
 *   messages: [{ role: 'user', content: 'Explain quantum computing' }]
 * });
 * console.log(chatResult.data?.choices[0].message.content);
 *
 * // Using the streamChat method
 * for await (const chunk of aiClient.streamChat({
 *   messages: [{ role: 'user', content: 'Write a poem about AI' }]
 * })) {
 *   if (chunk.data) {
 *     process.stdout.write(chunk.data.choices[0].delta.content || '');
 *   }
 * }
 */
const createClient: CreateAzionAIClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
): AzionAIClient => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.options?.debug);

  return {
    chat: (request: AzionAIRequest, options?: AzionClientOptions): Promise<AzionAIResult<AzionAIResponse>> =>
      chatMethod(tokenValue, request, { ...config?.options, ...options, debug: debugValue }),
    streamChat: (
      request: AzionAIRequest,
      options?: AzionClientOptions,
    ): AsyncGenerator<AzionAIResult<AzionAIStreamResponse>> =>
      streamChatMethod(tokenValue, request, { ...config?.options, ...options, debug: debugValue }),
  };
};

export { chat, createClient, streamChat };

export default createClient;
export * from './types';
