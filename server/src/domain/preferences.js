import { z } from 'zod';
import { currencies } from './money.js';
export const preferencesSchema = z.strictObject({
  currency: z.enum(currencies),
  monthlyTarget: z.number().int().min(0).max(100_000_000_00),
  weekStartsOn: z.enum(['monday', 'sunday']).default('monday'),
});
export const defaults = { currency: 'INR', monthlyTarget: 0, weekStartsOn: 'monday' };
export const profileSchema = z.strictObject({ name: z.string().trim().min(1).max(80) });
export const credentialsSchema = z.strictObject({
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(1).max(128),
});
export const registrationSchema = credentialsSchema.extend({
  name: profileSchema.shape.name,
  password: z.string().min(12).max(128),
});
