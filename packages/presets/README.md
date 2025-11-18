# Azion Presets

The Presets package provides pre-configured presets for different frameworks and libraries to simplify deployment on the Azion Edge Platform.

## Available Presets

- Angular
- Astro
- Docusaurus
- Eleventy
- Emscripten
- Gatsby
- Hexo
- HTML
- Hugo
- JavaScript
- Jekyll
- Next.js
- Nuxt.js
- OpenNext.js
- Preact
- Qwik
- React
- Rust WASM
- Stencil
- Svelte
- TypeScript
- VitePress
- Vue
- VuePress

## Usage with Azion CLI

1. **Link your project:**

   ```bash
   azion link
   ```

   > Choose the preset you want to use when prompted.

2. **Build and preview:**

   ```bash
   azion build
   azion dev
   ```

3. **Deploy:**
   ```bash
   azion deploy --local
   ```

### Nuxt.js Custom Preset (Nitro)

Supports both Server-Side Rendering (SSR) and Static Site Generation (SSG) for Nuxt.js applications.

**Features:**

- SSR support with edge runtime optimization
- SSG support with automatic static generation
- Seamless integration with Azion CLI
- Optimized for edge computing performance

**Quick Start:**

```bash
npm install azion
```

Configure your `nuxt.config.ts`:

```typescript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default defineNuxtConfig({
  nitro: {
    preset: require.resolve('azion/preset/nuxt/ssr'), // or 'azion/preset/nuxt/ssg'
  },
});
```

📖 **[Read the complete Nuxt.js preset documentation](https://github.com/aziontech/lib/tree/main/packages/presets/docs/preset-nuxt.md)**

### Svelte Custom Adapter

Supports both Server-Side Rendering (SSR) and Static Site Generation (SSG) for SvelteKit applications.

**Features:**

- SSR support with edge runtime optimization
- SSG support with automatic static generation
- Seamless integration with Azion CLI
- Optimized for edge computing performance

**Quick Start:**

```bash
npm install azion
```

Configure your `svelte.config.js`:

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

📖 **[Read the complete Svelte preset documentation](https://github.com/aziontech/lib/tree/main/packages/presets/docs/preset-svelte.md)**

## Contributing

We welcome contributions to add support for more frameworks and improve existing presets. Please check the main [Contributing Guidelines](https://github.com/aziontech/lib/tree/main/README.md#contributing) for more information.
