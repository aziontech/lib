# Nitro Preset

This preset enables server-side rendering for Nitro-based applications on the Azion Platform.

## Prerequisites

- Node.js 18+
- A Nitro-based project (e.g. TanStack Start, Analog, or a custom Nitro app)
- Azion CLI installed globally

## Installation

Install the Azion presets package in your project:

```bash
npm install @aziontech/presets
```

## Configuration

### TanStack Start + Vite

Configure your `vite.config.ts` to use the Azion Nitro preset:

```typescript
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import { nitro } from 'nitro/vite';

// import the preset using createRequire to ensure correct path resolution
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      tailwindcss(),
      nitro({
        // Use require.resolve to ensure the preset path is correctly resolved
        preset: require.resolve('@aziontech/presets/nitro/preset'),
      }),
      tanstackStart(),
      viteReact(),
    ],
  };
});
```

### Generic Nitro App

For any Nitro-based project, configure your `vite.config.ts`:

```typescript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default defineNitroConfig({
  preset: require.resolve('@aziontech/presets/nitro/preset'),
});
```

Or directly with the node_modules path:

```typescript
export default defineNitroConfig({
  preset: './node_modules/@aziontech/presets/src/presets/nitro/custom/index.js',
});
```

## Project Setup

### 1. Link Your Project

Connect your project to Azion and select the Nitro preset:

```bash
azion link
```

When prompted, choose the **Nitro preset** from the available options.

## Development Workflow

### Preview Your Application

#### Build and Preview

Build your application and preview it locally:

```bash
azion build
azion dev
```

#### Skip Framework Build (Optional)

If you want to skip the framework build process and use existing build artifacts:

```bash
azion dev --skip-framework-build
```

This is useful when you've already built your application and want to quickly test the edge function behavior.

## Deployment

### Deploy to Azion Edge

Deploy your application directly from your local environment:

```bash
azion -t <personal-token>
azion deploy --local
```

This command will:

1. Build your application with the Nitro preset
2. Package the edge function
3. Deploy to Azion's edge network
4. Provide you with the deployment URL

## How It Works

After a successful build, Nitro outputs two directories:

- `.output/server/` — the server-side bundle (`index.mjs`) deployed as an Azion edge function
- `.output/public/` — static assets uploaded to Azion's storage bucket

At runtime, the Azion Nitro module:

1. Attaches the Azion runtime context (`env`, `ctx`) to each incoming request
2. Checks if the request targets a static asset
3. Serves static assets directly from storage
4. Forwards all other requests to Nitro's native fetch handler

## Features

The Nitro preset provides:

- **Server-Side Rendering**: Full SSR support via Nitro's native server
- **Edge Runtime**: Optimized for Azion's edge computing platform
- **Static Asset Handling**: Efficient static file serving from Azion storage with cache policy
- **API Routes**: Support for Nitro server API routes
- **WASM Support**: WebAssembly modules supported out of the box

## Troubleshooting

### Common Issues

**Build Errors**: Ensure the preset path in your config resolves correctly. Use `require.resolve` when possible to guarantee the path is valid.

**Deployment Failures**: Verify that the Azion CLI is authenticated and your project is properly linked.

**Runtime Errors**: Check that your application is compatible with edge runtime constraints (no Node.js-only APIs).

### Getting Help

For additional support:

- Check the [Azion Documentation](https://www.azion.com/en/documentation/)
- Contact Azion Support for platform-specific issues

## Example Project Structure

```
my-nitro-app/
├── vite.config.ts          # Azion preset configuration (TanStack Start)
├── package.json            # Include @aziontech/presets dependency
├── app/                    # Application source
├── server/                 # Nitro server routes and middleware
└── public/                 # Static assets
```

## Next Steps

After successful deployment:

1. Test your application on the provided edge URL
2. Configure custom domains if needed

> **Note**: We are currently working on a Pull Request to the official Nitro repository to include an Azion preset natively. This will simplify the configuration process in future versions.
