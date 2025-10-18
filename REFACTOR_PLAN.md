# Refactor Plan: Remove Parallel Routes (@sidebar slots)

## New Folder Structure
```
app/(job-seeker)/
├── _components/
│   └── JobSeekerSidebar.tsx    ← Reusable sidebar component
├── layout.tsx                  ← Simplified (only children prop)
├── page.tsx                    ← Homepage
└── job-listings/
    └── [jobListingId]/
        └── page.tsx            ← Job detail page
```

## Steps to Refactor

### 1. Create Reusable Sidebar Component
- Move sidebar logic to `_components/JobSeekerSidebar.tsx`
- This component will be imported where needed

### 2. Simplify Layout
- Change `layout.tsx` to only accept `children` prop
- Remove `sidebar` prop dependency
- Include sidebar directly in layout

### 3. Clean Up Files to Delete
- Delete `@sidebar/` folder entirely
- Delete `job-listings/[jobListingId]/@sidebar/` folder
- Remove parallel route complexity

### 4. Benefits
- ✅ Simpler routing (no parallel route matching issues)
- ✅ Easier to understand and maintain
- ✅ No more 404 errors on reload
- ✅ Standard Next.js routing patterns

### 5. Trade-offs
- ❌ Less flexible (can't have different sidebars per route easily)
- ❌ Sidebar always rendered (can't conditionally show different sidebars)
