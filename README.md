# TojTech Frontend

React + TypeScript storefront and admin panel for the TojTech API.

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, react-router 7, axios. Fonts (Montserrat, Figtree) are self-hosted through `@fontsource-variable`.

## Run

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:8080/api/v1
npm install
npm run dev              # http://localhost:5173
```

The API must be running (see the backend repo: `docker compose up -d --build`) and its `CORS_ORIGIN` must be `http://localhost:5173`.

Other scripts: `npm run build` (typecheck + production build), `npm run preview`, `npm run lint`.

## Features

- Catalog with search, category filter, sorting and live stock labels
- Product page with gallery and quantity picker limited by stock
- Cart stored on the device (`localStorage`, key `tojtech_cart`); checkout is not implemented yet
- Register / log in with automatic, race-free token refresh
- Admin panel (`/admin`, admin role only): overview, products with image upload or link, categories

## Structure

```
public/                logo and favicon assets
src/api/client.ts      axios instance, shared token refresh
src/auth/              AuthContext
src/cart/              CartContext
src/components/        nav, footer, hero, modal, form pieces, icons
src/pages/storefront/  catalog, product, cart, login, register
src/pages/admin/       overview, products, categories
src/index.css          design tokens and shared component classes
```

## Notes

- Becoming an admin is done in the database, see the backend README.
- Design tokens (colors, fonts, shadows) live in `@theme` in `src/index.css` and follow the TojTech logo palette.
