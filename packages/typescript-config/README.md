# @repo/typescript-config

Shared `tsconfig` presets.

| File                 | Use                                                             |
| -------------------- | --------------------------------------------------------------- |
| `base.json`          | All packages. Strict mode, bundler module resolution, `noEmit`. |
| `react-library.json` | React libraries (`@repo/ui`). Extends `base.json`.              |

## Use

```json
{
	"extends": "@repo/typescript-config/base.json",
	"include": ["**/*.ts", "**/*.tsx", "eslint.config.js"]
}
```

The presets do not set `include`, because paths in a shared preset resolve relative to this package. Set `include` in each package.

TypeScript 6 does not load `@types/*` packages automatically. Add `"types": ["node"]` (or other types) in `compilerOptions` when a package uses them.
