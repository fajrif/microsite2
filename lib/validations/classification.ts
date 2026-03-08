import { z } from 'zod'

export const classificationSchema = z.object({
    name: z.string().min(1, 'Classification name is required'),
    description: z.string().optional(),
    orderNo: z.number().int().optional().default(0),
})

export type ClassificationFormData = z.infer<typeof classificationSchema>
