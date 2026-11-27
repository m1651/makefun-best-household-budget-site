// Example data for Hearth & Ledger.
// The Alvarez household is a made-up example family used to show the site
// working. Every figure below is labelled "example" on the page. The
// benchmark figures in BENCHMARKS are real: U.S. Bureau of Labor Statistics,
// Consumer Expenditure Survey, 2024 (news release USDL-25-1586, Dec 2025).

const CATEGORIES = [
  { id: 'housing', name: 'Housing', color: '#2e6b4f', icon: '⌂' },
  { id: 'groceries', name: 'Groceries', color: '#7a9e3f', icon: '◍' },
  { id: 'eating-out', name: 'Eating out', color: '#c98a2e', icon: '✦' },
  { id: 'transport', name: 'Transport', color: '#3f6d8e', icon: '➤' },
  { id: 'health', name: 'Health', color: '#a34d6e', icon: '+' },
  { id: 'entertainment', name: 'Entertainment', color: '#7b5ea7', icon: '♪' },
  { id: 'clothing', name: 'Clothing', color: '#4d7c8a', icon: '✂' },
  { id: 'household', name: 'Household', color: '#8a6d4b', icon: '▣' },
  { id: 'kids', name: 'Kids & childcare', color: '#b0583a', icon: '♥' },
  { id: 'gifts', name: 'Gifts & giving', color: '#5a7d5a', icon: '❋' },
  { id: 'personal', name: 'Personal care', color: '#9678a8', icon: '✿' },
  { id: 'income', name: 'Income', color: '#2e6b4f', icon: '$' },
];

const EXAMPLE_MONTH = { year: 2026, month: 11, label: 'November 2026' };

const EXAMPLE_TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', kind: 'expense', category: 'housing', note: 'Monthly rent', amount: 1850.00 },
  { id: 't02', date: '2026-11-01', kind: 'income', category: 'income', note: 'Maya — salary', amount: 4600.00 },
  { id: 't03', date: '2026-11-02', kind: 'expense', category: 'groceries', note: 'Green Market weekly shop', amount: 142.30 },
  { id: 't04', date: '2026-11-03', kind: 'expense', category: 'transport', note: 'Fuel — Route 9 station', amount: 52.40 },
  { id: 't05', date: '2026-11-04', kind: 'expense', category: 'eating-out', note: 'Lunch with Sam', amount: 38.50 },
  { id: 't06', date: '2026-11-05', kind: 'expense', category: 'kids', note: 'After-school club — November', amount: 420.00 },
  { id: 't07', date: '2026-11-06', kind: 'expense', category: 'housing', note: 'Electricity bill', amount: 96.20 },
  { id: 't08', date: '2026-11-07', kind: 'expense', category: 'entertainment', note: 'Streaming subscription', amount: 17.99 },
  { id: 't09', date: '2026-11-08', kind: 'expense', category: 'groceries', note: 'Corner grocer top-up', amount: 96.75 },
  { id: 't10', date: '2026-11-09', kind: 'expense', category: 'transport', note: 'Car payment', amount: 310.00 },
  { id: 't11', date: '2026-11-10', kind: 'expense', category: 'health', note: 'Pharmacy — cold medicine', amount: 36.10 },
  { id: 't12', date: '2026-11-11', kind: 'expense', category: 'clothing', note: 'Winter coat for Leo', amount: 64.00 },
  { id: 't13', date: '2026-11-12', kind: 'expense', category: 'groceries', note: 'Green Market weekly shop', amount: 168.40 },
  { id: 't14', date: '2026-11-13', kind: 'expense', category: 'eating-out', note: 'Pizza night', amount: 52.00 },
  { id: 't15', date: '2026-11-14', kind: 'expense', category: 'household', note: 'Cleaning supplies', amount: 38.20 },
  { id: 't16', date: '2026-11-15', kind: 'income', category: 'income', note: 'Sam — part-time pay', amount: 1250.00 },
  { id: 't17', date: '2026-11-16', kind: 'expense', category: 'transport', note: 'Monthly bus pass', amount: 72.00 },
  { id: 't18', date: '2026-11-17', kind: 'expense', category: 'health', note: 'Dentist check-up', amount: 85.00 },
  { id: 't19', date: '2026-11-18', kind: 'expense', category: 'groceries', note: 'Green Market weekly shop', amount: 121.60 },
  { id: 't20', date: '2026-11-19', kind: 'expense', category: 'entertainment', note: 'Cinema — family film', amount: 34.00 },
  { id: 't21', date: '2026-11-20', kind: 'expense', category: 'kids', note: 'School lunches', amount: 60.00 },
  { id: 't22', date: '2026-11-21', kind: 'expense', category: 'housing', note: 'Water bill', amount: 48.10 },
  { id: 't23', date: '2026-11-22', kind: 'expense', category: 'transport', note: 'Car insurance', amount: 118.00 },
  { id: 't24', date: '2026-11-23', kind: 'expense', category: 'groceries', note: 'Thanksgiving shop', amount: 154.55 },
  { id: 't25', date: '2026-11-24', kind: 'expense', category: 'gifts', note: 'Birthday gift for Aunt Rosa', amount: 50.00 },
  { id: 't26', date: '2026-11-25', kind: 'expense', category: 'eating-out', note: 'Takeaway — busy evening', amount: 27.40 },
  { id: 't27', date: '2026-11-26', kind: 'expense', category: 'health', note: 'Gym membership', amount: 45.00 },
  { id: 't28', date: '2026-11-27', kind: 'expense', category: 'clothing', note: 'School shoes', amount: 41.00 },
  { id: 't29', date: '2026-11-28', kind: 'expense', category: 'household', note: 'Light bulbs & batteries', amount: 57.30 },
  { id: 't30', date: '2026-11-29', kind: 'expense', category: 'personal', note: 'Haircut', amount: 33.00 },
  { id: 't31', date: '2026-11-30', kind: 'income', category: 'income', note: 'Freelance design work', amount: 320.00 },
  { id: 't32', date: '2026-11-30', kind: 'expense', category: 'eating-out', note: 'Sunday brunch', amount: 43.20 },
  { id: 't33', date: '2026-11-30', kind: 'expense', category: 'housing', note: 'Internet bill', amount: 65.00 },
  { id: 't34', date: '2026-11-30', kind: 'expense', category: 'entertainment', note: 'Bookshop — two paperbacks', amount: 22.50 },
  { id: 't35', date: '2026-11-30', kind: 'expense', category: 'kids', note: 'New trainers for Leo', amount: 78.00 },
];

