/**
 * @module api
 * @description This module provides functions to interact with the Azion AI API.
 */

import { ApiAzionAIRequest, ApiAzionAIResponse, ApiAzionAIStreamResponse } from './types';

const BASE_URL = 'https://ai.azion.com/copilot/chat/completions';

/**
 * Executes a non-streaming AI chat request.
 *
 * @async
 * @function chatCompletion
 * @param {string} token - Authentication token for the API.
 * @param {ApiAzionAIRequest} request - Request object containing chat parameters.
 * @returns {Promise<ApiAzionAIResponse>} A promise that resolves to the API response.
 * @throws {Error} If the API response is not successful.
 *
 * @example
 * const response = await chatCompletion('your-api-token', {
 *   messages: [{ role: 'user', content: 'Hello, AI!' }],
 *   stream: false
 * });
 * console.log(response);
 */
export const chatCompletion = async (token: string, request: ApiAzionAIRequest): Promise<ApiAzionAIResponse> => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Executes a streaming AI chat request.
 *
 * @async
 * @generator
 * @function streamChatCompletion
 * @param {string} token - Authentication token for the API.
 * @param {ApiAzionAIRequest} request - Request object containing chat parameters.
 * @yields {ApiAzionAIStreamResponse} Generates partial chat responses in real-time.
 * @throws {Error} If the API response is not successful or if the response body is not readable.
 *
 * @example
 * const stream = streamChatCompletion('your-api-token', {
 *   messages: [{ role: 'user', content: 'Tell me a story' }],
 *   stream: true
 * });
 * for await (const chunk of stream) {
 *   console.log(chunk);
 * }
 */
export const streamChatCompletion = async function* (
  token: string,
  request: ApiAzionAIRequest,
): AsyncGenerator<ApiAzionAIStreamResponse> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonData = line.slice(6);
        if (jsonData === '[DONE]') {
          return;
        }
        yield JSON.parse(jsonData) as ApiAzionAIStreamResponse;
      }
    }
  }
};
