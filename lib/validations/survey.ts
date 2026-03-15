import { z } from 'zod'

export const surveySubmitSchema = z.object({
    ad_product_id: z.string().uuid(),
    rating: z.number().int().min(1).max(10),
})

export const surveyUpdateSchema = z.object({
    rating: z.number().int().min(1).max(10),
})

export type SurveySubmitData = z.infer<typeof surveySubmitSchema>
export type SurveyUpdateData = z.infer<typeof surveyUpdateSchema>
