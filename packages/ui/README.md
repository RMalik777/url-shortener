# @repo/ui

Shared UI for the two apps: shadcn/ui components (Base UI, style `base-nova`), page templates, and the global Tailwind CSS 4 stylesheet.

## Exports

| Import                              | Content                                                 |
| ----------------------------------- | ------------------------------------------------------- |
| `@repo/ui/globals.css`              | Tailwind CSS, theme tokens, and fonts.                  |
| `@repo/ui/components/<name>`        | shadcn/ui components, for example `button` or `dialog`. |
| `@repo/ui/components/custom/<name>` | Custom components, for example `copy-button`.           |
| `@repo/ui/lib/utils`                | `cn()` helper for class names.                          |
| `@repo/ui/template/<name>`          | Page templates: `error`, `notfound`, `link-removed`.    |

Load the stylesheet in the root route of an app:

```tsx
import appCss from "@repo/ui/globals.css?url";
```

`globals.css` examines `apps/**` for Tailwind classes with `@source`. Thus a new app in `apps/` does not need more Tailwind configuration.

## Add a component

Run this command in `apps/web`:

```bash
pnpm dlx shadcn@latest add <component>
```

The CLI reads `components.json` and writes the component into `packages/ui/src/components`.
