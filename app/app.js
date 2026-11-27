// Hearth & Ledger entry point: hash routing and first paint.
// Routes: #/ dashboard, #/transactions, #/budgets, #/goals, #/benchmarks.

window.addEventListener('hashchange', render);
window.addEventListener('resize', () => {
  // Redraw the canvas charts at the new width so they stay crisp.
  const trend = document.getElementById('trend-chart');
  if (trend) drawBarChart(trend, state.trend);
  const donut = document.getElementById('donut-chart');
  if (donut) drawDonut(donut, categoryBreakdown());
});

render();
