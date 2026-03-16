# Document Feature Command

Generate comprehensive documentation for a new Next.js feature — both technical developer docs and user-friendly guides.

## Usage
```
/document-feature <feature-name>
```

**Example:** `/document-feature password-reset`

---

## Instructions

You are a documentation generator for a Next.js application. When given a feature name (`$ARGUMENTS`), follow these steps:

### Step 1 — Detect Feature Scope in Next.js Structure

Search the codebase to classify the feature as **frontend**, **backend (API routes)**, or **full-stack**:

```bash
# Next.js App Router — server components, client components, layouts
find app -type f \( -name "*.tsx" -o -name "*.ts" \) | xargs grep -li "$ARGUMENTS" 2>/dev/null

# Next.js Pages Router (if used)
find pages -type f \( -name "*.tsx" -o -name "*.ts" \) | xargs grep -li "$ARGUMENTS" 2>/dev/null

# API routes (App Router)
find app/api -type f | xargs grep -li "$ARGUMENTS" 2>/dev/null

# API routes (Pages Router)
find pages/api -type f | xargs grep -li "$ARGUMENTS" 2>/dev/null

# Shared components, hooks, lib utilities
find components lib hooks -type f 2>/dev/null | xargs grep -li "$ARGUMENTS" 2>/dev/null

# Server actions
grep -r "use server" app --include="*.ts" --include="*.tsx" -l 2>/dev/null | xargs grep -li "$ARGUMENTS" 2>/dev/null
```

Classify based on results:
- Files only in `app/**/page.tsx`, `components/`, `hooks/` → **frontend**
- Files only in `app/api/`, `pages/api/` → **backend**
- Files across both, or includes Server Actions → **full-stack**

Also detect:
- **App Router** (`app/` directory exists) vs **Pages Router** (`pages/` directory)
- **Server Actions** (`"use server"` directive present)
- **Middleware** (`middleware.ts` in root)

---

### Step 2 — Analyze Relevant Next.js Files

Read all files related to the feature. Extract:

**For App Router pages/layouts:**
- Is it a Server Component or Client Component (`"use client"` directive)?
- Route segment (`app/[path]/page.tsx` → `/path`)
- Dynamic segments (`[id]`, `[...slug]`, `(groups)`)
- `generateMetadata()` config
- `loading.tsx`, `error.tsx`, `not-found.tsx` siblings

**For API Routes:**
- `app/api/[path]/route.ts` → exported handlers: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- Request/response shapes (`NextRequest`, `NextResponse`)
- Auth middleware or session checks (`getServerSession`, `auth()`, cookies)

**For Server Actions:**
- File with `"use server"` at top
- Exported async functions and their signatures
- `revalidatePath()` / `revalidateTag()` calls
- Form bindings (`action={serverAction}`)

**For Client Components:**
- `"use client"` directive
- State, hooks used (`useState`, `useRouter`, `useSearchParams`, etc.)
- Data fetching (`useSWR`, `useQuery`, `fetch` in effects)

**For shared utilities:**
- `lib/` functions
- `hooks/` custom hooks
- `types/` or type definitions inline

---

### Step 3 — Find Related Documentation & Existing Patterns

```bash
# Existing docs
find docs -type f -name "*.md" 2>/dev/null | xargs grep -li "$ARGUMENTS" 2>/dev/null

# Check Next.js config for relevant settings
cat next.config.js 2>/dev/null || cat next.config.ts 2>/dev/null || cat next.config.mjs 2>/dev/null

# Check middleware
cat middleware.ts 2>/dev/null || cat middleware.js 2>/dev/null

# Check auth setup
find . -name "auth.ts" -o -name "auth.config.ts" 2>/dev/null | head -3
```

---

### Step 4 — Generate Developer Documentation

Create `docs/dev/<feature-name-kebab-case>-implementation.md`:

