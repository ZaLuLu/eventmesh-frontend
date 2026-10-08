import { z } from 'zod'

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  fieldErrors: z.record(z.string()).optional(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>

export interface PaginatedResult<T> {
  items: T[]
  nextCursor?: string
  totalCount?: number
}

export function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().optional(),
    totalCount: z.number().optional(),
  })
}
