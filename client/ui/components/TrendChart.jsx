import { useId } from 'react';
import { useSession } from '../lib/Session.jsx';
import { money } from '../lib/format.js';
export function TrendChart({ daily, expenses }) {
  const id = useId().replaceAll(':', '');
  const { user } = useSession();
  const max = Math.max(...daily.map((d) => d.cumulative), 100);
  const points = daily.map(
    (d, i) =>
      `${35 + (i / Math.max(1, daily.length - 1)) * 545},${145 - (d.cumulative / max) * 115}`,
  );
  const line = points.join(' ');
  return (
    <section className="card chart-card">
      <div className="card-heading">
        <div>
          <h2>Spending overview</h2>
          <div className="chart-subtitle">The rhythm of your month</div>
        </div>
        <div className="chart-key">
          <span>
            <i className="dot green" />
            Cumulative expenses
          </span>
        </div>
      </div>
      <div className="chart-total">{money(expenses, user.preferences.currency)}</div>
      <p className="chart-subtitle">Total recorded spending</p>
      <svg
        className="chart-svg"
        viewBox="0 0 600 160"
        role="img"
        aria-label={`Cumulative spending chart with ${daily.length} days. Total ${money(expenses, user.preferences.currency)}.`}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8da67c" stopOpacity=".23" />
            <stop offset="100%" stopColor="#8da67c" stopOpacity=".01" />
          </linearGradient>
        </defs>
        {[30, 68, 106, 145].map((y, i) => (
          <g key={y}>
            <line x1="35" x2="580" y1={y} y2={y} stroke="#edf0e8" strokeDasharray="3 4" />
            <text x="0" y={y + 3} fill="#9ba396" fontSize="8">
              {money(Math.round(max * (1 - i / 3)), user.preferences.currency, true)}
            </text>
          </g>
        ))}
        <polygon points={'35,145 ' + line + ' 580,145'} fill={`url(#${id})`} />
        <polyline
          points={line}
          fill="none"
          stroke="#789467"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
      <div className="chart-labels">
        {['01', '07', '14', '21', String(daily.length)].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
    </section>
  );
}
