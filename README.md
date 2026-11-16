# Tour Pricing Dashboard

A small, working demo of rule-based dynamic pricing for tours and activities: a dashboard that shows occupancy and days to departure for upcoming departures, suggests a price for each one, explains *why*, and lets you try "what if" scenarios.

All data is **synthetic**. It does not come from any operator.

## What it shows

- **Next.js 16 App Router.** The page is a Server Component, so KPIs and the table are computed on the server. Only the simulator is a Client Component (`"use client"`).
- **REST endpoints.** `GET /api/tours` returns the list with suggested prices. `GET /api/quote?basePrice=&occupancy=&days=` returns one quote and validates its input: a missing, blank or non-numeric value, or one out of range, gets a 400 that names the query parameter (for example `days must be a non-negative integer`).
- **A small design system on shadcn/ui** (Base UI primitives + Tailwind CSS 4): `OccupancyBadge`, `PriceDelta`, `KpiCard`, `ToursTable` and `PricingSimulator`, each with an autodocs page in **Storybook 10** and a story for every state (low/normal/high/full, price up/down/same, empty table, service error).
- **Behaviour tests** with Vitest for the pricing rules, their threshold edges and the quote endpoint.

## The pricing rules (`src/lib/pricing.ts`)

| Condition | Adjustment |
|---|---|
| Occupancy 90% or more | +25% |
| Occupancy 70–89% | +15% |
| Occupancy under 30% | −10% |
| Departs within 2 days and under half full | −10% more |
| Always | rounded to whole dollars |

With these rules the price always lands between 80% and 125% of the base price. Every adjustment adds a plain-language reason, so a person can check the suggestion instead of trusting a number. The occupancy thresholds live in one place and the badge uses the same ones, so the label and the price cannot disagree.

The rules are pure functions. The server page imports them directly. The simulator calls the REST endpoint, even though the function could run in the browser, to show a real client-server integration; in Storybook it calls the function directly, with no server.

A departure is **at risk** when it leaves in 7 days or less and is under half full.

## Design decisions

- **Quote function injected into the simulator.** In the app it calls the REST endpoint; in Storybook it calls the pure function directly, without a server. This keeps the component testable and the stories honest.
- **The server page does not fetch its own API.** It imports the same functions the API uses. Calling your own route handler from a Server Component adds a network hop for nothing.
- **Accessibility.** Occupancy level is written as text, not only shown as a colour. The price change has a screen-reader text ("versus base price …"). After the user moves a slider, a short summary ("Suggested price $56, -20% versus base") is announced politely; errors use `role="alert"`, outside that region. Nothing is announced on page load.
- **Mobile first for the key number.** Under the `sm` breakpoint the departures table becomes a list of cards, so the suggested price is always visible instead of hidden in a horizontally scrolling table.
- **The % shown comes from the rule, not from the rounded price.** $25 × 1.25 = $31.25 is shown as $31, which would read as +24% next to a reason that says +25%. The badge shows the rule's factor so the number and its reason agree.
- **Requests are cancelled.** When you move a slider fast, the previous request is aborted, so an old answer cannot overwrite a newer one.

## Suggestions from tools and AI that were not accepted

The rule here is that an AI or tool suggestion is a proposal, not a decision. These came up while building this:

- **`npm install --force`** to get past a peer-dependency conflict between Vitest 5 and `@types/node@20`. Instead, `@types/node` was raised to 22, which matches the Node 22 runtime.
- **`npm audit fix --force`** would have downgraded the shadcn CLI to 1.0 to remove a moderate `deepmerge` advisory. It was not applied. The remaining advisories are low or moderate and come from development tooling.
- **`"vite": "latest"`**, added by the Storybook installer. It was pinned to `8.3.8` so builds are reproducible.
- **Storybook's browser-testing add-on**, which would have pulled in Playwright. Only the docs add-on was installed; the logic is covered by Vitest.

## Run it

```bash
npm install
npm run dev              # http://localhost:3000
npm test                 # Vitest
npm run storybook        # http://localhost:6006
npm run typecheck && npm run lint && npm run build
```

## How it was built

Andrés Corredor defined the brief: a dashboard in the domain of tours and activities, to practise Next.js App Router, shadcn/ui and Storybook. The code was written with AI-assisted development (Claude Code), and each step was checked with typecheck, lint, tests, a production build and a smoke test of the running server. A Figma file for the components, made by Andrés with AI-assisted design, will be linked here when it exists.

Not covered yet: GraphQL, real data, authentication, and visual or browser tests.

Note on `cn`: shadcn now imports `cn` from the `cn` package, published by the shadcn maintainer (`github.com/shadcn-ui/cn`), instead of `clsx` + `tailwind-merge`. `src/lib/utils.ts` re-exports it.
