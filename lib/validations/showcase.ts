import { z } from 'zod'

export const showcaseSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    classification_id: z.string().min(1, 'Classification is required'),
    tagline: z.string().min(1, 'Tagline is required'),
    description: z.string().optional(),
    objective: z.string().optional(),
    solution: z.string().optional(),
    campaign_dates: z.string().optional(),
    market: z.string().optional(),
    formats: z.string().optional(),
    source: z.string().optional(),
    metrics_text: z.string().optional(),
    orderNo: z.coerce.number().int().optional().default(0),
})

export type ShowcaseFormData = z.infer<typeof showcaseSchema>

export const sampleSchema = z.object({
    name: z.string().min(1, 'Sample name is required'),
    description: z.string().optional(),
    audio: z.string().optional(),
    video_link: z.string().optional(),
})

export type SampleFormData = z.infer<typeof sampleSchema>

export const metricSchema = z.object({
    name: z.string().min(1, 'Metric name is required'),
    short_description: z.string().optional(),
    caption: z.string().optional(),
    prefix: z.string().optional(),
    value: z.number({ required_error: 'Value is required' }),
    suffix: z.string().optional(),
    hide_name: z.boolean().default(false),
})

export type MetricFormData = z.infer<typeof metricSchema>
