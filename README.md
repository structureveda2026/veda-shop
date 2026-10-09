# Veda Store

**Modern Vedic luxury e-commerce storefront** — authentic Rudraksha (1–14 Mukhi), certified gemstones, bracelets, yantras and puja kits, with Vedic guidance tools (Rashi, Planet and Purpose based discovery) and a Shopify-powered cart, checkout and order lifecycle.

Built by **Veda Structure Private Limited**.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [How It Works (Demo Mode vs Shopify Mode)](#how-it-works-demo-mode-vs-shopify-mode)
4. [Prerequisites](#prerequisites)
5. [Quick Start](#quick-start)
6. [Environment Variables](#environment-variables)
7. [Shopify Setup](#shopify-setup)
8. [Running the API Locally](#running-the-api-locally)
9. [Available Scripts](#available-scripts)
10. [Project Structure](#project-structure)
11. [Routes](#routes)
12. [Serverless API](#serverless-api)
13. [Deployment](#deployment)
14. [Legacy / Not-Yet-Wired Parts](#legacy--not-yet-wired-parts)
15. [Troubleshooting](#troubleshooting)
16. [Contributing](#contributing)
17. [Disclaimer](#disclaimer)

---

## Features

- **Landing pages per category** — Home, Rudraksha, Gemstones, Bracelets, Yantra and Puja Kits, each built from reusable, data-driven sections (hero, finder, shop-by-purpose, FAQ, reviews, final CTA).
- **Vedic discovery tools** — browse by Mukhi, Rashi (zodiac), Planet (Navagraha) and Purpose; "Find My Gemstone" / "Find My Product" modals; a multi-step gemstone recommendation engine.
- **Gemstone catalog** — category pages, full catalog with filters (colour, planet, zodiac, origin, price), single-gemstone pages and individual listing pages with certification details.
- **Product experience** — gallery with zoom, quick view, purchase options (size / quality variants), certificate viewer, product reviews, wishlist, recently viewed.
- **Cart & checkout** — persistent cart drawer and cart page, synced with a Shopify cart; checkout hands off to Shopify.
- **Customer accounts** — sign-in through Shopify Customer Account API (OAuth 2.0 + PKCE), order history, order detail, **cancel / return / exchange** flows driven by live Shopify order state.
- **Custom jewellery builder** — guided flow for bespoke gemstone jewellery requests.
- **Content & trust** — authenticity guide, certification hub, learn hubs, blog, videos, FAQ, policy pages.
- **Mobile-first UI** — sticky bottom navigation, mobile menu and filter drawers.
- **Modern Vedic Luxury design system** — ivory / gold palette with Cormorant Garamond (serif) and Inter (sans-serif).

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React 18, TypeScript, Vite 7 |
| Styling | Tailwind CSS **3.4**, PostCSS, Autoprefixer |
| Routing | React Router 7 |
| Icons | Lucide React, React Bootstrap Icons |
| State | React Context (Auth, Cart, Wishlist, Recently Viewed, Unit) |
| Commerce backend | **Shopify** — Storefront API (products, cart), Customer Account API (login), Admin API (orders, returns) |
| Serverless API | TypeScript functions in `/api` (Vercel format) |
| Hosting | Vercel (recommended) |

---

## How It Works (Demo Mode vs Shopify Mode)

The storefront is designed so that **Shopify can be connected without changing any component**.

- **Demo mode (default, no setup needed).** If the `VITE_SHOPIFY_*` variables are empty, every catalog and content service falls back to the local demo data in `src/data/`. Browsing, filters, finders, wishlist and the cart UI all work. Account, orders and real checkout do **not**.
- **Shopify mode.** When the Shopify variables are set, products and carts come from the Storefront API, sign-in goes through Shopify Customer Accounts, and the `/api` functions load and update orders through the Admin API.

Data access is isolated in `src/services/` (one catalog service and one content service per section). To move a section from demo data to live data, only the corresponding service function needs to change — components stay untouched.

> **Tip:** Start in demo mode to confirm the project runs, then add Shopify credentials.

---

## Prerequisites

- **Node.js 20.19+** (Node 22 LTS recommended) — required by Vite 7
- **npm 10+** (ships with Node)
- **Git**
- *(Optional, for Shopify mode)* a Shopify store and a [Vercel](https://vercel.com) account / the Vercel CLI

Check your versions:

```bash
node -v
npm -v
```

---

## Quick Start

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd VEDA-SHOP

# 2. Install dependencies
npm install

# 3. (Optional) create your local environment file
cp .env.example .env
#    Leave the Shopify values empty to run in demo mode.

# 4. Start the dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

> The dev server runs on port **3000** (set in `vite.config.ts`) and is exposed on your local network (`host: true`), so you can test on a phone using your computer's LAN IP.

### Verify your setup

```bash
npm run lint     # TypeScript type-check
npm run build    # Production build → dist/
npm run preview  # Serve the production build locally
```

---

## Environment Variables

Copy `.env.example` to `.env`. **Never commit `.env`** (it is already in `.gitignore`).

> Variables prefixed with `VITE_` are bundled into the browser build and are therefore **public**. Server-side secrets must **never** use the `VITE_` prefix.

### Browser-side (public)

| Variable | Required | Description |
| :--- | :---: | :--- |
| `VITE_SHOPIFY_STORE_DOMAIN` | Shopify mode | Your store domain, e.g. `your-store.myshopify.com` |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | Shopify mode | Storefront API **public** access token |
| `VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | For login | Customer Account API client ID (Headless channel) |
| `VITE_SHOPIFY_API_VERSION` | No | Storefront API version (default `2026-01`) |
| `VITE_SHOPIFY_COUNTRY` | No | Buyer country for pricing / markets (default `IN`) |
| `VITE_ORDERS_API_URL` | No | Orders API base URL (default `/api/orders`) |
| `VITE_AUTH_API_URL` | No | Auth API base URL (default `/api/auth`) |
| `VITE_NEWSLETTER_ENDPOINT` | No | URL that receives newsletter sign-ups (Klaviyo / Mailchimp form, etc.). If empty, sign-ups are only logged in dev. |

### Server-side only (Vercel → Settings → Environment Variables)

| Variable | Required | Description |
| :--- | :---: | :--- |
| `SHOPIFY_STORE_DOMAIN` | Orders / Account | Store domain (falls back to `VITE_SHOPIFY_STORE_DOMAIN`) |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Orders / Account | Admin API token (`shpat_...`) |
| `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET` | Alternative | Use instead of the token above for a Dev Dashboard app (client-credentials grant) |
| `SHOPIFY_ADMIN_API_VERSION` | No | Admin API version (default `2025-10`) |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | Login | Same value as the browser-side client ID (falls back to the `VITE_` one) |
| `SITE_ORIGIN` | No | Public site URL, only needed if requests arrive without an `Origin` header |
| `RETURN_WINDOW_DAYS` | No | Return eligibility window (default `7`) |
| `EXCHANGE_WINDOW_DAYS` | No | Exchange eligibility window (default `7`) |

> **Note:** `.env.example` also lists `PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_*`, `RAZORPAY_*`, `GEMINI_API_KEY`, `CLOUDINARY_*` and `NEXT_PUBLIC_APP_URL`. These belong to an earlier backend plan and are **not read by the current code** — see [Legacy / Not-Yet-Wired Parts](#legacy--not-yet-wired-parts). You can ignore or delete them.

### Complete `.env` template

Copy this into a `.env` file in the project root (or run `cp .env.example .env`) and replace the placeholder values. Values shown here are placeholders only — never commit real keys.

```dotenv
# ENVIRONMENT CONFIGURATION EXAMPLE — VEDA STRUCTURE GEMSTONES PLATFORM

# Server & Node
NODE_ENV=development
PORT=5000

# Database Connection (PostgreSQL)
DATABASE_URL=

# Redis Cache (Optional)
REDIS_URL=

# Security & Authentication
JWT_SECRET=
JWT_EXPIRES_IN=


# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID="rzp_test_YourRazorpayKeyIdHere"
RAZORPAY_KEY_SECRET="YourRazorpayKeySecretHere"
RAZORPAY_WEBHOOK_SECRET="YourRazorpayWebhookSecretHere"

# AI Assistant (Google Gemini API)
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Cloudinary Image Storage
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="1234567890"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# Client Application URL
NEXT_PUBLIC_APP_URL="http://localhost:5173"


# VITE_SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
# VITE_SHOPIFY_STOREFRONT_TOKEN="<storefront public token>"


# ---------------------------------------------------------------------------
# SHOPIFY — products, cart, checkout, payments, orders, returns, refunds
# ---------------------------------------------------------------------------

# Browser-side (public) — Storefront API + Customer Account sign-in
VITE_SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
VITE_SHOPIFY_STOREFRONT_TOKEN="<storefront public token>"
# Headless channel → Customer Account API → Client ID. In the same settings add:
#   Callback URI  : https://<your-site>/account/callback   (and http://localhost:3000/account/callback for vercel dev)
#   JavaScript origin: https://<your-site>
#   Logout URI    : https://<your-site>
VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID="<customer account api client id>"

# Server-side ONLY (Vercel → Settings → Environment Variables). Never prefix these with VITE_.
SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
# Admin API token (custom/Dev Dashboard app) with scopes:
#   read_orders write_orders read_returns write_returns read_products read_customers read_fulfillments
#   (+ read_all_orders so orders older than 60 days still show up)
SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_xxx"
#   ...or, for a Dev Dashboard app, use client credentials instead of the token above:
# SHOPIFY_CLIENT_ID="xxx"
# SHOPIFY_CLIENT_SECRET="xxx"
# SHOPIFY_ADMIN_API_VERSION="2025-10"
# SITE_ORIGIN="https://<your-site>"        # only if requests arrive without an Origin header

# Store policy
RETURN_WINDOW_DAYS=7
EXCHANGE_WINDOW_DAYS=7
```

> **Demo mode:** to run without Shopify, leave the `VITE_SHOPIFY_*` values empty or remove those lines — the placeholder strings above (such as `your-store.myshopify.com`) are not real credentials. Only the Shopify variables are used by the current code.

---

## Shopify Setup

Only needed for live products, accounts and orders.

### 1. Storefront API (products & cart)

1. In Shopify admin, create a **custom app** or use the **Headless** sales channel.
2. Grant Storefront API access to products, collections, cart and customer-facing data.
3. Copy the **public Storefront access token** into `VITE_SHOPIFY_STOREFRONT_TOKEN`, and your domain into `VITE_SHOPIFY_STORE_DOMAIN`.

### 2. Customer Account API (sign-in)

1. In the **Headless** channel, open **Customer Account API** settings and copy the **Client ID** into `VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`.
2. Register these URLs in the same settings:

   | Setting | Value |
   | :--- | :--- |
   | Callback URI | `https://<your-site>/account/callback` and `http://localhost:3000/account/callback` (for local `vercel dev`) |
   | JavaScript origin | `https://<your-site>` |
   | Logout URI | `https://<your-site>` |

### 3. Admin API (orders, returns, exchanges)

Create an Admin API app with these scopes:

```
read_orders  write_orders  read_returns  write_returns
read_products  read_customers  read_fulfillments
```

Add **`read_all_orders`** if orders older than 60 days must remain visible. Put the token in `SHOPIFY_ADMIN_ACCESS_TOKEN` (server-side only).

### 4. Refunds

Refunds are never triggered from the browser. Cancelled paid orders are refunded by Shopify itself; return refunds are processed by the store team in Shopify admin (**Return → Process**). The storefront only displays their live status.

---

## Running the API Locally

The `/api` folder contains **Vercel-style serverless functions**. `npm run dev` (plain Vite) serves only the frontend, so `/api/auth` and `/api/orders` will not respond. To run both together:

```bash
npm install -g vercel     # once
vercel login              # once
vercel dev
```

Then open the URL printed by the CLI (usually `http://localhost:3000`). Make sure the server-side variables are available to `vercel dev` (via `.env` or `vercel env pull`).

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Type-check (`tsc`) and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run the TypeScript compiler in check-only mode |

---

## Project Structure

```
VEDA-SHOP/
├── api/                      # Vercel serverless functions
│   ├── _lib/                 # Shared helpers (http, Shopify Admin client, order mapper)
│   ├── auth.ts               # Customer Account OAuth proxy (token / refresh / profile)
│   └── orders.ts             # Orders, cancel, return and exchange lifecycle
├── prisma/
│   └── schema.prisma         # Legacy DB schema (not used at runtime — see below)
├── src/
│   ├── components/           # UI sections, grouped by category
│   │   ├── home/             #   Homepage sections
│   │   ├── orders/           #   Order list / action modals
│   │   └── …                 #   Rudraksha*, Bracelet*, PujaKit*, Yantra*, Gemstone*, shared UI
│   ├── context/              # Auth, Cart, Wishlist, RecentlyViewed, Unit providers
│   ├── data/                 # Demo catalog & content (used when Shopify is not connected)
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Shopify client, pricing, analytics, order & account helpers
│   ├── pages/                # Route-level pages
│   ├── services/             # Data-access layer — the single place to swap demo data for Shopify
│   ├── types/                # Shared TypeScript types
│   ├── utils/                # Small helpers
│   ├── App.tsx               # Providers + route table
│   ├── main.tsx              # Entry point
│   └── index.css             # Tailwind layers + custom utilities
├── .env.example              # Environment variable template
├── index.html                # HTML shell, SEO meta, Google Fonts
├── tailwind.config.js        # Vedic colour palette, fonts, shadows
├── vite.config.ts            # Vite config (`@` → `src`, port 3000)
├── vercel.json               # SPA rewrite (excludes /api)
└── netlify.toml              # SPA redirect + build settings
```

Path alias: `@/…` resolves to `src/…`.

---

## Routes

| Area | Routes |
| :--- | :--- |
| Home & shop | `/`, `/shop`, `/search`, `/collections/:category`, `/collections/:category/:subcategory`, `/products/:slug` |
| Category landings | `/rudraksha`, `/bracelets`, `/puja-kits`, `/yantra` |
| Gemstones | `/gemstones`, `/gemstones/zodiac-stones`, `/gemstones/popular-vedic-gems`, `/gemstones/exclusive`, `/gemstones/other`, `/gemstones/view-all`, `/gemstones/:slug`, `/gemstones/:slug/listing/:productId`, `/planets/:planetSlug`, `/certification`, `/custom-gemstone-jewellery` |
| Guidance | `/rashi`, `/rashi/:rashi`, `/purpose/:purposeId`, `/guides/rudraksha`, `/guides/gemstone`, `/guides/puja` |
| Content | `/blog`, `/videos`, `/faqs`, `/authenticity`, `/about`, `/contact`, `/policies/:policyType` |
| Commerce | `/cart`, `/wishlist`, `/checkout`, `/order-success`, `/track-order` |
| Account | `/account`, `/account/orders`, `/account/orders/:orderId`, `/account/callback` |
| Admin (demo UI) | `/admin` |

---

## Serverless API

Shopify is the source of truth; nothing is stored by these functions. Every request verifies the caller's identity against Shopify and checks that the order belongs to that customer.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth?action=config` | Returns Shopify authorization / logout endpoints |
| `POST` | `/api/auth` | `{ action: 'token' }` exchange code (PKCE) · `{ action: 'refresh' }` refresh token |
| `GET` | `/api/auth?action=profile` | Customer profile (`Authorization: Bearer <access token>`) |
| `GET` | `/api/orders` | List the signed-in customer's orders (`?after=<cursor>` to paginate) |
| `GET` | `/api/orders?id=<orderId>` | Single order detail |
| `POST` | `/api/orders` | `{ action: 'cancel' \| 'return' \| 'exchange', … }` |

---

## Deployment

### Vercel (recommended)

1. Push the repository to GitHub.
2. In Vercel, **Add New → Project** and import the repository.
3. Framework preset: **Vite** · Build command: `npm run build` · Output directory: `dist`.
4. Add the environment variables from the tables above (browser-side **and** server-side).
5. Deploy. `vercel.json` already rewrites all non-`/api` paths to `index.html`, so deep links and page refreshes work.
6. Add your production URL to the Shopify Customer Account **Callback URI / JavaScript origin / Logout URI** settings.

### Netlify (frontend only)

`netlify.toml` configures the build (`npm run build`, publish `dist`) and the SPA redirect. However, the `/api` functions are written for Vercel and are **not** set up for Netlify Functions, so account and order features will not work there without porting them.

---

## Legacy / Not-Yet-Wired Parts

These exist in the repository but are **not active** in the current build. They are safe to leave in place.

| Item | Status |
| :--- | :--- |
| `prisma/schema.prisma` | Earlier PostgreSQL schema. No Prisma client is used at runtime; no migration is required. |
| Gemini AI assistant (`AiGemstoneAssistant.tsx`) | Currently a scripted, local-response widget. No Gemini API call is made, so `GEMINI_API_KEY` is unused. |
| Razorpay | Mentioned in checkout copy only. Payments are handled by Shopify checkout. |
| `DATABASE_URL`, `REDIS_URL`, `JWT_*`, `CLOUDINARY_*`, `PORT`, `NEXT_PUBLIC_APP_URL` | Present in `.env.example`, not read by the code. |
| `/admin` dashboard | Demo UI. Manage real products and orders in Shopify admin. |
| `src/services/authService.ts` | Legacy local auth shapes; live sign-in uses Shopify Customer Accounts. |

---

## Troubleshooting

**Build fails with: _"It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin"_**
The project is written for **Tailwind CSS 3** (`@tailwind` directives, `tailwind.config.js`, `postcss.config.js`). Tailwind 4 changed its PostCSS setup and will break the build. Make sure `package.json` pins Tailwind 3:

```bash
npm install -D tailwindcss@^3.4.17
```

**`Port 3000 is already in use`**
Stop the other process, or run `npx vite --port 3001`. If you use another port, update the Shopify Callback URI accordingly.

**Browser shows `/favicon.png` 404**
`index.html` references `/favicon.png`, but there is no `public/` folder yet. Create `public/favicon.png` (or update the `<link>` in `index.html`).

**Sign-in redirects to an error page**
The Callback URI, JavaScript origin and Logout URI in Shopify must match your running URL exactly (see [Shopify Setup](#shopify-setup)).

**`/api/...` returns 404 locally**
Plain `npm run dev` does not run serverless functions. Use `vercel dev`.

**Page refresh gives 404 in production**
Your host must rewrite all routes to `index.html`. This is preconfigured in `vercel.json` and `netlify.toml`.

**Large bundle warning during build (~1.2 MB JS)**
Informational only. Code-splitting via route-level `React.lazy` is a recommended future optimisation.

**Clean reinstall**

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Contributing

1. Create a branch: `git checkout -b feature/your-change`
2. Keep changes focused and avoid regressions in existing sections.
3. Run `npm run lint` and `npm run build` before committing.
4. Commit with a clear message and open a pull request.

Guidelines used in this codebase:

- Keep data access inside `src/services/` so Shopify can be swapped in without touching components.
- Reuse existing sections and data-driven templates instead of hard-coding new pages.
- Follow the light, ivory-and-gold design language defined in `tailwind.config.js`.
- For health-adjacent content, use traditional-association wording (e.g. "traditionally associated with…") and make no medical claims.

---

## Disclaimer

Vedic gemstone and Rudraksha recommendations are based on traditional astrological principles and are **not** presented as scientifically or medically proven. Rashi- and planet-based guidance is general; for a personalised recommendation, consult a qualified astrologer. Demo products and certificates included in `src/data/` are for presentation purposes only.

---

© Veda Structure Private Limited. All rights reserved.