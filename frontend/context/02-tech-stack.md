# Tech Stack

## Confirmed (from `package.json`)

| Package | Version |
|---------|---------|
| Vue | ^3.5.42 |
| Vite | ^8.2.2 |
| TypeScript | ~6.0.2 |
| Vue Router | ^4.6.4 |
| Pinia | ^3.0.4 |
| Naive UI | ^2.44.1 |
| vue-i18n | ^9.14.5 |
| Axios | ^1.18.1 |
| jalaali-js | ^2.0.0 (Jalali calendar) |
| @vicons/carbon, @vicons/ionicons5 | ^0.13.0 |

## Backend integration

- Consumes **.NET REST API** at `backend/`
- Dev proxy: Vite proxies `/api` → `http://localhost:5064`
- API base: relative `/api/v1` (no env var required in dev)

## Environment

- `.env.example` documents optional overrides
- Never commit secrets

## Commands

```bash
npm install
npm run dev      # Vite dev server on :5173
npm run build    # tsc && vite build
npm run preview  # preview production build
```

## UI conventions

- Component library: **Naive UI** (tables, forms, modals, layout)
- Icons: `@vicons/carbon` and `@vicons/ionicons5`
- Default locale: Persian (`fa`), RTL layout
- Dates: Jalali via `jalaali-js` + `useDateFormat` (display) and `AppDatePicker` (selection: Jalali in `fa`, Gregorian in `en`)
