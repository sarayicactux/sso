# Coding Rules

## General

- Match neighboring code before introducing new abstractions
- Keep components focused; extract composables for shared logic
- Composition API with `<script setup lang="ts">`
- Preserve RTL/Persian UI — default locale is `fa`

## API layer

- One function per API operation in `src/api/{module}.ts`
- All HTTP through `src/api/client.ts` — no scattered raw Axios calls
- Base path: `/api/v1`

## State

- Auth user and permissions in `src/stores/auth.ts`
- Theme in `src/stores/theme.ts`
- Avoid duplicating server state — fetch when needed, cache deliberately

## Routing

- Lazy-load views via dynamic `import()`
- `meta.requiresAuth` for protected routes
- `meta.permission` for permission-gated routes
- `meta.keepAlive` for list views that benefit from caching

## Forms and validation

- Client validation for UX; server validation is authoritative
- Display ProblemDetails via `getApiError()` and `translateApiErrorMessage()`

## Data tables (grids)

- **Row actions:** icon-only controls with `NTooltip` on hover — never labeled text buttons in action columns
- Use `renderGridAction()` from `src/utils/gridActions.ts`
- **Status column:** show an `NSwitch` toggle — never plain status text in grid cells
- Use `renderGridStatusSwitch()` and `gridStatusColumnProps` from `src/utils/gridActions.ts`
- Page-level primary actions (e.g. “+ New user”) may remain full buttons outside the grid
- **Delete action:** trash icon opens a confirm modal — **never** call the delete API directly from the icon handler

## Delete confirmation (required)

Applies to **all** destructive delete flows: data grids, tables, nested lists, detail-page sections, card actions, etc.

1. User clicks delete (trash) icon → open confirm modal with localized title/message
2. User clicks **Confirm** → call delete API → success toast → refresh list/state
3. User clicks **Cancel** or close icon → close modal, no API call

```typescript
// Grid action — open confirm, do not delete inline
renderGridAction(TrashOutline, t('common.delete'), () => openDeleteConfirm(row), 'error')
```

- Reuse `DeleteConfirmModal` + `useDeleteConfirm()` (`src/components/DeleteConfirmModal.vue`, `src/composables/useDeleteConfirm.ts`)

- Use `n-modal` with dialog preset (`positive-text` / `@positive-click` for confirm, `negative-text` / `@negative-click` for cancel) or a dedicated confirm modal component
- All strings via vue-i18n (`en.ts` + `fa.ts`)
- Follow modal close rules: no backdrop/Esc dismiss (global defaults in `src/main.ts`)

## Search / filters

- Use `debounce()` from `src/utils/debounce.ts` for search inputs (default 300ms)

## Modals

- Use Naive UI `n-modal` (global defaults in `src/main.ts`)
- **Do not** close on backdrop click or Esc — only via Cancel button or close icon
- Dialog preset: use `negative-text` / `@negative-click` for cancel; card preset: explicit Cancel in `#footer`
- Do not set `:mask-closable="true"` or `:close-on-esc="true"` unless product explicitly requires it

## i18n

- All user-facing strings via `vue-i18n` (`t('key')`)
- Backend error messages mapped in `src/utils/api-error-translator.ts`

## Date pickers (required)

Date **selection** and **display** follow the active UI language:

| Locale | Calendar |
|--------|----------|
| `fa` | Jalali (Persian) |
| `en` | Gregorian |

- Use **`AppDatePicker`** (`src/components/AppDatePicker.vue`) for every date-selection field — current and future forms
- Do **not** use `n-date-picker` directly. Naive UI `dateFaIR` only localizes Gregorian month names; it is not a Jalali calendar
- `v-model` is an ISO **Gregorian** date string (`yyyy-MM-dd`) or `null` — that is what the API stores
- Read-only dates in tables/detail views still go through `useDateFormat()` (Jalali digits when `fa`, Gregorian when `en`)

```vue
<n-form-item :label="t('orders.orderDate')" path="orderDate">
  <AppDatePicker v-model="form.orderDate" />
</n-form-item>
```

## Do not

- Embed backend business rules (pricing, authorization decisions) in the SPA
- Store JWT in insecure locations
- Log tokens or passwords in browser console
