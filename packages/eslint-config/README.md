# @repo/eslint-config

Shared ESLint flat config for all packages. It contains:

- The TanStack ESLint config (`@tanstack/eslint-config`)
- The patterns of the root `.gitignore`
- Ignore rules for generated files (`routeTree.gen.ts`, `worker-configuration.d.ts`)

## Use

Create `eslint.config.js` in the package:

```js
// @ts-check

import { eslintconfig } from "@repo/eslint-config";

export default eslintconfig;
```

Add `@repo/eslint-config` and `eslint` to the `devDependencies` of the package.
