# TojTech — Frontend

Minimal React + TypeScript storefront and admin panel for the TojTech API.

## Stack

- React 19 + TypeScript, built with Vite
- Tailwind CSS v4 for styling
- React Router for routing
- Axios for API calls

## Setup

```bash
npm install
cp .env.example .env   # already done — edit if your API runs elsewhere
npm run dev
```

Runs at `http://localhost:5173`. Make sure the Go API is running (default
`http://localhost:8080`) and that `VITE_API_URL` in `.env` points at it.

**Backend CORS**: the API must allow `http://localhost:5173` as an origin
(`cors.Handler` in `routes.go`) or requests from this dev server will be
blocked by the browser.

## What's included

**Storefront** (public):
- `/` — product catalog with category filtering
- `/login`, `/register` — auth screens

**Admin panel** (requires an account with `role: "admin"`):
- `/admin` — quick counts (products, categories, out-of-stock)
- `/admin/products` — create/edit/delete products, manage product images
- `/admin/categories` — create/edit/delete categories

To get an admin account, register normally through the UI, then promote the
user directly in Postgres:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

Log out and log back in afterwards — the role is baked into the JWT at login
time, so an existing session won't pick up the change automatically.

## Notes on how this is wired up

- The access token lives in memory (a React context), not `localStorage`.
  Refreshing the page logs you out — that's expected until the API grows a
  refresh-token flow.
- The client-side admin guard (`RequireRole`) is a UX convenience only. The
  real access control is the API's `RequireRole` middleware — the UI simply
  avoids showing screens a customer account can't use anyway.
- A product's category comes back from the API as `{ uuid }` only (no name),
  so pages that need a category's name fetch `/categories` separately and
  match by `uuid` client-side.
- API error responses are shaped as `{ "error": "...", "error_description":
  "..." }`; `extractError()` in `src/api/client.ts` is the one place that
  turns that into a string for the UI.

## Project layout

```
src/
├── api/client.ts          axios instance, token injection, error parsing
├── auth/AuthContext.tsx   login/register/logout, current user in memory
├── components/            Navbar, admin sidebar layout, modal, route guard
├── pages/storefront/      catalog, login, register
├── pages/admin/           overview, products, categories
└── types.ts               shapes matching the Go API's DTOs
```
