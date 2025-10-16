# Nuxt.js Preset

This preset enables Server-Side Rendering (SSR) and Static Site Generation (SSG) for Nuxt.js applications on the Azion Platform.

## Prerequisites

- Node.js 18+
- Nuxt.js 3.x project
- Azion CLI installed globally

## Installation

First, install the Azion package in your Nuxt.js project:

```bash
npm install azion@~1.20.8
```

## Configuration SSR

Configure your `nuxt.config.ts` to use the Azion SSR preset:

```typescript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default defineNuxtConfig({
  nitro: {
    preset: require.resolve('azion/preset/nuxt/ssr'),
  },
});
```

Or directly with the path node_modules:

```typescript
export default defineNuxtConfig({
  nitro: {
    preset: './node_modules/azion/packages/presets/src/presets/nuxt/nitro/ssr',
  },
});
```

## Configuration SSG

Configure your `nuxt.config.ts` to use the Azion SSG preset:

```typescript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default defineNuxtConfig({
  nitro: {
    preset: require.resolve('azion/preset/nuxt/ssg'),
  },
});
```

Or directly with the path node_modules:

```typescript
export default defineNuxtConfig({
  nitro: {
    preset: './node_modules/azion/packages/presets/src/presets/nuxt/nitro/ssg',
  },
});
```

## If your configuration not contains the nitro preset

If your `nuxt.config.ts` doesn't include a nitro preset configuration, our preset will automatically execute `npx nuxt generate` to create a static project.

```typescript
export default defineNuxtConfig({
 ...
});
```

## Project Setup

### 1. Link Your Project

Connect your project to Azion and select the Nuxt preset:

```bash
azion link
```

When prompted, choose the **Nuxt preset** from the available options.

## Development Workflow

### Preview Your Application

#### Build and Preview

Build your application and preview it locally:

```bash
azion build
azion dev
```

#### Skip Framework Build (Optional)

If you want to skip the Nuxt.js framework build process and use existing build artifacts:

```bash
azion dev --skip-framework-build
```

This is useful when you've already built your Nuxt application and want to quickly test the edge function behavior.

## Deployment

### Deploy to Azion Edge

Deploy your application directly from your local environment:

```bash
azion -t <personal-token>
azion deploy --local
```

This command will:

1. Build your Nuxt.js application with the SSR preset
2. Package the edge function
3. Deploy to Azion's edge network
4. Provide you with the deployment URL

## Features

The Nuxt.js SSR preset provides:

- **Server-Side Rendering**: Full SSR support with Nuxt.js
- **Edge Runtime**: Optimized for Azion's edge computing platform
- **Automatic Optimization**: Built-in performance optimizations for edge deployment
- **Static Asset Handling**: Efficient static file serving
- **API Routes**: Support for Nuxt.js server API routes

## Troubleshooting

### Common Issues

**Build Errors**: Ensure your `nuxt.config.ts` is properly configured with the preset path.

**Deployment Failures**: Verify that the Azion CLI is authenticated and your project is properly linked.

**Runtime Errors**: Check that your Nuxt.js application is compatible with edge runtime constraints.

### Getting Help

For additional support:

- Check the [Azion Documentation](https://www.azion.com/en/documentation/)
- Visit the [Nuxt.js Documentation](https://nuxt.com/docs)
- Contact Azion Support for platform-specific issues

## Example Project Structure

```
my-nuxt-app/
├── nuxt.config.ts          # Azion preset configuration
├── package.json            # Include azion dependency
├── pages/                  # Nuxt.js pages
├── server/                 # Server API routes
├── components/             # Vue components
└── assets/                 # Static assets
```

## Next Steps

After successful deployment:

1. Test your application on the provided edge URL
2. Configure custom domains if needed

> **Note**: We are currently working on a Pull Request to the official Nitro repository to include an Azion preset natively. This will simplify the configuration process in future versions.
