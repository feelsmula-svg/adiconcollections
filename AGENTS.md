<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:styling-and-components-rules -->
# Styling & Reusable Components (COMPULSORY — NO EXCEPTIONS)

Every UI change in this repo follows the rules below. There are **no exceptions** —
bug fixes, prototypes, "quick" demos, one-off screens, and refactors all comply.
Violations must be fixed in the same change that introduces them.

## 1. The single source of truth

- **Design system lives in:** `app/components/ui/` (barrel: `app/components/ui/index.ts`).
- **Design tokens live in:** `app/globals.css` (`@theme` block — spacing, color,
  radius, font families, type scale).
- **Feature components live in:** `app/components/*` and use the design-system
  primitives — never raw elements.

## 2. No raw / unstyled elements in feature code

Feature/page/screen files MUST NOT contain raw HTML elements. The following are
**banned** outside `app/components/ui/`:

- `<div>`        → use `<Box>` or `<Stack>` / `<Row>`
- `<span>`       → use `<Text as="span">` or `<Icon>`
- `<section>`    → use `<Section>`
- `<button>`     → use `<Button>` or `<IconButton>`
- `<a>`          → use `<LinkButton>` or `<TextLink>` (wrap `next/link`)
- `<img>`        → use `<Image>` (wrap `next/image`)
- `<input>`, `<textarea>`, `<select>`, `<label>`, `<form>` → use the matching
  form primitive (`<TextField>`, `<Select>`, …). Create it if missing.
- `<h1>`–`<h6>`  → use `<Heading level={1..6} variant=…>`
- `<p>`          → use `<Text variant=…>`
- `<ul>`, `<ol>`, `<li>`, `<table>`, `<tr>`, `<td>` → create a `<List>` /
  `<DataTable>` primitive before using these in features.

Raw elements are allowed **only** inside the `app/components/ui/` implementation
files themselves. They must never leak into `app/page.tsx`, `app/layout.tsx`,
route segments, or feature components in `app/components/*`.

## 3. Workflow before writing any UI

Before adding markup, you MUST:

1. **Open `app/components/ui/index.ts`** to see what already exists.
2. **Read the props/variants** of the closest matching component.
3. **Use it as-is.** Need spacing? Use `<Stack gap="lg">` / `<Box className="p-lg">`,
   never an extra wrapper `<div>`.
4. **Only if no suitable component exists**, create a new one — see §4.

## 4. Creating a new design-system component

When (and only when) the primitive does not yet exist:

1. **Add it under `app/components/ui/<ComponentName>.tsx`** — never colocated
   with the feature that needs it first.
2. **Match the existing API style:** prop names `variant`, `size`, `tone`,
   `as`; use the `cn(...)` helper from `app/components/ui/cn.ts`; consume
   tokens (not hard-coded values).
3. **Export it from `app/components/ui/index.ts`** so it is discoverable.
4. **Refactor any duplicated raw markup elsewhere** to use the new component
   in the same change. Do not leave the old version behind.

## 5. Tokens, not magic numbers

All visual values come from the `@theme` block in `app/globals.css`:

- Spacing: `p-xs`, `gap-md`, `mt-2xl`, `py-section` — never `p-[12px]`, never
  `style={{ padding: 12 }}`.
- Color: `bg-primary`, `text-on-surface`, `border-outline-variant` — never
  hex literals (`#c4a47a`, `bg-[#c4a47a]`).
- Radius: `rounded-lg`, `rounded-2xl`, `rounded-full` — never `rounded-[6px]`.
- Typography: `font-display-xl`, `text-headline-md`, `font-label-caps` — never
  ad-hoc `text-[18px]` / `tracking-[0.3em]`.
- Animation: reuse the `animate-in`, `fade-in`, `slide-in-from-*` classes
  already declared in `globals.css`.

If a token is missing for a real need, **add it to `@theme` first**, then use
the generated utility. Do not bypass with arbitrary values.

## 6. Banned patterns

- `style={{ … }}` in feature code with hard-coded values.
- `className="bg-[#…]"`, `className="text-[14px]"`, `className="p-[12px]"`
  (arbitrary-value escape hatches in feature code).
- A second styling system (CSS modules, styled-components, emotion). The
  project uses Tailwind v4 + the `@theme` tokens — full stop.
- Copy-pasting markup between feature components instead of extracting a
  shared primitive.

## 7. Pre-merge checklist (every UI change)

- [ ] No raw HTML elements in `app/page.tsx`, `app/layout.tsx`, or
      `app/components/*` (feature components).
- [ ] Every visual element is a `app/components/ui/*` primitive.
- [ ] Any new primitive lives in `app/components/ui/`, is exported from
      `index.ts`, and uses tokens.
- [ ] All colors, spacing, radius, and typography come from `@theme` tokens —
      no hex, no arbitrary values, no inline pixels.
- [ ] Existing duplicated raw markup encountered along the way has been
      migrated to the shared primitive.

> If you find yourself about to write a raw `<div>`, `<button>`, `<span>`, or
> `<section>` in feature code — **stop**. Find the primitive in
> `app/components/ui/index.ts` first; if it does not exist, create it there,
> then use it.
<!-- END:styling-and-components-rules -->
