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
npm install azion@~1.20.8
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

📖 **[Read the complete Nuxt.js preset documentation](https://github.com/aziontech/lib/tree/1.20.x/packages/presets/docs/preset-nuxt.md)**

## Contributing

We welcome contributions to add support for more frameworks and improve existing presets. Please check the 1.20.x [Contributing Guidelines](https://github.com/aziontech/lib/tree/1.20.x/README.md#contributing) for more information.
