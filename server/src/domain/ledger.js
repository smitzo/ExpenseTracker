import { z } from 'zod';
import { moneySchema } from './money.js';
import { daySchema } from './dates.js';
import { idSchema } from './identifiers.js';
export const transactionSchema = z.strictObject({
  amount: moneySchema,
  description: z.string().trim().min(1).max(160),
  date: daySchema,
  kind: z.enum(['expense', 'income']),
  categoryId: idSchema.nullable().default(null),
  note: z.string().trim().max(1000).default(''),
});
export const transactionPatch = transactionSchema
  .partial()
  .extend({
    categoryId: idSchema.nullable().optional(),
    note: z.string().trim().max(1000).optional(),
    version: z.number().int().min(1),
  })
  .refine((v) => Object.keys(v).length > 1, 'Supply a field to update');
