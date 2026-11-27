# Hearth & Ledger — a household budget site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/m1651/makefun-best-household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/m1651/makefun-best-household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Hearth & Ledger is a household budget site that runs entirely offline from its own static files, on a desktop and on a phone. No network requests, no accounts, no tracking — open `app/index.html` and it works.

## What it does

- **Dashboard** — income vs spending, savings rate, money left to spend, a six-month income-vs-spending bar chart, a spending-by-category donut, and recent activity.
- **Transactions** — add, edit and delete income and expense entries; filter by category, type and search text; sort by date or amount; export the filtered list as CSV.
- **Budgets** — a monthly limit per category with a live progress bar and the exact over/under amount; change any limit and the bars move.
- **Goals** — savings goals with progress, add money to a goal, start a new goal, remove one.
- **Benchmarks** — real U.S. national averages from the Bureau of Labor Statistics Consumer Expenditure Survey 2024, shown next to this household's month, plus the 50/30/20 rule checked against the real split.

The preloaded household (the Alvarez family, November 2026) is a made-up example, labelled as such on every page. The benchmark figures are real and sourced on the page: U.S. Bureau of Labor Statistics, Consumer Expenditure Survey 2024 (USDL-25-1586, released Dec 19, 2025) — average spending $78,535 a year, housing $26,266, transportation $13,318, food $10,169, healthcare $6,197, entertainment $3,609.

## Run it

Serve `app/` with any static server, or just open `app/index.html` in a browser:

```sh
cd app && python3 -m http.server 8080
```

Changes are kept in the browser's localStorage (optional — the site works the same with storage off). Use "Restore the example" on any page to get the example household back.

## Files

- `app/index.html` — the site shell and navigation
- `app/style.css` — the whole design (system fonts only)
- `app/data.js` — example household data and the BLS benchmark figures
- `app/store.js` — state, persistence, and every derived total
- `app/charts.js` — bar, donut and comparison charts drawn on canvas
- `app/views.js` — the five pages and all their controls
- `app/app.js` — hash routing
- `main.ts` — builds the submission bundle (`app/`, `screenshots/`, `dossier.json`)

## Entry

Built for the [make.fun bounty: Make the best household budget site](https://make.fun/bounty/best-household-budget-site-20261126-1457).

## License

MIT — see [LICENSE](LICENSE).

---

Made for the make.fun bounty — [see the bounty](https://make.fun/bounty/best-household-budget-site-20261126-1457?ref=mee18qb6).
