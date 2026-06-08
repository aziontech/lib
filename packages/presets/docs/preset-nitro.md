# Nitro Preset

This preset enables server-side rendering for Nitro-based applications on the Azion Platform.

## Prerequisites

- Node.js 18+
- A Nitro-based project (e.g. TanStack Start, Analog, or a custom Nitro app)
- Azion CLI installed globally

## Configuration

### Step 1 — Install the Azion Presets package

```bash
npm install @aziontech/presets -D
# or
yarn add @aziontech/presets -D
# or
pnpm add @aziontech/presets -D
```

### Step 2 — Install the Nitro package

The preset requires the Nitro nightly build:

```bash
npm install nitro-nightly@latest -D
# or
yarn add nitro-nightly@latest -D
# or
pnpm add nitro-nightly@latest -D
```

### Step 3 — Configure vite.config.ts

> **Note:** The example below is for a **TanStack Start + Nitro** setup. For full details on the TanStack + Nitro preset integration, refer to the [TanStack Start Hosting documentation](https://tanstack.com/router/latest/docs/framework/react/start/hosting).

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

## Project Reference

This template is based on the [TanStack Start Basic React Query example](https://github.com/TanStack/router/tree/main/examples/react/start-basic-react-query), which includes:

- **File-based routing** via TanStack Router
- **API routes** via TanStack Router API
- **Server-side data fetching** with React Query

It is a good starting point to understand how routing and API routes are structured before deploying to Azion.

## Project Setup

### Link Your Project

Connect your project to Azion and select the Nitro preset:

```bash
azion link
```

When prompted, choose the **Nitro preset** from the available options.

## Development Workflow

### Build and Preview

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

### Deploy to Azion

Deploy your application directly from your local environment:

```bash
azion -t <personal-token>
azion deploy --local
```

This command will:

1. Build your application with the Nitro preset
2. Package the function
3. Deploy to Azion's network
4. Provide you with the deployment URL

## Features

The Nitro preset provides:

- **Server-Side Rendering**: Full SSR support via Nitro's native server
- **Edge Runtime**: Optimized for Azion's computing platform
- **Static Asset Handling**: Efficient static file serving from Azion storage with cache policy
- **API Routes**: Support for Nitro server API routes

### Getting Help

For additional support:

- Check the [Azion Documentation](https://www.azion.com/en/documentation/)
- Contact Azion Support for platform-specific issues

## Next Steps

After successful deployment:

1. Test your application on the provided URL
2. Configure custom domains if needed

> **Note**: We are currently working on a Pull Request to the official Nitro repository to include an Azion preset natively. This will simplify the configuration process in future versions.
