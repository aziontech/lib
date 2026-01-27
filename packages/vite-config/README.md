# @lib/vite-config

Shared Vite configuration for Azion library packages.

## Usage

### Basic Configuration

```js
import { createViteConfig } from '@lib/vite-config';

export default createViteConfig({
  dirname: __dirname,
});
```

### With SSR

```js
import { createViteConfig } from '@lib/vite-config';

export default createViteConfig({
  dirname: __dirname,
  ssr: true,
});
```

### With External Dependencies

```js
import { createViteConfig } from '@lib/vite-config';

export default createViteConfig({
  dirname: __dirname,
  external: ['dependency1', 'dependency2'],
});
```

### With Multiple Entry Points

```js
import { createViteConfig } from '@lib/vite-config';

export default createViteConfig({
  dirname: __dirname,
  entry: {
    index: 'src/index.ts',
    utils: 'src/utils/index.ts',
  },
});
```

### With Aliases

```js
import { resolve } from 'path';
import { createViteConfig } from '@lib/vite-config';

export default createViteConfig({
  dirname: __dirname,
  alias: {
    '@utils': resolve(__dirname, '../utils/src/'),
  },
  dts: {
    aliasesExclude: [/@utils/],
  },
});
```

### With Custom Plugins

```js
import { defineConfig } from 'vite';
import { createViteConfig } from '@lib/vite-config';
import customPlugin from './custom-plugin';

const baseConfig = createViteConfig({
  dirname: __dirname,
});

export default defineConfig({
  ...baseConfig,
  plugins: [customPlugin(), ...baseConfig.plugins],
});
```

## Options

- **dirname** (required): `__dirname` of the package
- **entry**: Entry points (default: `{ index: 'src/index.ts' }`)
- **alias**: Resolve aliases object
- **external**: External dependencies (array or function)
- **ssr**: Enable SSR mode (default: `false`)
- **dts**: DTS plugin options override
- **sourcemap**: Enable sourcemap (default: `false`)
- **buildOptions**: Additional build options
