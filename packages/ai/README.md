# Azion AI Client

The Azion AI Client provides a simple interface to interact with the Azion AI API. This AI is specialized and has contextual knowledge about all Azion products, services, and technologies, allowing for precise and relevant responses about Azion's Edge Computing platform.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Debug Mode](#debug-mode)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Types](#types)
- [Contributing](#contributing)

## Installation

Install the package using npm or yarn:

```
npm install azion
```

or

```
yarn add azion
```

## Environment Variables

Configure the client using the following environment variables:

- `AZION_TOKEN`: Your Azion API token.
- `AZION_DEBUG`: Enable debug mode (true/false).

Example `.env` file:

```
AZION_TOKEN=your-api-token
AZION_DEBUG=true
```

## Debug Mode

Debug mode provides detailed logging of API requests and responses. Enable it by setting the `AZION_DEBUG` environment variable to `true` or passing `true` as the `debug` parameter in the methods.

## Usage

### Using Environment Variables

You can use environment variables to configure the client without directly passing the token and debug parameters.

### Direct Method Calls

Use the provided wrapper methods to perform AI chat operations directly.

### Client Configuration

Create a client instance with specific configurations.

### API Examples

#### Chat

```typescript
import { chat } from 'azion/ai';
import type { AzionAIRequest, AzionAIResponse, AzionAIResult } from '@azion/ai';

const request: AzionAIRequest = {
messages: [{ role: 'user', content: 'Explain what Azion Edge Computing is.' }]
};
const { data: response, error }: AzionAIResult<AzionAIResponse> = await chat(request, { debug: true });
if (response) {
console.log('AI response:', response.choices[0].message.content);
} else {
console.error('Chat failed', error);
}
```

#### Streaming Chat

```typescript
import { streamChat } from 'azion/ai';
import type { AzionAIRequest, AzionAIStreamResponse, AzionAIResult } from '@azion/ai';

const request: AzionAIRequest = {
messages: [{ role: 'user', content: 'List 5 use cases for Azion Edge Functions.' }]
};
const stream = streamChat(request, { debug: true });
for await (const chunk: AzionAIResult<AzionAIStreamResponse> of stream) {
if (chunk.data) {
process.stdout.write(chunk.data.choices[0].delta.content || '');
} else {
console.error('Error:', chunk.error);
}
}
```

## API Reference

### `chat`

Sends a chat request to the Azion AI service.

**Parameters:**

- `request: AzionAIRequest` - Request object containing chat parameters.
- `options?: AzionClientOptions` - Additional client options.

**Returns:**

- `Promise<AzionAIResult<AzionAIResponse>>` - A promise that resolves to the chat result or an error.

### `streamChat`

Sends a streaming chat request to the Azion AI service.

**Parameters:**

- `request: AzionAIRequest` - Request object containing chat parameters.
- `options?: AzionClientOptions` - Additional client options.

**Returns:**

- `AsyncGenerator<AzionAIResult<AzionAIStreamResponse>>` - An async generator that produces partial chat results.

### `createClient`

Creates an Azion AI client with methods to interact with AI services.

**Parameters:**

- `config?: Partial<{ token: string; options?: AzionClientOptions }>` - Optional configuration for the client.

**Returns:**

- `AzionAIClient` - A client object with methods to interact with AI services.

## Types

Here are the main types used in the Azion AI Client:

```typescript
import type {
AzionAIMessage,
AzionAIConfig,
AzionAIRequest,
AzionAIResponse,
AzionAIStreamResponse,
AzionAIResult,
AzionAIClient,
AzionClientOptions,
CreateAzionAIClient
} from '@azion/ai';

// AzionAIMessage
```

For more detailed information about these types, please refer to the source code.

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
