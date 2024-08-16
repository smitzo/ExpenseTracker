import { z } from 'zod';
export const pageSchema = z.object({ page: z.coerce.number().int().min(1).max(10000).default(1), limit: z.coerce.number().int().min(1).max(100).default(25) });
export function pageMeta(page, limit, total) { return { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) }; }
