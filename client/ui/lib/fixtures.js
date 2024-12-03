const id = (n) => `10000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
export function fixtures() {
  const now = new Date();
  const month = now.toISOString().slice(0, 7);
  const cats = [
    ['Food & dining', 'amber'],
    ['Shopping', 'violet'],
    ['Transport', 'blue'],
    ['Bills & utilities', 'rose'],
    ['Health', 'green'],
    ['Entertainment', 'slate'],
    ['Income', 'green'],
    ['Other', 'slate'],
  ].map(([name, color], i) => ({ id: id(i + 1), name, color }));
  const rows = [];
  const merchants = [
    'Sunday groceries',
    'Blue Tokai coffee',
    'Metro recharge',
    'Dinner with friends',
    'Monthly internet',
    'Bookshop',
    'Fresh produce',
    'Spotify Premium',
    'Lunch at work',
    'Pharmacy',
  ];
  for (let m = -2; m <= 0; m++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + m, 1));
    const key = d.toISOString().slice(0, 7);
    const end = m === 0 ? now.getUTCDate() : 28;
    rows.push({
      id: id(100 + rows.length),
      date: key + '-01',
      amount: 8500000,
      description: 'Monthly salary',
      kind: 'income',
      categoryId: cats[6].id,
      note: '',
      version: 1,
    });
    for (let day = 1; day <= end; day++) {
      const index = day % merchants.length;
      rows.push({
        id: id(100 + rows.length),
        date: key + '-' + String(day).padStart(2, '0'),
        amount: [245000, 38000, 120000, 185000, 99900, 89000, 164500, 11900, 42000, 65000][index],
        description: merchants[index],
        kind: 'expense',
        categoryId: cats[[0, 0, 2, 0, 3, 1, 0, 5, 0, 4][index]].id,
        note: '',
        version: 1,
      });
    }
  }
  return {
    user: {
      id: id(99),
      name: 'Alex Morgan',
      email: 'alex@example.com',
      preferences: { currency: 'INR', monthlyTarget: 2000000, weekStartsOn: 'monday' },
    },
    categories: cats,
    transactions: rows,
    budgets: cats.slice(0, 6).map((c, i) => ({
      id: id(500 + i),
      categoryId: c.id,
      month,
      amount: [1500000, 800000, 500000, 1200000, 400000, 300000][i],
    })),
    recurring: [
      {
        id: id(601),
        name: 'Spotify Premium',
        amount: 11900,
        frequency: 'monthly',
        nextDate: month + '-28',
        categoryId: cats[5].id,
        active: true,
      },
      {
        id: id(602),
        name: 'Internet',
        amount: 99900,
        frequency: 'monthly',
        nextDate: month + '-28',
        categoryId: cats[3].id,
        active: true,
      },
    ],
  };
}
