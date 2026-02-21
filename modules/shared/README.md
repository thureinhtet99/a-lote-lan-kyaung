# Shared Module

This module contains common utilities, components, and types used across all other modules.

## Purpose

The shared module provides reusable code to prevent duplication and maintain consistency across the application.

## Contents

### UI Components (`/components/ui`)

Shadcn UI components:

- `button.tsx` - Button component
- `input.tsx` - Input field
- `select.tsx` - Dropdown select
- `dialog.tsx` - Modal dialog
- `avatar.tsx` - User avatar
- `badge.tsx` - Badge/tag component
- `card.tsx` - Card container
- `alert.tsx` - Alert messages
- `tooltip.tsx` - Tooltips
- And many more...

**Usage:**

```typescript
import { Button } from '@/modules/shared/components/ui/button';

<Button variant="primary">Click me</Button>
```

### Data Table (`/components/data-table`)

Reusable table components with sorting, filtering, and pagination:

- `DataTable.tsx` - Main table component
- `DataTableSortableColumnHeader.tsx` - Sortable headers
- `data-table-faceted-filter.tsx` - Multi-select filters
- `data-table-pagination.tsx` - Pagination controls

**Usage:**

```typescript
import { DataTable } from '@/modules/shared/components/data-table/DataTable';

<DataTable
  columns={columns}
  data={data}
  filterColumn="name"
/>
```

### Markdown (`/components/markdown`)

Markdown editing and rendering:

- `markdown-editor.tsx` - Rich markdown editor
- `MarkdownRenderer.tsx` - Markdown display
- `MarkdownPartial.tsx` - Partial markdown rendering

**Usage:**

```typescript
import { MarkdownEditor } from '@/modules/shared/components/markdown/markdown-editor';

<MarkdownEditor
  value={content}
  onChange={setContent}
/>
```

### Common Components (`/components`)

Utility components:

- `ActionButton.tsx` - Action button with loading state
- `CheckCondition.tsx` - Conditional rendering helper
- `loading.tsx` - Loading spinner
- `LoadingSwap.tsx` - Content/loading swap
- `logo.tsx` - Application logo
- `PricingTable.tsx` - Pricing table component
- `stat-card.tsx` - Statistics card

### Hooks (`/hooks`)

Custom React hooks:

- `use-async-action.ts` - Async action handling
- `use-breakpoint.ts` - Responsive breakpoints
- `use-darkmode.ts` - Dark mode toggle
- `use-mobile.ts` - Mobile detection
- `use-sign-out.ts` - Sign out functionality

**Usage:**

```typescript
import { useMobile } from "@/modules/shared/hooks/use-mobile";

const isMobile = useMobile();
```

### Utilities (`/lib`)

Helper functions:

- `utils.ts` - General utilities
- `cn()` - Class name merger

**Usage:**

```typescript
import { cn } from "@/modules/shared/lib/utils";

const className = cn("base-class", isActive && "active-class");
```

### Types (`/types`)

Shared TypeScript types and interfaces used across modules.

## File Structure

```
/shared
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── data-table/       # Table components
│   ├── markdown/         # Markdown editor/viewer
│   ├── layout/          # Layout components
│   ├── ActionButton.tsx
│   ├── CheckCondition.tsx
│   ├── loading.tsx
│   ├── LoadingSwap.tsx
│   ├── logo.tsx
│   ├── PricingTable.tsx
│   ├── ResponsiveBreakpoint.tsx
│   └── stat-card.tsx
├── hooks/
│   ├── use-async-action.ts
│   ├── use-breakpoint.ts
│   ├── use-darkmode.ts
│   ├── use-mobile.ts
│   └── use-sign-out.ts
├── lib/
│   └── utils.ts
├── types/
│   └── index.type.ts
└── index.ts
```

## Design System

### Colors

Defined in `config/colors.ts`:

- Primary, Secondary, Accent colors
- Light/Dark theme support

### Typography

- Font: Geist Sans
- Sizes: xs, sm, base, lg, xl, 2xl, etc.

### Spacing

Tailwind spacing scale (4px increments)

### Breakpoints

- `xs`: 0px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Adding New Shared Components

When creating new shared components:

1. **Determine if truly shared**: Used by 2+ modules?
2. **Place in appropriate subfolder**: UI, layout, etc.
3. **Document props**: Use JSDoc comments
4. **Export from index.ts**: Add to public API
5. **Write tests**: Test shared components thoroughly

Example:

```typescript
/**
 * A reusable card component
 *
 * @param title - Card title
 * @param children - Card content
 */
export function SharedCard({ title, children }: SharedCardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
```

## Guidelines

### When to Add to Shared

✅ **Add when:**

- Component used in 2+ modules
- Utility function needed everywhere
- Common UI pattern
- Reusable hook

❌ **Don't add when:**

- Feature-specific component
- Single-use utility
- Module-specific logic

### Dependencies

The shared module should:

- ✅ Have minimal dependencies
- ✅ Export pure, reusable code
- ✅ Be framework-agnostic where possible
- ❌ Not depend on other feature modules
- ❌ Not contain business logic

## Testing

```bash
# Run shared module tests
npm test -- shared
```

## Contributing

When contributing to shared module:

1. Ensure truly reusable
2. Write comprehensive documentation
3. Add TypeScript types
4. Include usage examples
5. Write unit tests
6. Update this README
