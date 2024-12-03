import { z } from 'zod';
import { moneySchema } from './money.js';
import { daySchema } from './dates.js';
import { idSchema } from './identifiers.js';
export const recurringSchema = z.strictObject({
  name: z.string().trim().min(1).max(100),
  amount: moneySchema,
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  nextDate: daySchema,
  categoryId: idSchema.nullable().default(null),
  active: z.boolean().default(true),
});
