// Views for Hearth & Ledger: each route renders its section into #view.
// Every control here is wired to the store, so totals, bars and charts move
// the moment an entry changes.

const viewRoot = document.getElementById('view');

function esc(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function setActiveNav(route) {
  document.querySelectorAll('.nav-link').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
  });
}

function exampleNote() {
  return '<p class="example-note">Example household: the Alvarez family (two adults, one child). ' +
    'All figures are a made-up November 2026 example so you can see the site working — ' +
    'add, edit or delete anything and the totals update. ' +
    '<button class="link-btn" id="reset-example" type="button">Restore the example</button></p>';
}

// ---------------- Dashboard ----------------

function renderDashboard() {
  setActiveNav('dashboard');
  const income = monthIncome();
  const spending = monthSpending();
  const saved = monthSaved();
  const rate = savingsRate();
  const breakdown = categoryBreakdown();
  const top = breakdown.slice(0, 5);
  const recent = [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);

  viewRoot.innerHTML =
    '<section class="page-head"><h1>November at a glance</h1>' +
    '<p class="lede">Income, spending and savings for the Alvarez household — ' +
    'everything below is live, from the entries on the Transactions page.</p></section>' +
    exampleNote() +
    '<section class="cards">' +
    '<article class="card"><h2>Income</h2><p class="big">' + money(income) + '</p>' +
    '<p class="muted">3 paydays in November</p></article>' +
    '<article class="card"><h2>Spending</h2><p class="big">' + money(spending) + '</p>' +
    '<p class="muted">of a ' + money(totalBudget()) + ' monthly plan</p></article>' +
    '<article class="card"><h2>Saved</h2><p class="big">' + money(saved) + '</p>' +
    '<p class="muted">savings rate ' + pct(rate) + '</p></article>' +
    '<article class="card"><h2>Left to spend</h2><p class="big">' + money(totalBudget() - spending) + '</p>' +
    '<p class="muted">' + (spending <= totalBudget() ? 'inside the plan so far' : 'over the plan — see Budgets') + '</p></article>' +
    '</section>' +
    '<section class="split">' +
    '<article class="panel"><h2>Income vs spending, Jun – Nov</h2>' +
    '<canvas id="trend-chart" aria-label="Bar chart of monthly income and spending, June to November"></canvas>' +
    '<p class="legend"><span class="swatch inc"></span> Income <span class="swatch spend"></span> Spending</p>' +
    '<p class="muted">November income was steady while spending ran ' + money(spending - state.trend[4].spending) +
    ' higher than October.</p></article>' +
    '<article class="panel"><h2>Where November went</h2>' +
    '<canvas id="donut-chart" aria-label="Donut chart of spending by category"></canvas>' +
    '<ul class="key-list">' + top.map((c) =>
      '<li><span class="dot" style="background:' + c.color + '"></span>' + esc(c.name) +
      ' <strong>' + money(c.spent) + '</strong></li>').join('') + '</ul>' +
    '<p><a href="#/budgets">See every category budget →</a></p></article>' +
    '</section>' +
    '<section class="panel"><h2>Recent activity</h2>' +
    '<ul class="activity">' + recent.map((t) =>
      '<li><span class="act-date">' + niceDate(t.date) + '</span>' +
      '<span class="act-note">' + esc(t.note) + ' <em>· ' + esc(categoryName(t.category)) + '</em></span>' +
      '<span class="act-amount ' + t.kind + '">' + (t.kind === 'income' ? '+' : '−') + money(t.amount) + '</span></li>').join('') +
    '</ul><p><a href="#/transactions">All ' + state.transactions.length + ' transactions →</a></p></section>' +
    '<section class="panel tip"><h2>How the month is going</h2>' +
    '<p>Groceries ran ' + money(spentByCategory('groceries') - state.budgets.groceries) +
    ' over its ' + money(state.budgets.groceries) + ' budget, and eating out ' +
    money(spentByCategory('eating-out') - state.budgets['eating-out']) + ' over. ' +
    'Housing, transport and health are all inside their budgets, which is why the month still ends ' +
    money(saved) + ' ahead. Two small overruns are normal — the fix is to move money between ' +
    'categories on the <a href="#/budgets">Budgets</a> page, not to pretend they did not happen.</p></section>';

  drawBarChart(document.getElementById('trend-chart'), state.trend);
  drawDonut(document.getElementById('donut-chart'), breakdown);
  wireReset();
}