```markdown
# [Feature Name] — Technical Documentation

> **Scope:** [Frontend | Backend | Full-Stack]
> **Router:** [App Router | Pages Router]
> **Last Updated:** [today's date]
> **User Guide:** [../../user/how-to-<feature>.md]

---

## Overview

[2–3 sentence technical summary]

---

## Route Structure

| Type | Path | Notes |
|------|------|-------|
| Page | `app/[path]/page.tsx` | [Server/Client Component] |
| API  | `app/api/[path]/route.ts` | [Methods: GET, POST, ...] |
| Action | `app/[path]/actions.ts` | [Server Action] |

---

## API Reference

[For each route handler found:]

### `[METHOD] /api/[path]`

**Auth required:** Yes / No
**Handler:** `app/api/[path]/route.ts`

**Request:**
\`\`\`typescript
// Body / query params
{
  field: string  // description
}
\`\`\`

**Response `200`:**
\`\`\`typescript
{
  field: string
}
\`\`\`

**Error responses:**
| Status | Reason |
|--------|--------|
| 400 | Validation failed |
| 401 | Unauthenticated |
| 403 | Unauthorized |
| 500 | Server error |

---

## Server Actions

[If Server Actions are used:]

### `actionName(prevState, formData)`

**File:** `app/.../actions.ts`
**Revalidates:** `[path or tag]`

\`\`\`typescript
// Input
formData.get('field') // type: string

// Returns
{ success: boolean, error?: string }
\`\`\`

---

## Component Architecture

[If frontend or full-stack:]

\`\`\`
app/[feature]/
├── page.tsx              # Server Component — [what it fetches]
├── [feature]-form.tsx    # "use client" — [what it handles]
├── loading.tsx           # Suspense fallback
└── error.tsx             # Error boundary
\`\`\`

**Data flow:**
\`\`\`
page.tsx (Server) → fetches data → passes as props
  └── [Feature]Form (Client) → calls Server Action / API Route
        └── revalidatePath() → page re-renders
\`\`\`

---

## Data Models

\`\`\`typescript
// From types/ or inline
type FeatureName = {
  id: string
  // ...
}
\`\`\`

---

## Authentication & Authorization

[Describe how auth is checked — middleware, getServerSession, auth(), etc.]

---

## Caching & Revalidation

| Data | Strategy | Revalidation |
|------|----------|-------------|
| [query] | `fetch` with `cache: 'force-cache'` | `revalidateTag('...')` |
| [mutation] | Server Action | `revalidatePath('/...')` |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_*` | Yes | [client-accessible config] |
| `[SECRET_KEY]` | Yes | [server-only secret] |

---

## Testing

\`\`\`bash
# Run tests
pnpm test -- --grep "[feature]"

# E2E
pnpm playwright test [feature]
\`\`\`

Key test cases:
- [ ] Happy path
- [ ] Unauthenticated redirect
- [ ] Form validation errors
- [ ] Loading & error states

---

## Related Documentation

[Links to related dev docs]

---

*Generated by `/document-feature`. Review before merging.*
```

---

### Step 5 — Generate User Documentation

Create `docs/user/how-to-<feature-name-kebab-case>.md`:

```markdown
# How to [User-Friendly Feature Name]

> **Time required:** ~[X] minutes
> **Technical guide:** [../../dev/<feature>-implementation.md]

---

## What is [Feature Name]?

[1–2 sentences. Plain language. What does this let the user DO?]

---

## Before You Begin

- [ ] You must be [logged in / an admin / etc.]
- [ ] [Any other prerequisite]

---

## Step-by-Step

### Step 1 — [Action]

Go to **[Page Name]** in the navigation.

📸 *Screenshot: [e.g., "Top navigation bar with 'Settings' highlighted"]*

---

### Step 2 — [Action]

[Clear instruction.]

📸 *Screenshot: [e.g., "The password reset form with fields visible"]*

> 💡 **Tip:** [Optional hint]

---

### Step 3 — [Action]

[Clear instruction.]

📸 *Screenshot: [e.g., "Success confirmation message after submitting"]*

---

## What Happens Next

[What should the user expect — redirect, email, confirmation, etc.]

---

## Common Issues

### [Problem]
**You see:** [error message or symptom]
**Fix:** [plain-language solution]

---

## Need Help?

- 📖 [Link to related user guide]
- 🔧 [Link to developer docs]

---

*Last updated: [today's date]*
```

---

### Step 6 — Output Summary

```
✅ Documentation generated for: [Feature Name]

📂 Next.js scope:   [Frontend | Backend | Full-Stack]
🔀 Router:          [App Router | Pages Router]
⚡ Server Actions:  [Yes | No]

📄 Developer Docs → docs/dev/[filename].md
👤 User Guide     → docs/user/[filename].md

🔗 Related docs cross-referenced: [list or "none found"]
📸 Screenshot placeholders: [count]

Next steps:
1. Fill in any [bracketed placeholders]
2. Replace 📸 placeholders with real screenshots
3. Run test cases listed in the developer doc
```

---

## Scope-Specific Adjustments

**Frontend only (no API routes, no Server Actions):**
- Skip API Reference and Server Actions sections
- Expand Component Architecture with full props tables
- Add accessibility notes (ARIA, keyboard nav, focus management)

**Backend only (API routes only, no UI):**
- Skip Component Architecture section
- Add cURL and fetch examples for every endpoint
- Include rate limiting and error handling detail

**Full-stack with Server Actions:**
- Include sequence diagram showing form → action → revalidation flow
- Document optimistic update patterns if used (`useOptimistic`)
- Note which components are Server vs Client

**Full-stack with API Routes:**
- Include full request lifecycle: Client → Route Handler → DB → Response
- Document any middleware that runs on this route
