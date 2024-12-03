import { z } from 'zod';
export const categorySchema = z.strictObject({
  name: z.string().trim().min(1).max(40),
  color: z.enum(['green', 'amber', 'blue', 'rose', 'violet', 'slate']).default('green'),
});
export const defaultCategories = [
  ['Food & dining', 'amber'],
  ['Shopping', 'violet'],
  ['Transport', 'blue'],
  ['Bills & utilities', 'rose'],
  ['Health', 'green'],
  ['Entertainment', 'slate'],
  ['Income', 'green'],
  ['Other', 'slate'],
].map(([name, color]) => ({ name, color }));
