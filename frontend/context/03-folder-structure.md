# Folder Structure

## Source tree

```text
frontend/
  src/
    api/
      auth.ts              # login, logout, refresh, me, changePassword
      client.ts            # Axios instance, interceptors, refresh queue
      users.ts
      roles.ts
      products.ts
      customers.ts
      countries.ts
      terminals.ts
      orders.ts
    assets/styles/
      global.css
    components/
      AppDatePicker.vue    # Locale-aware date selection (Jalali in fa, Gregorian in en)
      layout/
        AppLayout.vue      # Sidebar, menu, header, change-password modal
    composables/
      useDateFormat.ts     # Jalali date formatting
      usePermission.ts     # hasPermission, hasAnyPermission, hasAllPermissions
    i18n/
      index.ts
      fa.ts                # Persian (default)
      en.ts
    router/
      index.ts             # Routes + beforeEach guards
    stores/
      auth.ts              # JWT session, refresh timers, /me
      theme.ts
    types/
      auth.ts, common.ts, user.ts, role.ts, product.ts, order.ts, customer.ts, geography.ts
    utils/
      error.ts             # getApiError — ProblemDetails parsing
      api-error-translator.ts  # i18n for backend error messages
      gridActions.ts       # renderGridAction, renderGridStatusSwitch
      debounce.ts
      persianDigits.ts
      calendarDate.ts      # ISO ↔ Jalali helpers for AppDatePicker
    views/
      auth/LoginView.vue
      dashboard/DashboardView.vue
      products/ProductList.vue
      orders/OrderList.vue, OrderDetail.vue, OrderForm.vue
      customers/CustomerList.vue, CustomerDetail.vue, CustomerForm.vue
      admin/AdminDashboard.vue, UserManagement.vue, RoleManagement.vue, CustomerGroupManagement.vue, CustomerTypeManagement.vue, CountryManagement.vue, TerminalManagement.vue
      not-found/NotFound.vue
    App.vue
    main.ts
    env.d.ts
  context/                 # Knowledge digest (this folder)
  agents/
    frontend-developer.yaml
  .cursor/skills/sale-frontend/
  MEMORY.md
  index.html
  package.json
  vite.config.ts
  .env.example
```

## Knowledge and agent files

| File | Purpose |
|------|---------|
| `MEMORY.md` | Agent memory — status, hard rules |
| `context/` | Knowledge digest |
| `agents/frontend-developer.yaml` | Agent role definition |
| `.cursor/skills/sale-frontend/SKILL.md` | Development skill |

## MCP

Re-index after structural changes:

```text
index_repository repo_path=frontend/ project=C-sarayi-sale-frontend
```
