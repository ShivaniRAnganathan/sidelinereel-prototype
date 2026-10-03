# SidelineReel – roster tagging prototype

Clickable prototype for the "similar jersey numbers" roster tagging fix.
Built with Vite + React + TypeScript + Tailwind v4 + shadcn/ui (preset `bIkeymG`: radix-vega style, neutral theme, lucide icons, Inter).

- `npm install && npm run dev` – local dev
- `npm run build` – single self-contained `dist/index.html` (vite-plugin-singlefile)
- `scripts/smoke.mjs` – headless Playwright smoke test (needs `playwright-core` + Chrome)

Views: Coach review queue, Parent reel, Sunday recap preview. All state is shared (src/store.tsx); demo data in src/data.ts.
