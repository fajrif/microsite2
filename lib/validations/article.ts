import { z } from 'zod'

export const articleSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required'),
    short_description: z.string().optional(),
    content: z.string().optional(),
    category_id: z.string().min(1, 'Category is required'),
    published_date: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
})

export type ArticleFormData = z.infer<typeof articleSchema>
