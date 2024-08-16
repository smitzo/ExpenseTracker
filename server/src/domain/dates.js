import { z } from 'zod';
export const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s => { const d = new Date(s + 'T00:00:00Z'); return !Number.isNaN(+d) && d.toISOString().slice(0, 10) === s && s >= '2000-01-01' && s <= '2100-12-31'; }, 'Use a valid calendar date between 2000 and 2100');
export const monthSchema = z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/);
export const today = () => new Date().toISOString().slice(0, 10);
export const monthOf = day => day.slice(0, 7);
export function monthDays(month) { return new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5)), 0)).getUTCDate(); }
export function shiftMonth(month, delta) { const d = new Date(month + '-01T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + delta); return d.toISOString().slice(0, 7); }
export function nextDue(day, frequency) {
  const d = new Date(day + 'T00:00:00Z');
  if (frequency === 'weekly') d.setUTCDate(d.getUTCDate() + 7);
  else { const original = d.getUTCDate(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + (frequency === 'yearly' ? 12 : 1)); d.setUTCDate(Math.min(original, monthDays(d.toISOString().slice(0, 7)))); }
  return d.toISOString().slice(0, 10);
}