function wireReset() {
  const btn = document.getElementById('reset-example');
  if (btn) btn.addEventListener('click', () => { resetExample(); render(); });
}

// ---------------- Transactions ----------------

let txFilter = { category: 'all', kind: 'all', query: '', sort: 'date-desc' };
let editingId = null;

function renderTransactions() {
  setActiveNav('transactions');
  const cats = CATEGORIES.filter((c) => c.id !== 'income');
  let list = [...state.transactions];
  if (txFilter.category !== 'all') list = list.filter((t) => t.category === txFilter.category);
  if (txFilter.kind !== 'all') list = list.filter((t) => t.kind === txFilter.kind);
  if (txFilter.query) {
    const q = txFilter.query.toLowerCase();
    list = list.filter((t) => t.note.toLowerCase().includes(q));
  }
  list.sort((a, b) => {
    if (txFilter.sort === 'amount-desc') return b.amount - a.amount;
    if (txFilter.sort === 'amount-asc') return a.amount - b.amount;
    if (txFilter.sort === 'date-asc') return a.date < b.date ? -1 : 1;
    return a.date < b.date ? 1 : -1;
  });
  const shownIncome = list.filter((t) => t.kind === 'income').reduce((s, t) => s + t.amount, 0);
  const shownSpending = list.filter((t) => t.kind === 'expense').reduce((s, t) => s + t.amount, 0);

  viewRoot.innerHTML =
    '<section class="page-head"><h1>Transactions</h1>' +
    '<p class="lede">Every dollar in and out in November. Add a new entry, fix a mistake, ' +
    'or delete one — the dashboard, budgets and charts update at once.</p></section>' +
    exampleNote() +
    '<section class="panel"><h2>' + (editingId ? 'Edit entry' : 'Add an entry') + '</h2>' +
    '<form id="tx-form" class="form-grid">' +
    '<label>Date<input type="date" id="tx-date" value="2026-11-28" required></label>' +
    '<label>Type<select id="tx-kind"><option value="expense">Expense</option><option value="income">Income</option></select></label>' +
    '<label>Category<select id="tx-category">' +
    CATEGORIES.map((c) => '<option value="' + c.id + '">' + esc(c.name) + '</option>').join('') +
    '</select></label>' +
    '<label>What was it?<input type="text" id="tx-note" maxlength="80" placeholder="e.g. Weekly shop" required></label>' +
    '<label>Amount ($)<input type="number" id="tx-amount" min="0.01" step="0.01" placeholder="0.00" required></label>' +
    '<div class="form-actions"><button class="btn" type="submit">' + (editingId ? 'Save changes' : 'Add entry') + '</button>' +
    (editingId ? '<button class="btn ghost" type="button" id="tx-cancel">Cancel</button>' : '') +
    '</div></form>' +
    '<p class="form-msg" id="tx-msg" role="status"></p></section>' +
    '<section class="panel"><h2>Filter &amp; sort</h2>' +
    '<div class="filters">' +
    '<label>Category <select id="f-category"><option value="all">All categories</option>' +
    cats.map((c) => '<option value="' + c.id + '"' + (txFilter.category === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') +
    '<option value="income"' + (txFilter.category === 'income' ? ' selected' : '') + '>Income</option></select></label>' +
    '<label>Type <select id="f-kind"><option value="all">Income &amp; expenses</option>' +
    '<option value="expense"' + (txFilter.kind === 'expense' ? ' selected' : '') + '>Expenses only</option>' +
    '<option value="income"' + (txFilter.kind === 'income' ? ' selected' : '') + '>Income only</option></select></label>' +
    '<label>Search <input type="search" id="f-query" value="' + esc(txFilter.query) + '" placeholder="Search notes…"></label>' +
    '<label>Sort <select id="f-sort">' +
    '<option value="date-desc"' + (txFilter.sort === 'date-desc' ? ' selected' : '') + '>Newest first</option>' +
    '<option value="date-asc"' + (txFilter.sort === 'date-asc' ? ' selected' : '') + '>Oldest first</option>' +
    '<option value="amount-desc"' + (txFilter.sort === 'amount-desc' ? ' selected' : '') + '>Largest amount</option>' +
    '<option value="amount-asc"' + (txFilter.sort === 'amount-asc' ? ' selected' : '') + '>Smallest amount</option></select></label>' +
    '</div>' +
    '<p class="muted">Showing ' + list.length + ' of ' + state.transactions.length + ' entries · ' +
    'income ' + money(shownIncome) + ' · spending ' + money(shownSpending) + '</p>' +
    '<div class="table-wrap"><table><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead><tbody>' +
    (list.length ? list.map((t) =>
      '<tr><td>' + niceDate(t.date) + '</td><td>' + esc(t.note) + '</td><td>' + esc(categoryName(t.category)) + '</td>' +
      '<td class="num ' + t.kind + '">' + (t.kind === 'income' ? '+' : '−') + money(t.amount) + '</td>' +
      '<td class="row-actions"><button class="link-btn" type="button" data-edit="' + t.id + '">Edit</button> ' +
      '<button class="link-btn danger" type="button" data-del="' + t.id + '">Delete</button></td></tr>').join('')
      : '<tr><td colspan="5">No entries match these filters. Try clearing the search or choosing another category.</td></tr>') +
    '</tbody></table></div>' +
    '<p><button class="btn ghost" type="button" id="export-csv">Download these entries as CSV</button></p></section>';

  wireReset();
  const form = document.getElementById('tx-form');
  if (editingId) {
    const t = state.transactions.find((x) => x.id === editingId);
    if (t) {
      document.getElementById('tx-date').value = t.date;
      document.getElementById('tx-kind').value = t.kind;
      document.getElementById('tx-category').value = t.category;
      document.getElementById('tx-note').value = t.note;
      document.getElementById('tx-amount').value = t.amount.toFixed(2);
      document.getElementById('tx-cancel').addEventListener('click', () => { editingId = null; renderTransactions(); });
    }
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(document.getElementById('tx-amount').value);
    const note = document.getElementById('tx-note').value.trim();
    const date = document.getElementById('tx-date').value;
    if (!note || !date || !(amount > 0)) {
      document.getElementById('tx-msg').textContent = 'Please fill in a date, a description and an amount over $0.';
      return;
    }
    const entry = {
      id: editingId || ('t' + Date.now().toString(36)),
      date,
      kind: document.getElementById('tx-kind').value,
      category: document.getElementById('tx-category').value,
      note,
      amount: Math.round(amount * 100) / 100,
    };
    if (editingId) {
      const i = state.transactions.findIndex((x) => x.id === editingId);
      if (i >= 0) state.transactions[i] = entry;
      editingId = null;
    } else {
      state.transactions.push(entry);
    }
    saveState();
    renderTransactions();
    document.getElementById('tx-msg').textContent = 'Saved. Totals, budgets and charts are updated.';
  });
  document.getElementById('f-category').addEventListener('change', (e) => { txFilter.category = e.target.value; renderTransactions(); });
  document.getElementById('f-kind').addEventListener('change', (e) => { txFilter.kind = e.target.value; renderTransactions(); });
  document.getElementById('f-query').addEventListener('input', (e) => { txFilter.query = e.target.value; renderTransactions(); });
  document.getElementById('f-sort').addEventListener('change', (e) => { txFilter.sort = e.target.value; renderTransactions(); });
  viewRoot.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => {
    editingId = b.dataset.edit;
    renderTransactions();
    document.getElementById('tx-form').scrollIntoView({ behavior: 'smooth' });
  }));
  viewRoot.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
    const t = state.transactions.find((x) => x.id === b.dataset.del);
    if (t && window.confirm('Delete "' + t.note + '" (' + money(t.amount) + ')?')) {
      state.transactions = state.transactions.filter((x) => x.id !== t.id);
      saveState();
      renderTransactions();
    }
  }));
  document.getElementById('export-csv').addEventListener('click', () => {
    const rows = [['Date', 'Type', 'Category', 'Note', 'Amount']].concat(
      list.map((t) => [t.date, t.kind, categoryName(t.category), '"' + t.note.replace(/"/g, '""') + '"', t.amount.toFixed(2)]));
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hearth-ledger-november-2026.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

// ---------------- Budgets ----------------

function renderBudgets() {
  setActiveNav('budgets');
  const breakdown = categoryBreakdown();
  const spent = monthSpending();
  const planned = totalBudget();
  viewRoot.innerHTML =
    '<section class="page-head"><h1>Category budgets</h1>' +
    '<p class="lede">A plan for every category, set at the start of the month. ' +
    'Change a limit and the bars move; spend past one and it shows red with the exact overage.</p></section>' +
    exampleNote() +
    '<section class="cards">' +
    '<article class="card"><h2>Planned</h2><p class="big">' + money(planned) + '</p><p class="muted">across ' + breakdown.length + ' categories</p></article>' +
    '<article class="card"><h2>Spent</h2><p class="big">' + money(spent) + '</p><p class="muted">' + pct((spent / planned) * 100) + ' of the plan used</p></article>' +
    '<article class="card"><h2>Remaining</h2><p class="big">' + money(planned - spent) + '</p><p class="muted">' + (planned - spent >= 0 ? 'still inside the plan' : 'over the plan overall') + '</p></article>' +
    '</section>' +
    '<section class="panel"><h2>November budgets</h2>' +
    '<div class="budget-list">' + breakdown.map((c) => {
      const over = c.spent - c.limit;
      const fill = c.limit > 0 ? Math.min(100, (c.spent / c.limit) * 100) : 0;
      return '<article class="budget-row">' +
        '<div class="budget-top"><span class="budget-name"><span class="dot" style="background:' + c.color + '"></span>' + esc(c.name) + '</span>' +
        '<span class="budget-nums">' + money(c.spent) + ' of ' + money(c.limit) + '</span></div>' +
        '<div class="bar" role="img" aria-label="' + esc(c.name) + ': ' + money(c.spent) + ' spent of ' + money(c.limit) + ' budget">' +
        '<span class="bar-fill' + (over > 0 ? ' over' : '') + '" style="width:' + fill.toFixed(1) + '%"></span></div>' +
        '<div class="budget-foot"><span class="' + (over > 0 ? 'over-text' : 'under-text') + '">' +
        (over > 0 ? money(over) + ' over budget' : money(-over) + ' left') + '</span>' +
        '<label>Monthly limit $<input type="number" min="0" value="' + c.limit + '" data-limit="' + c.id + '" aria-label="Monthly limit for ' + esc(c.name) + '"></label></div>' +
        '</article>';
    }).join('') + '</div>' +
    '<p class="muted">Tip: when one category runs over, raise its limit only by lowering another — ' +
    'otherwise the plan quietly grows. Groceries and eating out are over this month; housing, transport and kids still have room.</p></section>';

  wireReset();
  viewRoot.querySelectorAll('[data-limit]').forEach((input) => input.addEventListener('change', () => {
    const v = Number(input.value);
    if (Number.isFinite(v) && v >= 0) {
      state.budgets[input.dataset.limit] = Math.round(v);
      saveState();
      renderBudgets();
    }
  }));
}

// ---------------- Goals ----------------

function renderGoals() {
  setActiveNav('goals');
  const savedTotal = state.goals.reduce((s, g) => s + g.saved, 0);
  const targetTotal = state.goals.reduce((s, g) => s + g.target, 0);
  viewRoot.innerHTML =
    '<section class="page-head"><h1>Savings goals</h1>' +
    '<p class="lede">Money with a job to do. Each goal shows what is saved, what is left, ' +
    'and how far along it is — add to one whenever the month ends ahead.</p></section>' +
    exampleNote() +
    '<section class="cards">' +
    '<article class="card"><h2>Saved toward goals</h2><p class="big">' + money(savedTotal) + '</p><p class="muted">across ' + state.goals.length + ' goals</p></article>' +
    '<article class="card"><h2>Goals total</h2><p class="big">' + money(targetTotal) + '</p><p class="muted">' + pct((savedTotal / targetTotal) * 100) + ' funded overall</p></article>' +
    '<article class="card"><h2>This month saved</h2><p class="big">' + money(monthSaved()) + '</p><p class="muted">available to assign to a goal</p></article>' +
    '</section>' +
    '<section class="panel"><h2>Start a goal</h2>' +
    '<form id="goal-form" class="form-grid">' +
    '<label>Goal name<input type="text" id="goal-name" maxlength="60" placeholder="e.g. New washing machine" required></label>' +
    '<label>Target amount ($)<input type="number" id="goal-target" min="1" placeholder="1000" required></label>' +
    '<label>Already saved ($)<input type="number" id="goal-saved" min="0" value="0"></label>' +
    '<label>Why it matters<input type="text" id="goal-note" maxlength="120" placeholder="A sentence about this goal"></label>' +
    '<div class="form-actions"><button class="btn" type="submit">Add goal</button></div></form>' +
    '<p class="form-msg" id="goal-msg" role="status"></p></section>' +
    '<section class="goal-list">' + state.goals.map((g) => {
      const done = Math.min(100, (g.saved / g.target) * 100);
      return '<article class="panel goal-card"><h2>' + esc(g.name) + '</h2>' +
        '<p class="muted">' + esc(g.note || '') + '</p>' +
        '<div class="bar"><span class="bar-fill goal" style="width:' + done.toFixed(1) + '%"></span></div>' +
        '<p><strong>' + money(g.saved) + '</strong> of ' + money(g.target) + ' · ' + pct(done) + ' · ' +
        money(g.target - g.saved) + ' to go</p>' +
        '<form class="add-money" data-goal="' + g.id + '">' +
        '<label>Add $<input type="number" min="1" placeholder="50" required></label>' +
        '<button class="btn" type="submit">Add to goal</button>' +
        '<button class="link-btn danger" type="button" data-del-goal="' + g.id + '">Remove goal</button></form>' +
        '</article>';
    }).join('') + '</section>';

  wireReset();
  document.getElementById('goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('goal-name').value.trim();
    const target = Number(document.getElementById('goal-target').value);
    const saved = Number(document.getElementById('goal-saved').value) || 0;
    if (!name || !(target > 0) || saved < 0 || saved > target * 10) {
      document.getElementById('goal-msg').textContent = 'Give the goal a name and a target over $0.';
      return;
    }
    state.goals.push({
      id: 'g' + Date.now().toString(36),
      name, target: Math.round(target), saved: Math.round(saved),
      note: document.getElementById('goal-note').value.trim(),
    });
    saveState();
    renderGoals();
  });
  viewRoot.querySelectorAll('.add-money').forEach((form) => form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(form.querySelector('input').value);
    const g = state.goals.find((x) => x.id === form.dataset.goal);
    if (g && amount > 0) {
      g.saved = Math.round((g.saved + amount) * 100) / 100;
      saveState();
      renderGoals();
    }
  }));
  viewRoot.querySelectorAll('[data-del-goal]').forEach((b) => b.addEventListener('click', () => {
    const g = state.goals.find((x) => x.id === b.dataset.delGoal);
    if (g && window.confirm('Remove the goal "' + g.name + '"?')) {
      state.goals = state.goals.filter((x) => x.id !== g.id);
      saveState();
      renderGoals();
    }
  }));
}

// ---------------- Benchmarks ----------------

function renderBenchmarks() {
  setActiveNav('benchmarks');
  const income = monthIncome();
  const spending = monthSpending();
  const needs = ['housing', 'groceries', 'transport', 'health', 'kids', 'household', 'personal']
    .reduce((s, id) => s + spentByCategory(id), 0);
  const wants = ['eating-out', 'entertainment', 'clothing', 'gifts']
    .reduce((s, id) => s + spentByCategory(id), 0);
  const rows = BENCHMARK_MAP.map((m) => {
    const ours = m.ours.reduce((s, id) => s + spentByCategory(id), 0);
    const bls = BENCHMARKS.rows.find((r) => r.name === m.name);
    return { name: m.name, ours, average: bls ? bls.annual / 12 : 0 };
  });

  viewRoot.innerHTML =
    '<section class="page-head"><h1>How we compare</h1>' +
    '<p class="lede">Real national averages from the U.S. Bureau of Labor Statistics, ' +
    'next to this household’s November — and the 50/30/20 rule of thumb, checked against the real split.</p></section>' +
    '<section class="panel"><h2>U.S. average household spending, 2024</h2>' +
    '<p class="muted">Source: ' + esc(BENCHMARKS.source) + '. Annual averages for all consumer units; ' +
    'monthly figures are the annual average divided by 12. Total average spending was ' +
    money0(BENCHMARKS.totalAnnual) + ' a year (' + money0(BENCHMARKS.totalAnnual / 12) + ' a month) ' +
    'on average income before taxes of ' + money0(BENCHMARKS.incomeBeforeTaxAnnual) + ' a year.</p>' +
    '<div class="table-wrap"><table><thead><tr><th>Category</th><th class="num">Per year</th><th class="num">Per month</th><th class="num">Share</th></tr></thead><tbody>' +
    BENCHMARKS.rows.filter((r) => r.share !== null).map((r) =>
      '<tr><td>' + esc(r.name) + '</td><td class="num">' + money0(r.annual) + '</td><td class="num">' + money0(r.annual / 12) + '</td><td class="num">' + r.share.toFixed(1) + '%</td></tr>').join('') +
    '</tbody></table></div>' +
    '<p class="muted">Housing is a third of the average budget; housing, transport and food together are over 60 cents of every dollar.</p></section>' +
    '<section class="panel"><h2>This household vs the national average (per month)</h2>' +
    '<p class="legend"><span class="swatch ours"></span> Alvarez household, Nov 2026 <span class="swatch avg"></span> U.S. average, 2024</p>' +
    '<div id="compare-bars"></div>' +
    '<p class="muted">The Alvarez household spends less than the national average in every category shown — ' +
    'most of all on transport (' + money0(rows[2].average - rows[2].ours) + ' less a month, one car and a bus pass instead of two cars) ' +
    'and entertainment. Food is almost exactly average.</p></section>' +
    '<section class="panel"><h2>The 50/30/20 rule, checked</h2>' +
    '<p>The common rule of thumb says: about 50% of take-home pay on needs, 30% on wants, 20% on saving. ' +
    'Here is November, honestly counted:</p>' +
    '<div class="rule-rows">' +
    '<div class="rule-row"><span>Needs — housing, groceries, transport, health, kids, household</span><strong>' + money(needs) + ' · ' + pct((needs / income) * 100) + '</strong></div>' +
    '<div class="rule-row"><span>Wants — eating out, entertainment, clothing, gifts</span><strong>' + money(wants) + ' · ' + pct((wants / income) * 100) + '</strong></div>' +
    '<div class="rule-row"><span>Saving — what is left over</span><strong>' + money(monthSaved()) + ' · ' + pct(savingsRate()) + '</strong></div>' +
    '</div>' +
    '<p>Needs run high at ' + pct((needs / income) * 100) + ' because rent is the biggest bill and childcare is a need, ' +
    'not a luxury. The household still saves ' + pct(savingsRate()) + ' because wants are kept small — ' +
    'that trade-off, not a perfect 50/30/20 split, is what makes the month work. If your needs are over 50%, ' +
    'look first at the biggest need (usually housing or transport) before cutting small pleasures.</p></section>' +
    '<section class="panel tip"><h2>Five habits that keep this budget working</h2>' +
    '<ol class="habits">' +
    '<li><strong>Pay yourself first.</strong> Move the savings amount to a separate account on payday, before spending starts.</li>' +
    '<li><strong>One weekly shop.</strong> A list, once a week, beats five small trips — this household’s grocery overrun came from top-ups.</li>' +
    '<li><strong>Name every dollar.</strong> A budget with a line for gifts and car repairs has no “surprise” spending.</li>' +
    '<li><strong>Compare, don’t copy.</strong> National averages show where you stand; your rent, city and family size set your own normal.</li>' +
    '<li><strong>Review monthly, not daily.</strong> Fifteen minutes at month-end — this page, the budgets page, one fix — is enough.</li>' +
    '</ol></section>';

  drawCompareBars(document.getElementById('compare-bars'), rows);
  wireReset();
}

// ---------------- Router ----------------

function render() {
  const hash = window.location.hash || '#/';
  const route = hash.replace(/^#\/?/, '').split('/')[0] || 'dashboard';
  if (route === 'transactions') renderTransactions();
  else if (route === 'budgets') renderBudgets();
  else if (route === 'goals') renderGoals();
  else if (route === 'benchmarks') renderBenchmarks();
  else renderDashboard();
  window.scrollTo(0, 0);
}
