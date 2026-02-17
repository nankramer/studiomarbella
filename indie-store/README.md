# Studio Marbella Independent Store (MVP)

Independent ecommerce starter built with Next.js (no Shopify dependency).

## Features

- Product catalog
- Client-side cart (localStorage)
- Server-side order validation
- Checkout init endpoints for Ozow and Peach Payments
- Basic security headers in `next.config.ts`

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Security notes

- Do not trust client totals: this code recalculates totals on the server.
- Never expose gateway secrets in frontend code.
- Keep `.env.local` out of git.
- Put Cloudflare in front of the app and enable WAF/rate limits.
- Keep dependencies updated and patch quickly.

## Gateway setup

### Ozow

Set `OZOW_SITE_CODE`, `OZOW_PRIVATE_KEY`, and callback URLs.
Confirm hash algorithm and exact field order against latest Ozow docs before production.

### Peach Payments

Set `PEACH_BASE_URL`, `PEACH_ACCESS_TOKEN`, `PEACH_ENTITY_ID`.
Set `PEACH_HOSTED_CHECKOUT_URL` to your hosted widget page URL if you want direct redirect.

## Production checklist

- Add persistent DB for orders/inventory.
- Add admin auth with MFA.
- Store order events and payment webhooks.
- Add inventory reservation and reconciliation.
- Add observability: structured logs, alerts, uptime checks.
