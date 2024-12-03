import { ArrowDownLeft, ArrowUpRight, Wallet, Sprout } from 'lucide-react';
import { useSession } from '../lib/Session.jsx';
import { money } from '../lib/format.js';
export function SummaryCards({ digest }) {
  const { user } = useSession();
  const { summary: s, savings, comparison } = digest;
  const cards = [
    {
      label: 'Net this month',
      value: s.balance,
      Icon: Wallet,
      foot: 'Recorded income minus expenses',
      featured: true,
    },
    { label: 'Total income', value: s.income, Icon: ArrowDownLeft, foot: 'Money coming your way' },
    {
      label: 'Total expenses',
      value: s.expenses,
      Icon: ArrowUpRight,
      foot:
        comparison.percentChange === null
          ? 'Add previous-month entries to compare'
          : `${Math.abs(comparison.percentChange)}% ${comparison.percentChange > 0 ? 'more' : 'less'} than last month`,
    },
    {
      label: 'Savings rate',
      text: savings.rate === null ? '—' : savings.rate + '%',
      Icon: Sprout,
      foot:
        savings.rate === null ? 'Record income to see your rate' : 'A little more for your future',
    },
  ];
  return (
    <div className="summary-grid">
      {cards.map(({ label, value, text, Icon, foot, featured }) => (
        <section className={'card stat ' + (featured ? 'featured' : '')} key={label}>
          <div className="stat-label">
            {label}
            <Icon className="stat-icon" size={15} />
          </div>
          <h2>{text || money(value, user.preferences.currency)}</h2>
          <div className="stat-foot">{foot}</div>
        </section>
      ))}
    </div>
  );
}
