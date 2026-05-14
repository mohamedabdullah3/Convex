# CRO Evidence-Based Audit Engine (MVP)

A Next.js MVP that generates evidence-based CRO audits from business context + URL page signals.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env.local
   ```
3. Set key:
   ```
   OPENAI_API_KEY=your_key
   ```
4. Run locally:
   ```bash
   npm run dev
   ```

## Audit flow
1. User fills business context form.
2. API validates input with Zod.
3. Server tries to fetch + extract page signals (title, headings, links, forms, buttons, visible text, image alt).
4. If fetch fails, limitation is passed to the model and shown in UI.
5. OpenAI returns JSON audit.
6. API validates JSON against schema before returning.
7. UI renders report sections with copy/export JSON actions.

## Known limitations
- Single-page fetch only (no full crawl).
- Bot-protected pages may fail fetch.
- No screenshot upload yet (planned).
- Output quality depends on page accessibility and prompt-model behavior.

## Future improvements
- Screenshot-based visual audit
- Lighthouse/PageSpeed integration
- Heatmap integrations
- GA4/GTM data import
- Session recording insights
- Screenshot annotations
- PDF export
- Multi-page crawl
- Competitor comparison
- Industry-specific templates
- Saving audit history
- Client-ready branded reports
- Arabic report generation
- Local compliance checker

## Current MVP defaults
- Simplified input form excludes `trafficSource` and `audienceStage`.
- If `OPENAI_API_KEY` is missing, the API returns a demo audit with a clear notice so UI can still be tested.
