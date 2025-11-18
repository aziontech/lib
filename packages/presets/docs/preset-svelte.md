# SvelteKit Preset

This preset enables Server-Side Rendering (SSR) and Static Site Generation (SSG) for SvelteKit applications on the Azion Platform.

## Prerequisites

- Node.js 18+
- SvelteKit project
- Azion CLI installed globally

## Installation

First, install the Azion package in your SvelteKit project:

```bash
npm install azion@~1.20.11
```

## Configuration SSR

Configure your `svelte.config.js` to use the Azion SSR adapter:

```javascript
import adapter from 'azion/preset/svelte/ssr';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
  },
};

export default config;
```

## Configuration SSG

Configure your `svelte.config.js` to use the Azion SSG adapter:

```javascript
import adapter from '@sveltejs/adapter-static'; // SvelteKit static adapter

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
  },
};

export default config;
```

## Project Setup

### 1. Link Your Project

Connect your project to Azion and select the SvelteKit preset:

```bash
azion link
```

When prompted, choose the **SvelteKit preset** from the available options.

## Development Workflow

### Preview Your Application

#### Build and Preview

Build your application and preview it locally:

```bash
azion build
azion dev
```

#### Skip Framework Build (Optional)

If you want to skip the SvelteKit framework build process and use existing build artifacts:

```bash
azion dev --skip-framework-build
```

This is useful when you've already built your SvelteKit application and want to quickly test the edge function behavior.

## Deployment

### Deploy to Azion Edge

Deploy your application directly from your local environment:

```bash
azion -t <personal-token>
azion deploy --local
```

This command will:

1. Build your SvelteKit application with the SSR adapter
2. Package the edge function
3. Deploy to Azion's edge network
4. Provide you with the deployment URL

### Getting Help

For additional support:

- Check the [Azion Documentation](https://www.azion.com/en/documentation/)
- Visit the [SvelteKit Documentation](https://kit.svelte.dev/docs)
- Contact Azion Support for platform-specific issues

## Next Steps

After successful deployment:

1. Test your application on the provided edge URL
2. Configure custom domains if needed

> **Note**: We are currently working on a Pull Request to the official SvelteKit repository to include an Azion adapter natively. This will simplify the configuration process in future versions.
