'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showcaseSchema, type ShowcaseFormData } from '@/lib/validations/showcase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'

interface SampleEntry {
    id?: string
    name: string
    description: string
    imageFile: File | null
    imagePreview: string | null
    audio: string
    videoLink: string
    orderNo: number
    isExisting: boolean
}

interface MetricEntry {
    name: string
    short_description: string
    caption: string
    prefix: string
    value: string
    suffix: string
    hide_name: boolean
    orderNo: number
}

interface ShowcaseFormProps {
    initialData?: any
    classifications: Array<{ id: string; name: string }>
}

export function ShowcaseForm({ initialData, classifications }: ShowcaseFormProps) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEdit = !!initialData

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ShowcaseFormData>({
        resolver: zodResolver(showcaseSchema),
        defaultValues: {
            name: initialData?.name || '',
            classification_id: initialData?.classification_id || '',
            tagline: initialData?.tagline || '',
            description: initialData?.description || '',
            objective: initialData?.objective || '',
            solution: initialData?.solution || '',
            campaign_dates: initialData?.campaign_dates || '',
            market: initialData?.market || '',
            formats: initialData?.formats || '',
            source: initialData?.source || '',
            metrics_text: initialData?.metrics_text || '',
            orderNo: initialData?.orderNo ?? 0,
        },
    })

    // Samples state
    const [samples, setSamples] = useState<SampleEntry[]>(() => {
        if (initialData?.samples) {
            return initialData.samples.map((s: any) => ({
                id: s.id,
                name: s.name,
                description: s.description || '',
                imageFile: null,
                imagePreview: s.image,
                audio: s.audio || '',
                videoLink: s.video_link || '',
                orderNo: s.orderNo ?? 0,
                isExisting: true,
            }))
        }
        return []
    })

    // Metrics state
    const [metrics, setMetrics] = useState<MetricEntry[]>(() => {
        if (initialData?.metrics) {
            return initialData.metrics.map((m: any) => ({
                name: m.name,
                short_description: m.short_description || '',
                caption: m.caption || '',
                prefix: m.prefix || '',
                value: m.value.toString(),
                suffix: m.suffix || '',
                hide_name: m.hide_name || false,
                orderNo: m.orderNo ?? 0,
            }))
        }
        return []
    })

    const addSample = () => {
        setSamples([...samples, {
            name: '',
            description: '',
            imageFile: null,
            imagePreview: null,
            audio: '',
            videoLink: '',
            orderNo: 0,
            isExisting: false,
        }])
    }

    const removeSample = (index: number) => {
        setSamples(samples.filter((_, i) => i !== index))
    }

    const updateSample = (index: number, field: string, value: any) => {
        const updated = [...samples]
        ;(updated[index] as any)[field] = value
        setSamples(updated)
    }

    const handleSampleImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const updated = [...samples]
                updated[index].imageFile = file
                updated[index].imagePreview = reader.result as string
                setSamples(updated)
            }
            reader.readAsDataURL(file)
        }
    }

    const addMetric = () => {
        setMetrics([...metrics, {
            name: '',
            short_description: '',
            caption: '',
            prefix: '',
            value: '',
            suffix: '',
            hide_name: false,
            orderNo: 0,
        }])
    }

    const removeMetric = (index: number) => {
        setMetrics(metrics.filter((_, i) => i !== index))
    }

    const updateMetric = (index: number, field: string, value: any) => {
        const updated = [...metrics]
        ;(updated[index] as any)[field] = value
        setMetrics(updated)
    }

    const onSubmit = async (data: ShowcaseFormData) => {
        setIsSubmitting(true)
        setError('')

        try {
            const formData = new FormData()

            // Append showcase fields
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString())
                }
            })

            // Separate existing and new samples
            const existingSamples: { id: string; name: string; description: string; audio: string; video_link: string; orderNo: number }[] = []
            const newSamples: { name: string; description: string; audio: string; video_link: string; orderNo: number }[] = []
            let newSampleIndex = 0
            let existingSampleIndex = 0

            for (const sample of samples) {
                if (sample.isExisting && sample.id) {
                    existingSamples.push({
                        id: sample.id,
                        name: sample.name,
                        description: sample.description,
                        audio: sample.audio,
                        video_link: sample.videoLink,
                        orderNo: sample.orderNo,
                    })
                    if (sample.imageFile) {
                        formData.append(`existing_sample_image_${existingSampleIndex}`, sample.imageFile)
                    }
                    existingSampleIndex++
                } else {
                    if (!sample.imageFile) {
                        setError(`Sample "${sample.name || `#${newSampleIndex + 1}`}": Image is required`)
                        setIsSubmitting(false)
                        return
                    }
                    newSamples.push({
                        name: sample.name,
                        description: sample.description,
                        audio: sample.audio,
                        video_link: sample.videoLink,
                        orderNo: sample.orderNo,
                    })
                    formData.append(`sample_image_${newSampleIndex}`, sample.imageFile)
                    newSampleIndex++
                }
            }

            formData.append('samples', JSON.stringify(newSamples))

            if (isEdit) {
                formData.append('existing_samples', JSON.stringify(existingSamples))
            }

            // Append metrics
            formData.append('metrics', JSON.stringify(metrics.map(m => ({
                ...m,
                value: parseFloat(m.value) || 0,
            }))))

            const url = isEdit ? `/api/showcases/${initialData.id}` : '/api/showcases'
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save showcase')
            }

            toast.success(isEdit ? 'Showcase updated successfully' : 'Showcase created successfully')

            router.push('/admin/showcases')
            router.refresh()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
            setError(errorMessage)
            toast.error(errorMessage)
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" {...register('name')} disabled={isSubmitting} />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="classification_id">Classification *</Label>
                    <select
                        id="classification_id"
                        {...register('classification_id')}
                        className="w-full border rounded-md px-3 py-2 bg-white"
                        disabled={isSubmitting}
                    >
                        <option value="">Select a classification</option>
                        {classifications.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {errors.classification_id && <p className="text-sm text-red-600">{errors.classification_id.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tagline">Tagline *</Label>
                <Input id="tagline" {...register('tagline')} disabled={isSubmitting} />
                {errors.tagline && <p className="text-sm text-red-600">{errors.tagline.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} disabled={isSubmitting} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="objective">Objective</Label>
                    <Textarea id="objective" {...register('objective')} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="solution">Solution</Label>
                    <Textarea id="solution" {...register('solution')} disabled={isSubmitting} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="campaign_dates">Campaign Dates</Label>
                    <Input id="campaign_dates" {...register('campaign_dates')} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="market">Market</Label>
                    <Input id="market" {...register('market')} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="formats">Formats</Label>
                    <Input id="formats" {...register('formats')} disabled={isSubmitting} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Input id="source" {...register('source')} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="metrics_text">Metrics Text</Label>
                    <Input id="metrics_text" {...register('metrics_text')} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="orderNo">Order No</Label>
                    <Input id="orderNo" type="number" {...register('orderNo', { valueAsNumber: true })} disabled={isSubmitting} placeholder="0" />
                </div>
            </div>

            {/* Samples Section */}
            <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Samples</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addSample}>
                        <Plus className="h-4 w-4 mr-1" /> Add Sample
                    </Button>
                </div>

                {samples.length === 0 && (
                    <p className="text-gray-500 text-sm">No samples added yet.</p>
                )}

                {samples.map((sample, index) => (
                    <div key={index} className="border rounded-lg p-4 mb-4 relative">
                        <button
                            type="button"
                            onClick={() => removeSample(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            disabled={isSubmitting}
                        >
                            <X size={18} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Sample Name *</Label>
                                <Input
                                    value={sample.name}
                                    onChange={(e) => updateSample(index, 'name', e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="e.g., Horsepower"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={sample.description}
                                    onChange={(e) => updateSample(index, 'description', e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Order No</Label>
                                <Input
                                    type="number"
                                    value={sample.orderNo}
                                    onChange={(e) => updateSample(index, 'orderNo', parseInt(e.target.value) || 0)}
                                    disabled={isSubmitting}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                                <Label>{sample.isExisting ? 'Replace Image' : 'Image *'}</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleSampleImage(index, e)}
                                    disabled={isSubmitting}
                                />
                                {sample.imagePreview && (
                                    <img src={sample.imagePreview} alt="Preview" className="mt-1 max-h-20 rounded" />
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                                <Label>Audio Path</Label>
                                <Input
                                    value={sample.audio}
                                    onChange={(e) => updateSample(index, 'audio', e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="/audios/sample.wav"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Video Link</Label>
                                <Input
                                    value={sample.videoLink}
                                    onChange={(e) => updateSample(index, 'videoLink', e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="/videos/sample.mp4"
                                />
                            </div>
                        </div>

                        {sample.isExisting && (
                            <div className="mt-2">
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Existing</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Metrics Section */}
            <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Metrics</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addMetric}>
                        <Plus className="h-4 w-4 mr-1" /> Add Metric
                    </Button>
                </div>

                {metrics.length === 0 && (
                    <p className="text-gray-500 text-sm">No metrics added yet.</p>
                )}

                {metrics.map((metric, index) => (
                    <div key={index} className="border rounded-lg p-4 mb-4 relative">
                        <button
                            type="button"
                            onClick={() => removeMetric(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            disabled={isSubmitting}
                        >
                            <X size={18} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input
                                    value={metric.name}
                                    onChange={(e) => updateMetric(index, 'name', e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="e.g., impressions"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Value *</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={metric.value}
                                    onChange={(e) => updateMetric(index, 'value', e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="e.g., 1.7"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Short Description</Label>
                                <Input
                                    value={metric.short_description}
                                    onChange={(e) => updateMetric(index, 'short_description', e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="e.g., Total Campaign"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                            <div className="space-y-2">
                                <Label>Prefix</Label>
                                <Input
                                    value={metric.prefix}
                                    onChange={(e) => updateMetric(index, 'prefix', e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Suffix</Label>
                                <Input
                                    value={metric.suffix}
                                    onChange={(e) => updateMetric(index, 'suffix', e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="e.g., M, K"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Caption</Label>
                                <Input
                                    value={metric.caption}
                                    onChange={(e) => updateMetric(index, 'caption', e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Order No</Label>
                                <Input
                                    type="number"
                                    value={metric.orderNo}
                                    onChange={(e) => updateMetric(index, 'orderNo', parseInt(e.target.value) || 0)}
                                    disabled={isSubmitting}
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex items-end space-x-2 pb-1">
                                <input
                                    type="checkbox"
                                    checked={metric.hide_name}
                                    onChange={(e) => updateMetric(index, 'hide_name', e.target.checked)}
                                    disabled={isSubmitting}
                                    className="h-4 w-4"
                                />
                                <Label className="text-sm">Hide Name</Label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : isEdit ? 'Update Showcase' : 'Create Showcase'}
                </Button>
                <Link href="/admin/showcases">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}
