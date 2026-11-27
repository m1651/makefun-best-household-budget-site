// State for Hearth & Ledger: holds the household's transactions, budgets and
// goals, derives every total from them, and keeps changes in localStorage
// (optional — the site works the same with storage off).

const STORE_KEY = 'hearth-ledger-v1';

function freshState() {
  return {
    month: { ...EXAMPLE_MONTH },
    transactions: EXAMPLE_TRANSACTIONS.map((t) => ({ ...t })),
    budgets: { ...EXAMPLE_BUDGETS },
    goals: EXAMPLE_GOALS.map((g) => ({ ...g })),
    trend: EXAMPLE_TREND.map((m) => ({ ...m })),
  };
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return freshState();
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved.transactions) || !saved.budgets || !Array.isArray(saved.goals)) return freshState();
    return saved;
  } catch {
    return freshState();
  }
}

let state = loadState();
let storageOn = true;

function saveState() {
  if (!storageOn) return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    storageOn = false; // private mode or full storage: keep working in memory
  }
}

function resetExample() {
  state = freshState();
  saveState();
}

// ---- Derived figures: every number on the page comes from these. ----

function monthIncome() {
  return state.transactions
    .filter((t) => t.kind === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

function monthSpending() {
  return state.transactions
    .filter((t) => t.kind === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

function monthSaved() {
  return monthIncome() - monthSpending();
}

function savingsRate() {
  const income = monthIncome();
  return income > 0 ? (monthSaved() / income) * 100 : 0;
}

function spentByCategory(categoryId) {
  return state.transactions
    .filter((t) => t.kind === 'expense' && t.category === categoryId)
    .reduce((sum, t) => sum + t.amount, 0);
}

function categoryBreakdown() {
  return CATEGORIES.filter((c) => c.id !== 'income')
    .map((c) => ({ ...c, spent: spentByCategory(c.id), limit: state.budgets[c.id] || 0 }))
    .filter((c) => c.spent > 0 || c.limit > 0)
    .sort((a, b) => b.spent - a.spent);
}

function totalBudget() {
  return Object.values(state.budgets).reduce((sum, v) => sum + v, 0);
}

function money(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function money0(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function pct(n) {
  return (Math.round(n * 10) / 10).toFixed(1) + '%';
}

function niceDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function categoryName(id) {
  const c = CATEGORIES.find((x) => x.id === id);
  return c ? c.name : id;
}

function categoryColor(id) {
  const c = CATEGORIES.find((x) => x.id === id);
  return c ? c.color : '#666';
}
