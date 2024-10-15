import { chat, createClient, streamChat } from '../src/index';
import * as servicesApi from '../src/services/api/index';
import { AzionAIClient, AzionAIResponse, AzionAIStreamResponse } from './types';

jest.mock('../src/services/api/index');

describe('AI Module', () => {
  const mockToken = 'mock-token';
  const mockDebug = true;
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AZION_TOKEN = mockToken;
    process.env.AZION_DEBUG = 'true';
  });

  describe('createClient', () => {
    it('should create a client with default configuration', () => {
      const client = createClient();
      expect(client).toHaveProperty('chat');
      expect(client).toHaveProperty('streamChat');
    });

    it('should create a client with custom configuration', () => {
      const client = createClient({ token: 'custom-token', options: { debug: false } });
      expect(client).toHaveProperty('chat');
      expect(client).toHaveProperty('streamChat');
    });
  });

  describe('chat', () => {
    it('should successfully send a chat request', async () => {
      const mockResponse: AzionAIResponse = {
        choices: [
          { finish_reason: 'stop', index: 0, message: { content: 'Hello!', role: 'assistant' }, logprobs: null },
        ],
        created: 1234567890,
        id: 'chat-123',
        model: 'gpt-3.5-turbo',
        object: 'chat.completion',
        usage: {
          completion_tokens: 1,
          prompt_tokens: 1,
          total_tokens: 2,
          completion_tokens_details: { reasoning_tokens: 1 },
        },
      };
      (servicesApi.chatCompletion as jest.Mock).mockResolvedValue(mockResponse);

      const result = await chat({ messages: [{ role: 'user', content: 'Hi' }] }, { debug: mockDebug });
      expect(result.data).toEqual(mockResponse);
      expect(servicesApi.chatCompletion).toHaveBeenCalledWith(mockToken, {
        messages: [{ role: 'user', content: 'Hi' }],
        stream: false,
      });
    });

    it('should return error on failure', async () => {
      const mockError = new Error('API Error');
      (servicesApi.chatCompletion as jest.Mock).mockRejectedValue(mockError);

      const result = await chat({ messages: [{ role: 'user', content: 'Hi' }] }, { debug: mockDebug });
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('API Error');
    });
  });

  describe('streamChat', () => {
    it('should successfully stream chat responses', async () => {
      const mockStreamResponse: AzionAIStreamResponse = {
        choices: [{ delta: { content: 'Hello' }, finish_reason: null, index: 0, logprobs: null }],
        created: 1234567890,
        id: 'chat-stream-123',
        model: 'gpt-3.5-turbo',
        object: 'chat.completion.chunk',
        system_fingerprint: 'fp-123',
      };

      (servicesApi.streamChatCompletion as jest.Mock).mockImplementation(function* () {
        yield mockStreamResponse;
      });

      const generator = streamChat({ messages: [{ role: 'user', content: 'Hi' }] }, { debug: mockDebug });

      const result = await generator.next();
      expect(result.value.data).toEqual(mockStreamResponse);

      expect(servicesApi.streamChatCompletion).toHaveBeenCalledWith(mockToken, {
        messages: [{ role: 'user', content: 'Hi' }],
        stream: true,
      });
    });

    it('should yield error on failure', async () => {
      const mockError = new Error('Stream Error');
      // eslint-disable-next-line require-yield
      (servicesApi.streamChatCompletion as jest.Mock).mockImplementation(function* () {
        throw mockError;
      });

      const generator = streamChat({ messages: [{ role: 'user', content: 'Hi' }] }, { debug: mockDebug });

      const result = await generator.next();
      expect(result.value.error).toBeInstanceOf(Error);
      expect(result.value.error?.message).toBe('Stream Error');
    });
  });

  describe('Client methods', () => {
    let client: AzionAIClient;

    beforeEach(() => {
      client = createClient({ token: 'custom-token', options: { debug: false } });
    });

    it('should call chat method', async () => {
      const mockResponse: AzionAIResponse = {
        choices: [
          { finish_reason: 'stop', index: 0, message: { content: 'Hello!', role: 'assistant' }, logprobs: null },
        ],
        created: 1234567890,
        id: 'chat-123',
        model: 'gpt-3.5-turbo',
        object: 'chat.completion',
        usage: {
          completion_tokens: 1,
          prompt_tokens: 1,
          total_tokens: 2,
          completion_tokens_details: { reasoning_tokens: 1 },
        },
      };
      (servicesApi.chatCompletion as jest.Mock).mockResolvedValue(mockResponse);

      const result = await client.chat({ messages: [{ role: 'user', content: 'Hi' }] });
      expect(result.data).toEqual(mockResponse);
      expect(servicesApi.chatCompletion).toHaveBeenCalledWith('custom-token', {
        messages: [{ role: 'user', content: 'Hi' }],
        stream: false,
      });
    });

    it('should call streamChat method', async () => {
      const mockStreamResponse: AzionAIStreamResponse = {
        choices: [{ delta: { content: 'Hello' }, finish_reason: null, index: 0, logprobs: null }],
        created: 1234567890,
        id: 'chat-stream-123',
        model: 'gpt-3.5-turbo',
        object: 'chat.completion.chunk',
        system_fingerprint: 'fp-123',
      };

      function* mockStreamGenerator() {
        yield mockStreamResponse;
      }

      (servicesApi.streamChatCompletion as jest.Mock).mockReturnValue(mockStreamGenerator());

      const generator = client.streamChat({ messages: [{ role: 'user', content: 'Hi' }] });

      for await (const chunk of generator) {
        expect(chunk.data).toEqual(mockStreamResponse);
      }

      expect(servicesApi.streamChatCompletion).toHaveBeenCalledWith('custom-token', {
        messages: [{ role: 'user', content: 'Hi' }],
        stream: true,
      });
    });
  });
});
