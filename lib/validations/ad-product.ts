import { z } from 'zod'

export const adProductSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    tagline: z.string().min(1, 'Tagline is required'),
    description: z.string().optional(),
    orderNo: z.coerce.number().int().optional().default(0),
})

export type AdProductFormData = z.infer<typeof adProductSchema>

export const featureSchema = z.object({
    name: z.string().min(1, 'Feature name is required'),
    caption: z.string().optional(),
    description: z.string().optional(),
    orderNo: z.coerce.number().int().optional().default(0),
})

export type FeatureFormData = z.infer<typeof featureSchema>
