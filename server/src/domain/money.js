import { z } from 'zod';
export const moneySchema = z.number().int().positive().max(100_000_000_00);
export const currencies = ['INR', 'USD', 'EUR', 'GBP'];
export function toMinor(input) {
  const s = String(input).trim();
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(s))
    throw new Error('Use a positive amount with at most two decimal places.');
  const [whole, fraction = ''] = s.split('.');
  return moneySchema.parse(Number(whole) * 100 + Number(fraction.padEnd(2, '0')));
}
export function sumMoney(values) {
  const result = values.reduce((a, b) => a + b, 0);
  if (!Number.isSafeInteger(result)) throw new Error('Amount exceeds safe integer range');
  return result;
}
