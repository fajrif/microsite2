'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { classificationSchema, type ClassificationFormData } from '@/lib/validations/classification'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface ClassificationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    classification?: {
        id: string
        name: string
        description: string | null
        image: string | null
        orderNo: number
    } | null
    onSuccess: () => void
}

export function ClassificationDialog({
    open,
    onOpenChange,
    classification,
    onSuccess,
}: ClassificationDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const isEdit = !!classification

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ClassificationFormData>({
        resolver: zodResolver(classificationSchema),
    })

    useEffect(() => {
        if (classification) {
            reset({ name: classification.name, description: classification.description || '', orderNo: classification.orderNo ?? 0 })
            setImagePreview(classification.image)
        } else {
            reset({ name: '', description: '', orderNo: 0 })
            setImagePreview(null)
        }
    }, [classification, reset])

    useEffect(() => {
        if (!open) {
            reset({ name: '', description: '', orderNo: 0 })
            setIsSubmitting(false)
            setError('')
            setImagePreview(null)
        }
    }, [open, reset])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setImagePreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = async (data: ClassificationFormData) => {
        setIsSubmitting(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('name', data.name)
            if (data.description) formData.append('description', data.description)
            formData.append('orderNo', String(data.orderNo ?? 0))

            const imageInput = document.getElementById('classification-image') as HTMLInputElement
            if (imageInput?.files?.[0]) {
                formData.append('image', imageInput.files[0])
            }

            const url = isEdit ? `/api/classifications/${classification.id}` : '/api/classifications'
            const method = isEdit ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save classification')
            }

            toast.success(isEdit ? 'Classification updated successfully' : 'Classification created successfully')

            reset()
            onSuccess()
            onOpenChange(false)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
            setError(errorMessage)
            toast.error(errorMessage)
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Classification' : 'Add Classification'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Update the classification details'
                            : 'Create a new classification for showcases'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="classification-image">Image</Label>
                        <Input
                            id="classification-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={isSubmitting}
                        />
                        {imagePreview && (
                            <img src={imagePreview} alt="Preview" className="mt-2 max-h-32 rounded" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            disabled={isSubmitting}
                            placeholder="e.g., 3D Audio, ASMR Audio"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            disabled={isSubmitting}
                            placeholder="Optional description"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="orderNo">Order No</Label>
                        <Input
                            id="orderNo"
                            type="number"
                            {...register('orderNo', { valueAsNumber: true })}
                            disabled={isSubmitting}
                            placeholder="0"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