// Monthly category budgets for the example month, in dollars.
const EXAMPLE_BUDGETS = {
  housing: 2150, groceries: 650, 'eating-out': 150, transport: 640, health: 220,
  entertainment: 120, clothing: 150, household: 140, kids: 620, gifts: 80, personal: 60,
};

// Six months of totals so the trend chart has something real to show.
const EXAMPLE_TREND = [
  { label: 'Jun', income: 6170, spending: 4210 },
  { label: 'Jul', income: 6170, spending: 4480 },
  { label: 'Aug', income: 6320, spending: 4150 },
  { label: 'Sep', income: 6170, spending: 4620 },
  { label: 'Oct', income: 6170, spending: 4390 },
  { label: 'Nov', income: 6170, spending: 4538 },
];

const EXAMPLE_GOALS = [
  { id: 'g1', name: 'Emergency fund', target: 9000, saved: 6400, note: 'Three months of essential bills, kept in a separate savings account.' },
  { id: 'g2', name: 'Family holiday in July', target: 1800, saved: 950, note: 'A week by the coast — train tickets, a cottage and food money.' },
  { id: 'g3', name: 'New car down payment', target: 5000, saved: 1250, note: 'Trading in the old hatchback next spring.' },
];

// Real national averages. Source: U.S. Bureau of Labor Statistics,
// Consumer Expenditure Survey 2024, news release USDL-25-1586 (Dec 19, 2025).
// Annual figures are the BLS published means; monthly figures are annual / 12.
const BENCHMARKS = {
  source: 'U.S. Bureau of Labor Statistics, Consumer Expenditure Survey 2024 (USDL-25-1586, released Dec 19, 2025)',
  totalAnnual: 78535,
  incomeBeforeTaxAnnual: 104207,
  rows: [
    { name: 'Housing', annual: 26266, share: 33.4 },
    { name: 'Transportation', annual: 13318, share: 17.0 },
    { name: 'Food', annual: 10169, share: 12.9 },
    { name: 'Personal insurance & pensions', annual: 9797, share: 12.5 },
    { name: 'Healthcare', annual: 6197, share: 7.9 },
    { name: 'Entertainment', annual: 3609, share: 4.6 },
    { name: 'Apparel & services', annual: 2001, share: 2.5 },
    { name: 'Food at home', annual: 6224, share: null },
    { name: 'Food away from home', annual: 3945, share: null },
    { name: 'Gasoline', annual: 2411, share: null },
  ],
};

// How this household's November spending maps onto the BLS categories,
// so the comparison chart compares like with like.
const BENCHMARK_MAP = [
  { name: 'Housing', ours: ['housing'] },
  { name: 'Food', ours: ['groceries', 'eating-out'] },
  { name: 'Transportation', ours: ['transport'] },
  { name: 'Healthcare', ours: ['health'] },
  { name: 'Entertainment', ours: ['entertainment'] },
  { name: 'Apparel & services', ours: ['clothing'] },
];
