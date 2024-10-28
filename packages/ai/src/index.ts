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
 * const { data, error } = await chatMethod('your-token', {
 *   messages: [{ role: 'user', content: 'Hello, AI!' }]
 * }, { debug: true });
 * if (data) {
 *   console.log('AI response:', data.choices[0].message.content);
 * } else if (error) {
 *   console.error('Error:', error.message);
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
 * for await (const { data, error } of stream) {
 *   if (data) {
 *     console.log('AI chunk:', data.choices[0].delta.content);
 *   } else if (error) {
 *     console.error('Error:', error.message);
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
 * const { data, error } = await chat({
 *   messages: [{ role: 'user', content: 'What is the capital of France?' }]
 * });
 * if (data) {
 *   console.log('AI response:', data.choices[0].message.content);
 * } else if (error) {
 *   console.error('Error:', error.message);
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
 * for await (const { data, error } of stream) {
 *   if (data) {
 *     process.stdout.write(data.choices[0].delta.content || '');
 *   } else if (error) {
 *     console.error('Error:', error.message);
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
 * const { data: chatData, error: chatError } = await aiClient.chat({
 *   messages: [{ role: 'user', content: 'Explain quantum computing' }]
 * });
 * if (chatData) {
 *   console.log('AI response:', chatData.choices[0].message.content);
 * } else if (chatError) {
 *   console.error('Chat error:', chatError.message);
 * }
 *
 * // Using the streamChat method
 * const stream = aiClient.streamChat({
 *   messages: [{ role: 'user', content: 'Write a poem about AI' }]
 * });
 * for await (const { data: streamData, error: streamError } of stream) {
 *   if (streamData) {
 *     process.stdout.write(streamData.choices[0].delta.content || '');
 *   } else if (streamError) {
 *     console.error('Stream error:', streamError.message);
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
